# Advance Self - Database Architecture

Bu proje, **Advance Self** uygulamasının PostgreSQL veritabanı altyapısını içermektedir. Veritabanı, kullanıcıların zaman içindeki fiziksel değişimlerini (boy, kilo, yüz analizleri) kaybetmeden takip edebilecek şekilde tasarlanmıştır.

## 🗄️ Şema ve Tablo Yapısı

Uygulamanın veri yapısı birbirine bağlı 5 temel tablodan oluşmaktadır. Tam yapı `schema.sql` dosyası içerisinde tanımlanmıştır.

### 1. `users` (Kullanıcılar)
Sisteme kayıt olan kullanıcıların temel giriş ve kimlik bilgilerini tutar.
- **Alanlar:** `id`, `username`, `email`, `password_hash`, `created_at`, `updated_at`

### 2. `user_metrics` (Fiziksel Gelişim - Haftalık Kayıt)
Kullanıcının her hafta güncellediği boy, kilo ve vücut kitle indeksi (VKİ) bilgilerini ve sisteme yüklenen güncel fotoğrafların bağlantılarını barındırır.
- Eski verilerin üzerine yazılmaz (History Tracking). Böylece kullanıcının geçmişten bugüne olan değişimi grafiklere dökülebilir.
- `users` tablosuna bağlıdır (1:N ilişkisi).

### 3. `face_analyses` (Yüz Analizi Puanlamaları)
Kullanıcının yüklediği fotoğraflar üzerinden yapay zeka/görüntü işleme ile elde edilen yüz puanlamalarını tutar.
- **Puanlar (0-100):** Kaş, Göz, Burun, Dudak, Çene, Cilt ve Genel Puan.
- Her bir analiz, o haftaki `user_metrics` kaydına bağlıdır (1:1/1:N ilişkisi).

### 4. `recommendations` (Çözüm Önerileri)
Analiz sonucunda elde edilen verilerle kullanıcıya sunulan kişiselleştirilmiş fiziksel çözüm önerileridir (örn: "Çene hattı için boyun egzersizi", "Cilt için zencefil" vb.).
- `face_analyses` tablosuna bağlıdır.

### 5. `physiognomy_analyses` (Marifetname Yorumları)
Fiziksel özelliklere göre İbrahim Hakkı'nın Marifetname'sinden çıkarılan psikolojik ve karakter analizlerini tutar (örn: "Burun kemerliyse karakter şu yöndedir").
- `face_analyses` tablosuna bağlıdır.

---

## 🏗️ Tasarım Kararları (Best Practices)

- **Referential Integrity & Cascade:** Tablolar arası ilişkilendirmelerde `ON DELETE CASCADE` kullanılmıştır. Bir kullanıcı sistemden silindiğinde, ona ait tüm analiz, resim URL'leri ve öneriler çöplük yaratmamak adına otomatik temizlenir.
- **Performans Optimizasyonu:** `user_metrics`, `face_analyses` ve diğer ilişkili tablolardaki Foreign Key'ler (Dış Anahtarlar) ve zaman alanları (`recorded_at`) üzerinde indeksleme (`INDEX`) yapılmıştır. Böylece milyonlarca satır veri dahi olsa Frontend için grafik sorguları çok hızlı sonuç döner.
- **Veri Doğrulama (Constraints):** Yüz analiz puanlarının veri bütünlüğünü korumak amacıyla `CHECK (score >= 0 AND score <= 100)` kısıtlamaları eklenmiştir.

---

## 🚀 Kurulum ve Çalıştırma

Projede Docker **kullanılmamaktadır**. Kendi PostgreSQL sunucunuzda (Localhost veya Uzak Sunucu) aşağıdaki adımlarla tabloları oluşturabilirsiniz.

### Seçenek 1: Terminal / Command Line (`psql`) İle Kurulum
PostgreSQL kurulu bilgisayarınızda terminali açıp şu komutu çalıştırın:
```bash
psql -U postgres -d veritabani_adi -f schema.sql
```
*(Gerekirse `postgres` kısmını kendi kullanıcı adınızla, `veritabani_adi` kısmını hedef DB ile değiştirin)*

### Seçenek 2: PgAdmin / DBeaver İle Kurulum
1. Veritabanı yönetim aracınızı açın ve veritabanınıza bağlanın.
2. `schema.sql` dosyasının içindeki tüm kodları kopyalayın.
3. Yeni bir SQL sorgu penceresi açın, kodları yapıştırın ve çalıştırın (Run / Execute). Tüm tablolar ve indeksler saniyeler içerisinde oluşturulacaktır.
