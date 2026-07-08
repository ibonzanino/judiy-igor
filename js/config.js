/* ============================================================
   config.js — EDITE AQUI os dados do casamento
   Um único lugar para trocar data, links e textos dinâmicos.
   O conteúdo estático das seções fica no index.html.
   ============================================================ */
window.WEDDING = {
  /* Nomes (aparecem no envelope, boas-vindas, rodapé) — o HTML já usa
     estes valores; troque também no index.html se mudar os nomes. */
  names: "Judiy & Igor",

  /* Data/hora do casamento no formato ISO (fuso local).
     Formato: "AAAA-MM-DDTHH:MM:SS". Usado pelo countdown. */
  weddingDate: "2027-03-27T08:00:00",

  /* Link do RSVP — Google Form (ou deixe vazio "" para usar o mailto abaixo). */
  rsvpUrl: "https://forms.gle/your-rsvp-form-id",

  /* E-mail de contato (rodapé + fallback de RSVP via mailto). */
  contactEmail: "chamberlainwedding@gmail.com",
};
