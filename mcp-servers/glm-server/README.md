# GLM 4.7 MCP Server for Claude Code

Bu MCP server, Claude Code içinde GLM 4.7'yi araç olarak kullanmanızı sağlar.

## 🎯 Nasıl Çalışır?

- Claude Code ana AI olarak çalışır
- GLM 4.7'yi bir "tool" olarak çağırabilirsiniz
- Claude kotası dolduğunda veya GLM'in güçlü olduğu görevler için kullanın
- Kod yazma, terminal komutları, Çince işleme için özellikle etkili

## 📦 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
cd "C:\Users\KULLANICI_ADI\Documents\Mk Projeler\Tab Eklentisi\mcp-servers\glm-server"
npm install
```

### 2. API Anahtarını Ayarlayın

#### Yöntem A: Ortam Değişkeni (Önerilen)

**Windows PowerShell:**
```powershell
$env:GLM_API_KEY = "your-zhipu-api-key"
```

**Windows CMD:**
```cmd
set GLM_API_KEY=your-zhipu-api-key
```

**Kalıcı yapmak için (Windows):**
1. Windows Ayarlar > Sistem > Hakkında > Gelişmiş Sistem Ayarları
2. Environment Variables
3. Yeni kullanıcı değişkeni: `GLM_API_KEY` = `your-key`

#### Yöntem B: .env Dosyası

```bash
cp .env.example .env
# .env dosyasını düzenleyin ve API anahtarınızı ekleyin
```

### 3. Claude Code'a MCP Server Ekleyin

**Yöntem 1: Claude Code Ayarları (Önerilen)**

Claude Code Settings'i açın ve MCP servers bölümüne ekleyin:

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

**Yöntem 2: Komut Satırı**

```bash
# Proje dizinindeyken
claude mcp add --scope project --transport stdio glm -- node "mcp-servers/glm-server/index.js"
```

### 4. Claude Code'u Yeniden Başlatın

```bash
# Claude Code'u kapatıp tekrar açın
# veya
/restart
```

## 🚀 Kullanım

MCP server eklendikten sonra Claude Code içinde şöyle kullanabilirsiniz:

### Örnek 1: Genel Soru

```
Hey Claude, GLM'e şunu sor: "JavaScript'te async/await nasıl çalışır?"
```

Claude otomatik olarak `ask_glm` aracını kullanacak.

### Örnek 2: Kod Görevi

```
Bu kodu GLM ile optimize et:

function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}
```

Claude `ask_glm_code` aracını kullanacak.

### Örnek 3: Açıkça Tool Çağırma

```
/ask_glm "React hooks en iyi pratikler nelerdir?"
```

## 🛠️ Mevcut Araçlar

### 1. `ask_glm`
**Genel amaçlı GLM sorgusu**

Parametreler:
- `prompt` (gerekli): GLM'e gönderilecek soru/görev
- `temperature` (opsiyonel): 0-1 arası yaratıcılık seviyesi
- `systemPrompt` (opsiyonel): GLM'in rolünü tanımlar

**Örnek:**
```javascript
{
  "prompt": "Python'da list comprehension örnekleri ver",
  "temperature": 0.7,
  "systemPrompt": "Sen Python uzmanısın"
}
```

### 2. `ask_glm_code`
**Kod odaklı görevler için optimize edilmiş**

Parametreler:
- `task` (gerekli): Kod görevi
- `code` (opsiyonel): Üzerinde çalışılacak kod
- `language` (opsiyonel): Programlama dili

**Örnek:**
```javascript
{
  "task": "Bu fonksiyonu TypeScript'e çevir",
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript"
}
```

## 💡 Kullanım Senaryoları

### 1. Claude Kotası Dolduğunda

```
Claude yanıt veremiyor -> "GLM, bu görevi sen halleder misin?"
```

### 2. Kod Üretimi

```
"GLM ile bir React component yaz: kullanıcı profili kartı"
```

### 3. Çince İşleme

```
"Bu Çince metni GLM ile çevir ve açıkla"
```

### 4. Terminal Komutları

```
"GLM'den sor: Docker container restart komutu nedir?"
```

## 🔧 Sorun Giderme

### "GLM_API_KEY not set" Hatası

```bash
# Kontrol edin:
echo $env:GLM_API_KEY  # PowerShell
echo %GLM_API_KEY%     # CMD

# Tekrar ayarlayın:
$env:GLM_API_KEY = "your-key"
```

### MCP Server Başlamıyor

```bash
# Manuel test:
cd mcp-servers/glm-server
node index.js

# Hata mesajlarını kontrol edin
```

### Claude Code GLM Aracını Görmüyor

1. Claude Code Settings'i açın
2. MCP Servers bölümünde "glm" var mı kontrol edin
3. `/restart` komutuyla Claude Code'u yenileyin
4. `/tools` komutuyla mevcut araçları listeleyin

### API Hatası

```
GLM API error: 401 - Unauthorized
```

**Çözüm:**
- API anahtarınızı kontrol edin
- Zhipu AI dashboard'dan yeni key oluşturun
- API kotanızı kontrol edin

## 📊 Performans

**GLM 4.7 Avantajları:**
- ✅ 40-200x daha ucuz (Claude'a göre)
- ✅ Kod görevlerinde çok güçlü
- ✅ Hızlı yanıt süresi
- ✅ Terminal komutlarında başarılı

**Ne Zaman GLM Kullanmalı:**
- Kod üretimi/düzenleme
- Basit soru-cevap
- Çince dil işleme
- Bütçe sınırlaması varsa

**Ne Zaman Claude Kullanmalı:**
- Karmaşık akıl yürütme
- Uzun bağlam analizi
- Çok adımlı görevler
- Yaratıcı yazım

## 🔄 Güncelleme

```bash
cd mcp-servers/glm-server
npm update
```

## 📚 Kaynaklar

- [GLM 4.7 Documentation](https://docs.z.ai/guides/llm/glm-4.7)
- [Zhipu AI Platform](https://open.bigmodel.cn/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Claude Code MCP Guide](https://docs.claude.ai/docs/mcp)

---

## ✅ Hızlı Test

Kurulumu test etmek için:

```bash
# 1. Server çalışıyor mu?
cd mcp-servers/glm-server
node index.js

# 2. Claude Code'da
/tools

# "ask_glm" ve "ask_glm_code" görünmeli

# 3. Test sorusu
"GLM'e sor: Merhaba, nasılsın?"
```

**Başarılı ise GLM'den yanıt alacaksınız!** 🎉
