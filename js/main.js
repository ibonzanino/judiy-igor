/* main.js — injeta valores do config.js nos links/textos dinâmicos */
(function () {
  var cfg = window.WEDDING || {};

  // (o botão de RSVP é tratado em js/rsvp.js)

  // Título da aba com os nomes
  if (cfg.names) document.title = cfg.names + " · Você está convidado(a)";
})();
