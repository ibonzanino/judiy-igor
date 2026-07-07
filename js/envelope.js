/* envelope.js — portão de entrada: abre o envelope e revela a página */
(function () {
  var gate = document.getElementById("gate");
  var envelope = document.getElementById("envelope");
  var body = document.body;
  if (!gate || !envelope) return;

  var opened = false;

  function open() {
    if (opened) return;
    opened = true;

    envelope.classList.add("is-open");
    gate.classList.add("is-leaving");
    body.classList.remove("is-locked");

    // Após a animação da aba, esconde o portão e rola para o conteúdo.
    setTimeout(function () {
      gate.setAttribute("hidden", "");
      var welcome = document.getElementById("welcome");
      if (welcome) {
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        welcome.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    }, 1100);
  }

  envelope.addEventListener("click", open);
})();
