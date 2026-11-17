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
  weddingDate: "2027-03-27T09:00:00",

  /* Confirmação de presença (modal do botão "Confirmar presença!").
     - api:      URL do app da web do Google Apps Script (termina em /exec).
                 Passo a passo em apps-script/README.md. Enquanto estiver vazia,
                 o modal avisa que as confirmações abrem em breve.
     - deadline: último dia para confirmar ("AAAA-MM-DD"). Depois dele, o modal
                 mostra só o contato dos noivos. */
  rsvp: {
    api: "https://script.google.com/macros/s/AKfycbzHcExdKRkDbsmu1zxERqvzSxBGOnS8X8WowNT3wMKjL5Lzv4F4ScZyF_FNmYvnCaVF/exec",
    deadline: "2027-02-27",
  },

  /* Contato dos noivos (mostrado no modal de RSVP quando a pessoa não acha o
     convite ou o prazo acabou). WhatsApp com DDI+DDD, só números
     (ex.: "5519999999999"); se vazio, usa o e-mail. */
  contactWhatsapp: "5519991198065",
  contactEmail: "judiymaia@icloud.com",

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
