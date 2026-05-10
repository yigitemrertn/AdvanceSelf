-- 1. Kullanıcı Hesap Bilgileri (Users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kullanıcı Temel Profili (User_Profiles)
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender VARCHAR(50),
    height INTEGER, -- cm
    body_shape VARCHAR(50), -- e.g., Üçgen, Kum saati
    face_shape VARCHAR(50), -- e.g., Oval, Kare
    preferred_styles JSONB -- e.g., ["Spor", "Klasik"]
);

-- 3. Haftalık Yüz Analizi ve Fiziksel Gelişim (Analyses)
CREATE TABLE analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_first_analysis BOOLEAN DEFAULT FALSE,
    weight DECIMAL(5,2), -- Kilo
    photo_url TEXT, -- AWS S3 vs.
    skin_type VARCHAR(50), -- Yağlı, kuru vb.
    facial_proportions JSONB -- Yüz hatları vb.
);

-- 4. Üretilen Öneriler (Recommendations)
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    analysis_id INTEGER REFERENCES analyses(id) ON DELETE CASCADE,
    category VARCHAR(100), -- "Stil", "Egzersiz", "Cilt Bakımı"
    content JSONB, -- Önerinin detayları
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
