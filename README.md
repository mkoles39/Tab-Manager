# Chrome Tab Manager

Ücretsiz ve güçlü Chrome sekme yönetim eklentisi.

## Özellikler

- 📑 Tüm sekmeleri tek arayüzde görüntüleme
- 🔍 Hızlı sekme arama
- 💾 Session kaydetme ve geri yükleme
- 🗂️ Sekme gruplama
- 🔄 Duplicate sekme tespiti
- 🪟 Pencereler arası sekme taşıma
- ⚡ Hızlı ve hafif

## Kurulum

### Hazır paketle (önerilen)

1. [`dist/chrome-tab-manager-v1.0.0.zip`](dist/chrome-tab-manager-v1.0.0.zip) dosyasını indirin ve bir klasöre çıkarın
2. Chrome'da `chrome://extensions/` adresine gidin
3. Sağ üstteki "Geliştirici modu"nu aktif edin
4. "Paketlenmemiş öğe yükle" butonuna tıklayın ve çıkardığınız klasörü seçin

> Chrome, Web Store dışındaki `.zip` dosyalarını doğrudan yüklemez; önce çıkarmanız gerekir.
> Klasörü sildiğinizde eklenti de kalkar, bu yüzden kalıcı bir yere çıkarın.

### Geliştirme Modu

1. Bu repoyu klonlayın veya indirin
2. Yukarıdaki 2-4. adımları uygulayıp repo klasörünü seçin

Paketi yeniden oluşturmak için:

```bash
zip -r dist/chrome-tab-manager-v1.0.0.zip manifest.json background.js popup.html newtab.html scripts styles icons
```

### Icon Dosyaları

PNG icon'lar `icons/` klasöründe hazır. Değiştirmek isterseniz `icons/icon.svg` kaynağından yeniden üretebilirsiniz:

- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

Online SVG to PNG converter kullanabilirsiniz veya şu komutu kullanabilirsiniz:
```bash
# ImageMagick ile
convert -background none -resize 16x16 icons/icon.svg icons/icon16.png
convert -background none -resize 48x48 icons/icon.svg icons/icon48.png
convert -background none -resize 128x128 icons/icon.svg icons/icon128.png
```

## Kullanım

1. Chrome toolbar'ında eklenti simgesine tıklayın
2. Açılan popup'ta sekmelerinizi yönetin
3. Session kaydetmek için 💾 butonuna tıklayın
4. Farklı görünümler arasında geçiş yapmak için üst menüyü kullanın

## Geliştirme

Proje vanilla JavaScript, HTML ve CSS ile geliştirilmiştir. Herhangi bir framework bağımlılığı yoktur.

### Dosya Yapısı

```
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── popup.html            # Popup UI
├── styles/
│   └── popup.css         # Styles
├── scripts/
│   ├── popup.js          # Main popup script
│   ├── utils.js          # Utility functions
│   ├── tabManager.js     # Tab management
│   ├── sessionManager.js # Session management
│   ├── groupManager.js   # Group management
│   └── uiController.js   # UI controller
└── icons/
    └── icon.svg          # Icon source
```

## Test Etme

Detaylı test talimatları için `TESTING.md` dosyasına bakın.

## Katkıda Bulunma

Bu proje kişisel kullanım için geliştirilmiştir. İyileştirme önerileri için issue açabilirsiniz.

## Sürüm Geçmişi

### v1.0.0 (İlk Sürüm)
- ✅ Sekme listeleme ve yönetimi
- ✅ Arama ve filtreleme
- ✅ Session kaydetme/yükleme
- ✅ Grup oluşturma ve yönetimi
- ✅ Duplicate sekme tespiti
- ✅ Modern ve kullanıcı dostu arayüz

## Lisans

MIT License - Kendi kullanımınız için özgürce kullanabilirsiniz.
