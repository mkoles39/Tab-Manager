# Tasarım Dokümanı

## Genel Bakış

Chrome Tab Manager, Manifest V3 standardını kullanan modern bir Chrome eklentisidir. Eklenti, popup tabanlı bir kullanıcı arayüzü, arka plan servis worker'ı ve Chrome API'leri ile entegre bir mimari kullanır. Vanilla JavaScript, HTML ve CSS ile geliştirilecek olup, herhangi bir framework bağımlılığı olmayacaktır.

## Mimari

### Yüksek Seviye Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Browser                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Chrome Tabs API                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Service Worker (Background)                │ │
│  │  - Tab event listeners                                  │ │
│  │  - Storage management                                   │ │
│  │  - Message handling                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Popup Interface                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Tab Manager  │  │   Sessions   │  │   Settings   │ │ │
│  │  │   Component  │  │  Component   │  │  Component   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Chrome Storage API (Local)                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Bileşen Mimarisi

Eklenti üç ana katmandan oluşur:

1. **Presentation Layer (Popup UI)**
   - HTML/CSS ile oluşturulmuş kullanıcı arayüzü
   - Kullanıcı etkileşimlerini yönetir
   - DOM manipülasyonu ve event handling

2. **Business Logic Layer (Service Worker)**
   - Tab yönetimi mantığı
   - Storage operasyonları
   - Chrome API entegrasyonu
   - Event-driven architecture

3. **Data Layer (Chrome Storage)**
   - Session verileri
   - Kullanıcı tercihleri
   - Uygulama durumu

## Bileşenler ve Arayüzler

### 1. Manifest Dosyası (manifest.json)

```json
{
  "manifest_version": 3,
  "name": "Chrome Tab Manager",
  "version": "1.0.0",
  "description": "Ücretsiz ve güçlü sekme yönetim eklentisi",
  "permissions": [
    "tabs",
    "storage",
    "tabGroups"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 2. Service Worker (background.js)

**Sorumluluklar:**
- Tab event'lerini dinleme (created, removed, updated)
- Storage operasyonlarını yönetme
- Popup ile mesajlaşma
- Tab ve window yönetimi

**Ana Fonksiyonlar:**
```javascript
// Tab yönetimi
- getAllTabs(): Promise<Tab[]>
- closeTab(tabId): Promise<void>
- closeTabs(tabIds): Promise<void>
- moveTab(tabId, windowId): Promise<void>
- createTabGroup(tabIds, groupName, color): Promise<void>

// Session yönetimi
- saveSession(name, tabs): Promise<void>
- getSessions(): Promise<Session[]>
- deleteSession(sessionId): Promise<void>
- restoreSession(sessionId, newWindow): Promise<void>

// Duplicate detection
- findDuplicateTabs(): Promise<DuplicateGroup[]>
```

### 3. Popup Interface

#### 3.1 Ana Yapı (popup.html)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles/popup.css">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <h1 class="title">Tab Manager</h1>
      <div class="header-actions">
        <button id="save-session-btn" class="btn-icon" title="Session Kaydet">
          <span class="icon">💾</span>
        </button>
        <button id="settings-btn" class="btn-icon" title="Ayarlar">
          <span class="icon">⚙️</span>
        </button>
      </div>
    </header>

    <!-- Tab Navigation -->
    <nav class="tab-nav">
      <button class="tab-nav-btn active" data-view="tabs">Sekmeler</button>
      <button class="tab-nav-btn" data-view="sessions">Sessions</button>
      <button class="tab-nav-btn" data-view="groups">Gruplar</button>
    </nav>

    <!-- Search Bar -->
    <div class="search-container">
      <input type="text" id="search-input" placeholder="Sekme ara..." class="search-input">
      <span class="search-icon">🔍</span>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <span class="stat-item">
        <span class="stat-label">Toplam:</span>
        <span id="total-tabs" class="stat-value">0</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">Seçili:</span>
        <span id="selected-tabs" class="stat-value">0</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">Duplicate:</span>
        <span id="duplicate-tabs" class="stat-value">0</span>
      </span>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <button id="select-all-btn" class="btn-secondary">Tümünü Seç</button>
      <button id="close-selected-btn" class="btn-danger">Seçilenleri Kapat</button>
      <button id="find-duplicates-btn" class="btn-secondary">Duplicate Bul</button>
    </div>

    <!-- Main Content Area -->
    <main class="content">
      <!-- Tabs View -->
      <div id="tabs-view" class="view active">
        <div id="tabs-container" class="tabs-container">
          <!-- Tabs will be dynamically inserted here -->
        </div>
      </div>

      <!-- Sessions View -->
      <div id="sessions-view" class="view">
        <div class="sessions-header">
          <h2>Kaydedilmiş Sessions</h2>
          <button id="new-session-btn" class="btn-primary">Yeni Session</button>
        </div>
        <div id="sessions-container" class="sessions-container">
          <!-- Sessions will be dynamically inserted here -->
        </div>
      </div>

      <!-- Groups View -->
      <div id="groups-view" class="view">
        <div class="groups-header">
          <h2>Sekme Grupları</h2>
          <button id="new-group-btn" class="btn-primary">Yeni Grup</button>
        </div>
        <div id="groups-container" class="groups-container">
          <!-- Groups will be dynamically inserted here -->
        </div>
      </div>
    </main>
  </div>

  <!-- Modal Templates -->
  <div id="modal-overlay" class="modal-overlay hidden">
    <div class="modal">
      <div class="modal-header">
        <h3 id="modal-title"></h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body" id="modal-body"></div>
      <div class="modal-footer">
        <button id="modal-cancel" class="btn-secondary">İptal</button>
        <button id="modal-confirm" class="btn-primary">Onayla</button>
      </div>
    </div>
  </div>

  <script src="scripts/popup.js"></script>
</body>
</html>
```

#### 3.2 UI Bileşenleri

**Tab Item Component:**
```html
<div class="tab-item" data-tab-id="{tabId}">
  <input type="checkbox" class="tab-checkbox">
  <img src="{favicon}" class="tab-favicon" alt="">
  <div class="tab-info">
    <div class="tab-title">{title}</div>
    <div class="tab-url">{url}</div>
  </div>
  <div class="tab-actions">
    <button class="btn-icon tab-goto" title="Git">↗</button>
    <button class="btn-icon tab-close" title="Kapat">✕</button>
  </div>
</div>
```

**Session Item Component:**
```html
<div class="session-item" data-session-id="{sessionId}">
  <div class="session-header">
    <h3 class="session-name">{name}</h3>
    <span class="session-date">{date}</span>
  </div>
  <div class="session-info">
    <span class="session-tab-count">{tabCount} sekme</span>
  </div>
  <div class="session-actions">
    <button class="btn-secondary session-restore">Geri Yükle</button>
    <button class="btn-secondary session-restore-new">Yeni Pencerede Aç</button>
    <button class="btn-icon session-rename" title="Yeniden Adlandır">✏️</button>
    <button class="btn-icon session-delete" title="Sil">🗑️</button>
  </div>
</div>
```

**Group Item Component:**
```html
<div class="group-item" data-group-id="{groupId}">
  <div class="group-header" style="border-left: 4px solid {color}">
    <h3 class="group-name">{name}</h3>
    <span class="group-tab-count">{tabCount} sekme</span>
    <button class="btn-icon group-toggle">▼</button>
  </div>
  <div class="group-tabs">
    <!-- Tab items here -->
  </div>
</div>
```

### 4. JavaScript Modülleri

#### 4.1 TabManager (scripts/tabManager.js)

```javascript
class TabManager {
  constructor() {
    this.tabs = [];
    this.selectedTabs = new Set();
    this.duplicates = new Map();
  }

  async loadTabs() { }
  async refreshTabs() { }
  filterTabs(searchTerm) { }
  selectTab(tabId) { }
  selectAllTabs() { }
  deselectAllTabs() { }
  async closeSelectedTabs() { }
  async closeTab(tabId) { }
  async goToTab(tabId) { }
  async findDuplicates() { }
  async moveTabsToWindow(tabIds, windowId) { }
  renderTabs() { }
}
```

#### 4.2 SessionManager (scripts/sessionManager.js)

```javascript
class SessionManager {
  constructor() {
    this.sessions = [];
  }

  async loadSessions() { }
  async saveSession(name, tabs) { }
  async deleteSession(sessionId) { }
  async renameSession(sessionId, newName) { }
  async restoreSession(sessionId, newWindow = false) { }
  renderSessions() { }
}
```

#### 4.3 GroupManager (scripts/groupManager.js)

```javascript
class GroupManager {
  constructor() {
    this.groups = [];
  }

  async loadGroups() { }
  async createGroup(name, color, tabIds) { }
  async deleteGroup(groupId) { }
  async addTabsToGroup(groupId, tabIds) { }
  async removeTabsFromGroup(groupId, tabIds) { }
  renderGroups() { }
}
```

#### 4.4 UIController (scripts/uiController.js)

```javascript
class UIController {
  constructor() {
    this.tabManager = new TabManager();
    this.sessionManager = new SessionManager();
    this.groupManager = new GroupManager();
    this.currentView = 'tabs';
  }

  init() { }
  setupEventListeners() { }
  switchView(viewName) { }
  showModal(title, content, onConfirm) { }
  hideModal() { }
  updateStats() { }
  showNotification(message, type) { }
}
```

## Veri Modelleri

### Tab Model
```javascript
{
  id: number,
  windowId: number,
  title: string,
  url: string,
  favIconUrl: string,
  active: boolean,
  pinned: boolean,
  groupId: number | null,
  index: number
}
```

### Session Model
```javascript
{
  id: string, // UUID
  name: string,
  createdAt: number, // timestamp
  tabs: Array<{
    title: string,
    url: string,
    favIconUrl: string
  }>,
  tabCount: number
}
```

### TabGroup Model
```javascript
{
  id: number,
  title: string,
  color: string, // 'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'
  collapsed: boolean,
  windowId: number
}
```

### Storage Schema
```javascript
{
  sessions: Session[],
  settings: {
    theme: 'light' | 'dark',
    defaultView: 'tabs' | 'sessions' | 'groups',
    confirmBeforeClose: boolean,
    autoSaveSession: boolean
  }
}
```

## Hata Yönetimi

### Hata Türleri

1. **Tab İşlem Hataları**
   - Tab bulunamadı
   - Tab kapatılamadı
   - İzin hatası

2. **Storage Hataları**
   - Quota aşımı
   - Okuma/yazma hatası
   - Veri bozulması

3. **Network Hataları**
   - Favicon yüklenemedi
   - URL erişilemez

### Hata Yönetim Stratejisi

```javascript
class ErrorHandler {
  static handle(error, context) {
    console.error(`[${context}]`, error);
    
    // User-friendly mesaj göster
    const message = this.getUserMessage(error);
    UIController.showNotification(message, 'error');
    
    // Telemetry (opsiyonel)
    this.logError(error, context);
  }

  static getUserMessage(error) {
    const messages = {
      'TAB_NOT_FOUND': 'Sekme bulunamadı',
      'PERMISSION_DENIED': 'İzin reddedildi',
      'STORAGE_QUOTA_EXCEEDED': 'Depolama alanı dolu',
      'NETWORK_ERROR': 'Ağ hatası oluştu'
    };
    return messages[error.code] || 'Bir hata oluştu';
  }
}
```

## Test Stratejisi

### Unit Tests
- TabManager fonksiyonları
- SessionManager fonksiyonları
- GroupManager fonksiyonları
- Utility fonksiyonları

### Integration Tests
- Chrome API entegrasyonu
- Storage operasyonları
- UI event handling

### Manual Testing Checklist
- [ ] Popup açılma hızı (< 100ms)
- [ ] 100+ sekme ile performans
- [ ] Session kaydetme/yükleme
- [ ] Duplicate detection doğruluğu
- [ ] Farklı window'lar arası taşıma
- [ ] Grup oluşturma ve yönetme
- [ ] Arama fonksiyonalitesi
- [ ] Responsive tasarım

## Performans Optimizasyonları

### 1. Virtual Scrolling
Çok sayıda sekme için virtual scrolling kullanılacak:
```javascript
class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.visibleItems = [];
  }

  render(items) {
    // Sadece görünür alandaki itemları render et
    const scrollTop = this.container.scrollTop;
    const viewportHeight = this.container.clientHeight;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.ceil((scrollTop + viewportHeight) / this.itemHeight);
    
    this.visibleItems = items.slice(startIndex, endIndex);
    // Render logic...
  }
}
```

### 2. Debouncing
Arama ve scroll event'leri için debouncing:
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
```

### 3. Lazy Loading
Favicon'lar için lazy loading:
```javascript
class LazyImageLoader {
  static load(img, src) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  }
}
```

### 4. Caching
Tab verilerini cache'leme:
```javascript
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
}
```

## Güvenlik Considerations

### 1. Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 2. URL Sanitization
```javascript
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    // Sadece http ve https protokollerine izin ver
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
```

### 3. XSS Prevention
```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

## Kullanıcı Deneyimi (UX) Tasarımı

### Renk Paleti
```css
:root {
  --primary-color: #4285f4;
  --secondary-color: #5f6368;
  --success-color: #34a853;
  --danger-color: #ea4335;
  --warning-color: #fbbc04;
  --background: #ffffff;
  --surface: #f8f9fa;
  --text-primary: #202124;
  --text-secondary: #5f6368;
  --border: #dadce0;
}
```

### Responsive Design
- Minimum genişlik: 400px
- Maksimum genişlik: 600px
- Yükseklik: 600px (ayarlanabilir)

### Animasyonlar
- Fade in/out: 200ms
- Slide: 300ms
- Hover effects: 150ms

### Accessibility
- ARIA labels tüm interaktif elementlerde
- Keyboard navigation desteği
- Focus indicators
- Screen reader uyumluluğu

## Deployment

### Build Process
1. Kod minification (opsiyonel)
2. Asset optimization
3. Manifest validation
4. ZIP packaging

### Chrome Web Store Yayınlama
1. Developer account oluşturma
2. Store listing hazırlama
3. Screenshots ve promotional images
4. Privacy policy
5. Extension upload ve review

## Gelecek Geliştirmeler (v2.0)

- Cloud sync (Google Drive entegrasyonu)
- Tema desteği (dark/light mode)
- Keyboard shortcuts
- Tab suspend (bellek tasarrufu)
- İstatistikler ve analytics
- Export/import sessions
- Tab notları
- Bookmark entegrasyonu
