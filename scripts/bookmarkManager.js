// Bookmark Manager - Handles bookmark operations and rendering

class BookmarkManager {
  constructor() {
    this.bookmarks = [];
    this.categories = new Map();
    this.categoryOrder = []; // Store custom order of category IDs
  }

  // Load bookmarks from Chrome
  async loadBookmarks() {
    try {
      const tree = await chrome.bookmarks.getTree();
      this.bookmarks = this.flattenBookmarks(tree);
      await this.categorizeBookmarks(tree);

      // Load custom order
      await this.loadCategoryOrder();

      return this.categories;
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      throw error;
    }
  }

  // Load category order from local storage
  async loadCategoryOrder() {
    try {
      const result = await chrome.storage.local.get(['categoryOrder']);
      if (result.categoryOrder) {
        this.categoryOrder = result.categoryOrder;
      }
    } catch (error) {
      console.error('Error loading category order:', error);
    }
  }

  // Save category order to local storage
  async saveCategoryOrder() {
    try {
      // Update categoryOrder based on current categories if empty
      if (this.categoryOrder.length === 0 && this.categories.size > 0) {
        this.categoryOrder = Array.from(this.categories.keys());
      }

      await chrome.storage.local.set({ categoryOrder: this.categoryOrder });
    } catch (error) {
      console.error('Error saving category order:', error);
    }
  }

  // Flatten bookmark tree
  flattenBookmarks(nodes, result = []) {
    for (const node of nodes) {
      if (node.url) {
        result.push(node);
      }
      if (node.children) {
        this.flattenBookmarks(node.children, result);
      }
    }
    return result;
  }

  // Categorize bookmarks by folder name or domain
  async categorizeBookmarks(tree) {
    this.categories.clear();

    if (tree && tree[0]) {
      this.processBookmarkTree(tree[0], '', true);
    }
  }

  // Process bookmark tree to get folders (synchronous)
  processBookmarkTree(node, parentTitle = '', isRoot = false) {
    if (node.children) {
      for (const child of node.children) {
        if (child.children) {
          // This is a folder
          const folderName = child.title || 'Diğer';
          const bookmarksInFolder = this.getBookmarksInFolder(child);

          // Only add to categories if NOT a root-level system folder
          if (!isRoot) {
            this.categories.set(child.id, {
              id: child.id,
              name: folderName,
              icon: this.getCategoryIcon(folderName),
              bookmarks: bookmarksInFolder
            });
          }

          // Recursively process subfolders
          this.processBookmarkTree(child, folderName, false);
        }
      }
    }
  }
  // Get all bookmarks in a folder (non-recursive)
  getBookmarksInFolder(folder) {
    const bookmarks = [];
    if (folder.children) {
      for (const child of folder.children) {
        if (child.url) {
          bookmarks.push(child);
        }
      }
    }
    return bookmarks;
  }

  // Get icon for category based on name
  getCategoryIcon(name) {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('work') || nameLower.includes('iş') || nameLower.includes('çalışma')) {
      return '💼';
    } else if (nameLower.includes('ai') || nameLower.includes('yapay')) {
      return '🤖';
    } else if (nameLower.includes('shop') || nameLower.includes('alış') || nameLower.includes('market')) {
      return '🛒';
    } else if (nameLower.includes('social') || nameLower.includes('sosyal')) {
      return '💬';
    } else if (nameLower.includes('dev') || nameLower.includes('code') || nameLower.includes('geliştir')) {
      return '💻';
    } else if (nameLower.includes('news') || nameLower.includes('haber')) {
      return '📰';
    } else if (nameLower.includes('video') || nameLower.includes('youtube')) {
      return '🎥';
    } else if (nameLower.includes('music') || nameLower.includes('müzik')) {
      return '🎵';
    } else if (nameLower.includes('game') || nameLower.includes('oyun')) {
      return '🎮';
    } else if (nameLower.includes('food') || nameLower.includes('yemek')) {
      return '🍔';
    } else {
      return '📁';
    }
  }

  // Open bookmark
  async openBookmark(url, newTab = true) {
    try {
      if (newTab) {
        await chrome.tabs.create({ url, active: true });
      } else {
        await chrome.tabs.update({ url });
      }
    } catch (error) {
      console.error('Error opening bookmark:', error);
      throw error;
    }
  }

  // Render bookmarks in the UI
  async renderBookmarks() {
    const container = document.getElementById('tabs-container');

    if (!container) {
      console.error('Bookmarks container not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Load bookmarks
    await this.loadBookmarks();

    // Check if there are categories
    if (this.categories.size === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <div class="empty-state-text">
            Henüz bookmark klasörü yok.<br>
            Hızlı başlamak için varsayılan kategoriler oluşturun.
          </div>
          <button id="create-default-categories-btn" class="btn-primary" style="margin-top: 16px;">
            ✨ Varsayılan Kategorileri Oluştur
          </button>
          <button id="create-custom-category-btn" class="btn-secondary" style="margin-top: 8px;">
            ➕ Özel Kategori Oluştur
          </button>
        </div>
      `;

      // Setup button listeners
      const defaultBtn = document.getElementById('create-default-categories-btn');
      if (defaultBtn) {
        defaultBtn.addEventListener('click', () => this.createDefaultCategories());
      }

      const customBtn = document.getElementById('create-custom-category-btn');
      if (customBtn) {
        customBtn.addEventListener('click', () => {
          if (window.uiController) {
            window.uiController.showCreateCategoryModal();
          }
        });
      }

      return;
    }

    // Prepare sorted categories
    let sortedCategories = [];

    // First, add categories based on saved order
    if (this.categoryOrder.length > 0) {
      this.categoryOrder.forEach(id => {
        if (this.categories.has(id)) {
          sortedCategories.push(this.categories.get(id));
        }
      });
    }

    // Then add any new categories that aren't in the order list yet
    this.categories.forEach((category, id) => {
      if (!this.categoryOrder.includes(id)) {
        sortedCategories.push(category);
        this.categoryOrder.push(id); // Add to order list
      }
    });

    // Save updated order if we added new ones
    if (this.categoryOrder.length !== sortedCategories.length) {
      this.saveCategoryOrder();
    }

    // Render each category
    if (sortedCategories.length > 0) {
      sortedCategories.forEach((category) => {
        const categoryElement = this.createCategoryElement(category);
        container.appendChild(categoryElement);
      });

      // Add "New Column" button at the end
      const addColumnBtn = document.createElement('button');
      addColumnBtn.className = 'window-group add-column-btn';
      addColumnBtn.style.minWidth = 'var(--column-width)';
      addColumnBtn.style.height = '100px';
      addColumnBtn.style.display = 'flex';
      addColumnBtn.style.alignItems = 'center';
      addColumnBtn.style.justifyContent = 'center';
      addColumnBtn.style.background = 'rgba(0,0,0,0.02)';
      addColumnBtn.style.border = '2px dashed var(--border)';
      addColumnBtn.style.cursor = 'pointer';
      addColumnBtn.style.color = 'var(--text-secondary)';
      addColumnBtn.style.fontSize = '14px';
      addColumnBtn.style.fontWeight = '500';
      addColumnBtn.style.transition = 'all 0.2s';

      addColumnBtn.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <span style="font-size: 24px;">+</span>
          <span>Yeni Kategori</span>
        </div>
      `;

      addColumnBtn.addEventListener('mouseover', () => {
        addColumnBtn.style.background = 'rgba(66, 133, 244, 0.05)';
        addColumnBtn.style.borderColor = 'var(--primary-color)';
        addColumnBtn.style.color = 'var(--primary-color)';
      });

      addColumnBtn.addEventListener('mouseout', () => {
        addColumnBtn.style.background = 'rgba(0,0,0,0.02)';
        addColumnBtn.style.borderColor = 'var(--border)';
        addColumnBtn.style.color = 'var(--text-secondary)';
      });

      addColumnBtn.addEventListener('click', () => {
        if (window.uiController) {
          window.uiController.showCreateCategoryModal();
        }
      });

      container.appendChild(addColumnBtn);
    } else {
      // Still show empty state if no categories after loading
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <div class="empty-state-text">
            Kategoriler yükleniyor...
          </div>
        </div>
      `;
    }
  }



  // Create default categories
  async createDefaultCategories() {
    try {
      // Get bookmarks bar
      const tree = await chrome.bookmarks.getTree();
      const bookmarksBar = tree[0].children.find(node => node.id === '1'); // Bookmarks bar

      if (!bookmarksBar) {
        throw new Error('Bookmarks bar not found');
      }

      // Check if categories already exist
      const existingFolders = bookmarksBar.children.filter(child => child.children);
      if (existingFolders.length >= 6) {
        if (window.uiController) {
          window.uiController.showNotification('Kategoriler zaten mevcut!', 'info');
        }
        await this.renderBookmarks();
        return;
      }

      // Default categories
      const defaultCategories = [
        { name: 'Work', icon: '💼' },
        { name: 'AI', icon: '🤖' },
        { name: 'Alışveriş', icon: '🛒' },
        { name: 'Social', icon: '💬' },
        { name: 'Dev', icon: '💻' },
        { name: 'News', icon: '📰' }
      ];

      // Create folders only if they don't exist
      for (const category of defaultCategories) {
        const exists = bookmarksBar.children.some(child =>
          child.title === category.name && child.children
        );

        if (!exists) {
          await chrome.bookmarks.create({
            parentId: bookmarksBar.id,
            title: category.name
          });
        }
      }

      if (window.uiController) {
        window.uiController.showNotification('Kategoriler oluşturuldu! 🎉', 'success');
      }

      // Refresh
      await this.renderBookmarks();
    } catch (error) {
      console.error('Error creating default categories:', error);
      if (window.uiController) {
        window.uiController.showNotification('Kategoriler oluşturulamadı', 'error');
      }
    }
  }

  // Create custom category
  async createCategory(name) {
    try {
      const tree = await chrome.bookmarks.getTree();
      console.log('Bookmark Tree:', tree);

      // Find bookmarks bar - usually id '1' but let's be safer
      // Root (0) -> Children -> Find one that is likely the bar
      let bookmarksBar = tree[0].children.find(node => node.id === '1');

      if (!bookmarksBar) {
        // Fallback: look for the first folder with children
        bookmarksBar = tree[0].children.find(node => node.children);
      }

      if (!bookmarksBar) {
        console.error('Bookmarks bar not found in tree:', tree);
        throw new Error('Bookmarks bar not found');
      }

      console.log('Creating category in:', bookmarksBar.id, bookmarksBar.title);

      await chrome.bookmarks.create({
        parentId: bookmarksBar.id,
        title: name
      });

      await this.renderBookmarks();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error; // Rethrow so UIController handles it
    }
  }

  // Delete category
  async deleteCategory(categoryId) {
    try {
      // Check if category is not empty
      const category = this.categories.get(categoryId);
      if (category && category.bookmarks.length > 0) {
        throw new Error('Kategori boş değil. Önce içindeki bookmarkları silin veya taşıyın.');
      }

      await chrome.bookmarks.remove(categoryId);

      // Remove from order list
      this.categoryOrder = this.categoryOrder.filter(id => id !== categoryId);
      await this.saveCategoryOrder();

      if (window.uiController) {
        window.uiController.showNotification('Kategori silindi', 'success');
      }

      await this.renderBookmarks();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Create a category element
  createCategoryElement(category) {
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'window-group';
    categoryGroup.dataset.categoryId = category.id;
    categoryGroup.draggable = true; // Enable dragging for the category

    // Setup drag and drop for bookmarks (dropping into category)
    this.setupDragAndDrop(categoryGroup, category);

    // Setup drag and drop for category reordering
    this.setupCategoryDragAndDrop(categoryGroup, category);

    // Category header
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'window-header';

    // Header content container
    const headerContent = document.createElement('div');
    headerContent.className = 'window-header-content';
    headerContent.style.display = 'flex';
    headerContent.style.alignItems = 'center';
    headerContent.style.flex = '1';
    headerContent.style.gap = '12px';

    const headerIcon = document.createElement('span');
    headerIcon.className = 'window-header-icon';
    headerIcon.textContent = category.icon;

    const headerInfo = document.createElement('div');
    headerInfo.className = 'window-header-info';

    const headerTitle = document.createElement('div');
    headerTitle.className = 'window-header-title';
    headerTitle.textContent = category.name;

    const headerCount = document.createElement('div');
    headerCount.className = 'window-header-count';
    headerCount.textContent = `${category.bookmarks.length} sites`;

    headerInfo.appendChild(headerTitle);
    headerInfo.appendChild(headerCount);
    headerContent.appendChild(headerIcon);
    headerContent.appendChild(headerInfo);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'window-header-action';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Kategoriyi Sil';
    deleteBtn.style.background = 'transparent';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.opacity = '0'; // Hidden by default
    deleteBtn.style.transition = 'opacity 0.2s';
    deleteBtn.style.padding = '4px';
    deleteBtn.style.borderRadius = '4px';

    deleteBtn.addEventListener('mouseover', () => {
      deleteBtn.style.backgroundColor = 'rgba(0,0,0,0.05)';
    });

    deleteBtn.addEventListener('mouseout', () => {
      deleteBtn.style.backgroundColor = 'transparent';
    });

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.uiController) {
        window.uiController.showDeleteCategoryModal(category);
      }
    });

    // Show delete button on hover
    categoryHeader.addEventListener('mouseenter', () => {
      deleteBtn.style.opacity = '1';
    });
    categoryHeader.addEventListener('mouseleave', () => {
      deleteBtn.style.opacity = '0';
    });

    categoryHeader.appendChild(headerContent);
    categoryHeader.appendChild(deleteBtn);
    categoryGroup.appendChild(categoryHeader);

    // Category bookmarks container
    const bookmarksContainer = document.createElement('div');
    bookmarksContainer.className = 'window-tabs';

    // Render bookmarks or empty message
    if (category.bookmarks.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-category-message';
      emptyMessage.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 13px;">
          Henüz bookmark yok<br>
          <span style="font-size: 11px;">Sekmeleri buraya sürükleyin</span>
        </div>
      `;
      bookmarksContainer.appendChild(emptyMessage);
    } else {
      category.bookmarks.forEach(bookmark => {
        const bookmarkElement = this.createBookmarkElement(bookmark);
        bookmarksContainer.appendChild(bookmarkElement);
      });
    }

    categoryGroup.appendChild(bookmarksContainer);
    return categoryGroup;
  }

  // Setup category drag and drop (for reordering columns)
  setupCategoryDragAndDrop(categoryElement, category) {
    categoryElement.addEventListener('dragstart', (e) => {
      // Only allow dragging if clicking the header (to avoid conflict with bookmarks)
      // But since the whole group is draggable, we need to check the target
      // Actually, let's just check if we are NOT dragging a bookmark
      if (e.target.classList.contains('tab-item')) {
        return; // Let the bookmark drag handler handle it
      }

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/x-category-id', category.id);
      categoryElement.classList.add('dragging-category');

      // Set a ghost image or style if needed
      setTimeout(() => {
        categoryElement.style.opacity = '0.5';
      }, 0);
    });

    categoryElement.addEventListener('dragend', (e) => {
      categoryElement.classList.remove('dragging-category');
      categoryElement.style.opacity = '1';

      // Remove all drop targets visual feedback
      document.querySelectorAll('.window-group').forEach(el => {
        el.classList.remove('drag-over-category-left');
        el.classList.remove('drag-over-category-right');
      });
    });

    categoryElement.addEventListener('dragover', (e) => {
      if (e.dataTransfer.types.includes('application/x-category-id')) {
        e.preventDefault(); // Allow dropping

        const draggingId = e.dataTransfer.getData('application/x-category-id');
        if (draggingId === category.id) return;

        // Visual feedback based on mouse position (left or right half)
        const rect = categoryElement.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;

        categoryElement.classList.remove('drag-over-category-left');
        categoryElement.classList.remove('drag-over-category-right');

        if (e.clientX < midX) {
          categoryElement.classList.add('drag-over-category-left');
        } else {
          categoryElement.classList.add('drag-over-category-right');
        }
      }
    });

    categoryElement.addEventListener('dragleave', (e) => {
      categoryElement.classList.remove('drag-over-category-left');
      categoryElement.classList.remove('drag-over-category-right');
    });

    categoryElement.addEventListener('drop', async (e) => {
      if (e.dataTransfer.types.includes('application/x-category-id')) {
        e.preventDefault();
        e.stopPropagation();

        categoryElement.classList.remove('drag-over-category-left');
        categoryElement.classList.remove('drag-over-category-right');

        const draggedId = e.dataTransfer.getData('application/x-category-id');
        if (draggedId === category.id) return;

        try {
          // Calculate new index in local order array
          const currentOrder = [...this.categoryOrder];
          const oldIndex = currentOrder.indexOf(draggedId);
          let newIndex = currentOrder.indexOf(category.id);

          if (oldIndex === -1 || newIndex === -1) return;

          // Determine if we are dropping before or after
          const rect = categoryElement.getBoundingClientRect();
          const midX = rect.left + rect.width / 2;
          const dropAfter = e.clientX >= midX;

          if (dropAfter) {
            newIndex++;
          }

          // Move item in array
          currentOrder.splice(oldIndex, 1);
          // Adjust index if we removed an item before the insertion point
          if (oldIndex < newIndex) {
            newIndex--;
          }
          currentOrder.splice(newIndex, 0, draggedId);

          // Update local state and save
          this.categoryOrder = currentOrder;
          await this.saveCategoryOrder();

          // Try to sync with Chrome bookmarks if possible (and not a root folder)
          // Root folders (1, 2) cannot be moved, so we catch that error silently
          try {
            await this.moveCategoryInChrome(draggedId, newIndex);
          } catch (chromeError) {
            console.log('Could not sync order with Chrome (likely root folder), but local order is updated.');
          }

          await this.renderBookmarks();

        } catch (error) {
          console.error('Error moving category:', error);
          if (window.uiController) {
            window.uiController.showNotification('Kategori taşınamadı', 'error');
          }
        }
      }
    });
  }

  // Move category in Chrome (helper)
  async moveCategoryInChrome(categoryId, newIndex) {
    // We need to be careful here. The newIndex in our local array might not match 
    // the index in Chrome's folder structure if we have mixed content.
    // But for now, let's just try to move it if it's not a root folder.
    if (categoryId === '1' || categoryId === '2') return; // Don't try to move root folders

    // This part is tricky because 'newIndex' is relative to our displayed categories,
    // not necessarily the Chrome bookmark tree index.
    // For now, we rely mainly on local storage for order.
    // We can attempt to move it to the end if it's the last one, etc.
    // But honestly, if we use local storage for order, we don't strictly NEED to sync with Chrome
    // unless the user wants to see the same order in the browser's bookmark manager.

    // Let's skip Chrome sync for now to avoid complexity and errors, 
    // as the user specifically asked to move the Bookmarks Bar which IS impossible in Chrome.
    // So relying purely on local sort is the correct solution.
    return;
  }

  // Add bookmark to category
  async addBookmarkToCategory(parentId, title, url) {
    try {
      await chrome.bookmarks.create({
        parentId: parentId,
        title: title || 'New Bookmark',
        url: url
      });
    } catch (error) {
      console.error('Error creating bookmark:', error);
      throw error;
    }
  }

  // Delete bookmark
  async deleteBookmark(bookmarkId) {
    try {
      await chrome.bookmarks.remove(bookmarkId);

      if (window.uiController) {
        window.uiController.showNotification('Bookmark silindi', 'success');
      }

      await this.renderBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }

  // Create a bookmark element
  createBookmarkElement(bookmark) {
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'tab-item';
    bookmarkItem.dataset.bookmarkId = bookmark.id;

    // Favicon
    const favicon = document.createElement('img');
    favicon.className = 'tab-favicon';

    // Try Chrome's internal favicon cache first (best quality)
    const chromeFaviconUrl = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(bookmark.url)}&size=32`;
    favicon.src = chromeFaviconUrl;
    favicon.alt = '';

    // Fallback chain: Chrome Cache -> Google Service -> Generic Icon
    favicon.onerror = () => {
      // If Chrome cache fails, try Google's service
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`;

      if (favicon.src === googleFaviconUrl) {
        // If Google service also failed (prevent infinite loop), show generic icon
        favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">🔖</text></svg>';
        favicon.onerror = null; // Stop handling errors
      } else {
        favicon.src = googleFaviconUrl;
      }
    };

    // Bookmark info
    const bookmarkInfo = document.createElement('div');
    bookmarkInfo.className = 'tab-info';

    const bookmarkTitle = document.createElement('div');
    bookmarkTitle.className = 'tab-title';
    bookmarkTitle.textContent = bookmark.title || 'Untitled';
    bookmarkTitle.title = bookmark.title;

    const bookmarkUrl = document.createElement('div');
    bookmarkUrl.className = 'tab-url';
    try {
      const url = new URL(bookmark.url);
      bookmarkUrl.textContent = url.hostname;
    } catch {
      bookmarkUrl.textContent = bookmark.url;
    }
    bookmarkUrl.title = bookmark.url;

    bookmarkInfo.appendChild(bookmarkTitle);
    bookmarkInfo.appendChild(bookmarkUrl);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'tab-delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Sil';

    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent opening the bookmark

      if (window.uiController) {
        const confirmed = await window.uiController.showConfirmModal(
          'Bookmark Sil',
          `"${bookmark.title}" yer işaretini silmek istediğinize emin misiniz?`
        );

        if (confirmed) {
          await this.deleteBookmark(bookmark.id);
        }
      }
    });

    // Click to open
    bookmarkItem.addEventListener('click', async (e) => {
      // Don't open if clicking delete button (handled by stopPropagation, but extra safety)
      if (e.target.closest('.tab-delete-btn')) return;

      try {
        await this.openBookmark(bookmark.url, false);
      } catch (error) {
        if (window.uiController) {
          window.uiController.showNotification('Bookmark açılamadı', 'error');
        }
      }
    });

    // Assemble
    bookmarkItem.appendChild(favicon);
    bookmarkItem.appendChild(bookmarkInfo);
    bookmarkItem.appendChild(deleteBtn);

    // Enable dragging
    bookmarkItem.draggable = true;
    bookmarkItem.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'copyMove';
      e.dataTransfer.setData('text/uri-list', bookmark.url);
      e.dataTransfer.setData('text/plain', bookmark.url);
      e.dataTransfer.setData('text/html', `<a href="${bookmark.url}">${bookmark.title}</a>`);
      e.dataTransfer.setData('application/x-bookmark-id', bookmark.id);
      bookmarkItem.style.opacity = '0.5';
    });

    bookmarkItem.addEventListener('dragend', (e) => {
      bookmarkItem.style.opacity = '1';
      document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      });
    });

    // Allow dropping on other bookmarks for reordering
    bookmarkItem.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent category drop handler

      // Don't allow dropping on itself
      const draggedId = e.dataTransfer.getData('application/x-bookmark-id');
      if (draggedId === bookmark.id) return;

      const rect = bookmarkItem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      bookmarkItem.classList.remove('drag-over-top', 'drag-over-bottom');

      if (e.clientY < midY) {
        bookmarkItem.classList.add('drag-over-top');
      } else {
        bookmarkItem.classList.add('drag-over-bottom');
      }
    });

    bookmarkItem.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      bookmarkItem.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    bookmarkItem.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      bookmarkItem.classList.remove('drag-over-top', 'drag-over-bottom');

      const draggedId = e.dataTransfer.getData('application/x-bookmark-id');
      if (!draggedId || draggedId === bookmark.id) return;

      try {
        // Get destination info
        const rect = bookmarkItem.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const dropBefore = e.clientY < midY;

        // Get current bookmark's index
        const currentBookmark = await chrome.bookmarks.get(bookmark.id);
        let newIndex = currentBookmark[0].index;

        if (!dropBefore) {
          newIndex++;
        }

        // Move the bookmark
        await chrome.bookmarks.move(draggedId, {
          parentId: bookmark.parentId,
          index: newIndex
        });

        if (window.uiController) {
          window.uiController.showNotification('Sıralama güncellendi', 'success');
        }

        await this.renderBookmarks();
      } catch (error) {
        console.error('Error reordering bookmark:', error);
        if (window.uiController) {
          window.uiController.showNotification('Sıralama değiştirilemedi', 'error');
        }
      }
    });

    return bookmarkItem;
  }

  // Get favicon URL
  getFaviconUrl(url) {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">🔖</text></svg>';
    }
  }

  // Setup drag and drop for category
  setupDragAndDrop(categoryElement, category) {
    // Prevent default drag behavior
    categoryElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      categoryElement.classList.add('drag-over');
    });

    categoryElement.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      categoryElement.classList.remove('drag-over');
    });

    categoryElement.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      categoryElement.classList.remove('drag-over');

      try {
        // Check if this is an internal bookmark drag
        const draggedBookmarkId = e.dataTransfer.getData('application/x-bookmark-id');

        if (draggedBookmarkId) {
          // Internal drag - Move the bookmark

          // Check if we are dropping into the same category
          // We need to check the current parent of the dragged bookmark
          const bookmarks = await chrome.bookmarks.get(draggedBookmarkId);
          if (bookmarks && bookmarks[0]) {
            if (bookmarks[0].parentId === category.id) {
              // Dropped in the same category - do nothing
              console.log('Dropped in same category, ignoring');
              return;
            }

            // Move to new category
            await chrome.bookmarks.move(draggedBookmarkId, { parentId: category.id });

            if (window.uiController) {
              window.uiController.showNotification('Bookmark taşındı', 'success');
            }

            await this.renderBookmarks();
            return;
          }
        }

        // External drag (or fallback) - Create new bookmark
        const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
        const title = e.dataTransfer.getData('text/html');

        if (url) {
          // Extract title from HTML if available
          let bookmarkTitle = url;
          if (title) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = title;
            const linkElement = tempDiv.querySelector('a');
            if (linkElement) {
              bookmarkTitle = linkElement.textContent || linkElement.href;
            }
          }

          // Add bookmark to this category
          await this.addBookmarkToCategory(category.id, bookmarkTitle, url);

          if (window.uiController) {
            window.uiController.showNotification(`"${bookmarkTitle}" eklendi!`, 'success');
          }

          // Refresh bookmarks
          await this.renderBookmarks();
        }
      } catch (error) {
        console.error('Error handling drop:', error);
        if (window.uiController) {
          window.uiController.showNotification('İşlem başarısız', 'error');
        }
      }
    });
  }

  // Enable dragging from browser tabs
  enableTabDragging() {
    // This will be handled by the browser's native drag behavior
    // Users can drag tabs from the tab bar to the bookmark categories
    console.log('Tab dragging enabled - drag tabs from browser to categories');
  }
}
