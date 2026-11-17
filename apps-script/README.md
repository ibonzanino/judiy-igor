# Confirmação de presença — planilha + Apps Script

O botão **Confirmar presença!** do site abre um modal que conversa com uma Planilha
Google. Vocês cuidam da lista de convidados na planilha. As respostas chegam
sozinhas, uma linha por pessoa.

## 1. Criar a planilha

1. Crie uma planilha nova no Google Planilhas (por exemplo, "Casamento — RSVP").
2. Vá em **Extensões → Apps Script**, apague o que estiver no editor, cole todo o
   conteúdo de [`Code.gs`](Code.gs) e salve.
3. Volte à planilha e recarregue a página. Vai aparecer o menu **Casamento**.
4. Clique em **Casamento → Preparar abas**. O Google pede autorização na primeira
   vez; é o próprio script de vocês, pode autorizar. Isso cria as abas
   **Convidados** e **Respostas**.

## 2. Preencher a aba "Convidados"

Uma linha por **pessoa**. As pessoas do mesmo convite têm o mesmo nome em **Convite**:

| Código | Convite       | Nome        | Criança | Link |
|--------|---------------|-------------|---------|------|
|        | Família Silva | João Silva  |         |      |
|        | Família Silva | Maria Silva |         |      |
|        | Família Silva | Pedro Silva | sim     |      |
|        | Ana e Bruno   | Ana Costa   |         |      |
|        | Ana e Bruno   | Bruno Lima  |         |      |
|        | Carla         | Carla Souza |         |      |

- **Convite**: aparece no modal como "Olá, *Família Silva*!". Use nomes diferentes
  para convites diferentes, por exemplo "Família Silva (tios)" e "Família Silva (primos)".
- **Nome**: nome e sobrenome, porque é assim que a pessoa se acha na busca.
- **Criança**: escreva `sim` (ou use uma caixa de seleção). Fica em branco para adultos.
- Deixe **Código** e **Link** em branco e clique em **Casamento → Gerar códigos e
  links**. Cada convite ganha um código, e a primeira linha dele ganha o link para
  mandar no WhatsApp.

Dá para rodar **Gerar códigos e links** de novo sempre que acrescentarem
convidados. Os códigos que já existem não mudam.

> ⚠️ Não troque o código de um convite depois de mandar o link, senão o link antigo
> para de funcionar.

## 3. Publicar o app da web

1. No Apps Script, vá em **Implantar → Nova implantação**.
2. Em ⚙️ escolha **App da Web**.
   - **Executar como:** Eu
   - **Quem pode acessar:** Qualquer pessoa
3. Clique em **Implantar** e copie a **URL do app da Web** (termina em `/exec`).
4. Cole essa URL em `js/config.js`, no campo `rsvp.api`, e publique o site.

Se mudarem o `Code.gs` depois, use **Implantar → Gerenciar implantações → ✏️ →
Versão: Nova versão**. Assim a URL continua a mesma. "Nova implantação" geraria
outra URL.

## 4. Acompanhar as respostas

A aba **Respostas** tem uma linha por pessoa, com Presença "Sim" ou "Não". Se o
convite responder de novo, a resposta anterior é substituída. Restrição
alimentar e recado ficam na primeira linha de cada convite.

Contagens úteis, para colar numa aba "Resumo":

```
Confirmados:         =CONT.SE(Respostas!F:F; "Sim")
Não vão:             =CONT.SE(Respostas!F:F; "Não")
Crianças que vão:    =CONT.SES(Respostas!F:F; "Sim"; Respostas!E:E; "Sim")
Total convidados:    =CONT.VALORES(Convidados!C2:C)
Ainda sem resposta:  =CONT.VALORES(Convidados!C2:C) - CONT.VALORES(Respostas!D2:D)
```

## Como o site usa isso

- Quem abre o link `…/?c=CODIGO` vê os nomes do próprio convite e marca **Vou** ou
  **Não vou** para cada pessoa. O código fica salvo no navegador, então a
  pessoa pode voltar ao site sem o link.
- **Só entra quem tem link com código válido** (`js/access.js`). Sem código, ou com um
  código que não está na planilha, aparece a tela "Este convite é pessoal" com o botão
  "Pedir o link no WhatsApp". Se o Google estiver fora do ar, quem tem código entra
  mesmo assim. Isso vale para o convite e para a lista de presentes.
- Dentro do modal, "Não é você?" deixa procurar outro convite pelo **nome e
  sobrenome** (útil em celular compartilhado). A busca exige pelo menos duas palavras
  e mostra só o nome do convite.
- Para tirar alguém do site, apague as linhas do convite na aba Convidados. O link
  dele para de abrir o site.
- Depois do prazo (`rsvp.deadline` em `js/config.js`) o modal mostra só o contato
  de vocês.
