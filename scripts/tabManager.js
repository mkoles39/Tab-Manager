// Tab operations (run directly from extension pages)
const TabManager = {
  async getAll() {
    return chrome.tabs.query({});
  },
  async close(tabIds) {
    if (!tabIds || !tabIds.length) return;
    await chrome.tabs.remove(tabIds);
  },
  async goTo(tabId) {
    const tab = await chrome.tabs.get(tabId);
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  },
  async moveToWindow(tabId, windowId) {
    await chrome.tabs.move(tabId, { windowId, index: -1 });
  },
  isRealPage(tab) {
    return tab.url && !tab.url.startsWith('chrome-extension://');
  },
  // Returns { extraIds: Set (2nd+ copies), allIds: Set (every tab that has a twin) }
  findDuplicates(tabs) {
    const seen = new Map();
    const extraIds = new Set();
    const allIds = new Set();
    for (const tab of tabs) {
      if (!tab.url) continue;
      const key = Utils.dupKey(tab.url);
      if (seen.has(key)) {
        extraIds.add(tab.id);
        allIds.add(tab.id);
        allIds.add(seen.get(key));
      } else {
        seen.set(key, tab.id);
      }
    }
    return { extraIds, allIds };
  },
  groupByWindow(tabs) {
    const map = new Map();
    for (const tab of tabs) {
      if (!map.has(tab.windowId)) map.set(tab.windowId, []);
      map.get(tab.windowId).push(tab);
    }
    return map;
  },
  filter(tabs, query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return tabs;
    return tabs.filter(t =>
      (t.title || '').toLowerCase().includes(q) || (t.url || '').toLowerCase().includes(q));
  }
};
