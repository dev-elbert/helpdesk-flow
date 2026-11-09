# FlowDesk: painel de gestão de chamados

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Sem dependências](https://img.shields.io/badge/depend%C3%AAncias-0-6789f8)
![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-39c595)

Projeto de portfólio que simula uma central de atendimento de suporte. Feito com **HTML, CSS e JavaScript puro**, sem bibliotecas, sem build e sem servidor.

**[▶ Ver demonstração ao vivo](https://dev-elbert.github.io/helpdesk-flow/)**

<!-- Para mostrar a tela aqui: tire um print, salve como docs/screenshot.png e descomente a linha abaixo. -->
<!-- ![Tela do FlowDesk](docs/screenshot.png) -->

## Funcionalidades

- **Indicadores** com total de chamados, abertos, em andamento e resolvidos.
- **Cadastro, edição e exclusão** de chamados num modal acessível (`<dialog>`).
- **Busca** por título, cliente, responsável ou número.
- **Filtros combinados** por status e prioridade, com botão para limpar.
- **Exportação CSV** do que está filtrado na tela, pronta para abrir no Excel.
- **Persistência** com `localStorage`, com validação dos dados ao carregar.
- **Layout responsivo** para computador e celular.
- Dados fictícios de exemplo e botão para restaurá-los.

## Como executar

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` no navegador.
3. Clique em **Novo chamado** para testar.

Não precisa instalar nada. Se preferir um servidor local, qualquer um serve, por exemplo `npx serve .` ou a extensão Live Server do VS Code.

> Os dados ficam **apenas no navegador e no dispositivo atual**. Não existe banco de dados, login, sincronização nem controle real de acesso. **Não use dados pessoais reais.**

## Estrutura

```text
helpdesk-flow/
├── index.html    # Estrutura da página e formulário
├── styles.css    # Estilo, layout e responsividade
├── script.js     # Regras, filtros, exportação e armazenamento local
├── favicon.svg   # Ícone da aba
└── README.md     # Esta documentação
```

## Decisões técnicas

| Decisão | Por quê |
| --- | --- |
| Elementos criados com `createElement` e `textContent` | Nenhum texto digitado vira HTML, o que evita XSS. |
| Validação ao ler o `localStorage` | Dado corrompido ou editado à mão é descartado em vez de quebrar a tela. |
| CSV com `;`, BOM UTF-8 e proteção contra fórmula | Abre certo no Excel em português e evita *CSV injection* (`=`, `+`, `-`, `@`). |
| `<dialog>` nativo | Foco preso no modal, tecla Esc e fundo escuro sem biblioteca. |
| `aria-label`, `aria-live` e `:focus-visible` | Uso por teclado e leitor de tela. |
| `prefers-reduced-motion` | Respeita quem desativa animações no sistema. |

## O que este projeto demonstra

Manipulação do DOM, eventos, arrays (`filter`, `map`, `sort`), `Blob` e download de arquivos, `Intl.DateTimeFormat`, criação de elementos seguros, persistência local e interface responsiva sem framework.

## Próximos passos

- [ ] API REST com Node.js e Express.
- [ ] Banco de dados (PostgreSQL) no lugar do `localStorage`.
- [ ] Login, permissões e validação no servidor.
- [ ] Histórico de movimentações de cada chamado.
- [ ] Ordenação por coluna e paginação.
- [ ] Testes automatizados.

## Publicação no GitHub Pages

Em **Settings → Pages**, selecione **Deploy from a branch**, a branch `main` e a pasta `/ (root)`. Em um ou dois minutos o site fica no ar em `https://dev-elbert.github.io/helpdesk-flow/`.

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).
