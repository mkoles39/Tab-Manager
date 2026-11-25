// Shared by the popup and the new tab page: icons, appearance and backup

const ICON_PATHS = {
  board: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  note: '<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6M9 13h8M9 17h6"/>',
  check: '<path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
  tabs: '<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v11"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  open: '<path d="M7 17 17 7M9 7h8v8"/>',
  folder: '<path d="M3 6h6l2 3h10v11H3z"/>',
  work: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5h6v3M3 13h18"/>',
  shop: '<path d="M6 8h12l1 13H5z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>',
  ai: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M2 13h3M19 13h3"/>',
  social: '<path d="M4 5h16v11H10l-5 4v-4H4z"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 13h7"/>',
  video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  music: '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  game: '<rect x="2" y="8" width="20" height="10" rx="5"/><path d="M7 11v4M5 13h4M16 12h.01M18 14h.01"/>',
  food: '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-4 3-4 10 0 10v8"/>'
};

function uiIcon(name) {
  return `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.folder}</svg>`;
}

// Replace every <span data-icon="..."> in the page with its icon
function paintIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(element => {
    element.innerHTML = uiIcon(element.dataset.icon);
  });
}

// ---------- Appearance ----------

const APPEARANCE_DEFAULTS = { themeChoice: 'system', density: 'compact' };
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
let appearance = { ...APPEARANCE_DEFAULTS };

function applyAppearance(settings = {}) {
  appearance = { ...appearance, ...settings };
  const dark = appearance.themeChoice === 'dark' || (appearance.themeChoice === 'system' && darkQuery.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.density = appearance.density;
}

darkQuery.addEventListener('change', () => applyAppearance());
applyAppearance(); // avoid a light flash before the stored settings arrive
chrome.storage.local.get(['settings']).then(result => applyAppearance(result.settings));
document.addEventListener('DOMContentLoaded', () => paintIcons());

// ---------- Backup ----------

const BACKUP_KEYS = ['sessions', 'settings', 'notes', 'todos', 'categoryOrder', 'collapsedCategories'];

async function exportBackup() {
  const data = await chrome.storage.local.get(BACKUP_KEYS);
  const backup = { app: 'chrome-tab-manager', exportDate: new Date().toISOString(), data };

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  link.download = `tab-manager-yedek-${backup.exportDate.slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// Returns the values to store, or throws if the file is not a usable backup
function readBackup(text) {
  const backup = JSON.parse(text);
  if (backup?.app !== 'chrome-tab-manager' || typeof backup.data !== 'object') {
    throw new Error('Bu dosya bir Tab Manager yedeği değil');
  }

  const values = {};
  BACKUP_KEYS.forEach(key => {
    const value = backup.data[key];
    if (value === undefined) return;

    const valid = key === 'settings' ? value && typeof value === 'object' : Array.isArray(value);
    if (!valid) throw new Error(`Yedekteki "${key}" bölümü bozuk`);
    values[key] = value;
  });

  const sessionsOk = (values.sessions || []).every(session => session && Array.isArray(session.tabs));
  if (!sessionsOk) throw new Error('Yedekteki session kayıtları bozuk');
  return values;
}
