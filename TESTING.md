# Chrome Tab Manager - Test Talimatları

## Eklentiyi Yükleme

1. Chrome tarayıcınızı açın
2. Adres çubuğuna `chrome://extensions/` yazın ve Enter'a basın
3. Sağ üst köşede "Geliştirici modu" anahtarını aktif edin
4. "Paketlenmemiş öğe yükle" butonuna tıklayın
5. Bu proje klasörünü seçin
6. Eklenti yüklenecek ve Chrome toolbar'ında görünecektir

## Temel Fonksiyonları Test Etme

### 1. Sekme Listeleme
- [ ] Eklenti simgesine tıklayın
- [ ] Popup açılmalı ve tüm açık sekmeler listelenmeli
- [ ] Her sekme için başlık, URL ve favicon görünmeli
- [ ] Aktif sekme vurgulanmış olmalı

### 2. Sekme Arama
- [ ] Arama kutusuna bir kelime yazın
- [ ] Sekmeler gerçek zamanlı filtrelenmeli
- [ ] Hem başlık hem URL'de arama yapılmalı
- [ ] Sonuç bulunamazsa "Sonuç bulunamadı" mesajı görünmeli

### 3. Sekme Kapatma
- [ ] Bir sekmenin üzerine gelin
- [ ] Sağdaki X butonuna tıklayın
- [ ] Sekme kapanmalı ve liste güncellenmeli
- [ ] Birden fazla sekme seçin (checkbox)
- [ ] "Seçilenleri Kapat" butonuna tıklayın
- [ ] Onay mesajı görünmeli
- [ ] Seçili sekmeler kapanmalı

### 4. Session Kaydetme
- [ ] Birkaç sekme açın
- [ ] 💾 butonuna tıklayın
- [ ] Session adı girin
- [ ] "Onayla" butonuna tıklayın
- [ ] "Session kaydedildi" bildirimi görünmeli

### 5. Session Geri Yükleme
- [ ] "Sessions" sekmesine geçin
- [ ] Kaydedilmiş session'lar listelenmeli
- [ ] "Geri Yükle" butonuna tıklayın
- [ ] Session'daki sekmeler açılmalı
- [ ] "Yeni Pencerede Aç" butonunu test edin
- [ ] Yeni pencerede açılmalı

### 6. Session Yönetimi
- [ ] Session'ın ✏️ butonuna tıklayın
- [ ] Yeni isim girin ve kaydedin
- [ ] İsim değişmeli
- [ ] 🗑️ butonuna tıklayın
- [ ] Onay mesajı görünmeli
- [ ] Session silinmeli

### 7. Duplicate Tespiti
- [ ] Aynı URL'yi birkaç sekmede açın
- [ ] "Duplicate Bul" butonuna tıklayın
- [ ] Duplicate sekmeler sarı renkte vurgulanmalı
- [ ] Stats bar'da duplicate sayısı görünmeli

### 8. Grup Oluşturma
- [ ] Birkaç sekme seçin
- [ ] "Gruplar" sekmesine geçin
- [ ] "Yeni Grup" butonuna tıklayın
- [ ] Grup adı ve renk seçin
- [ ] Grup oluşturulmalı
- [ ] Chrome'da native tab group görünmeli

### 9. Grup Yönetimi
- [ ] "Gruplar" sekmesinde gruplar listelenmeli
- [ ] Grup başlığına tıklayarak daralt/genişlet
- [ ] Grup içindeki sekmeleri görüntüleyin
- [ ] Bir sekmeyi gruptan çıkarın

### 10. Pencereler Arası Taşıma
- [ ] İki Chrome penceresi açın
- [ ] Bir sekmede birkaç tab seçin
- [ ] (Bu özellik için UI henüz tam entegre değil - gelecek güncellemede)

## Performans Testi

### Çok Sayıda Sekme ile Test
- [ ] 50+ sekme açın
- [ ] Popup hızlı açılmalı (< 100ms)
- [ ] Liste sorunsuz scroll edilmeli
- [ ] Arama hızlı çalışmalı
- [ ] Seçim işlemleri akıcı olmalı

### Bellek Kullanımı
- [ ] Chrome Task Manager'ı açın (Shift+Esc)
- [ ] Extension'ın bellek kullanımını kontrol edin
- [ ] 50 MB'ın altında olmalı

## Bilinen Sınırlamalar

1. **Icon Dosyaları**: PNG icon dosyaları manuel oluşturulmalı (ICON_INSTRUCTIONS.md'ye bakın)
2. **Chrome Internal Pages**: `chrome://` sayfaları için bazı işlemler kısıtlıdır
3. **Drag & Drop**: Sürükle-bırak özelliği henüz implement edilmedi

## Hata Durumları

### Eklenti Yüklenmiyor
- Manifest.json dosyasını kontrol edin
- Console'da hata mesajlarını kontrol edin
- Icon dosyalarının eksik olması uyarı verir ama eklenti çalışır

### Popup Açılmıyor
- Background.js'de hata olabilir
- Chrome DevTools'da Extensions sayfasından "background page" inspect edin
- Console'da hataları kontrol edin

### Sekmeler Görünmüyor
- Chrome tabs permission'ı verilmiş mi kontrol edin
- Console'da hata mesajlarını kontrol edin

## Debug İpuçları

1. **Popup Debug**: Popup'a sağ tıklayıp "Inspect" seçin
2. **Background Debug**: chrome://extensions/ → "background page" inspect
3. **Console Logs**: Tüm önemli işlemler console'a log edilir
4. **Network**: Chrome DevTools Network tab'ında API çağrılarını izleyin

## Başarılı Test Kriterleri

✅ Tüm temel fonksiyonlar çalışıyor
✅ Hata mesajları kullanıcı dostu
✅ Performans kabul edilebilir seviyede
✅ UI responsive ve kullanışlı
✅ Session'lar kalıcı olarak saklanıyor
✅ Gruplar Chrome native gruplarıyla senkronize

## Sorun Bildirimi

Bir sorun bulursanız:
1. Hatanın adımlarını not edin
2. Console'daki hata mesajlarını kaydedin
3. Chrome ve eklenti versiyonunu belirtin
4. Ekran görüntüsü alın
