-- Kullanıcılar Tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL -- Hashli şifreler için alanı geniş tuttum
);

-- Kullanıcı Tercihleri ve Fiziksel Özellikler Tablosu
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    is_male BOOLEAN NOT NULL, -- Int 1-0 yerine boolean daha performanslı ve okunur
    height INTEGER NOT NULL, -- cm
    weight INTEGER NOT NULL, -- kg
    age INTEGER, -- Yaş analizi etkiler
    face_shape VARCHAR(30) NOT NULL,
    body_type VARCHAR(30) NOT NULL,
    preferred_style VARCHAR(50) NOT NULL,
    skin_tone VARCHAR(30), -- Opsiyonel: Analiz derinliği için
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Tanımı
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
      REFERENCES users(id)
      ON DELETE CASCADE -- Kullanıcı silinirse verileri de silinsin
);