# Gereksinimler Dokümanı

## Giriş

Chrome Tab Manager, kullanıcıların Google Chrome tarayıcısında açık sekmelerini verimli bir şekilde yönetmelerine olanak tanıyan ücretsiz bir tarayıcı eklentisidir. Eklenti, sekmeleri gruplama, kaydetme, arama ve organize etme özellikleri sunarak kullanıcıların tarayıcı deneyimini iyileştirir.

## Sözlük

- **Extension**: Chrome tarayıcısına eklenen ve tarayıcı işlevselliğini genişleten yazılım bileşeni
- **Tab**: Chrome tarayıcısında açık olan web sayfası sekmesi
- **Tab Group**: Birden fazla sekmenin mantıksal olarak gruplandırılmış koleksiyonu
- **Session**: Belirli bir zamandaki tüm açık sekmelerin anlık görüntüsü
- **Popup Interface**: Eklenti simgesine tıklandığında açılan kullanıcı arayüzü
- **Local Storage**: Tarayıcının yerel veri depolama mekanizması
- **Active Tab**: Kullanıcının şu anda görüntülediği sekme
- **Window**: Chrome tarayıcı penceresi (birden fazla sekme içerebilir)

## Gereksinimler

### Gereksinim 1

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, açık sekmelerimi tek bir arayüzde görmek istiyorum, böylece tüm sekmelerime hızlıca erişebilirim.

#### Kabul Kriterleri

1. WHEN kullanıcı Extension simgesine tıkladığında, THE Extension SHALL Popup Interface'i açmalıdır
2. THE Extension SHALL tüm açık Tab'ları liste formatında görüntülemelidir
3. THE Extension SHALL her Tab için başlık, favicon ve URL bilgilerini göstermelidir
4. THE Extension SHALL Active Tab'ı görsel olarak farklı bir şekilde vurgulamalıdır
5. THE Extension SHALL her Window'daki Tab'ları ayrı bölümlerde gruplandırmalıdır

### Gereksinim 2

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, sekmelerimi arayabilmek istiyorum, böylece çok sayıda açık sekme arasında istediğim sekmeyi hızlıca bulabilirim.

#### Kabul Kriterleri

1. THE Extension SHALL Popup Interface'de bir arama kutusu sağlamalıdır
2. WHEN kullanıcı arama kutusuna metin girdiğinde, THE Extension SHALL Tab listesini gerçek zamanlı olarak filtrelemelidir
3. THE Extension SHALL Tab başlığı ve URL'sine göre arama yapmalıdır
4. THE Extension SHALL büyük-küçük harf duyarsız arama gerçekleştirmelidir
5. WHEN arama sonucu boş olduğunda, THE Extension SHALL "Sonuç bulunamadı" mesajı göstermelidir

### Gereksinim 3

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, sekmelerimi kapatabilmek istiyorum, böylece gereksiz sekmeleri hızlıca temizleyebilirim.

#### Kabul Kriterleri

1. THE Extension SHALL her Tab için bir kapatma butonu göstermelidir
2. WHEN kullanıcı kapatma butonuna tıkladığında, THE Extension SHALL ilgili Tab'ı kapatmalıdır
3. THE Extension SHALL birden fazla Tab'ı aynı anda seçme imkanı sunmalıdır
4. THE Extension SHALL seçili Tab'ları toplu olarak kapatma özelliği sağlamalıdır
5. WHEN kullanıcı bir Tab'ı kapattığında, THE Extension SHALL Tab listesini otomatik olarak güncellemelidir

### Gereksinim 4

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, mevcut sekmelerimi bir session olarak kaydedebilmek istiyorum, böylece daha sonra aynı sekmeleri tekrar açabilirim.

#### Kabul Kriterleri

1. THE Extension SHALL kullanıcının mevcut tüm Tab'ları kaydetmesine izin vermelidir
2. WHEN kullanıcı Session kaydettiğinde, THE Extension SHALL kullanıcıdan bir Session adı istemelidir
3. THE Extension SHALL Session'ı Local Storage'a kalıcı olarak kaydetmelidir
4. THE Extension SHALL her Session için tarih ve saat bilgisi saklamalıdır
5. THE Extension SHALL kaydedilen Session'ları liste halinde görüntülemelidir

### Gereksinim 5

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, kaydettiğim session'ları geri yükleyebilmek istiyorum, böylece önceki çalışma ortamıma dönebilirim.

#### Kabul Kriterleri

1. THE Extension SHALL kaydedilmiş Session'ların listesini göstermelidir
2. WHEN kullanıcı bir Session'ı seçtiğinde, THE Extension SHALL o Session'daki tüm Tab'ları açmalıdır
3. THE Extension SHALL Session'ları yeni bir Window'da veya mevcut Window'da açma seçeneği sunmalıdır
4. THE Extension SHALL Session yükleme işlemi sırasında ilerleme göstergesi göstermelidir
5. IF bir Tab açılamadığında, THEN THE Extension SHALL hata mesajı göstermelidir

### Gereksinim 6

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, kaydettiğim session'ları yönetebilmek istiyorum, böylece artık ihtiyacım olmayan session'ları silebilirim.

#### Kabul Kriterleri

1. THE Extension SHALL her Session için silme butonu göstermelidir
2. WHEN kullanıcı silme butonuna tıkladığında, THE Extension SHALL onay mesajı göstermelidir
3. WHEN kullanıcı silme işlemini onayladığında, THE Extension SHALL Session'ı Local Storage'dan kaldırmalıdır
4. THE Extension SHALL Session'ları yeniden adlandırma özelliği sağlamalıdır
5. THE Extension SHALL Session listesini tarih, ad veya sekme sayısına göre sıralama imkanı sunmalıdır

### Gereksinim 7

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, sekmelerimi gruplandırabilmek istiyorum, böylece ilgili sekmeleri organize edebilirim.

#### Kabul Kriterleri

1. THE Extension SHALL kullanıcının Tab'ları sürükle-bırak ile gruplandırmasına izin vermelidir
2. THE Extension SHALL Tab Group oluşturma özelliği sağlamalıdır
3. WHEN kullanıcı bir Tab Group oluşturduğunda, THE Extension SHALL kullanıcıdan grup adı ve renk seçmesini istemelidir
4. THE Extension SHALL Tab Group'ları Chrome'un native tab group özelliği ile senkronize etmelidir
5. THE Extension SHALL Tab Group'ları daraltma ve genişletme özelliği sunmalıdır

### Gereksinim 8

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, duplicate (tekrarlanan) sekmeleri tespit edebilmek istiyorum, böylece gereksiz sekmeleri temizleyebilirim.

#### Kabul Kriterleri

1. THE Extension SHALL aynı URL'ye sahip Tab'ları tespit etmelidir
2. WHEN duplicate Tab tespit edildiğinde, THE Extension SHALL bu Tab'ları görsel olarak işaretlemelidir
3. THE Extension SHALL duplicate Tab'ları toplu olarak kapatma özelliği sağlamalıdır
4. THE Extension SHALL en eski veya en yeni Tab'ı tutma seçeneği sunmalıdır
5. THE Extension SHALL duplicate Tab sayısını göstermelidir

### Gereksinim 9

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, sekmelerimi farklı pencereler arasında taşıyabilmek istiyorum, böylece çalışma alanımı daha iyi organize edebilirim.

#### Kabul Kriterleri

1. THE Extension SHALL Tab'ları farklı Window'lar arasında taşıma özelliği sağlamalıdır
2. THE Extension SHALL tüm açık Window'ları listelemelidir
3. WHEN kullanıcı bir Tab'ı başka bir Window'a taşıdığında, THE Extension SHALL Tab'ı hedef Window'a transfer etmelidir
4. THE Extension SHALL birden fazla Tab'ı aynı anda taşıma imkanı sunmalıdır
5. THE Extension SHALL yeni bir Window oluşturarak Tab taşıma seçeneği sağlamalıdır

### Gereksinim 10

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, eklentinin hafif ve hızlı çalışmasını istiyorum, böylece tarayıcı performansım etkilenmesin.

#### Kabul Kriterleri

1. THE Extension SHALL 100 milisaniye içinde Popup Interface'i açmalıdır
2. THE Extension SHALL maksimum 50 MB bellek kullanmalıdır
3. THE Extension SHALL Tab listesini 200 milisaniye içinde güncellemelidir
4. THE Extension SHALL Local Storage'da maksimum 5 MB veri depolamalıdır
5. THE Extension SHALL arka planda minimum CPU kullanımı ile çalışmalıdır
