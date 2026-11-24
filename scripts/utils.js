// Shared helpers
const Utils = {
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },
  escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  },
  debounce(fn, ms = 200) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },
  formatDate(ts) {
    return new Date(ts).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
  },
  domain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url || ''; }
  },
  normalizeUrl(url) {
    if (!url) return '';
    return /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : 'https://' + url;
  },
  // Normalised form used for duplicate detection (ignores hash and trailing slash)
  dupKey(url) {
    try {
      const u = new URL(url);
      u.hash = '';
      return u.href.replace(/\/$/, '');
    } catch { return url; }
  },
  faviconHtml(tab) {
    const src = tab.favIconUrl || '';
    if (src && /^(https?:|data:)/.test(src)) {
      return `<img class="favicon" src="${Utils.escapeHtml(src)}" alt="">`;
    }
    return '<span class="favicon favicon-fallback">🌐</span>';
  }
};
