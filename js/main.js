/* main.js — injeta valores do config.js nos links/textos dinâmicos */
(function () {
  var cfg = window.WEDDING || {};

  // RSVP: usa Google Form; se vazio, cai para mailto do e-mail de contato.
  var rsvpBtn = document.getElementById("rsvp-btn");
  if (rsvpBtn) {
    if (cfg.rsvpUrl) {
      rsvpBtn.href = cfg.rsvpUrl;
    } else if (cfg.contactEmail) {
      rsvpBtn.href = "mailto:" + cfg.contactEmail + "?subject=" +
        encodeURIComponent("Confirmação de presença - " + (cfg.names || "Casamento"));
      rsvpBtn.removeAttribute("target");
    }
  }

  // E-mail de contato (rodapé)
  var contact = document.getElementById("contact-link");
  if (contact && cfg.contactEmail) {
    contact.textContent = cfg.contactEmail;
    contact.href = "mailto:" + cfg.contactEmail;
  }

  // Links "Visit website" dos hotéis
  var links = cfg.hotelLinks || {};
  document.querySelectorAll("[data-hotel]").forEach(function (a) {
    var url = links[a.getAttribute("data-hotel")];
    if (url) a.href = url;
  });

  // Título da aba com os nomes
  if (cfg.names) document.title = cfg.names + " · Você está convidado(a)";
})();
