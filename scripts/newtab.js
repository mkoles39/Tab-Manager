// New-tab dashboard controller
const $ = id => document.getElementById(id);
const view = { current: 'workspaces', query: '' };

function showView(name) {
  view.current = name;
  $('board-container').classList.toggle('hidden', name !== 'workspaces');
  $('notes-view').classList.toggle('hidden', name !== 'notes');
  $('todo-view').classList.toggle('hidden', name !== 'todo');
  document.querySelectorAll('.sidebar-nav .nav-item').forEach((b, i) =>
    b.classList.toggle('active', ['workspaces', 'notes', 'todo'][i] === name));
  document.querySelector('.workspace-selector').style.visibility = name === 'workspaces' ? '' : 'hidden';
  if (name === 'notes') renderNotes();
  if (name === 'todo') renderTodos();
}

/* ---------- Workspaces ---------- */
function renderWorkspaceSelector() {
  const sel = document.querySelector('.workspace-selector');
  const active = BookmarkManager.active().id;
  sel.innerHTML = BookmarkManager.data.workspaces.map(w =>
    `<button class="workspace-btn ${w.id === active ? 'active' : ''}" data-id="${w.id}" title="Çift tıkla: yeniden adlandır">${Utils.escapeHtml(w.name)}</button>`
  ).join('') + '<button class="add-workspace-btn" title="Yeni çalışma alanı">+</button>';
}

function renderBoard() {
  const q = view.query.trim().toLowerCase();
  const ws = BookmarkManager.active();
  const cols = ws.columns.map(col => {
    const items = col.items.filter(i => !q || i.title.toLowerCase().includes(q) || i.url.toLowerCase().includes(q));
    if (q && !items.length) return '';
    return `<section class="column" data-col="${col.id}">
      <header class="column-header">
        <h4 class="column-title" title="Çift tıkla: yeniden adlandır">${Utils.escapeHtml(col.name)}</h4>
        <span class="muted">${col.items.length}</span>
        <button class="btn-icon col-delete" title="Kategoriyi sil">🗑️</button>
      </header>
      <div class="column-items">
        ${items.map(i => `<div class="bookmark" data-item="${i.id}">
          <img class="favicon" src="${Utils.escapeHtml(faviconFor(i.url))}" alt="">
          <a href="${Utils.escapeHtml(i.url)}" title="${Utils.escapeHtml(i.url)}">${Utils.escapeHtml(i.title)}</a>
          <button class="btn-icon item-delete" title="Sil">✕</button></div>`).join('')}
      </div>
      <button class="add-item-btn">+ Bağlantı ekle</button>
    </section>`;
  }).join('');
  $('tabs-container').innerHTML = cols + '<button class="add-column-btn">+ Yeni kategori</button>';
}

function faviconFor(url) {
  return `${chrome.runtime.getURL('_favicon/')}?pageUrl=${encodeURIComponent(url)}&size=32`;
}

async function renderOpenTabs() {
  const tabs = (await TabManager.getAll()).filter(TabManager.isRealPage);
  $('open-tabs-list').innerHTML = tabs.map(t => `<div class="open-tab" draggable="true"
      data-id="${t.id}" data-url="${Utils.escapeHtml(t.url)}" data-title="${Utils.escapeHtml(t.title || t.url)}">
      ${Utils.faviconHtml(t)}<span class="tab-title">${Utils.escapeHtml(t.title || t.url)}</span></div>`).join('')
    || '<div class="empty">Açık sekme yok</div>';
}

async function addLinkFlow(colId, preset = {}) {
  const body = await UI.modal({
    title: 'Bağlantı ekle', confirmText: 'Ekle',
    bodyHtml: `<label class="field"><span>Başlık</span><input type="text" id="l-title" value="${Utils.escapeHtml(preset.title || '')}"></label>
      <label class="field"><span>URL</span><input type="text" id="l-url" value="${Utils.escapeHtml(preset.url || '')}" placeholder="https://"></label>`
  });
  if (!body) return;
  const url = body.querySelector('#l-url').value.trim();
  if (!url) return UI.toast('URL gerekli', 'error');
  await BookmarkManager.addItem(colId, body.querySelector('#l-title').value.trim(), url);
  renderBoard();
}

function bindWorkspaces() {
  document.querySelector('.workspace-selector').addEventListener('click', async e => {
    if (e.target.closest('.add-workspace-btn')) {
      const name = await UI.prompt('Yeni çalışma alanı', 'Ad:', '', 'Oluştur');
      if (name) { await BookmarkManager.addWorkspace(name); renderWorkspaceSelector(); renderBoard(); }
    } else if (e.target.closest('.workspace-btn')) {
      await BookmarkManager.setActive(e.target.closest('.workspace-btn').dataset.id);
      renderWorkspaceSelector(); renderBoard();
    }
  });
  document.querySelector('.workspace-selector').addEventListener('dblclick', async e => {
    const btn = e.target.closest('.workspace-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    const body = await UI.modal({
      title: 'Çalışma alanı', confirmText: 'Kaydet',
      bodyHtml: `<label class="field"><span>Ad</span><input type="text" id="ws-name" value="${Utils.escapeHtml(btn.textContent)}"></label>
        <label class="field"><input type="checkbox" id="ws-del"> Bu çalışma alanını sil</label>`
    });
    if (!body) return;
    if (body.querySelector('#ws-del').checked) await BookmarkManager.deleteWorkspace(id);
    else if (body.querySelector('#ws-name').value.trim()) await BookmarkManager.renameWorkspace(id, body.querySelector('#ws-name').value.trim());
    renderWorkspaceSelector(); renderBoard();
  });

  const board = $('tabs-container');
  board.addEventListener('click', async e => {
    const col = e.target.closest('.column');
    if (e.target.closest('.add-column-btn')) {
      const name = await UI.prompt('Yeni kategori', 'Kategori adı:', '', 'Ekle');
      if (name) { await BookmarkManager.addColumn(name); renderBoard(); }
    } else if (col && e.target.closest('.add-item-btn')) {
      addLinkFlow(col.dataset.col);
    } else if (col && e.target.closest('.col-delete')) {
      if (await UI.confirm('Kategoriyi sil', 'Bu kategori ve içindeki bağlantılar silinsin mi?', 'Sil')) {
        await BookmarkManager.deleteColumn(col.dataset.col); renderBoard();
      }
    } else if (col && e.target.closest('.item-delete')) {
      await BookmarkManager.deleteItem(col.dataset.col, e.target.closest('.bookmark').dataset.item);
      renderBoard();
    }
  });
  board.addEventListener('dblclick', async e => {
    const title = e.target.closest('.column-title');
    if (!title) return;
    const col = title.closest('.column');
    const name = await UI.prompt('Kategoriyi yeniden adlandır', 'Ad:', title.textContent);
    if (name) { await BookmarkManager.renameColumn(col.dataset.col, name); renderBoard(); }
  });

  // Drag an open tab onto a column to bookmark it
  $('open-tabs-list').addEventListener('click', e => {
    const el = e.target.closest('.open-tab');
    if (el) TabManager.goTo(Number(el.dataset.id));
  });
  $('open-tabs-list').addEventListener('dragstart', e => {
    const el = e.target.closest('.open-tab');
    if (!el) return;
    e.dataTransfer.setData('application/x-tab', JSON.stringify({ url: el.dataset.url, title: el.dataset.title }));
    e.dataTransfer.effectAllowed = 'copy';
  });
  board.addEventListener('dragover', e => {
    const col = e.target.closest('.column');
    if (col && e.dataTransfer.types.includes('application/x-tab')) { e.preventDefault(); col.classList.add('drag-over'); }
  });
  board.addEventListener('dragleave', e => { const c = e.target.closest('.column'); if (c) c.classList.remove('drag-over'); });
  board.addEventListener('drop', async e => {
    const col = e.target.closest('.column');
    if (!col) return;
    e.preventDefault();
    col.classList.remove('drag-over');
    try {
      const { url, title } = JSON.parse(e.dataTransfer.getData('application/x-tab'));
      await BookmarkManager.addItem(col.dataset.col, title, url);
      renderBoard();
    } catch { /* ignore foreign drops */ }
  });

  $('show-open-tabs-btn').onclick = async () => {
    const panel = $('open-tabs-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderOpenTabs();
  };
  $('close-tabs-panel').onclick = () => $('open-tabs-panel').classList.add('hidden');
}

/* ---------- Notes ---------- */
function renderNotes() {
  const q = view.query.trim().toLowerCase();
  const notes = NotesManager.notes.filter(n => !q || (n.title + n.content).toLowerCase().includes(q));
  $('notes-grid').innerHTML = notes.map(n => `<div class="note" data-id="${n.id}">
      <input class="note-title" placeholder="Başlık" value="${Utils.escapeHtml(n.title)}">
      <textarea class="note-content" placeholder="Not...">${Utils.escapeHtml(n.content)}</textarea>
      <div class="note-footer"><span class="muted">${Utils.formatDate(n.updatedAt)}</span>
      <button class="btn-icon note-delete" title="Sil">🗑️</button></div></div>`).join('')
    || '<div class="empty">Henüz not yok</div>';
}

function bindNotes() {
  $('add-note-btn').onclick = async () => { await NotesManager.add(); renderNotes(); };
  const save = Utils.debounce((id, patch) => NotesManager.update(id, patch), 400);
  $('notes-grid').addEventListener('input', e => {
    const note = e.target.closest('.note');
    if (!note) return;
    save(note.dataset.id, {
      title: note.querySelector('.note-title').value,
      content: note.querySelector('.note-content').value
    });
  });
  $('notes-grid').addEventListener('click', async e => {
    const note = e.target.closest('.note');
    if (note && e.target.closest('.note-delete') &&
        await UI.confirm('Notu sil', 'Bu not silinsin mi?', 'Sil')) {
      await NotesManager.remove(note.dataset.id); renderNotes();
    }
  });
}

/* ---------- To-do ---------- */
function renderTodos() {
  const q = view.query.trim().toLowerCase();
  const todos = TodoManager.todos.filter(t => !q || t.text.toLowerCase().includes(q));
  $('todo-list').innerHTML = todos.map(t => `<div class="todo-item ${t.done ? 'done' : ''}" data-id="${t.id}">
      <input type="checkbox" class="todo-check" ${t.done ? 'checked' : ''}>
      <span class="todo-text">${Utils.escapeHtml(t.text)}</span>
      <button class="btn-icon todo-delete" title="Sil">✕</button></div>`).join('')
    || '<div class="empty">Görev yok</div>';
}

function bindTodos() {
  const add = async () => {
    const input = $('new-todo-input');
    const text = input.value.trim();
    if (!text) return;
    await TodoManager.add(text);
    input.value = '';
    renderTodos();
  };
  $('add-todo-btn').onclick = add;
  $('new-todo-input').addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  $('todo-list').addEventListener('click', async e => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    if (e.target.classList.contains('todo-check')) { await TodoManager.toggle(item.dataset.id); renderTodos(); }
    else if (e.target.closest('.todo-delete')) { await TodoManager.remove(item.dataset.id); renderTodos(); }
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([BookmarkManager.load(), NotesManager.load(), TodoManager.load()]);
  document.querySelectorAll('.sidebar-nav .nav-item').forEach((b, i) =>
    b.onclick = () => showView(['workspaces', 'notes', 'todo'][i]));
  document.querySelector('.sidebar-bottom .nav-item').onclick = () => UI.toast('Ayarlar yakında', 'info');
  $('search-input').addEventListener('input', Utils.debounce(e => {
    view.query = e.target.value;
    if (view.current === 'workspaces') renderBoard();
    else if (view.current === 'notes') renderNotes();
    else renderTodos();
  }, 120));
  bindWorkspaces(); bindNotes(); bindTodos();
  renderWorkspaceSelector();
  renderBoard();
});
