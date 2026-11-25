// Popup controller - connects the popup UI to the tab, session and group managers.
// Extends UIController to reuse its modal and notification helpers.

class PopupController extends UIController {
  constructor() {
    super();
    this.storageManager = new StorageManager();
    this.settings = { ...this.storageManager.DEFAULT_SETTINGS };

    // The popup draws its own tab list; the new tab page is not affected.
    this.tabManager.renderTabs = () => this.renderTabList();

    // Query tabs directly so the list does not wait for the background worker
    this.tabManager.loadTabs = async () => {
      this.tabManager.tabs = await chrome.tabs.query({});
      this.tabManager.filteredTabs = [...this.tabManager.tabs];
      return this.tabManager.tabs;
    };
  }

  async init() {
    try {
      this.setupEventListeners(); // modal close / cancel / overlay
      this.setupPopupListeners();
      this.hideModal();
      document.getElementById('search-input').focus();
      this.getSearchSessions(); // start reading now so the first search is quicker

      this.settings = await this.storageManager.getSettings();
      await this.tabManager.refreshTabs();
      // Do not switch away if the user has already started typing
      if (!document.getElementById('search-input').value) {
        await this.switchPopupView(this.settings.defaultView);
      }
    } catch (error) {
      console.error('Error initializing popup:', error);
      this.showNotification('Başlatma hatası', 'error');
    }
  }

  setupPopupListeners() {
    const on = (id, handler) => {
      document.getElementById(id).addEventListener('click', () => this.run(handler));
    };

    on('save-session-btn', () => this.showSaveSessionModal());
    on('new-session-btn', () => this.showSaveSessionModal());
    on('settings-btn', () => this.showSettingsModal());
    on('select-all-btn', () => this.toggleSelectAll());
    on('close-selected-btn', () => this.closeSelected());
    on('find-duplicates-btn', () => this.findDuplicates());
    on('new-group-btn', () => this.showNewGroupModal());

    document.querySelectorAll('.tab-nav-btn').forEach(button => {
      button.addEventListener('click', () => this.run(() => this.switchPopupView(button.dataset.view)));
    });

    const search = document.getElementById('search-input');
    search.addEventListener('input', () => {
      this.switchPopupView('tabs');
      this.tabManager.filterTabs(search.value.trim());
    });
    search.addEventListener('keydown', event => this.handleSearchKey(event));
    chrome.storage.onChanged.addListener(changes => {
      if (changes.sessions) this.searchSessions = null;
    });

    document.addEventListener('keydown', (event) => {
      const overlay = document.getElementById('modal-overlay');
      if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
        event.preventDefault();
        this.hideModal();
        search.focus();
      }
    });

    // Enter confirms a modal that has a text field
    document.getElementById('modal-body').addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.matches('input[type="text"]')) {
        document.getElementById('modal-confirm').click();
      }
    });
  }

  // Run an action and report failures to the user
  async run(action) {
    try {
      await action();
    } catch (error) {
      console.error(error);
      this.showNotification('İşlem başarısız: ' + (error.message || 'Bilinmeyen hata'), 'error');
    }
  }

  async switchPopupView(view) {
    const name = ['tabs', 'sessions', 'groups'].includes(view) ? view : 'tabs';

    document.querySelectorAll('.tab-nav-btn').forEach(button => {
      button.classList.toggle('active', button.dataset.view === name);
    });
    document.querySelectorAll('.view').forEach(element => {
      element.classList.toggle('active', element.id === `${name}-view`);
    });
    // Counters and bulk actions only apply to the tab list
    document.querySelector('.action-bar').classList.toggle('hidden', name !== 'tabs');

    if (name === 'sessions') {
      await this.sessionManager.loadSessions();
      this.sessionManager.renderSessions();
    } else if (name === 'groups') {
      await this.groupManager.loadGroups();
      await this.groupManager.renderGroups();
    }
  }

  // ---------- Keyboard ----------

  // Rows that can be reached with the arrow keys, in screen order
  resultRows() {
    return [...document.querySelectorAll('#tabs-container .tab-item')];
  }

  highlightRow(index) {
    const rows = this.resultRows();
    rows.forEach(row => row.classList.remove('kb-active'));
    if (rows.length === 0) return;

    const row = rows[(index + rows.length) % rows.length];
    row.classList.add('kb-active');
    row.scrollIntoView({ block: 'nearest' });
  }

  handleSearchKey(event) {
    if (!document.getElementById('tabs-view').classList.contains('active')) return;

    const rows = this.resultRows();
    const current = rows.findIndex(row => row.classList.contains('kb-active'));

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightRow(current + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightRow(current < 0 ? -1 : current - 1);
    } else if (event.key === 'Enter' && current >= 0) {
      event.preventDefault();
      rows[current].click();
    } else if (event.key === 'Escape' && event.target.value) {
      // First Escape clears the search, the next one closes the popup
      event.preventDefault();
      event.target.value = '';
      this.tabManager.filterTabs('');
    }
  }

  // ---------- Bookmark and session results ----------

  async renderExtraResults(term, token) {
    const needle = term.toLowerCase();
    const bookmarks = (await chrome.bookmarks.search(term)).filter(node => node.url).slice(0, 8);
    const sessions = (await this.getSearchSessions()).filter(session =>
      [session.name, ...session.tabs.flatMap(tab => [tab.title, tab.url])]
        .some(text => (text || '').toLowerCase().includes(needle))
    ).slice(0, 5);

    // A newer search has been drawn while we were waiting
    if (token !== this.renderToken) return;

    const container = document.getElementById('tabs-container');

    this.appendResultSection(container, 'Yer İşaretleri', bookmarks.map(bookmark =>
      this.createResultRow('open', bookmark.title || bookmark.url, bookmark.url, async () => {
        await chrome.tabs.create({ url: bookmark.url });
        window.close();
      })
    ));

    this.appendResultSection(container, 'Sessions', sessions.map(session =>
      this.createResultRow('save', session.name, `${session.tabCount} sekme`, () => this.confirmRestore(session))
    ));

    if (!container.querySelector('.tab-item')) {
      container.innerHTML = '<div class="empty-state">Sonuç bulunamadı</div>';
    } else if (!container.querySelector('.kb-active')) {
      this.highlightRow(0);
    }
  }

  // Storage reads can be slow, so read once and reuse until the sessions change
  getSearchSessions() {
    this.searchSessions = this.searchSessions || this.storageManager.getSessions();
    return this.searchSessions;
  }

  appendResultSection(container, title, rows) {
    if (rows.length === 0) return;

    const group = document.createElement('div');
    group.className = 'window-group';

    const header = document.createElement('div');
    header.className = 'window-header';
    header.textContent = title;

    group.append(header, ...rows);
    container.appendChild(group);
  }

  createResultRow(icon, title, detail, action) {
    const row = document.createElement('div');
    row.className = 'tab-item result-item';

    const mark = document.createElement('span');
    mark.className = 'result-icon';
    mark.innerHTML = uiIcon(icon);

    const info = document.createElement('div');
    info.className = 'tab-info';

    const heading = document.createElement('div');
    heading.className = 'tab-title';
    heading.textContent = title;

    const sub = document.createElement('div');
    sub.className = 'tab-url';
    sub.textContent = detail;

    info.append(heading, sub);
    row.append(mark, info);
    row.addEventListener('click', () => this.run(action));
    return row;
  }

  // Opening a session creates many tabs, so ask first
  async confirmRestore(session) {
    const answer = this.showConfirmModal(
      'Session Aç',
      `<strong>${escapeHtml(session.name)}</strong> (${session.tabCount} sekme) yeni pencerede açılsın mı?`
    );
    document.getElementById('modal-confirm').focus();

    if (await answer) {
      await this.sessionManager.restoreSession(session.id, true);
    }
  }

  // ---------- Tab list ----------

  renderTabList() {
    const container = document.getElementById('tabs-container');
    const manager = this.tabManager;
    container.innerHTML = '';

    // Drop selections of tabs that no longer exist
    const openIds = new Set(manager.tabs.map(tab => tab.id));
    manager.selectedTabs.forEach(id => {
      if (!openIds.has(id)) manager.selectedTabs.delete(id);
    });

    let windowNumber = 0;
    manager.groupTabsByWindow().forEach(tabs => {
      windowNumber += 1;
      const group = document.createElement('div');
      group.className = 'window-group';

      const header = document.createElement('div');
      header.className = 'window-header';
      header.textContent = `Pencere ${windowNumber} (${tabs.length} sekme)`;
      group.appendChild(header);

      tabs.forEach(tab => {
        const item = manager.createTabElement(tab);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'tab-checkbox';
        checkbox.checked = manager.selectedTabs.has(tab.id);
        checkbox.addEventListener('click', event => event.stopPropagation());
        checkbox.addEventListener('change', () => {
          manager.selectTab(tab.id, checkbox.checked);
          this.updateSelectionState();
        });

        item.prepend(checkbox);
        group.appendChild(item);
      });

      container.appendChild(group);
    });

    this.updateSelectionState();

    const token = this.renderToken = (this.renderToken || 0) + 1;
    const term = document.getElementById('search-input').value.trim();
    if (term) {
      this.highlightRow(0);
      this.run(() => this.renderExtraResults(term, token));
    } else if (manager.filteredTabs.length === 0) {
      container.innerHTML = '<div class="empty-state">Sonuç bulunamadı</div>';
    }
  }

  allVisibleSelected() {
    const { filteredTabs, selectedTabs } = this.tabManager;
    return filteredTabs.length > 0 && filteredTabs.every(tab => selectedTabs.has(tab.id));
  }

  updateSelectionState() {
    this.updateStats();
    document.getElementById('close-selected-btn')
      .classList.toggle('hidden', this.tabManager.selectedTabs.size === 0);
    document.getElementById('select-all-btn').textContent =
      this.allVisibleSelected() ? 'Seçimi Kaldır' : 'Tümünü Seç';
  }

  toggleSelectAll() {
    if (this.allVisibleSelected()) {
      this.tabManager.deselectAllTabs();
    } else {
      this.tabManager.selectAllTabs();
    }
    this.updateSelectionState();
  }

  async closeSelected() {
    const count = this.tabManager.selectedTabs.size;
    if (count === 0) {
      this.showNotification('Önce sekme seçin', 'warning');
      return;
    }

    if (this.settings.confirmBeforeClose) {
      const confirmed = await this.showConfirmModal('Sekmeleri Kapat', `${count} sekme kapatılsın mı?`);
      if (!confirmed) return;
    }

    await this.tabManager.closeSelectedTabs();
    await this.recheckDuplicates();
    this.showNotification(`${count} sekme kapatıldı`, 'success');
  }

  // Keep duplicate markers correct after tabs were closed
  async recheckDuplicates() {
    if (this.tabManager.duplicates.size > 0) {
      await this.tabManager.findDuplicates();
    }
    this.updateStats();
  }

  async findDuplicates() {
    await this.tabManager.refreshTabs();
    const count = await this.tabManager.findDuplicates();
    this.updateStats();

    if (count === 0) {
      this.showNotification('Duplicate sekme yok', 'info');
      return;
    }

    this.showModal('Duplicate Sekmeler', `
      <p>${count} adres birden fazla sekmede açık. Fazlalıklar kapatılsın mı?</p>
      <label class="form-row"><input type="radio" name="keep" value="newest" checked> En yeni sekmeyi tut</label>
      <label class="form-row"><input type="radio" name="keep" value="oldest"> En eski sekmeyi tut</label>
    `);

    this.onConfirm(async () => {
      const keepNewest = document.querySelector('input[name="keep"]:checked').value === 'newest';
      this.hideModal();
      await this.tabManager.closeDuplicates(keepNewest);
      this.updateStats();
      this.showNotification('Duplicate sekmeler kapatıldı', 'success');
    });
  }

  // ---------- Sessions ----------

  onConfirm(handler) {
    document.getElementById('modal-confirm').onclick = () => this.run(handler);
  }

  // Modal with a single text field
  showNameModal(title, value, onSave) {
    this.showModal(title, '<input type="text" id="name-input" class="search-input" placeholder="Ad">');

    const input = document.getElementById('name-input');
    input.value = value;
    input.focus();
    input.select();

    this.onConfirm(async () => {
      const name = input.value.trim();
      if (!name) {
        this.showNotification('Lütfen bir isim girin', 'warning');
        return;
      }
      this.hideModal();
      await onSave(name);
    });
  }

  showSaveSessionModal() {
    const defaultName = `Session ${new Date().toLocaleString('tr-TR')}`;

    this.showNameModal('Session Kaydet', defaultName, async (name) => {
      const tabs = await this.tabManager.loadTabs();
      this.tabManager.filterTabs(document.getElementById('search-input').value.trim());
      await this.sessionManager.saveSession(name, tabs);
      this.showNotification('Session kaydedildi', 'success');
    });
  }

  showRenameSessionModal(session) {
    this.showNameModal('Session Adını Değiştir', session.name, async (name) => {
      await this.sessionManager.renameSession(session.id, name);
      this.showNotification('Session adı değiştirildi', 'success');
    });
  }

  showDeleteSessionModal(session) {
    this.showModal('Session Sil', `<p><strong>${escapeHtml(session.name)}</strong> silinsin mi?</p>`);

    this.onConfirm(async () => {
      this.hideModal();
      await this.sessionManager.deleteSession(session.id);
      this.showNotification('Session silindi', 'success');
    });
  }

  // ---------- Groups ----------

  async showNewGroupModal() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const colorOptions = GROUP_COLORS
      .map(color => `<option value="${color.value}">${color.name}</option>`)
      .join('');

    this.showModal('Yeni Grup', `
      <input type="text" id="group-name" class="search-input" placeholder="Grup adı">
      <label class="form-row">Renk <select id="group-color">${colorOptions}</select></label>
      <div id="group-tab-list" class="pick-list"></div>
    `);

    const list = document.getElementById('group-tab-list');
    tabs.filter(tab => !tab.pinned).forEach(tab => {
      const row = document.createElement('label');
      row.className = 'form-row';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = tab.id;
      checkbox.checked = this.tabManager.selectedTabs.has(tab.id);

      const title = document.createElement('span');
      title.textContent = tab.title || tab.url;

      row.append(checkbox, title);
      list.appendChild(row);
    });

    document.getElementById('group-color').value = 'blue';
    document.getElementById('group-name').focus();

    this.onConfirm(async () => {
      const name = document.getElementById('group-name').value.trim();
      const color = document.getElementById('group-color').value;
      const tabIds = [...list.querySelectorAll('input:checked')].map(input => Number(input.value));

      if (!name || tabIds.length === 0) {
        this.showNotification('Grup adı girin ve en az bir sekme seçin', 'warning');
        return;
      }

      this.hideModal();
      await this.groupManager.createGroup(name, color, tabIds);
      this.showNotification('Grup oluşturuldu', 'success');
    });
  }

}

document.addEventListener('DOMContentLoaded', () => {
  new PopupController().init();
});
