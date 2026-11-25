# Continue.dev + GLM 4.7 Kurulum Rehberi

## 🎯 Amaç
Claude kotası dolduğunda GLM 4.7'ye geçiş yapmak için Continue.dev kurulumu.

---

## 📋 Kurulum Adımları

### 1. VS Code Uzantısını Yükleyin

**Yöntem 1: VS Code içinden**
1. VS Code'u açın
2. `Ctrl+Shift+X` ile Extensions panelini açın
3. "Continue" araması yapın
4. "Continue - Codestory" uzantısını yükleyin

**Yöntem 2: Terminal'den**
```bash
code --install-extension continue.continue
```

### 2. API Anahtarı Alın

#### Zhipu AI (Önerilen - Resmi GLM API)

1. https://open.bigmodel.cn/ adresine gidin
2. Kayıt olun (Çince telefon numarası gerekebilir)
3. Dashboard'dan API Key oluşturun
4. Ücretsiz krediler alabilirsiniz

**Not:** Eğer Çin telefon numaranız yoksa aşağıdaki alternatifi kullanın.

#### AI/ML API (Alternatif - Uluslararası)

1. https://aimlapi.com/ adresine gidin
2. Üye olun (Email yeterli)
3. API Key alın
4. Ücretsiz deneme kredileri mevcut

### 3. Yapılandırma Dosyasını Düzenleyin

Dosya zaten oluşturuldu: `C:\Users\KULLANICI_ADI\.continue\config.json`

**API anahtarınızı ekleyin:**

```json
{
  "models": [
    {
      "title": "GLM-4.7 (Zhipu AI)",
      "provider": "openai",
      "model": "glm-4-plus",
      "apiBase": "https://open.bigmodel.cn/api/paas/v4",
      "apiKey": "BURAYA_API_ANAHTARINIZI_YAPIŞTIRIN"
    }
  ],
  ...
}
```

### 4. VS Code'u Yeniden Başlatın

```bash
# VS Code'u kapatıp tekrar açın veya
# Ctrl+Shift+P -> "Reload Window"
```

---

## 🚀 Kullanım

### Chat Penceresi Açma

- **Kısayol:** `Ctrl+L` (Windows/Linux) veya `Cmd+L` (Mac)
- **Veya:** Soldaki Continue ikonuna tıklayın

### Kod Seçerek Soru Sorma

1. Kodun bir bölümünü seçin
2. `Ctrl+L` tuşlarına basın
3. Sorunuzu yazın
4. GLM 4.7 yanıt verecek

### Terminal Komutları (Chat içinde)

```plaintext
/edit - Kod düzenle
/comment - Yorum ekle
/test - Test yaz
/fix - Hata düzelt
/commit - Commit mesajı oluştur
```

### Autocomplete (Otomatik Tamamlama)

Kod yazarken GLM 4.7 otomatik öneriler sunacak:
- Kod yazın
- Bekleyin (birkaç saniye)
- Tab tuşuyla öneriyi kabul edin

---

## 🔄 Model Değiştirme

Chat penceresinde sağ üstteki model seçiciden:
- **GLM-4.7 (Zhipu AI)** ← Ana model
- **GLM-4.7 (AI/ML API)** ← Alternatif

---

## 💡 İpuçları

### 1. Context Ekleyin
`@` işaretini kullanarak dosya ve fonksiyon ekleyin:
```
@dosya.js bu dosyadaki hataları düzelt
```

### 2. Kod Geçmişi
Continue.dev konuşma geçmişinizi saklar - önceki sohbetlere dönebilirsiniz.

### 3. Özel Komutlar
`config.json` dosyasına kendi komutlarınızı ekleyebilirsiniz.

### 4. Performans
- GLM-4.7: Hızlı ve uygun maliyetli
- Özellikle kod üretiminde çok iyi
- Terminal görevlerinde güçlü

---

## ⚙️ Gelişmiş Ayarlar

### Temperature Ayarı (İsteğe bağlı)

Daha yaratıcı veya daha tutarlı yanıtlar için:

```json
{
  "models": [
    {
      "title": "GLM-4.7",
      "model": "glm-4-plus",
      "apiBase": "https://open.bigmodel.cn/api/paas/v4",
      "apiKey": "...",
      "temperature": 0.7  // 0-1 arası (düşük = tutarlı, yüksek = yaratıcı)
    }
  ]
}
```

### Embeddings (Kod Arama)

Kod tabanınızı anlamak için embedding kullanır:
- OpenAI API key gerektirir (opsiyonel)
- Devre dışı bırakılabilir

---

## 🐛 Sorun Giderme

### "API Key Invalid" Hatası
1. API anahtarınızı kontrol edin
2. `config.json` dosyasında tırnak içinde olduğundan emin olun
3. Boşluk veya özel karakter olmadığından emin olun

### Otomatik Tamamlama Çalışmıyor
1. `tabAutocompleteModel` ayarının doğru olduğunu kontrol edin
2. VS Code Settings'den Continue ayarlarına bakın
3. Uzantıyı devre dışı bırakıp tekrar etkinleştirin

### Yavaş Yanıtlar
1. API servisi yoğun olabilir
2. Alternatif AI/ML API'yi deneyin
3. Model seçicinize bakın (doğru model seçili mi?)

---

## 📚 Kaynaklar

- **Continue.dev Dokümantasyonu:** https://docs.continue.dev/
- **GLM-4.7 Teknik Analiz:** https://medium.com/@leucopsis/a-technical-analysis-of-glm-4-7-db7fcc54210a
- **Zhipu AI Platform:** https://open.bigmodel.cn/
- **AI/ML API Dokümantasyonu:** https://docs.aimlapi.com/

---

## ✅ Başarı Testleri

Kurulum tamamlandıktan sonra:

1. ✅ VS Code'da Continue sidebar görünüyor mu?
2. ✅ `Ctrl+L` chat penceresini açıyor mu?
3. ✅ Model seçicide "GLM-4.7" görünüyor mu?
4. ✅ Basit bir soru sorup yanıt alabiliyor musunuz?

**Hepsi tamam ise kurulum başarılı!** 🎉

---

## 💰 Maliyet Bilgisi

**GLM-4.7 Fiyatlandırması:**
- Input: ~$0.07/1M token
- Output: ~$0.07/1M token

**Claude 3.5 Sonnet (Karşılaştırma):**
- Input: $3/1M token
- Output: $15/1M token

**GLM 4.7 yaklaşık 40-200x daha ucuz!**

---

Kurulum ile ilgili sorularınız için bu README'yi referans alın.
