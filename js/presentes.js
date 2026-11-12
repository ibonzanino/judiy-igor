/* ============================================================
   presentes.js — lista de presentes + pagamento via PIX
   EDITE A LISTA AQUI: cada grupo tem um título e seus presentes
   (nome, descrição e valor em reais).
   value: null = "valor livre" (a pessoa digita o valor no app do banco).
   ============================================================ */
var GIFTS = [
  {
    title: "Cozinha",
    items: [
      { name: "Jogo de potes herméticos", desc: "Para a comida da sogra durar a semana inteira.", value: 120 },
      { name: "Sanduicheira e grill", desc: "O jantar oficial das noites de preguiça.", value: 150 },
      { name: "Jogo de facas com cepo", desc: "Afiadas, organizadas e longe do alcance do Igor.", value: 180 },
      { name: "Liquidificador", desc: "Sucos, vitaminas e as primeiras receitas a dois.", value: 200 },
      { name: "Faqueiro completo", desc: "Para receber a família com a mesa caprichada.", value: 220 },
      { name: "Aparelho de jantar", desc: "Pratos para os almoços de domingo em casa.", value: 350 },
      { name: "Batedeira", desc: "Para os bolos de aniversário (e de qualquer dia).", value: 350 },
      { name: "Air fryer", desc: "A queridinha de toda casa nova.", value: 400 },
      { name: "Jogo de panelas antiaderente", desc: "A base de tudo o que vai sair da nossa cozinha.", value: 450 },
      { name: "Micro-ondas", desc: "Para esquentar a marmita e o coração.", value: 650 },
    ],
  },
  {
    title: "Casa",
    items: [
      { name: "Ferro de passar a vapor", desc: "Camisa amassada nunca mais.", value: 150 },
      { name: "Ventilador", desc: "Piracicaba em março não perdoa.", value: 200 },
      { name: "Cortina blackout", desc: "Para dormir até mais tarde nos sábados.", value: 220 },
      { name: "Aspirador de pó vertical", desc: "Faxina rápida para sobrar tempo para nós dois.", value: 400 },
      { name: "Cota da geladeira", desc: "Ajude a encher (e a comprar) a nossa geladeira.", value: 500 },
      { name: "Cota da máquina de lavar", desc: "Uma parte da máquina que vai salvar o nosso casamento.", value: 500 },
    ],
  },
  {
    title: "Quarto e banho",
    items: [
      { name: "Par de travesseiros", desc: "Um para cada lado da cama, sem brigas.", value: 180 },
      { name: "Jogo de toalhas", desc: "Macias, fofinhas e combinando.", value: 200 },
      { name: "Edredom queen", desc: "Fim da disputa pelo cobertor no meio da madrugada.", value: 250 },
      { name: "Jogo de cama queen", desc: "Lençóis novos para uma vida nova.", value: 300 },
    ],
  },
  {
    title: "Lua de mel",
    items: [
      { name: "Jantar romântico na lua de mel", desc: "Com vista bonita e sem ninguém precisar lavar a louça.", value: 250 },
      { name: "Passeio na lua de mel", desc: "Um dia de aventura que vamos lembrar para sempre.", value: 300 },
      { name: "Cota da passagem", desc: "Um pedacinho da viagem dos nossos sonhos.", value: 400 },
    ],
  },
  {
    title: "Só para rir",
    items: [
      { name: "Kit primeiros socorros: Igor na cozinha", desc: "Band-aid, pomada para queimadura e muita paciência da Judiy.", value: 100 },
      { name: "Primeira conta de internet", desc: "Em troca, você ganha a senha do Wi-Fi quando vier nos visitar.", value: 120 },
      { name: "Gasolina para visitar os sogros", desc: "Um tanque cheio de boas intenções (e de saudade).", value: 150 },
      { name: "Um mês de pizza de domingo", desc: "Porque domingo à noite ninguém merece cozinhar.", value: 200 },
      { name: "Valor livre", desc: "Do tamanho do seu carinho — você escolhe o valor no app do banco.", value: null },
    ],
  },
];

(function () {
  var cfg = (window.WEDDING && window.WEDDING.pix) || {};
  var list = document.getElementById("gift-list");
  var dialog = document.getElementById("pix-dialog");
  if (!list || !dialog) return;

  /* ---------- PIX "copia e cola" (BR Code estático, padrão EMV do Banco Central) ---------- */
  function ascii(s, max) {
    return String(s || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9 .,\-]/g, "")
      .trim().slice(0, max);
  }
  function field(id, value) {
    return id + String(value.length).padStart(2, "0") + value;
  }
  function crc16(str) {
    var crc = 0xffff;
    for (var i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (var b = 0; b < 8; b++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }
  function pixPayload(amount, description) {
    var key = String(cfg.key).trim();
    // campo 26 tem no máximo 99 caracteres: a descrição usa o que sobrar
    var desc = ascii(description, Math.min(40, 99 - 26 - key.length));
    var account = field("00", "br.gov.bcb.pix") + field("01", key) + (desc ? field("02", desc) : "");
    var p =
      field("00", "01") +
      field("26", account) +
      field("52", "0000") +
      field("53", "986") +
      (amount ? field("54", amount.toFixed(2)) : "") +
      field("58", "BR") +
      field("59", ascii(cfg.name, 25) || "Noivos") +
      field("60", ascii(cfg.city, 15) || "Brasil") +
      field("62", field("05", "***")) +
      "6304";
    return p + crc16(p);
  }

  /* ---------- Lista ---------- */
  function money(v) {
    return "R$ " + v.toLocaleString("pt-BR");
  }

  GIFTS.forEach(function (group) {
    var section = document.createElement("section");
    section.className = "gift-group";
    var h = document.createElement("h2");
    h.className = "script-title gift-group__title reveal";
    h.textContent = group.title;
    var ul = document.createElement("ul");
    ul.className = "gift-list";
    section.appendChild(h);
    section.appendChild(ul);
    list.appendChild(section);
    group.items.forEach(function (g) { ul.appendChild(giftCard(g)); });
  });

  function giftCard(g) {
    var li = document.createElement("li");
    li.className = "gift reveal" + (g.value ? "" : " gift--free");
    li.innerHTML =
      '<h3 class="gift__name"></h3>' +
      '<p class="gift__desc"></p>' +
      '<div class="gift__foot">' +
      '<span class="gift__price"></span>' +
      '<button class="gift__btn" type="button">Presentear</button>' +
      "</div>";
    li.querySelector(".gift__name").textContent = g.name;
    li.querySelector(".gift__desc").textContent = g.desc;
    li.querySelector(".gift__price").textContent = g.value ? money(g.value) : "Você escolhe";
    li.querySelector(".gift__btn").addEventListener("click", function () { openGift(g); });
    return li;
  }

  /* ---------- Modal ---------- */
  var elTitle = document.getElementById("pix-title");
  var elValue = document.getElementById("pix-value");
  var elQr = document.getElementById("pix-qr");
  var elCopy = document.getElementById("pix-copy");
  var elKey = document.getElementById("pix-key");
  var elReady = dialog.querySelectorAll("[data-pix-ready]");
  var elSoon = dialog.querySelector("[data-pix-soon]");
  var current = "";
  var copyLabel = elCopy.textContent;

  function openGift(g) {
    elTitle.textContent = g.name;
    elValue.textContent = g.value ? money(g.value) : "Você escolhe o valor";

    var hasKey = !!String(cfg.key || "").trim();
    elReady.forEach(function (el) { el.hidden = !hasKey; });
    elSoon.hidden = hasKey;

    if (hasKey) {
      current = pixPayload(g.value, g.name);
      var qr = qrcode(0, "M");
      qr.addData(current);
      qr.make();
      elQr.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true, alt: "QR code PIX" });
      elKey.textContent = cfg.key;
    }
    elCopy.textContent = copyLabel;

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      dialog.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      ta.remove();
      ok ? resolve() : reject();
    });
  }

  elCopy.addEventListener("click", function () {
    copy(current).then(
      function () { elCopy.textContent = "Código copiado ✓"; },
      function () { window.prompt("Copie o código PIX:", current); }
    );
  });

  function close() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }
  dialog.querySelector(".pix__close").addEventListener("click", close);
  // clique no fundo escuro fecha
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });
})();
