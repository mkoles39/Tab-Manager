// Native Chrome tab groups
const GroupManager = {
  COLORS: ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'],
  async list() {
    return chrome.tabGroups.query({});
  },
  async create(tabIds, title, color) {
    if (!tabIds.length) throw new Error('Önce sekme seçin');
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, { title, color });
    return groupId;
  },
  async toggleCollapse(groupId, collapsed) {
    await chrome.tabGroups.update(groupId, { collapsed });
  },
  async ungroup(groupId) {
    const tabs = await chrome.tabs.query({ groupId });
    if (tabs.length) await chrome.tabs.ungroup(tabs.map(t => t.id));
  },
  async tabsIn(groupId) {
    return chrome.tabs.query({ groupId });
  }
};
