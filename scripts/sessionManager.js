// Saved sessions (same storage shape as background.js)
const SessionManager = {
  async list() {
    return StorageManager.get('sessions', []);
  },
  async save(name, tabs) {
    const sessions = await this.list();
    const session = {
      id: Utils.uuid(),
      name: name || `Session ${Utils.formatDate(Date.now())}`,
      createdAt: Date.now(),
      tabs: tabs
        .filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
        .map(t => ({ title: t.title, url: t.url, favIconUrl: t.favIconUrl })),
    };
    session.tabCount = session.tabs.length;
    if (!session.tabCount) throw new Error('Kaydedilecek sekme yok');
    sessions.push(session);
    await StorageManager.set('sessions', sessions);
    return session;
  },
  async remove(id) {
    const sessions = (await this.list()).filter(s => s.id !== id);
    await StorageManager.set('sessions', sessions);
  },
  async rename(id, name) {
    const sessions = await this.list();
    const s = sessions.find(x => x.id === id);
    if (s) { s.name = name; await StorageManager.set('sessions', sessions); }
  },
  async restore(id, newWindow) {
    const session = (await this.list()).find(s => s.id === id);
    if (!session || !session.tabs.length) throw new Error('Session bulunamadı');
    if (newWindow) {
      const win = await chrome.windows.create({ url: session.tabs[0].url });
      for (const t of session.tabs.slice(1)) {
        await chrome.tabs.create({ windowId: win.id, url: t.url, active: false });
      }
    } else {
      for (const t of session.tabs) {
        await chrome.tabs.create({ url: t.url, active: false });
      }
    }
  }
};
