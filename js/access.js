/* ============================================================
   access.js — só entra quem tem o link com código (?c=CODIGO)
   Roda no <head>, antes da página aparecer. Confere o código na planilha
   (Google Apps Script) e, se não houver código válido, cobre a página com
   a tela "Este convite é pessoal" e o contato dos noivos.

   É uma barreira para quem recebeu o link repassado, não um cofre: o
   conteúdo do site continua público no GitHub. A lista de convidados nunca
   vem para o navegador — ela só sai da planilha código a código.

   Expõe window.WEDDING_ACCESS = { code, pending, denied, ready, request }
   (o envelope espera "ready"; o modal de RSVP reaproveita "request").
   ============================================================ */
(function () {
  var cfg = window.WEDDING || {};
  var API = String((cfg.rsvp && cfg.rsvp.api) || "").trim();
  var KEY = "rsvp-code";   // mesmo nome usado em js/rsvp.js
  var OK = "rsvp-ok";      // código já conferido neste navegador
  var TIMEOUT_MS = 8000;
  var root = document.documentElement;

  function load(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function save(k, v) {
    try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {}
  }

  var urlCode = (new URLSearchParams(location.search).get("c") || "").trim();
  var code = urlCode || load(KEY);
  if (urlCode) save(KEY, urlCode);

  var settle;
  var acc = window.WEDDING_ACCESS = {
    code: code,
    pending: false,
    denied: false,
    request: null,
    ready: new Promise(function (r) { settle = r; })
  };

  // sem API configurada (ex.: desenvolvimento), o site fica aberto
  if (!API) { settle(true); return; }
  if (!code) { deny(); return; }

  var trusted = load(OK) === code;
  if (trusted) {
    whenReady(keepCodeInLinks); // entra na hora; a conferência abaixo roda por trás
  } else {
    acc.pending = true;
    root.classList.add("access-check"); // esconde a página até a resposta
  }

  // "code", não "c": o Apps Script reserva os parâmetros "c" e "sid"
  acc.request = fetch(API + "?action=invite&code=" + encodeURIComponent(code)).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  });

  var timeout = new Promise(function (r) { setTimeout(function () { r({ timeout: true }); }, TIMEOUT_MS); });

  Promise.race([acc.request, timeout]).then(function (res) {
    if (res && res.ok) {
      save(OK, code);
      allow();
    } else if (res && res.error === "not_found") {
      save(KEY, "");
      save(OK, "");
      deny();
    } else {
      allow(); // Google lento/fora do ar: quem tem código não fica trancado do lado de fora
    }
  }, function () {
    allow();
  });

  function allow() {
    acc.pending = false;
    root.classList.remove("access-check");
    settle(true);
    whenReady(keepCodeInLinks);
  }

  function deny() {
    acc.pending = false;
    acc.denied = true;
    root.classList.remove("access-check");
    root.classList.add("access-denied");
    settle(false);
    whenReady(showLock);
  }

  function whenReady(fn) {
    if (document.body) fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* links entre as páginas levam o código junto (caso o navegador não guarde) */
  function keepCodeInLinks() {
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      var href = a.getAttribute("href");
      if (/^[\w-]+\.html$/.test(href)) a.setAttribute("href", href + "?c=" + encodeURIComponent(code));
    });
  }

  /* ---------- Tela "convite pessoal" ---------- */
  function showLock() {
    if (document.getElementById("lock")) return;

    var contact = "";
    var external = false;
    if (cfg.contactWhatsapp) {
      contact = "https://wa.me/" + String(cfg.contactWhatsapp).replace(/\D/g, "") + "?text=" +
        encodeURIComponent("Oi! Não estou conseguindo abrir o convite do casamento. Pode me mandar o meu link?");
      external = true;
    } else if (cfg.contactEmail) {
      contact = "mailto:" + cfg.contactEmail + "?subject=" +
        encodeURIComponent("Link do convite - " + (cfg.names || "Casamento"));
    }

    var lock = document.createElement("div");
    lock.className = "gate lock";
    lock.id = "lock";
    lock.setAttribute("role", "dialog");
    lock.setAttribute("aria-modal", "true");
    lock.setAttribute("aria-labelledby", "lock-text");

    var inner = el("div", "gate__inner");
    inner.appendChild(el("p", "eyebrow gate__eyebrow", "Casamento de"));

    var names = el("h1", "gate__names");
    var parts = String(cfg.names || "").split("&");
    names.appendChild(document.createTextNode(parts[0].trim() + (parts.length > 1 ? " " : "")));
    if (parts.length > 1) {
      names.appendChild(el("span", "amp", "&"));
      names.appendChild(document.createTextNode(" " + parts.slice(1).join("&").trim()));
    }
    inner.appendChild(names);

    var text = el("p", "lock__text",
      "Este convite é pessoal. Para entrar, abra o link que você recebeu dos noivos.");
    text.id = "lock-text";
    inner.appendChild(text);

    if (contact) {
      var a = el("a", "lock__btn", external ? "Pedir o link no WhatsApp" : "Pedir o link por e-mail");
      a.href = contact;
      if (external) { a.target = "_blank"; a.rel = "noopener"; }
      inner.appendChild(a);
    }

    lock.appendChild(inner);
    document.body.appendChild(lock);
  }

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt) n.textContent = txt;
    return n;
  }
})();
