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

### İndirip Kurma

**[⬇️ chrome-tab-manager-v1.1.0.zip indir](https://github.com/mkoles39/Tab-Manager/releases/latest/download/chrome-tab-manager-v1.1.0.zip)**

1. Zip dosyasını indirip kalıcı bir klasöre çıkarın
2. Tarayıcıda `chrome://extensions/` adresine gidin (Edge: `edge://extensions/`)
3. "Geliştirici modu"nu aktif edin
4. "Paketlenmemiş öğe yükle" butonuna tıklayın
5. Zip'i çıkardığınız klasörü seçin

Kaynak koddan kurmak için repoyu klonlayıp proje klasörünü aynı şekilde yükleyebilirsiniz.

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
├── popup.html             # Popup UI
├── newtab.html            # Yeni sekme sayfası
├── styles/
│   ├── popup.css
│   └── newtab.css
├── scripts/
│   ├── popup.js           # Popup başlangıç betiği
│   ├── newtab.js          # Yeni sekme başlangıç betiği
│   ├── utils.js           # Yardımcı fonksiyonlar
│   ├── storageManager.js  # Depolama
│   ├── bookmarkManager.js # Yer işaretleri
│   ├── tabManager.js      # Sekme yönetimi
│   ├── sessionManager.js  # Session yönetimi
│   ├── groupManager.js    # Grup yönetimi
│   ├── notesManager.js    # Notlar
│   ├── todoManager.js     # Yapılacaklar
│   └── uiController.js    # UI controller
└── icons/                 # SVG kaynağı ve PNG simgeler
```

## Test Etme

Detaylı test talimatları için `TESTING.md` dosyasına bakın.

## Katkıda Bulunma

Bu proje kişisel kullanım için geliştirilmiştir. İyileştirme önerileri için issue açabilirsiniz.

## Sürüm Geçmişi

### v1.1.0
- Yeni sekme sayfası yeniden tasarlandı: sıkı, rahat ve geniş (tam boy) görünüm, daraltılabilen sütunlar, etiketli menü, SVG simgeler
- Yer işareti araması ve yeniden adlandırma
- Popup: Alt+Q kısayolu, klavyeyle gezinme, birleşik arama, sade araç çubuğu
- Ayarlar ekranı: tema, liste sıklığı, yedek alma ve geri yükleme
- Yeni eklenti simgesi; Alışveriş kategorisinin yanlış simgesi düzeltildi
- İşlevsiz çalışma alanı düğmeleri kaldırıldı

### v1.0.2
- Yeni sekme sayfasının iki kez yazılmış içeriği düzeltildi

### v1.0.1
- Popup düğmeleri, arama, session, grup ve ayarlar işlevsel hale getirildi
- Yüklenmekte olan sekmelerin yanlışlıkla duplicate sayılması düzeltildi

### v1.0.0 (İlk Sürüm)
- ✅ Sekme listeleme ve yönetimi
- ✅ Arama ve filtreleme
- ✅ Session kaydetme/yükleme
- ✅ Grup oluşturma ve yönetimi
- ✅ Duplicate sekme tespiti
- ✅ Modern ve kullanıcı dostu arayüz

## Lisans

MIT License - Kendi kullanımınız için özgürce kullanabilirsiniz.
