// New Tab page script - initializes the UI Controller for full page view

// Case-insensitive match that treats the Turkish İ/ı like i
function foldText(text) {
  return (text || '').replace(/İ/g, 'i').toLowerCase().replace(/ı/g, 'i');
}

// Filters the bookmark columns while the user types in the search box
function setupBookmarkSearch(uiController) {
  const input = document.getElementById('search-input');
  const container = document.getElementById('tabs-container');
  input.placeholder = 'Yer işaretlerinde ara...';

  const noResult = document.createElement('div');
  noResult.className = 'search-empty hidden';
  noResult.textContent = 'Sonuç bulunamadı';
  container.after(noResult);

  const apply = () => {
    const term = foldText(input.value.trim());
    container.classList.toggle('searching', term !== '');
    let first = null;

    container.querySelectorAll('.window-group').forEach(group => {
      const category = uiController.bookmarkManager.categories.get(group.dataset.categoryId);
      if (!category) {
        // The "new category" button is not a search result
        group.classList.toggle('hidden', term !== '');
        return;
      }

      // A matching category name shows the whole column
      const wholeColumn = foldText(category.name).includes(term);
      let visible = 0;

      group.querySelectorAll('.tab-item').forEach((item, index) => {
        const bookmark = category.bookmarks[index] || {};
        const match = wholeColumn || foldText(`${bookmark.title} ${bookmark.url}`).includes(term);
        item.classList.toggle('hidden', !match);
        item.classList.remove('search-first');
        if (match) {
          visible += 1;
          first = first || item;
        }
      });

      group.classList.toggle('hidden', term !== '' && visible === 0 && !wholeColumn);
    });

    if (term && first) first.classList.add('search-first');
    const anyColumn = container.querySelector('.window-group:not(.hidden)');
    noResult.classList.toggle('hidden', !term || Boolean(anyColumn));
    container.classList.toggle('hidden', Boolean(term) && !anyColumn);
  };

  input.addEventListener('input', () => {
    uiController.switchView('board-container');
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === 'board-container');
    });
    apply();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = container.querySelector('.tab-item.search-first');
      if (first) first.click();
    } else if (event.key === 'Escape') {
      input.value = '';
      apply();
    }
  });

  // Columns are redrawn after edits, so filter them again
  new MutationObserver(apply).observe(container, { childList: true });
}

// Keep the number on the "open tabs" button up to date
function setupOpenTabsCount() {
  const badge = document.getElementById('open-tabs-count');
  const update = async () => {
    badge.textContent = (await chrome.tabs.query({})).length;
  };
  chrome.tabs.onCreated.addListener(update);
  chrome.tabs.onRemoved.addListener(update);
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  setupOpenTabsCount();
  console.log('New Tab page loaded');

  // Initialize UI Controller
  const uiController = new UIController();
  setupBookmarkSearch(uiController);
  uiController.init();
});
