// UI Controller - Main controller that coordinates all managers

class UIController {
  constructor() {
    this.bookmarkManager = new BookmarkManager();
    this.tabManager = new TabManager();
    this.sessionManager = new SessionManager();
    this.groupManager = new GroupManager();
    this.notesManager = new NotesManager();
    this.todoManager = new TodoManager();
    this.currentView = 'tabs';

    // Make this available globally for other components
    window.uiController = this;

    // Bind methods to ensure 'this' context is preserved
    this.hideModal = this.hideModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.showCreateCategoryModal = this.showCreateCategoryModal.bind(this);
    this.showAddBookmarkModal = this.showAddBookmarkModal.bind(this);
    this.showConfirmModal = this.showConfirmModal.bind(this);
    this.toggleOpenTabsPanel = this.toggleOpenTabsPanel.bind(this);
    this.showOpenTabsPanel = this.showOpenTabsPanel.bind(this);
    this.hideOpenTabsPanel = this.hideOpenTabsPanel.bind(this);
    this.switchView = this.switchView.bind(this);
  }

  // Initialize the UI
  async init() {
    console.log('Initializing UI Controller');

    try {
      // Setup event listeners
      this.setupEventListeners();

      // Setup sidebar navigation
      this.setupSidebarNavigation();

      // Load initial data
      await this.loadInitialData();

      // Force hide modal to prevent ghost modals
      this.hideModal();

      console.log('UI Controller initialized successfully');
    } catch (error) {
      console.error('Error initializing UI:', error);
      this.showNotification('Başlatma hatası', 'error');
    }
  }

  // Load initial data
  async loadInitialData() {
    try {
      // Load bookmarks instead of tabs for the main view
      await this.bookmarkManager.loadBookmarks();
      await this.sessionManager.loadSessions();
      await this.groupManager.loadGroups();

      // Render bookmarks by default
      this.bookmarkManager.renderBookmarks();
      this.updateStats();

      // Show tip about hiding bookmarks bar (only once)
      this.showBookmarksBarTip();
    } catch (error) {
      console.error('Error loading initial data:', error);
      throw error;
    }
  }

  // Show tip about hiding Chrome's bookmarks bar
  async showBookmarksBarTip() {
    try {
      const result = await chrome.storage.local.get(['bookmarksBarTipShown']);

      if (!result.bookmarksBarTipShown) {
        setTimeout(() => {
          this.showNotification('💡 İpucu: Ctrl+Shift+B ile Chrome yer işaretleri çubuğunu gizleyebilirsiniz', 'info', 5000);
        }, 2000);

        // Mark as shown
        await chrome.storage.local.set({ bookmarksBarTipShown: true });
      }
    } catch (error) {
      console.error('Error showing tip:', error);
    }
  }

  // Setup all event listeners
  setupEventListeners() {
    console.log('setupEventListeners called');

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      const debouncedSearch = debounce((term) => {
        console.log('Search term:', term);
      }, 300);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }

    // Show open tabs button
    const showOpenTabsBtn = document.getElementById('show-open-tabs-btn');
    if (showOpenTabsBtn) {
      showOpenTabsBtn.addEventListener('click', () => {
        this.toggleOpenTabsPanel();
      });
    }

    // Close tabs panel button
    const closeTabsPanelBtn = document.getElementById('close-tabs-panel');
    if (closeTabsPanelBtn) {
      closeTabsPanelBtn.addEventListener('click', () => {
        this.hideOpenTabsPanel();
      });
    }

    // Modal close button
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.hideModal();
      });
    }

    const modalCancel = document.getElementById('modal-cancel');
    if (modalCancel) {
      modalCancel.addEventListener('click', () => {
        this.hideModal();
      });
    }

    // Modal overlay click
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.hideModal();
        }
      });
    }

    // Workspace buttons
    const workspaceBtns = document.querySelectorAll('.workspace-btn');
    workspaceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        workspaceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter bookmarks based on workspace (mock implementation)
        const workspaceName = btn.textContent.trim();
        this.showNotification(`${workspaceName} çalışma alanı seçildi`, 'success');

        // In a real implementation, we would filter categories here
        if (this.bookmarkManager) {
          this.bookmarkManager.renderBookmarks();
        }
      });
    });
  }

  setupSidebarNavigation() {
    console.log('Setting up sidebar navigation');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const views = {
      'Workspaces': 'board-container',
      'Notes': 'notes-view',
      'To-do': 'todo-view'
    };

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const title = item.getAttribute('title');
        console.log('Sidebar clicked:', title);
        const viewId = views[title];
        if (viewId) {
          this.switchView(viewId);

          // Update active state
          navItems.forEach(nav => nav.classList.remove('active'));
          item.classList.add('active');
        }
      });
    });
  }

  switchView(viewId) {
    console.log('Switching to view:', viewId);
    const views = ['board-container', 'notes-view', 'todo-view'];

    views.forEach(id => {
      const element = document.getElementById(id);
      console.log('Processing view:', id, 'Element found:', !!element);
      if (element) {
        if (id === viewId) {
          console.log('Showing:', id);
          element.classList.remove('hidden');
        } else {
          console.log('Hiding:', id);
          element.classList.add('hidden');
        }
      } else {
        console.error('View element not found:', id);
      }
    });
  }

  // Update stats bar
  updateStats() {
    const stats = this.tabManager.getStats();

    const totalEl = document.getElementById('total-tabs');
    const selectedEl = document.getElementById('selected-tabs');
    const duplicatesEl = document.getElementById('duplicate-tabs');

    if (totalEl) totalEl.textContent = stats.total;
    if (selectedEl) selectedEl.textContent = stats.selected;
    if (duplicatesEl) duplicatesEl.textContent = stats.duplicates;
  }

  // Show modal
  showModal(title, bodyContent) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (modal && modalTitle && modalBody) {
      modalTitle.textContent = title || 'Bildirim';
      modalBody.innerHTML = bodyContent || '';
      modal.classList.remove('hidden');
    }
  }

  // Hide modal
  hideModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
      modal.classList.add('hidden');

      const modalTitle = document.getElementById('modal-title');
      const modalBody = document.getElementById('modal-body');
      if (modalTitle) modalTitle.textContent = '';
      if (modalBody) modalBody.innerHTML = '';

      const confirmBtn = document.getElementById('modal-confirm');
      const cancelBtn = document.getElementById('modal-cancel');
      if (confirmBtn) {
        const newConfirm = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
      }
      if (cancelBtn) {
        const newCancel = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
        newCancel.addEventListener('click', () => {
          this.hideModal();
        });
      }
    }
  }

  // Show delete category modal
  showDeleteCategoryModal(category) {
    const bodyContent = `
      <p>
        <strong>${escapeHtml(category.name)}</strong> kategorisini silmek istediğinizden emin misiniz?
      </p>
      <p style="color: var(--text-secondary); font-size: 13px; margin-top: 8px;">
        Bu işlem geri alınamaz.
      </p>
    `;

    this.showModal('Kategoriyi Sil', bodyContent);

    const confirmBtn = document.getElementById('modal-confirm');
    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        try {
          await this.bookmarkManager.deleteCategory(category.id);
          this.hideModal();
          // Success notification is handled in bookmarkManager
        } catch (error) {
          console.error('Error deleting category:', error);
          this.showNotification(error.message || 'Kategori silinemedi', 'error');
        }
      };
    }
  }

  // Show create category modal
  showCreateCategoryModal() {
    const bodyContent = `
      <div style="margin-bottom: 16px;">
        <label for="category-name" style="display: block; margin-bottom: 8px; font-weight: 500;">
          Kategori Adı:
        </label>
        <input 
          type="text" 
          id="category-name" 
          class="search-input" 
          placeholder="Örn: İş, Okul, Eğlence"
          style="width: 100%;"
        />
      </div>
    `;

    this.showModal('Yeni Kategori Oluştur', bodyContent);

    setTimeout(() => {
      const input = document.getElementById('category-name');
      if (input) input.focus();
    }, 100);

    const confirmBtn = document.getElementById('modal-confirm');
    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        const input = document.getElementById('category-name');
        const name = input?.value.trim();

        if (!name) {
          this.showNotification('Lütfen bir isim girin', 'warning');
          return;
        }

        try {
          await this.bookmarkManager.createCategory(name);
          this.hideModal();
          this.showNotification('Kategori oluşturuldu', 'success');
        } catch (error) {
          console.error('UIController: Error creating category:', error);
          this.showNotification('Kategori oluşturulamadı: ' + (error.message || 'Bilinmeyen hata'), 'error');
        }
      };
    }
  }

  // Show add bookmark modal
  showAddBookmarkModal(categoryId) {
    const bodyContent = `
      <div style="margin-bottom: 16px;">
        <label for="bookmark-title" style="display: block; margin-bottom: 8px; font-weight: 500;">
          Başlık:
        </label>
        <input 
          type="text" 
          id="bookmark-title" 
          class="search-input" 
          placeholder="Site Başlığı"
          style="width: 100%; margin-bottom: 16px;"
        />
        
        <label for="bookmark-url" style="display: block; margin-bottom: 8px; font-weight: 500;">
          URL:
        </label>
        <input 
          type="text" 
          id="bookmark-url" 
          class="search-input" 
          placeholder="https://example.com"
          style="width: 100%;"
        />
      </div>
    `;

    this.showModal('Yer İşareti Ekle', bodyContent);

    setTimeout(() => {
      const input = document.getElementById('bookmark-title');
      if (input) input.focus();
    }, 100);

    const confirmBtn = document.getElementById('modal-confirm');
    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        const titleInput = document.getElementById('bookmark-title');
        const urlInput = document.getElementById('bookmark-url');
        const title = titleInput?.value.trim();
        let url = urlInput?.value.trim();

        if (!title || !url) {
          this.showNotification('Lütfen tüm alanları doldurun', 'warning');
          return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        try {
          await chrome.bookmarks.create({
            parentId: categoryId,
            title: title,
            url: url
          });

          await this.bookmarkManager.renderBookmarks();
          this.hideModal();
          this.showNotification('Yer işareti eklendi', 'success');
        } catch (error) {
          console.error('Error creating bookmark:', error);
          this.showNotification('Yer işareti eklenemedi', 'error');
        }
      };
    }
  }

  // Show confirm modal
  showConfirmModal(title, message) {
    return new Promise((resolve) => {
      const bodyContent = `<p>${message}</p>`;
      this.showModal(title, bodyContent);

      const confirmBtn = document.getElementById('modal-confirm');
      const cancelBtn = document.getElementById('modal-cancel');

      const handleConfirm = () => {
        this.hideModal();
        resolve(true);
      };

      const handleCancel = () => {
        this.hideModal();
        resolve(false);
      };

      if (confirmBtn) confirmBtn.onclick = handleConfirm;
      if (cancelBtn) cancelBtn.onclick = handleCancel;
    });
  }

  // Toggle open tabs panel
  toggleOpenTabsPanel() {
    const panel = document.getElementById('open-tabs-panel');
    if (panel) {
      if (panel.classList.contains('hidden')) {
        this.showOpenTabsPanel();
      } else {
        this.hideOpenTabsPanel();
      }
    }
  }

  // Show open tabs panel
  async showOpenTabsPanel() {
    const panel = document.getElementById('open-tabs-panel');
    if (panel) {
      panel.classList.remove('hidden');
      try {
        await this.tabManager.loadTabs();
        this.tabManager.renderOpenTabs();
      } catch (error) {
        console.error('Error loading tabs:', error);
        this.showNotification('Sekmeler yüklenemedi', 'error');
      }
    }
  }

  // Hide open tabs panel
  hideOpenTabsPanel() {
    const panel = document.getElementById('open-tabs-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
  }

  // Show notification
  showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container') || this.createNotificationContainer();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        #notification-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .notification {
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease;
          min-width: 200px;
        }
        .notification-success { background-color: #34a853; }
        .notification-error { background-color: #ea4335; }
        .notification-warning { background-color: #fbbc04; color: #202124; }
        .notification-info { background-color: #4285f4; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
    return container;
  }
}

// Helper function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
