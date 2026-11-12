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

  /* PIX da lista de presentes (presentes.html). O QR code e o "copia e cola"
     são gerados no navegador a partir destes dados.
     - key:  chave PIX exatamente como cadastrada no banco
             (CPF só números · e-mail · celular no formato "+5519999999999" · chave aleatória)
     - name: nome do recebedor (até 25 letras, sem acento)
     - city: cidade do recebedor (até 15 letras, sem acento)
     Enquanto key estiver vazia, a página mostra "PIX em breve". */
  pix: {
    key: "d0ba11ee-b8f4-4d90-a8f7-15bb8bd9462d",
    name: "Judiy e Igor",
    city: "Piracicaba",
  },
};
