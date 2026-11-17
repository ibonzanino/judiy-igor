/* ============================================================
   Confirmação de presença — Google Apps Script (app da web)
   Fica dentro da planilha (Extensões → Apps Script).
   Abas: "Convidados" (vocês preenchem) e "Respostas" (o site grava).
   Passo a passo em apps-script/README.md.
   ============================================================ */

var SITE_URL = "https://ibonzanino.github.io/judiy-igor/";

var ABA_CONVIDADOS = "Convidados";
var ABA_RESPOSTAS = "Respostas";
var CAB_CONVIDADOS = ["Código", "Convite", "Nome", "Criança", "Link"];
var CAB_RESPOSTAS = ["Atualizado em", "Código", "Convite", "Nome", "Criança", "Presença",
  "Restrição alimentar", "Recado"];

/* ---------- Menu "Casamento" na planilha ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Casamento")
    .addItem("Preparar abas", "prepararAbas")
    .addItem("Gerar códigos e links", "gerarCodigos")
    .addToUi();
}

/** Cria as abas com os cabeçalhos (não apaga nada que já exista). */
function prepararAbas() {
  var ss = SpreadsheetApp.getActive();
  [[ABA_CONVIDADOS, CAB_CONVIDADOS], [ABA_RESPOSTAS, CAB_RESPOSTAS]].forEach(function (a) {
    var sh = ss.getSheetByName(a[0]) || ss.insertSheet(a[0]);
    sh.getRange(1, 1, 1, a[1].length).setValues([a[1]]).setFontWeight("bold");
    sh.setFrozenRows(1);
  });
}

/** Dá um código a cada convite que ainda não tem (todas as linhas com o mesmo
    nome de convite recebem o mesmo código) e escreve o link na 1ª linha dele. */
function gerarCodigos() {
  var sh = aba(ABA_CONVIDADOS);
  var n = sh.getLastRow() - 1;
  if (n < 1) {
    SpreadsheetApp.getUi().alert('A aba "' + ABA_CONVIDADOS + '" está vazia. Preencha Convite e Nome ' +
      '(a partir da linha 2) e rode de novo.');
    return;
  }
  var rows = sh.getRange(2, 1, n, 5).getValues();

  var novos = 0;
  var porConvite = {};
  var usados = {};
  rows.forEach(function (r) {
    var c = texto(r[0]);
    var conv = texto(r[1]);
    if (!c) return;
    usados[c.toLowerCase()] = true;
    if (conv && !porConvite[conv]) porConvite[conv] = c;
  });

  var comLink = {};
  rows.forEach(function (r) {
    var conv = texto(r[1]);
    if (!conv || !texto(r[2])) return;
    if (!texto(r[0])) {
      if (!porConvite[conv]) { porConvite[conv] = novoCodigo(usados); novos++; }
      r[0] = porConvite[conv];
    }
    var c = texto(r[0]);
    r[4] = comLink[c] ? "" : SITE_URL + "?c=" + c;
    comLink[c] = true;
  });

  sh.getRange(2, 1, n, 1).setNumberFormat("@"); // código sempre como texto
  sh.getRange(2, 1, n, 5).setValues(rows);
  SpreadsheetApp.getActive().toast(
    novos ? novos + " convite(s) novo(s) com código e link." : "Nenhum convite novo: todos já tinham código.",
    "Casamento");
}

/* ---------- App da web ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    // "code", não "c": o Apps Script reserva os parâmetros "c" e "sid"
    if (p.action === "invite") return json(buscarConvite(p.code));
    if (p.action === "search") return json(buscarPorNome(p.q));
    return json({ ok: false, error: "acao_invalida" });
  } catch (err) {
    return json({ ok: false, error: "erro", detail: String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    return json(salvarResposta(JSON.parse(e.postData.contents)));
  } catch (err) {
    return json({ ok: false, error: "erro", detail: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/** Convite + resposta anterior (se houver). */
function buscarConvite(code) {
  var conv = convitePorCodigo(code);
  if (!conv) return { ok: false, error: "not_found" };
  conv.answer = respostaAnterior(conv.code);
  return { ok: true, invite: conv };
}

/** Busca por nome e sobrenome: só devolve convites em que alguém tem TODAS as
    palavras digitadas (começo de palavra, sem acento). Pede no mínimo 2 palavras
    para ninguém conseguir listar os convidados digitando uma letra. */
function buscarPorNome(q) {
  var palavras = normalizar(q).split(" ").filter(function (w) { return w.length >= 2; });
  if (palavras.length < 2) return { ok: false, error: "curto" };

  var vistos = {};
  var lista = [];
  lerConvidados().forEach(function (g) {
    var nome = " " + normalizar(g.name) + " ";
    var bate = palavras.every(function (w) { return nome.indexOf(" " + w) !== -1; });
    if (bate && !vistos[g.code]) {
      vistos[g.code] = true;
      lista.push({ code: g.code, invite: g.invite });
    }
  });
  return { ok: true, results: lista.slice(0, 5) };
}

/** Grava a resposta: apaga a anterior do mesmo convite e escreve uma linha
    por pessoa. Restrição e recado vão só na 1ª linha do convite. */
function salvarResposta(d) {
  var conv = convitePorCodigo(d && d.code);
  if (!conv) return { ok: false, error: "not_found" };

  var marcados = {};
  (d.guests || []).forEach(function (g) {
    if (g && (g.attending === "sim" || g.attending === "nao")) marcados[g.name] = g.attending;
  });
  var faltando = conv.guests.some(function (g) { return !marcados[g.name]; });
  if (faltando) return { ok: false, error: "incompleto" };

  var restricao = limpar(d.restricao, 300);
  var recado = limpar(d.recado, 500);

  var sh = aba(ABA_RESPOSTAS);
  var last = sh.getLastRow();
  if (last > 1) {
    var cods = sh.getRange(2, 2, last - 1, 1).getValues();
    for (var i = cods.length - 1; i >= 0; i--) {
      if (texto(cods[i][0]).toLowerCase() === conv.code.toLowerCase()) sh.deleteRow(i + 2);
    }
  }

  var agora = new Date();
  var linhas = conv.guests.map(function (g, i) {
    return [agora, conv.code, conv.invite, g.name, g.child ? "Sim" : "",
      marcados[g.name] === "sim" ? "Sim" : "Não",
      i === 0 ? restricao : "", i === 0 ? recado : ""];
  });
  var inicio = sh.getLastRow() + 1;
  sh.getRange(inicio, 2, linhas.length, 1).setNumberFormat("@");
  sh.getRange(inicio, 1, linhas.length, linhas[0].length).setValues(linhas);
  return { ok: true };
}

/* ---------- Leitura das abas ---------- */
function lerConvidados() {
  var sh = aba(ABA_CONVIDADOS);
  var n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 4).getValues().map(function (r) {
    var crianca = r[3];
    return {
      code: texto(r[0]),
      invite: texto(r[1]),
      name: texto(r[2]),
      child: crianca === true || /^(s|x)/i.test(texto(crianca))
    };
  }).filter(function (g) { return g.code && g.name; });
}

function convitePorCodigo(code) {
  var c = texto(code).toLowerCase();
  if (!c) return null;
  var pessoas = lerConvidados().filter(function (g) { return g.code.toLowerCase() === c; });
  if (!pessoas.length) return null;
  return {
    code: pessoas[0].code,
    invite: pessoas[0].invite || pessoas[0].name,
    guests: pessoas.map(function (g) { return { name: g.name, child: g.child }; })
  };
}

function respostaAnterior(code) {
  var sh = aba(ABA_RESPOSTAS);
  var n = sh.getLastRow() - 1;
  if (n < 1) return null;
  var tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  var resp = null;
  sh.getRange(2, 1, n, 8).getValues().forEach(function (r) {
    if (texto(r[1]).toLowerCase() !== code.toLowerCase()) return;
    if (!resp) {
      resp = {
        updatedAt: r[0] instanceof Date ? Utilities.formatDate(r[0], tz, "dd/MM") : "",
        guests: {},
        restricao: "",
        recado: ""
      };
    }
    resp.guests[texto(r[3])] = /^s/i.test(texto(r[5])) ? "sim" : "nao";
    resp.restricao = resp.restricao || texto(r[6]).replace(/^'/, "");
    resp.recado = resp.recado || texto(r[7]).replace(/^'/, "");
  });
  return resp;
}

/* ---------- Utilidades ---------- */
function aba(nome) {
  var sh = SpreadsheetApp.getActive().getSheetByName(nome);
  if (!sh) throw new Error('Aba "' + nome + '" não encontrada. Use o menu Casamento → Preparar abas.');
  return sh;
}

function texto(v) { return v == null ? "" : String(v).trim(); }

function normalizar(s) {
  return texto(s).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

/** Corta o tamanho e impede que o texto vire fórmula na planilha. */
function limpar(s, max) {
  var t = texto(s).slice(0, max);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

/** Código curto sem letras/números parecidos (0/o, 1/l/i) nem "e" (vira número). */
function novoCodigo(usados) {
  var abc = "abcdfghjkmnpqrstuvwxyz23456789";
  var c;
  do {
    c = "";
    for (var i = 0; i < 5; i++) c += abc.charAt(Math.floor(Math.random() * abc.length));
  } while (usados[c]);
  usados[c] = true;
  return c;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
