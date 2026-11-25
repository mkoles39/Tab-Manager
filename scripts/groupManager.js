// Group Manager - Handles tab group operations and rendering

class GroupManager {
  constructor() {
    this.groups = [];
    this.collapsedGroups = new Set();
  }

  // Load groups from Chrome
  async loadGroups() {
    try {
      const response = await sendMessage('getGroups');
      this.groups = response.groups || [];
      return this.groups;
    } catch (error) {
      console.error('Error loading groups:', error);
      throw error;
    }
  }

  // Create a new group
  async createGroup(name, color, tabIds) {
    try {
      const response = await sendMessage('createTabGroup', {
        tabIds,
        groupName: name,
        color
      });
      await this.loadGroups();
      this.renderGroups();
      return response.groupId;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Delete a group (ungroups tabs)
  async deleteGroup(groupId) {
    try {
      // Get tabs in the group
      const tabs = await chrome.tabs.query({ groupId });
      const tabIds = tabs.map(t => t.id);

      // Ungroup tabs
      await chrome.tabs.ungroup(tabIds);

      await this.loadGroups();
      this.renderGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Add tabs to a group
  async addTabsToGroup(groupId, tabIds) {
    try {
      await chrome.tabs.group({ groupId, tabIds });
      await this.loadGroups();
      this.renderGroups();
    } catch (error) {
      console.error('Error adding tabs to group:', error);
      throw error;
    }
  }

  // Remove tabs from a group
  async removeTabsFromGroup(groupId, tabIds) {
    try {
      await chrome.tabs.ungroup(tabIds);
      await this.loadGroups();
      this.renderGroups();
    } catch (error) {
      console.error('Error removing tabs from group:', error);
      throw error;
    }
  }

  // Toggle group collapse state
  toggleGroupCollapse(groupId) {
    if (this.collapsedGroups.has(groupId)) {
      this.collapsedGroups.delete(groupId);
    } else {
      this.collapsedGroups.add(groupId);
    }
  }

  // Render groups in the UI
  async renderGroups() {
    const container = document.getElementById('groups-container');

    if (!container) {
      console.error('Groups container not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Check if there are groups
    if (this.groups.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
                    <div class="empty-state-text">
            Henüz grup oluşturulmamış.<br>
            Sekmeleri gruplamak için "Yeni Grup" butonuna tıklayın.
          </div>
        </div>
      `;
      return;
    }

    // Get all tabs to match with groups
    const allTabs = await chrome.tabs.query({});

    // Render each group
    for (const group of this.groups) {
      const groupTabs = allTabs.filter(tab => tab.groupId === group.id);
      const groupElement = await this.createGroupElement(group, groupTabs);
      container.appendChild(groupElement);
    }
  }

  // Create a group element
  async createGroupElement(group, tabs) {
    const groupItem = document.createElement('div');
    groupItem.className = 'group-item';
    groupItem.dataset.groupId = group.id;

    // Add collapsed class if needed
    if (this.collapsedGroups.has(group.id)) {
      groupItem.classList.add('collapsed');
    }

    // Group header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-header';
    groupHeader.style.borderLeft = `4px solid ${this.getGroupColor(group.color)}`;

    const groupName = document.createElement('h3');
    groupName.className = 'group-name';
    groupName.textContent = group.title || 'Untitled Group';

    const tabCount = document.createElement('span');
    tabCount.className = 'group-tab-count';
    tabCount.textContent = `${tabs.length} sekme`;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-icon group-toggle';
    toggleBtn.innerHTML = uiIcon('chevron');
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleGroupCollapse(group.id);
      groupItem.classList.toggle('collapsed');
    });

    groupHeader.appendChild(groupName);
    groupHeader.appendChild(tabCount);
    groupHeader.appendChild(toggleBtn);

    // Group tabs container
    const groupTabs = document.createElement('div');
    groupTabs.className = 'group-tabs';

    // Render tabs in the group
    tabs.forEach(tab => {
      const tabElement = this.createGroupTabElement(tab, group.id);
      groupTabs.appendChild(tabElement);
    });

    // Assemble
    groupItem.appendChild(groupHeader);
    groupItem.appendChild(groupTabs);

    return groupItem;
  }

  // Create a tab element for group view
  createGroupTabElement(tab, groupId) {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.dataset.tabId = tab.id;

    if (tab.active) {
      tabItem.classList.add('active');
    }

    // Favicon
    const favicon = document.createElement('img');
    favicon.className = 'tab-favicon';
    favicon.src = getFaviconUrl(tab);
    favicon.alt = '';

    // Tab info
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-info';
    tabInfo.addEventListener('click', async () => {
      try {
        await sendMessage('goToTab', { tabId: tab.id });
        window.close();
      } catch (error) {
        console.error('Error going to tab:', error);
      }
    });

    const tabTitle = document.createElement('div');
    tabTitle.className = 'tab-title';
    tabTitle.textContent = tab.title || 'Untitled';
    tabTitle.title = tab.title;

    const tabUrl = document.createElement('div');
    tabUrl.className = 'tab-url';
    tabUrl.textContent = tab.url || '';
    tabUrl.title = tab.url;

    tabInfo.appendChild(tabTitle);
    tabInfo.appendChild(tabUrl);

    // Actions
    const tabActions = document.createElement('div');
    tabActions.className = 'tab-actions';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-icon tab-close';
    removeBtn.title = 'Gruptan Çıkar';
    removeBtn.innerHTML = uiIcon('close');
    removeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await this.removeTabsFromGroup(groupId, [tab.id]);
        if (window.uiController) {
          window.uiController.showNotification('Sekme gruptan çıkarıldı', 'success');
        }
      } catch (error) {
        if (window.uiController) {
          window.uiController.showNotification('Sekme çıkarılamadı', 'error');
        }
      }
    });

    tabActions.appendChild(removeBtn);

    // Assemble
    tabItem.appendChild(favicon);
    tabItem.appendChild(tabInfo);
    tabItem.appendChild(tabActions);

    return tabItem;
  }

  // Get color hex value
  getGroupColor(colorName) {
    const colors = {
      grey: '#5f6368',
      blue: '#4285f4',
      red: '#ea4335',
      yellow: '#fbbc04',
      green: '#34a853',
      pink: '#f538a0',
      purple: '#a142f4',
      cyan: '#24c1e0'
    };
    return colors[colorName] || colors.grey;
  }

  // Get group by ID
  getGroupById(groupId) {
    return this.groups.find(g => g.id === groupId);
  }
}
