// Utility functions for Chrome Tab Manager

// Debounce function for performance optimization
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Sanitize URL
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'chrome:', 'chrome-extension:'].includes(parsed.protocol)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Az önce';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} dakika önce`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} saat önce`;
  }
  
  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} gün önce`;
  }
  
  // Format as date
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Get favicon URL or return default
function getFaviconUrl(tab) {
  if (tab.favIconUrl && tab.favIconUrl.startsWith('http')) {
    return tab.favIconUrl;
  }
  return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">📄</text></svg>';
}

// Truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

// Send message to background script
function sendMessage(action, data = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action, ...data }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (response && response.success) {
        resolve(response);
      } else {
        reject(new Error(response?.error || 'Unknown error'));
      }
    });
  });
}

// Group colors for tab groups
const GROUP_COLORS = [
  { name: 'Gri', value: 'grey' },
  { name: 'Mavi', value: 'blue' },
  { name: 'Kırmızı', value: 'red' },
  { name: 'Sarı', value: 'yellow' },
  { name: 'Yeşil', value: 'green' },
  { name: 'Pembe', value: 'pink' },
  { name: 'Mor', value: 'purple' },
  { name: 'Cyan', value: 'cyan' }
];

// Virtual Scroller for performance with large lists
class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.items = [];
    this.visibleItems = [];
  }

  setItems(items) {
    this.items = items;
    this.render();
  }

  render() {
    if (!this.container) return;

    const scrollTop = this.container.scrollTop || 0;
    const viewportHeight = this.container.clientHeight || 600;
    
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(
      Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + 1,
      this.items.length
    );

    this.visibleItems = this.items.slice(startIndex, endIndex);

    // Set container height to accommodate all items
    const totalHeight = this.items.length * this.itemHeight;
    this.container.style.height = `${totalHeight}px`;

    // Render visible items with offset
    const offset = startIndex * this.itemHeight;
    this.container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.transform = `translateY(${offset}px)`;
    
    this.visibleItems.forEach(item => {
      const element = this.renderItem(item);
      wrapper.appendChild(element);
    });
    
    this.container.appendChild(wrapper);
  }
}

// Tab Cache for performance
class TabCache {
  constructor(ttl = 5000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}
