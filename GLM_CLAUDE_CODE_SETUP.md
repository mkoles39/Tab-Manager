# GLM 4.7 ile Claude Code Entegrasyonu

## 🎯 Özet

Claude Code içinde GLM 4.7'yi araç olarak kullanabilirsiniz. Bu şekilde:
- ✅ Claude Code'dan ayrılmazsınız
- ✅ Claude kotası dolduğunda GLM'e geçersiniz
- ✅ GLM'in kod yeteneklerinden faydalanırsınız
- ✅ 40-200x daha ucuz maliyetle çalışırsınız

**Not:** GLM, Claude'u tamamen değiştirmez - bir araç olarak eklenir.

---

## 🚀 3 Adımda Kurulum

### Adım 1: Bağımlılıkları Yükleyin

```bash
cd "C:\Users\KULLANICI_ADI\Documents\Mk Projeler\Tab Eklentisi\mcp-servers\glm-server"
npm install
```

### Adım 2: API Anahtarını Ayarlayın

**Zhipu AI API Key alın:**
1. https://open.bigmodel.cn/ adresine gidin
2. Kayıt olun
3. Dashboard'dan API Key oluşturun

**Windows'ta ortam değişkeni olarak kaydedin:**

```powershell
# PowerShell (Geçici)
$env:GLM_API_KEY = "your-api-key-here"

# Kalıcı yapmak için:
# Windows Ayarlar > Sistem > Gelişmiş Sistem Ayarları > Environment Variables
# Yeni değişken: GLM_API_KEY = your-key
```

### Adım 3: Claude Code'a Ekleyin

**Claude Code Settings dosyasını açın:**

Windows: `C:\Users\KULLANICI_ADI\.claude\settings.json`

**Şu yapılandırmayı ekleyin:**

```json
{
  "mcpServers": {
    "glm": {
      "command": "node",
      "args": [
        "C:\\Users\\KULLANICI_ADI\\Documents\\Mk Projeler\\Tab Eklentisi\\mcp-servers\\glm-server\\index.js"
      ],
      "env": {
        "GLM_API_KEY": "${GLM_API_KEY}"
      }
    }
  }
}
```

**Claude Code'u yeniden başlatın:**
```bash
# Terminal'de
/restart
```

---

## ✅ Test Edin

### 1. Araçları Kontrol Edin

```bash
/tools
```

**Görmeli:**
- `ask_glm` - GLM'e soru sor
- `ask_glm_code` - GLM ile kod yaz

### 2. Basit Test

Claude Code'da yazın:

```
GLM'e sor: JavaScript'te promise nedir?
```

Claude otomatik olarak GLM aracını kullanacak ve yanıt alacaksınız.

### 3. Kod Testi

```
GLM ile bir fonksiyon yaz: dizideki çift sayıları filtrele
```

---

## 💬 Nasıl Kullanılır?

### Doğal Dille Çağırma (Önerilen)

Claude otomatik olarak ne zaman GLM kullanması gerektiğini anlar:

```
"GLM'den sor..."
"Bunu GLM ile yap..."
"GLM kullanarak bu kodu optimize et..."
```

### Manuel Tool Çağırma

```
Ben: /ask_glm "React hooks açıkla"

Ben: /ask_glm_code task="Bu kodu TypeScript'e çevir" code="function add(a,b) { return a+b }"
```

### Akıllı Kullanım

**Claude'a söyleyin:**

```
"Kod görevleri için GLM kullan, strateji için sen karar ver"
```

Claude hangi görevi kimin yapması gerektiğine karar verir.

---

## 🎨 Kullanım Örnekleri

### Örnek 1: Kod Optimizasyonu

```
Ben: Bu kodu GLM ile optimize et:

function findDuplicates(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

Claude: [ask_glm_code aracını çağırır]
GLM: İşte optimize edilmiş versiyonu...
```

### Örnek 2: Hızlı Soru-Cevap

```
Ben: GLM'e sor: Docker container nasıl durdurulur?

Claude: [ask_glm aracını çağırır]
GLM: docker stop <container-id> komutuyla...
```

### Örnek 3: Hibrit Kullanım

```
Ben: Tab eklentisi için yeni bir özellik ekle. Planlama için sen,
     kod yazımı için GLM kullanalım.

Claude: Önce planı oluşturayım... [plan yapar]
Claude: Şimdi GLM'e kodu yazdıralım... [GLM'i çağırır]
GLM: [Kodu yazar]
Claude: Şimdi bu kodu entegre edelim... [entegrasyonu halleder]
```

---

## 🔧 Sorun Giderme

### Problem: "Tool not found" hatası

**Çözüm:**
```bash
# Claude Code Settings'i kontrol edin
cat ~/.claude/settings.json

# MCP server eklenmiş mi?
# Yeniden başlatın
/restart
```

### Problem: "GLM_API_KEY not set"

**Çözüm:**
```powershell
# Ortam değişkenini kontrol edin
echo $env:GLM_API_KEY

# Yoksa ayarlayın
$env:GLM_API_KEY = "your-key"

# Claude Code'u yeniden başlatın
```

### Problem: MCP server çalışmıyor

**Test:**
```bash
cd mcp-servers/glm-server
node index.js

# Hata mesajı var mı kontrol edin
```

**Yaygın sorunlar:**
- Node.js yüklü değil → `node --version` ile kontrol edin
- npm bağımlılıkları yok → `npm install` çalıştırın
- Dosya yolu yanlış → Settings'teki path'i kontrol edin

---

## 💰 Maliyet Karşılaştırması

| Model | Input (1M token) | Output (1M token) |
|-------|------------------|-------------------|
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| GLM 4.7 | ~$0.07 | ~$0.07 |
| **Tasarruf** | **~43x** | **~214x** |

**Örnek Senaryo:**
- 100 kod görevi (ortalama 2000 token input + 1000 token output)
- Claude: ~$1.80
- GLM: ~$0.02
- **Tasarruf: $1.78** (%99 daha ucuz!)

---

## 📊 Ne Zaman Hangisini Kullanmalı?

### GLM 4.7 Kullanın ✅

- ✅ Kod yazma/düzenleme
- ✅ Basit soru-cevap
- ✅ Terminal komutları
- ✅ Çince dil işleme
- ✅ Tekrarlayan görevler
- ✅ Bütçe sınırlı ise

### Claude 3.5 Sonnet Kullanın ⭐

- ⭐ Karmaşık akıl yürütme
- ⭐ Uzun bağlam analizi (200k token)
- ⭐ Çok adımlı stratejik görevler
- ⭐ Yaratıcı yazım
- ⭐ Mimari kararlar
- ⭐ Code review

### Hibrit Yaklaşım 🔄

**En iyi sonuç:**
```
Claude: Strateji + Orkestrasyon + Review
GLM: Kod yazımı + Hızlı sorgular + Tekrar eden işler
```

---

## 📁 Dosya Yapısı

```
Tab Eklentisi/
├── mcp-servers/
│   └── glm-server/
│       ├── index.js          # MCP server kodu
│       ├── package.json      # Bağımlılıklar
│       ├── .env.example      # Örnek config
│       └── README.md         # Detaylı dokümantasyon
├── .claude/
│   └── settings.json         # Claude Code ayarları
└── GLM_CLAUDE_CODE_SETUP.md  # Bu dosya
```

---

## 🎓 Detaylı Dokümantasyon

Daha fazla bilgi için:
- **MCP Server README:** `mcp-servers/glm-server/README.md`
- **GLM Docs:** https://docs.z.ai/guides/llm/glm-4.7
- **MCP Protocol:** https://modelcontextprotocol.io/

---

## ✨ Sonraki Adımlar

1. ✅ MCP server kurdunuz
2. ✅ Claude Code'a eklediniz
3. ⬜ İlk testi yapın
4. ⬜ Kendi kullanım akışınızı oluşturun
5. ⬜ Claude + GLM hibrit çalışmasını deneyin

**Başarılar!** 🚀

Sorularınız için README.md dosyalarına bakın veya bana sorun.
