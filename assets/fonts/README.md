# assets/fonts

## Citadel Script (fonte do script — nomes, títulos, assinatura)

**Citadel Script** não está no Google Fonts (é uma fonte premium, gratuita para uso pessoal),
por isso fica auto-hospedada aqui: `assets/fonts/citadel-script.otf`.

- O `@font-face` está em `css/tokens.css`, com `font-display: block`: enquanto a fonte
  carrega, o texto fica invisível (até ~3s) em vez de aparecer numa fonte reserva e "pular".
- O `<head>` do `index.html` e do `presentes.html` faz `preload` do arquivo, para ele
  chegar junto com o HTML. Se trocar o nome ou o formato do arquivo, atualize os três lugares.

> Dica: converter para `.woff2` (cloudconvert / transfonter) deixa o arquivo menor.

As outras duas fontes (**Cormorant Garamond** e **Merriweather**) vêm do Google Fonts,
carregadas no `<head>` das páginas — não precisa fazer nada.
