// Popup controller
const state = { tabs: [], selected: new Set(), query: '', view: 'tabs', dupIds: new Set(), extraDupIds: new Set() };
const $ = id => document.getElementById(id);

async function loadTabs() {
  state.tabs = await TabManager.getAll();
  const { extraIds, allIds } = TabManager.findDuplicates(state.tabs);
  state.extraDupIds = extraIds;
  state.dupIds = allIds;
  const alive = new Set(state.tabs.map(t => t.id));
  state.selected = new Set([...state.selected].filter(id => alive.has(id)));
}

function visibleTabs() { return TabManager.filter(state.tabs, state.query); }

function updateStats() {
  $('total-tabs').textContent = state.tabs.length;
  $('selected-tabs').textContent = state.selected.size;
  $('duplicate-tabs').textContent = state.extraDupIds.size;
}

function renderTabs() {
  const container = $('tabs-container');
  const tabs = visibleTabs();
  if (!tabs.length) {
    container.innerHTML = '<div class="empty">Sekme bulunamadı</div>';
    updateStats();
    return;
  }
  const byWindow = TabManager.groupByWindow(tabs);
  let html = '';
  let n = 1;
  for (const [, list] of byWindow) {
    html += `<div class="window-header">Pencere ${n++} <span class="muted">(${list.length})</span></div>`;
    for (const t of list) {
      const cls = ['tab-item'];
      if (t.active) cls.push('active');
      if (state.dupIds.has(t.id)) cls.push('duplicate');
      html += `<div class="${cls.join(' ')}" data-id="${t.id}">
        <input type="checkbox" class="tab-check" ${state.selected.has(t.id) ? 'checked' : ''}>
        ${Utils.faviconHtml(t)}
        <div class="tab-info" title="${Utils.escapeHtml(t.url)}">
          <div class="tab-title">${Utils.escapeHtml(t.title || t.url)}</div>
          <div class="tab-url">${Utils.escapeHtml(Utils.domain(t.url))}</div>
        </div>
        <button class="btn-icon tab-close" title="Kapat">✕</button>
      </div>`;
    }
  }
  container.innerHTML = html;
  updateStats();
}

async function renderSessions() {
  const sessions = (await SessionManager.list()).slice().sort((a, b) => b.createdAt - a.createdAt);
  const c = $('sessions-container');
  if (!sessions.length) { c.innerHTML = '<div class="empty">Kayıtlı session yok</div>'; return; }
  c.innerHTML = sessions.map(s => `
    <div class="card" data-id="${s.id}">
      <div class="card-main">
        <div class="card-title">${Utils.escapeHtml(s.name)}</div>
        <div class="muted">${s.tabCount} sekme · ${Utils.formatDate(s.createdAt)}</div>
      </div>
      <div class="card-actions">
        <button class="btn-secondary act-restore" title="Mevcut pencerede aç">Aç</button>
        <button class="btn-secondary act-restore-new" title="Yeni pencerede aç">Yeni pencere</button>
        <button class="btn-icon act-rename" title="Yeniden adlandır">✏️</button>
        <button class="btn-icon act-delete" title="Sil">🗑️</button>
      </div>
    </div>`).join('');
}

async function renderGroups() {
  const groups = await GroupManager.list();
  const c = $('groups-container');
  if (!groups.length) { c.innerHTML = '<div class="empty">Sekme grubu yok</div>'; return; }
  const counts = await Promise.all(groups.map(g => GroupManager.tabsIn(g.id).then(t => t.length)));
  c.innerHTML = groups.map((g, i) => `
    <div class="card" data-id="${g.id}" data-collapsed="${g.collapsed}">
      <span class="color-dot color-${g.color}"></span>
      <div class="card-main">
        <div class="card-title">${Utils.escapeHtml(g.title || 'Adsız grup')}</div>
        <div class="muted">${counts[i]} sekme</div>
      </div>
      <div class="card-actions">
        <button class="btn-secondary act-collapse">${g.collapsed ? 'Genişlet' : 'Daralt'}</button>
        <button class="btn-secondary act-ungroup">Dağıt</button>
      </div>
    </div>`).join('');
}

function switchView(view) {
  state.view = view;
  document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `${view}-view`));
  const tabsOnly = view === 'tabs';
  document.querySelector('.search-container').style.display = tabsOnly ? '' : 'none';
  document.querySelector('.stats-bar').style.display = tabsOnly ? '' : 'none';
  document.querySelector('.action-bar').style.display = tabsOnly ? '' : 'none';
  refresh();
}

async function refresh() {
  if (state.view === 'tabs') { await loadTabs(); renderTabs(); }
  else if (state.view === 'sessions') await renderSessions();
  else await renderGroups();
}

async function saveSessionFlow() {
  const useSelected = state.selected.size > 0;
  const tabs = useSelected ? state.tabs.filter(t => state.selected.has(t.id)) : state.tabs;
  const name = await UI.prompt('Session Kaydet',
    `${tabs.length} sekme kaydedilecek${useSelected ? ' (seçili)' : ''}. Session adı:`,
    `Session ${new Date().toLocaleDateString('tr-TR')}`);
  if (name === null) return;
  try {
    await SessionManager.save(name, tabs);
    UI.toast('Session kaydedildi', 'success');
    if (state.view === 'sessions') renderSessions();
  } catch (e) { UI.toast(e.message, 'error'); }
}

async function newGroupFlow() {
  if (!state.selected.size) {
    UI.toast('Önce "Sekmeler" görünümünden sekme seçin', 'error');
    return;
  }
  const body = await UI.modal({
    title: 'Yeni Grup', confirmText: 'Oluştur',
    bodyHtml: `<label class="field"><span>Grup adı</span><input type="text" id="g-name"></label>
      <label class="field"><span>Renk</span><select id="g-color">
      ${GroupManager.COLORS.map(c => `<option value="${c}">${c}</option>`).join('')}</select></label>
      <p class="muted">${state.selected.size} seçili sekme gruplanacak.</p>`
  });
  if (!body) return;
  try {
    await GroupManager.create([...state.selected], body.querySelector('#g-name').value.trim(),
      body.querySelector('#g-color').value);
    state.selected.clear();
    UI.toast('Grup oluşturuldu', 'success');
    renderGroups();
  } catch (e) { UI.toast(e.message, 'error'); }
}

function bind() {
  document.querySelectorAll('.tab-nav-btn').forEach(b => b.onclick = () => switchView(b.dataset.view));
  $('search-input').addEventListener('input', Utils.debounce(e => { state.query = e.target.value; renderTabs(); }, 120));

  $('tabs-container').addEventListener('click', async e => {
    const item = e.target.closest('.tab-item');
    if (!item) return;
    const id = Number(item.dataset.id);
    if (e.target.classList.contains('tab-check')) {
      e.target.checked ? state.selected.add(id) : state.selected.delete(id);
      updateStats();
    } else if (e.target.closest('.tab-close')) {
      await TabManager.close([id]);
      refresh();
    } else {
      await TabManager.goTo(id);
      window.close();
    }
  });

  $('select-all-btn').onclick = () => {
    const vis = visibleTabs().map(t => t.id);
    const all = vis.length && vis.every(id => state.selected.has(id));
    vis.forEach(id => all ? state.selected.delete(id) : state.selected.add(id));
    $('select-all-btn').textContent = all ? 'Tümünü Seç' : 'Seçimi Kaldır';
    renderTabs();
  };

  $('close-selected-btn').onclick = async () => {
    if (!state.selected.size) return UI.toast('Seçili sekme yok', 'error');
    if (!await UI.confirm('Sekmeleri Kapat', `${state.selected.size} sekme kapatılsın mı?`, 'Kapat')) return;
    await TabManager.close([...state.selected]);
    state.selected.clear();
    refresh();
  };

  $('find-duplicates-btn').onclick = () => {
    if (!state.extraDupIds.size) return UI.toast('Duplicate sekme yok', 'success');
    state.selected = new Set(state.extraDupIds); // select the extra copies, keep the first of each
    renderTabs();
    UI.toast(`${state.extraDupIds.size} duplicate sekme seçildi`, 'info');
  };

  $('save-session-btn').onclick = saveSessionFlow;
  $('new-session-btn').onclick = saveSessionFlow;
  $('new-group-btn').onclick = newGroupFlow;
  $('settings-btn').onclick = () => chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });

  $('sessions-container').addEventListener('click', async e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const id = card.dataset.id;
    try {
      if (e.target.closest('.act-restore')) await SessionManager.restore(id, false);
      else if (e.target.closest('.act-restore-new')) await SessionManager.restore(id, true);
      else if (e.target.closest('.act-rename')) {
        const name = await UI.prompt('Yeniden Adlandır', 'Session adı:', card.querySelector('.card-title').textContent);
        if (name) { await SessionManager.rename(id, name); renderSessions(); }
      } else if (e.target.closest('.act-delete')) {
        if (await UI.confirm('Session Sil', 'Bu session silinsin mi?', 'Sil')) { await SessionManager.remove(id); renderSessions(); }
      }
    } catch (err) { UI.toast(err.message, 'error'); }
  });

  $('groups-container').addEventListener('click', async e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const id = Number(card.dataset.id);
    if (e.target.closest('.act-collapse')) await GroupManager.toggleCollapse(id, card.dataset.collapsed !== 'true');
    else if (e.target.closest('.act-ungroup')) await GroupManager.ungroup(id);
    renderGroups();
  });

  // Keep the list live while the popup is open
  ['onCreated', 'onRemoved', 'onUpdated'].forEach(ev => chrome.tabs[ev].addListener(
    Utils.debounce(() => { if (state.view === 'tabs') refresh(); }, 300)));
}

document.addEventListener('DOMContentLoaded', () => { bind(); refresh(); });
