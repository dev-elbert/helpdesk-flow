'use strict';

// Este projeto usa localStorage para funcionar sem servidor.
// Os dados são apenas de demonstração; NÃO insira informações sensíveis reais.
const STORAGE_KEY = 'flowdesk_tickets_v1';
const PRIORITIES = ['Baixa', 'Média', 'Alta'];
const STATUSES = ['Aberto', 'Em andamento', 'Resolvido'];
const LIMITS = { title: 100, client: 70, owner: 60, description: 600 };
const EXAMPLES = [
  { id: 1042, title: 'Erro ao gerar relatório financeiro', client: 'Aurora Tech', priority: 'Alta', status: 'Aberto', owner: 'Mariana Costa', description: 'Erro intermitente ao exportar PDF.', createdAt: '2026-10-23T10:30:00' },
  { id: 1041, title: 'Dúvida sobre permissões de acesso', client: 'Grupo Solaris', priority: 'Baixa', status: 'Resolvido', owner: 'Pedro Lima', description: 'Orientação sobre perfis de usuário.', createdAt: '2026-10-22T14:15:00' },
  { id: 1040, title: 'Integração não sincroniza pedidos', client: 'Nova Comércio', priority: 'Alta', status: 'Em andamento', owner: 'Ana Souza', description: 'Analisar integração entre plataformas.', createdAt: '2026-10-21T09:20:00' },
  { id: 1039, title: 'Atualização de dados cadastrais', client: 'Ponto Norte', priority: 'Média', status: 'Aberto', owner: 'Lucas Rocha', description: 'Solicitação de alteração de cadastro.', createdAt: '2026-10-20T16:42:00' },
  { id: 1038, title: 'Lentidão no painel de vendas', client: 'Atlas Digital', priority: 'Média', status: 'Resolvido', owner: 'Mariana Costa', description: 'Diagnóstico de desempenho.', createdAt: '2026-10-19T11:05:00' },
  { id: 1037, title: 'Ajuste no fluxo de cobrança', client: 'Horizonte Serviços', priority: 'Média', status: 'Em andamento', owner: 'Pedro Lima', description: 'Revisão do processo de cobrança.', createdAt: '2026-10-18T13:00:00' },
];
const $ = (selector) => document.querySelector(selector);
const elements = {
  body: $('#ticketBody'), empty: $('#emptyState'), emptyMessage: $('#emptyMessage'), count: $('#resultCount'),
  total: $('#metricTotal'), open: $('#metricOpen'), progress: $('#metricProgress'), resolved: $('#metricResolved'),
  search: $('#searchInput'), statusFilter: $('#statusFilter'), priorityFilter: $('#priorityFilter'),
  clearFilters: $('#clearFiltersBtn'), dialog: $('#ticketDialog'), form: $('#ticketForm'), toast: $('#toast'),
};

// ---------- Armazenamento ----------

// O localStorage pode ter sido editado à mão ou vir de uma versão antiga:
// cada chamado é validado antes de entrar no app, e o que for inválido é descartado.
function normalizeTicket(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = Number(raw.id);
  const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
  const title = text(raw.title, LIMITS.title);
  const client = text(raw.client, LIMITS.client);
  if (!Number.isInteger(id) || id <= 0 || !title || !client) return null;
  return {
    id, title, client,
    priority: PRIORITIES.includes(raw.priority) ? raw.priority : 'Média',
    status: STATUSES.includes(raw.status) ? raw.status : 'Aberto',
    owner: text(raw.owner, LIMITS.owner),
    description: text(raw.description, LIMITS.description),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
  };
}
function loadTickets() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) return structuredClone(EXAMPLES);
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return structuredClone(EXAMPLES);
    const seen = new Set();
    return parsed.map(normalizeTicket).filter((ticket) => {
      if (!ticket || seen.has(ticket.id)) return false;
      seen.add(ticket.id);
      return true;
    });
  } catch (error) {
    console.warn('Não foi possível ler o armazenamento local.', error);
    return structuredClone(EXAMPLES);
  }
}
let tickets = loadTickets();
let toastTimer;
function saveTickets() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }
  catch (error) { console.warn('Não foi possível salvar.', error); showToast('Armazenamento indisponível: alterações apenas nesta sessão.'); }
}

// ---------- Utilitários ----------

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 3200);
}
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
// "Média" vira "media" e "Em andamento" vira "em-andamento": nome de classe CSS sem acento nem espaço.
function safeClass(value) { return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replaceAll(' ', '-'); }
function plural(count, singular, pluralForm) { return `${count} ${count === 1 ? singular : pluralForm}`; }

// ---------- Tabela ----------

function createCell(text, className) {
  const cell = document.createElement('td');
  if (className) cell.className = className;
  cell.textContent = text;
  return cell;
}
function createPillCell(text, className) {
  const td = document.createElement('td');
  const span = document.createElement('span');
  span.className = `pill ${className}-${safeClass(text)}`;
  span.textContent = text;
  td.append(span);
  return td;
}
function createTicketRow(ticket) {
  const tr = document.createElement('tr');
  const titleCell = document.createElement('td');
  const name = document.createElement('div');
  name.className = 'ticket-name'; name.textContent = ticket.title;
  titleCell.append(name);
  if (ticket.description) {
    const description = document.createElement('div');
    description.className = 'ticket-desc'; description.textContent = ticket.description;
    description.title = ticket.description;
    titleCell.append(description);
  }
  const id = document.createElement('div');
  id.className = 'ticket-id'; id.textContent = `#${ticket.id}`;
  titleCell.append(id);
  tr.append(titleCell, createCell(ticket.client), createPillCell(ticket.priority, 'priority'), createPillCell(ticket.status, 'status'), createCell(ticket.owner || 'Não atribuído'), createCell(formatDate(ticket.createdAt)));
  const actions = document.createElement('td');
  const edit = document.createElement('button');
  edit.className = 'action-btn'; edit.type = 'button'; edit.textContent = 'Editar';
  edit.setAttribute('aria-label', `Editar chamado ${ticket.id}`);
  edit.addEventListener('click', () => openDialog(ticket));
  const remove = document.createElement('button');
  remove.className = 'action-btn danger'; remove.type = 'button'; remove.textContent = 'Excluir';
  remove.setAttribute('aria-label', `Excluir chamado ${ticket.id}`);
  remove.addEventListener('click', () => {
    if (!confirm(`Excluir o chamado #${ticket.id}?`)) return;
    tickets = tickets.filter((item) => item.id !== ticket.id);
    saveTickets(); render(); showToast('Chamado excluído.');
  });
  actions.append(edit, remove); tr.append(actions);
  return tr;
}
function getFilteredTickets() {
  const search = elements.search.value.trim().toLocaleLowerCase('pt-BR');
  const status = elements.statusFilter.value;
  const priority = elements.priorityFilter.value;
  return tickets.filter((ticket) => {
    const matchSearch = [ticket.title, ticket.client, ticket.owner || '', String(ticket.id)].some((v) => v.toLocaleLowerCase('pt-BR').includes(search));
    return matchSearch && (status === 'todos' || ticket.status === status) && (priority === 'todas' || ticket.priority === priority);
  }).sort((a, b) => b.id - a.id);
}
function render() {
  elements.total.textContent = tickets.length;
  elements.open.textContent = tickets.filter((t) => t.status === 'Aberto').length;
  elements.progress.textContent = tickets.filter((t) => t.status === 'Em andamento').length;
  elements.resolved.textContent = tickets.filter((t) => t.status === 'Resolvido').length;
  const shown = getFilteredTickets();
  elements.body.replaceChildren(...shown.map(createTicketRow));
  elements.count.textContent = plural(shown.length, 'chamado', 'chamados');
  elements.empty.hidden = shown.length !== 0;
  const noTickets = tickets.length === 0;
  elements.emptyMessage.textContent = noTickets ? 'Nenhum chamado cadastrado. Clique em "Novo chamado" para começar.' : 'Nenhum chamado encontrado com esses filtros.';
  elements.clearFilters.hidden = noTickets;
}
function clearFilters() {
  elements.search.value = '';
  elements.statusFilter.value = 'todos';
  elements.priorityFilter.value = 'todas';
}

// ---------- Exportação CSV ----------

// Ponto e vírgula e BOM UTF-8 para o Excel em português abrir com acentos e colunas certas.
// Valores que começam com = + - @ ganham um apóstrofo para não virarem fórmula (CSV injection).
function toCsvValue(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function exportCsv() {
  const shown = getFilteredTickets();
  if (shown.length === 0) { showToast('Nenhum chamado para exportar.'); return; }
  const header = ['Número', 'Título', 'Cliente', 'Prioridade', 'Status', 'Responsável', 'Criado em', 'Descrição'];
  const rows = shown.map((t) => [t.id, t.title, t.client, t.priority, t.status, t.owner, formatDate(t.createdAt), t.description]);
  const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `flowdesk-chamados-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast(`${plural(shown.length, 'chamado exportado', 'chamados exportados')}.`);
}

// ---------- Formulário ----------

function openDialog(ticket = null) {
  elements.form.reset();
  $('#ticketId').value = ticket?.id ?? '';
  $('#dialogTitle').textContent = ticket ? `Editar chamado #${ticket.id}` : 'Novo chamado';
  if (ticket) {
    $('#titleInput').value = ticket.title;
    $('#clientInput').value = ticket.client;
    $('#priorityInput').value = ticket.priority;
    $('#statusInput').value = ticket.status;
    $('#ownerInput').value = ticket.owner || '';
    $('#descriptionInput').value = ticket.description || '';
  }
  elements.dialog.showModal();
  $('#titleInput').focus();
}
function closeDialog() { elements.dialog.close(); }

// ---------- Eventos ----------

$('#newTicketBtn').addEventListener('click', () => openDialog());
$('#exportBtn').addEventListener('click', exportCsv);
$('#closeDialogBtn').addEventListener('click', closeDialog);
$('#cancelBtn').addEventListener('click', closeDialog);
elements.dialog.addEventListener('click', (event) => { if (event.target === elements.dialog) closeDialog(); });
elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!elements.form.reportValidity()) return;
  const id = Number($('#ticketId').value);
  const existing = tickets.find((ticket) => ticket.id === id);
  const data = {
    id: existing ? existing.id : Math.max(1000, ...tickets.map((item) => item.id)) + 1,
    title: $('#titleInput').value.trim(), client: $('#clientInput').value.trim(),
    priority: $('#priorityInput').value, status: $('#statusInput').value,
    owner: $('#ownerInput').value.trim(), description: $('#descriptionInput').value.trim(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  if (!data.title || !data.client) { showToast('Preencha título e cliente.'); return; }
  if (existing) Object.assign(existing, data); else tickets.unshift(data);
  saveTickets(); render(); closeDialog(); showToast(existing ? 'Chamado atualizado.' : 'Chamado criado.');
});
[elements.search, elements.statusFilter, elements.priorityFilter].forEach((element) => element.addEventListener('input', render));
elements.clearFilters.addEventListener('click', () => { clearFilters(); render(); elements.search.focus(); });
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('Restaurar os exemplos? Todos os chamados adicionados ou alterados serão perdidos.')) return;
  tickets = structuredClone(EXAMPLES);
  clearFilters();
  saveTickets(); render(); showToast('Dados de demonstração restaurados.');
});
render();
