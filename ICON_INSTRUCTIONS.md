# Icon Dosyaları Oluşturma Talimatları

Chrome Tab Manager eklentisinin çalışması için icon dosyalarına ihtiyaç var.

## Gerekli Icon Boyutları

- `icons/icon16.png` - 16x16 piksel
- `icons/icon48.png` - 48x48 piksel  
- `icons/icon128.png` - 128x128 piksel

## Seçenek 1: Online SVG to PNG Converter Kullanma

1. `icons/icon.svg` dosyasını açın
2. Şu sitelerden birini kullanın:
   - https://cloudconvert.com/svg-to-png
   - https://convertio.co/svg-png/
   - https://www.aconvert.com/image/svg-to-png/

3. Her boyut için ayrı ayrı dönüştürün:
   - 16x16 için → `icon16.png` olarak kaydedin
   - 48x48 için → `icon48.png` olarak kaydedin
   - 128x128 için → `icon128.png` olarak kaydedin

4. Dosyaları `icons/` klasörüne koyun

## Seçenek 2: ImageMagick Kullanma (Komut Satırı)

Eğer ImageMagick yüklüyse:

```bash
convert -background none -resize 16x16 icons/icon.svg icons/icon16.png
convert -background none -resize 48x48 icons/icon.svg icons/icon48.png
convert -background none -resize 128x128 icons/icon.svg icons/icon128.png
```

## Seçenek 3: Kendi Icon'unuzu Oluşturma

Photoshop, GIMP, Figma veya başka bir tasarım aracı kullanarak:

1. 128x128 piksel boyutunda bir icon tasarlayın
2. Sekme yönetimi temasına uygun bir tasarım yapın
3. PNG formatında 3 farklı boyutta export edin
4. Dosyaları `icons/` klasörüne koyun

## Geçici Çözüm

Icon dosyaları olmadan da test edebilirsiniz, ancak Chrome uyarı verecektir. 
Eklenti yine de çalışacaktır.

## Icon Hazır Olduğunda

Icon dosyalarını oluşturduktan sonra:

1. Chrome'da `chrome://extensions/` adresine gidin
2. "Geliştirici modu"nu aktif edin
3. "Paketlenmemiş öğe yükle" butonuna tıklayın
4. Proje klasörünü seçin
5. Eklenti yüklenecek ve toolbar'da görünecektir
