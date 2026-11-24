// Workspaces -> columns (categories) -> links, stored in chrome.storage.local
const BookmarkManager = {
  data: null,

  async load() {
    let data = await StorageManager.get('workspaceData', null);
    if (!data || !Array.isArray(data.workspaces) || !data.workspaces.length) {
      data = {
        active: null,
        workspaces: [
          { id: Utils.uuid(), name: 'Work', columns: [] },
          { id: Utils.uuid(), name: 'Personal', columns: [] }
        ]
      };
      data.active = data.workspaces[0].id;
    }
    this.data = data;
    return data;
  },
  save() { return StorageManager.set('workspaceData', this.data); },

  active() { return this.data.workspaces.find(w => w.id === this.data.active) || this.data.workspaces[0]; },
  setActive(id) { this.data.active = id; return this.save(); },

  addWorkspace(name) {
    const ws = { id: Utils.uuid(), name, columns: [] };
    this.data.workspaces.push(ws);
    this.data.active = ws.id;
    return this.save();
  },
  renameWorkspace(id, name) {
    const ws = this.data.workspaces.find(w => w.id === id);
    if (ws) ws.name = name;
    return this.save();
  },
  deleteWorkspace(id) {
    if (this.data.workspaces.length <= 1) return Promise.resolve();
    this.data.workspaces = this.data.workspaces.filter(w => w.id !== id);
    if (this.data.active === id) this.data.active = this.data.workspaces[0].id;
    return this.save();
  },

  addColumn(name) {
    this.active().columns.push({ id: Utils.uuid(), name, items: [] });
    return this.save();
  },
  renameColumn(colId, name) {
    const c = this.active().columns.find(x => x.id === colId);
    if (c) c.name = name;
    return this.save();
  },
  deleteColumn(colId) {
    const ws = this.active();
    ws.columns = ws.columns.filter(c => c.id !== colId);
    return this.save();
  },
  addItem(colId, title, url) {
    const c = this.active().columns.find(x => x.id === colId);
    if (!c) return Promise.resolve();
    c.items.push({ id: Utils.uuid(), title: title || url, url: Utils.normalizeUrl(url) });
    return this.save();
  },
  deleteItem(colId, itemId) {
    const c = this.active().columns.find(x => x.id === colId);
    if (c) c.items = c.items.filter(i => i.id !== itemId);
    return this.save();
  }
};
