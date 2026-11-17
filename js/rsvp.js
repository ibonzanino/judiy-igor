/* ============================================================
   rsvp.js — modal "Confirmar presença!"
   Cada convite (pessoa, casal ou família) tem um código e recebe o link
   personalizado  …/?c=CODIGO. O modal busca no Google Apps Script os nomes
   daquele convite e grava a resposta na planilha (apps-script/README.md).
   Sem código, a pessoa procura o próprio convite pelo nome e sobrenome.
   ============================================================ */
(function () {
  var cfg = window.WEDDING || {};
  var rc = cfg.rsvp || {};
  var btn = document.getElementById("rsvp-btn");
  var dialog = document.getElementById("rsvp-dialog");
  if (!btn || !dialog) return;

  var API = String(rc.api || "").trim();
  var KEY = "rsvp-code";

  /* ---------- localStorage (pode falhar em aba anônima) ---------- */
  function save(v) {
    try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {}
  }
  function stored() {
    try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; }
  }

  // código do link tem prioridade; senão, o da última visita
  var urlCode = (new URLSearchParams(location.search).get("c") || "").trim();
  var code = urlCode || stored();
  if (urlCode) save(urlCode);

  var invite = null;   // { code, invite, guests: [{ name, child }], answer }
  var pending = null;  // busca do convite em andamento

  /* ---------- Datas ---------- */
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
    "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var deadline = rc.deadline ? new Date(rc.deadline + "T23:59:59") : null;
  function ddmm(d) {
    return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2);
  }
  function isClosed() { return !!deadline && new Date() > deadline; }
  var wedding = cfg.weddingDate ? new Date(cfg.weddingDate) : null;
  var weddingDay = wedding ? wedding.getDate() + " de " + MESES[wedding.getMonth()] : "";

  /* ---------- API (Google Apps Script) ----------
     POST com corpo text/plain evita o preflight de CORS do Apps Script. */
  function get(params) {
    var qs = Object.keys(params).map(function (k) {
      return k + "=" + encodeURIComponent(params[k]);
    }).join("&");
    return fetch(API + (API.indexOf("?") === -1 ? "?" : "&") + qs).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function post(body) {
    return fetch(API, { method: "POST", body: JSON.stringify(body) }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function loadInvite(c) {
    if (invite && invite.code === c) return Promise.resolve({ ok: true, invite: invite });
    if (!pending || pending.code !== c) {
      // reaproveita a consulta que js/access.js já fez para este código
      var acc = window.WEDDING_ACCESS;
      // "code", não "c": o Apps Script reserva os parâmetros "c" e "sid"
      pending = acc && acc.request && acc.code === c ? acc.request : get({ action: "invite", code: c });
      pending.code = c;
      pending.then(function (res) {
        if (res && res.ok) invite = res.invite;
      }, function () { pending = null; });
    }
    return pending;
  }

  // quem chegou pelo link já começa a carregar o convite em segundo plano
  if (API && code && !isClosed()) loadInvite(code).catch(function () {});

  /* ---------- Elementos ---------- */
  var elTitle = document.getElementById("rsvp-title");
  var steps = dialog.querySelectorAll("[data-step]");
  var searchForm = dialog.querySelector('[data-step="search"]');
  var searchMsg = dialog.querySelector("[data-search-msg]");
  var results = dialog.querySelector("[data-results]");
  var form = dialog.querySelector('[data-step="form"]');
  var guestsBox = dialog.querySelector("[data-guests]");
  var prevMsg = dialog.querySelector("[data-prev]");
  var formError = dialog.querySelector("[data-form-error]");
  var submitBtn = form.querySelector('[type="submit"]');
  var doneMsg = dialog.querySelector("[data-done-msg]");
  var noticeMsg = dialog.querySelector("[data-notice-msg]");
  var retryBtn = dialog.querySelector("[data-retry]");
  var retry = null;

  /* contato dos noivos: WhatsApp se houver, senão e-mail */
  var contactHref = "";
  if (cfg.contactWhatsapp) {
    contactHref = "https://wa.me/" + String(cfg.contactWhatsapp).replace(/\D/g, "") +
      "?text=" + encodeURIComponent("Oi! Estou tentando confirmar presença no casamento.");
  } else if (cfg.contactEmail) {
    contactHref = "mailto:" + cfg.contactEmail + "?subject=" +
      encodeURIComponent("Confirmação de presença - " + (cfg.names || "Casamento"));
  }
  dialog.querySelectorAll("[data-contact]").forEach(function (a) {
    if (!contactHref) { a.closest("p").hidden = true; return; }
    a.href = contactHref;
    if (contactHref.indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener"; }
  });

  function show(step, title) {
    steps.forEach(function (el) { el.hidden = el.getAttribute("data-step") !== step; });
    elTitle.textContent = title;
    if (dialog.open) elTitle.focus();
  }

  function notice(title, msg, onRetry) {
    noticeMsg.textContent = msg;
    retry = onRetry || null;
    retryBtn.hidden = !onRetry;
    show("notice", title);
  }

  function failed() {
    notice("Ops!", "Não conseguimos carregar seu convite agora. Verifique a internet e tente de novo.", start);
  }

  /* ---------- Fluxo ---------- */
  function start() {
    if (!API) {
      return notice("Em breve", "As confirmações de presença abrem em breve. Volte aqui mais pertinho da data!");
    }
    if (isClosed()) {
      return notice("Prazo encerrado",
        "O prazo para confirmar presença terminou em " + ddmm(deadline) + ". Se precisar, fale com a gente.");
    }
    if (!code) code = stored(); // ex.: clicou em "Não é você?", fechou e abriu de novo
    if (!code) return showSearch("");

    show("loading", "Confirmar presença");
    loadInvite(code).then(function (res) {
      if (res && res.ok) return showForm(res.invite);
      if (res && res.error === "not_found") {
        code = "";
        save("");
        return showSearch("Não encontramos o convite deste link. Procure pelo seu nome:");
      }
      failed();
    }, failed);
  }

  function showSearch(msg) {
    searchMsg.textContent = msg || "Digite seu nome e sobrenome para encontrar o seu convite.";
    results.innerHTML = "";
    show("search", "Encontre seu convite");
  }

  function showForm(inv) {
    var many = inv.guests.length > 1;
    guestsBox.innerHTML = "";
    inv.guests.forEach(function (g, i) {
      var prev = inv.answer && inv.answer.guests ? inv.answer.guests[g.name] : "";
      var fs = document.createElement("fieldset");
      fs.className = "rsvp-guest";
      var lg = document.createElement("legend");
      lg.className = "rsvp-guest__name";
      lg.textContent = g.name;
      if (g.child) {
        var tag = document.createElement("span");
        tag.className = "rsvp-guest__tag";
        tag.textContent = "criança";
        lg.appendChild(tag);
      }
      fs.appendChild(lg);
      var choice = document.createElement("div");
      choice.className = "rsvp-choice";
      [["sim", "Vou"], ["nao", "Não vou"]].forEach(function (opt) {
        var label = document.createElement("label");
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "g" + i;
        input.value = opt[0];
        input.checked = prev === opt[0];
        var span = document.createElement("span");
        span.textContent = opt[1];
        label.appendChild(input);
        label.appendChild(span);
        choice.appendChild(label);
      });
      fs.appendChild(choice);
      guestsBox.appendChild(fs);
    });

    var a = inv.answer;
    form.elements.restricao.value = a ? a.restricao || "" : "";
    form.elements.recado.value = a ? a.recado || "" : "";
    prevMsg.hidden = !a;
    if (a) {
      prevMsg.textContent = (many ? "Vocês já responderam" : "Você já respondeu") +
        (a.updatedAt ? " em " + a.updatedAt : "") + ". Se algo mudou, é só alterar e confirmar de novo.";
    }
    formError.hidden = true;
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirmar";
    show("form", "Olá, " + inv.invite + "!");
  }

  function showDone(going, many) {
    doneMsg.textContent = going
      ? "Recebemos sua confirmação. " + (weddingDay ? "Até o dia " + weddingDay + "!" : "Até lá!")
      : "Que pena que não vai dar! Obrigado por " + (many ? "nos avisarem." : "nos avisar.");
    show("done", going ? "Presença confirmada" : "Resposta registrada");
  }

  /* ---------- Busca por nome ---------- */
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = searchForm.elements.q.value.trim();
    var words = q.split(/\s+/).filter(function (w) { return w.length >= 2; });
    results.innerHTML = "";
    if (words.length < 2) {
      searchMsg.textContent = "Digite seu nome e sobrenome (por exemplo: Maria Souza).";
      return;
    }
    searchMsg.textContent = "Procurando…";
    get({ action: "search", q: q }).then(function (res) {
      var list = res && res.ok ? res.results : [];
      if (!list.length) {
        searchMsg.textContent = "Não encontramos ninguém com esse nome. Confira a grafia ou fale com a gente.";
        return;
      }
      searchMsg.textContent = list.length > 1 ? "Qual destes é o seu convite?" : "Encontramos seu convite:";
      list.forEach(function (r) {
        var li = document.createElement("li");
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = r.invite;
        b.addEventListener("click", function () {
          code = r.code;
          save(code);
          start();
        });
        li.appendChild(b);
        results.appendChild(li);
      });
    }, function () {
      searchMsg.textContent = "Não conseguimos buscar agora. Verifique a internet e tente de novo.";
    });
  });

  /* ---------- Envio ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var inv = invite;
    if (!inv) return start();

    var answers = [];
    var missing = false;
    inv.guests.forEach(function (g, i) {
      var checked = form.querySelector('input[name="g' + i + '"]:checked');
      if (!checked) missing = true;
      else answers.push({ name: g.name, attending: checked.value });
    });
    if (missing) {
      formError.textContent = inv.guests.length > 1
        ? "Marque se cada pessoa vai ou não."
        : "Marque se você vai ou não.";
      formError.hidden = false;
      return;
    }

    var body = {
      code: inv.code,
      guests: answers,
      restricao: form.elements.restricao.value.trim(),
      recado: form.elements.recado.value.trim()
    };
    formError.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";

    post(body).then(function (res) {
      if (!res || !res.ok) throw new Error(res && res.error);
      var map = {};
      answers.forEach(function (a) { map[a.name] = a.attending; });
      inv.answer = { updatedAt: ddmm(new Date()), guests: map, restricao: body.restricao, recado: body.recado };
      showDone(answers.some(function (a) { return a.attending === "sim"; }), inv.guests.length > 1);
    }).catch(function () {
      formError.textContent = "Não foi possível enviar. Verifique a internet e tente de novo.";
      formError.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirmar";
    });
  });

  // o aviso "marque se cada pessoa vai" some assim que a pessoa marca algo
  form.addEventListener("change", function () { formError.hidden = true; });

  // "Não é você?" — volta para a busca. O código salvo só muda quando a pessoa
  // escolhe outro convite (senão, sem código, ela ficaria trancada fora do site).
  dialog.querySelector("[data-not-me]").addEventListener("click", function () {
    code = "";
    invite = null;
    showSearch("");
  });

  retryBtn.addEventListener("click", function () { if (retry) retry(); });

  /* ---------- Abrir / fechar ---------- */
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    start();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    elTitle.focus();
  });

  function close() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }
  dialog.querySelector(".modal__close").addEventListener("click", close);
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });
})();
