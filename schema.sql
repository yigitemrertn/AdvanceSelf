-- 1. User Account Info (Users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Basic User Profile (User_Profiles)
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender VARCHAR(50),
    height DECIMAL(5,2), -- cm
    body_shape VARCHAR(50), -- e.g., Triangle, Hourglass
    face_shape VARCHAR(50), -- e.g., Oval, Square
    preferred_styles JSONB -- e.g., ["Sport", "Classic"]
);

-- 3. Weekly Face and Body Analysis (Analyses)
CREATE TABLE analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_first_analysis BOOLEAN DEFAULT FALSE,
    weight DECIMAL(5,2), -- kg
    photo_url TEXT, -- e.g., AWS S3 URL
    skin_type VARCHAR(50), -- e.g., Oily, Dry
    facial_proportions JSONB -- e.g., Face lines
);

-- 4. Generated Recommendations (Recommendations)
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    analysis_id INTEGER REFERENCES analyses(id) ON DELETE CASCADE,
    category VARCHAR(100), -- e.g., "Style", "Workout", "Skin Care"
    content JSONB, -- Recommendation details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
