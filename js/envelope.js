/* envelope.js — portão de entrada: abre a aba (com o lacre), tira o cartão e revela a página */
(function () {
  var gate = document.getElementById("gate");
  var envelope = document.getElementById("envelope");
  var body = document.body;
  if (!gate || !envelope) return;

  var opened = false;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // aba abre (0–1s) → cartão sai (0.75–1.7s) → envelope sai (1.85–2.35s) → fundo esmaece (2.1–2.7s)
  var HIDE_MS = reduce ? 400 : 2750;

  // js/access.js confere o código do convite; o envelope só abre depois disso
  var access = window.WEDDING_ACCESS;
  var hint = gate.querySelector(".gate__hint");
  var hintText = hint ? hint.textContent : "";
  var waiting = false;

  function open() {
    if (opened || waiting) return;
    if (access && access.denied) return;
    if (access && access.pending) {
      waiting = true;
      gate.classList.add("is-waiting");
      if (hint) hint.textContent = "Abrindo seu convite…";
      access.ready.then(function (ok) {
        waiting = false;
        gate.classList.remove("is-waiting");
        if (hint) hint.textContent = hintText;
        if (ok) open();
      });
      return;
    }
    opened = true;

    envelope.classList.add("is-open");
    gate.classList.add("is-leaving");
    body.classList.remove("is-locked");

    // Após a animação, esconde o portão e rola para o conteúdo.
    setTimeout(function () {
      gate.setAttribute("hidden", "");
      var welcome = document.getElementById("welcome");
      if (welcome) {
        welcome.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }, HIDE_MS);
  }

  envelope.addEventListener("click", open);
})();
