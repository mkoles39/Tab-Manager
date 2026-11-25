// Tab Manager - Handles tab operations and rendering

class TabManager {
  constructor() {
    this.tabs = [];
    this.selectedTabs = new Set();
    this.duplicates = new Map();
    this.filteredTabs = [];
    this.currentSearchTerm = '';
  }

  // Load all tabs from Chrome
  async loadTabs() {
    try {
      const response = await sendMessage('getAllTabs');
      this.tabs = response.tabs || [];
      this.filteredTabs = [...this.tabs];
      return this.tabs;
    } catch (error) {
      console.error('Error loading tabs:', error);
      throw error;
    }
  }

  // Refresh tabs
  async refreshTabs() {
    await this.loadTabs();
    if (this.currentSearchTerm) {
      this.filterTabs(this.currentSearchTerm);
    }
    this.renderTabs();
  }

  // Filter tabs by search term
  filterTabs(searchTerm) {
    this.currentSearchTerm = searchTerm.toLowerCase();

    if (!this.currentSearchTerm) {
      this.filteredTabs = [...this.tabs];
    } else {
      this.filteredTabs = this.tabs.filter(tab => {
        const title = (tab.title || '').toLowerCase();
        const url = (tab.url || tab.pendingUrl || '').toLowerCase();
        return title.includes(this.currentSearchTerm) || url.includes(this.currentSearchTerm);
      });
    }

    this.renderTabs();
  }

  // Select/deselect a tab
  selectTab(tabId, selected) {
    if (selected) {
      this.selectedTabs.add(tabId);
    } else {
      this.selectedTabs.delete(tabId);
    }
  }

  // Select all tabs
  selectAllTabs() {
    this.filteredTabs.forEach(tab => {
      this.selectedTabs.add(tab.id);
    });
    this.updateCheckboxes();
  }

  // Deselect all tabs
  deselectAllTabs() {
    this.selectedTabs.clear();
    this.updateCheckboxes();
  }

  // Update checkboxes state
  updateCheckboxes() {
    const checkboxes = document.querySelectorAll('.tab-checkbox');
    checkboxes.forEach(checkbox => {
      const tabId = parseInt(checkbox.closest('.tab-item').dataset.tabId);
      checkbox.checked = this.selectedTabs.has(tabId);
    });
  }

  // Close a single tab
  async closeTab(tabId) {
    try {
      await sendMessage('closeTab', { tabId });
      this.selectedTabs.delete(tabId);
      await this.refreshTabs();
    } catch (error) {
      console.error('Error closing tab:', error);
      throw error;
    }
  }

  // Close selected tabs
  async closeSelectedTabs() {
    if (this.selectedTabs.size === 0) {
      return;
    }

    try {
      const tabIds = Array.from(this.selectedTabs);
      await sendMessage('closeTabs', { tabIds });
      this.selectedTabs.clear();
      await this.refreshTabs();
    } catch (error) {
      console.error('Error closing tabs:', error);
      throw error;
    }
  }

  // Go to a tab (activate and focus)
  async goToTab(tabId) {
    try {
      await sendMessage('goToTab', { tabId });
      window.close(); // Close popup after navigating
    } catch (error) {
      console.error('Error going to tab:', error);
      throw error;
    }
  }

  // Find duplicate tabs
  async findDuplicates() {
    this.duplicates.clear();
    const urlMap = new Map();

    // Group tabs by URL
    this.tabs.forEach(tab => {
      // A tab that is still loading has an empty url and the target in pendingUrl
      const url = tab.url || tab.pendingUrl;
      if (!url) return;
      if (!urlMap.has(url)) {
        urlMap.set(url, []);
      }
      urlMap.get(url).push(tab);
    });

    // Find duplicates (URLs with more than one tab)
    urlMap.forEach((tabs, url) => {
      if (tabs.length > 1) {
        this.duplicates.set(url, tabs);
      }
    });

    this.renderTabs();
    return this.duplicates.size;
  }

  // Check if a tab is duplicate
  isDuplicate(tab) {
    return this.duplicates.has(tab.url || tab.pendingUrl);
  }

  // Close duplicate tabs (keep newest or oldest)
  async closeDuplicates(keepNewest = true) {
    const tabsToClose = [];

    this.duplicates.forEach(tabs => {
      // Sort by id (newer tabs have higher ids)
      const sorted = [...tabs].sort((a, b) => a.id - b.id);

      if (keepNewest) {
        // Keep the last one, close others
        tabsToClose.push(...sorted.slice(0, -1).map(t => t.id));
      } else {
        // Keep the first one, close others
        tabsToClose.push(...sorted.slice(1).map(t => t.id));
      }
    });

    if (tabsToClose.length > 0) {
      await sendMessage('closeTabs', { tabIds: tabsToClose });
      this.duplicates.clear();
      await this.refreshTabs();
    }
  }

  // Move tabs to another window
  async moveTabsToWindow(tabIds, windowId) {
    try {
      for (const tabId of tabIds) {
        await sendMessage('moveTab', { tabId, windowId });
      }
      await this.refreshTabs();
    } catch (error) {
      console.error('Error moving tabs:', error);
      throw error;
    }
  }

  // Group tabs by window
  groupTabsByWindow() {
    const windows = new Map();

    this.filteredTabs.forEach(tab => {
      if (!windows.has(tab.windowId)) {
        windows.set(tab.windowId, []);
      }
      windows.get(tab.windowId).push(tab);
    });

    return windows;
  }

  // Render tabs in the UI (Main Board)
  renderTabs() {
    // ... existing implementation ...
  }

  // Render tabs in the Open Tabs Panel (Side Panel)
  renderOpenTabs() {
    const container = document.getElementById('open-tabs-list');
    if (!container) return;

    container.innerHTML = '';

    if (this.tabs.length === 0) {
      container.innerHTML = '<div class="empty-state">Açık sekme yok</div>';
      return;
    }

    this.tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = 'draggable-tab';
      tabEl.draggable = true;

      // Drag events
      tabEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/x-tab-id', tab.id);
        e.dataTransfer.setData('text/plain', tab.url);
        e.dataTransfer.effectAllowed = 'copy';
        tabEl.classList.add('dragging');
      });

      tabEl.addEventListener('dragend', () => {
        tabEl.classList.remove('dragging');
      });

      // Favicon
      const favicon = document.createElement('img');
      favicon.className = 'draggable-tab-favicon';
      favicon.src = getFaviconUrl(tab);
      favicon.onerror = () => { favicon.src = 'icons/default-favicon.svg'; }; // Fallback

      // Title
      const title = document.createElement('span');
      title.className = 'draggable-tab-title';
      title.textContent = tab.title;

      tabEl.appendChild(favicon);
      tabEl.appendChild(title);
      container.appendChild(tabEl);
    });
  }

  // Create a tab element
  createTabElement(tab) {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.dataset.tabId = tab.id;

    // Add active class
    if (tab.active) {
      tabItem.classList.add('active');
    }

    // Add duplicate class
    if (this.isDuplicate(tab)) {
      tabItem.classList.add('duplicate');
    }

    // Favicon
    const favicon = document.createElement('img');
    favicon.className = 'tab-favicon';
    favicon.src = getFaviconUrl(tab);
    favicon.alt = '';

    // Tab info
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-info';

    // Make entire tab item clickable
    tabItem.addEventListener('click', (e) => {
      // Don't navigate if clicking on action buttons
      if (!e.target.closest('.tab-actions')) {
        this.goToTab(tab.id);
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

    const gotoBtn = document.createElement('button');
    gotoBtn.className = 'btn-icon tab-goto';
    gotoBtn.title = 'Git';
    gotoBtn.innerHTML = uiIcon('open');
    gotoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.goToTab(tab.id);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-icon tab-close';
    closeBtn.title = 'Kapat';
    closeBtn.innerHTML = uiIcon('close');
    closeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await this.closeTab(tab.id);
        if (window.uiController) {
          window.uiController.updateStats();
        }
      } catch (error) {
        if (window.uiController) {
          window.uiController.showNotification('Sekme kapatılamadı', 'error');
        }
      }
    });

    tabActions.appendChild(gotoBtn);
    tabActions.appendChild(closeBtn);

    // Assemble (no checkbox)
    tabItem.appendChild(favicon);
    tabItem.appendChild(tabInfo);
    tabItem.appendChild(tabActions);

    return tabItem;
  }

  // Get stats
  getStats() {
    return {
      total: this.tabs.length,
      selected: this.selectedTabs.size,
      duplicates: this.duplicates.size
    };
  }
}
