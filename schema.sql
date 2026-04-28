-- ==============================================================================
-- Advance Self - PostgreSQL Database Schema
-- ==============================================================================

-- 1. Users Table
-- Stores user authentication and profile information.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Metrics (Weekly Updates)
-- Keeps track of user's weekly progress, height, weight, BMI, and photos.
-- Never delete old records, append new ones each week.
CREATE TABLE user_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    height_cm NUMERIC(5, 2) NOT NULL,
    weight_kg NUMERIC(5, 2) NOT NULL,
    bmi NUMERIC(5, 2) NOT NULL,
    bmi_category VARCHAR(50) NOT NULL, -- e.g., Çok zayıf, Zayıf, İdeal, Kilolu, Obez
    photo_front_url VARCHAR(500) NOT NULL,
    photo_side_url VARCHAR(500) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Face Analyses
-- Stores scores (0-100) for different facial features based on the provided photos.
CREATE TABLE face_analyses (
    id SERIAL PRIMARY KEY,
    metric_id INTEGER NOT NULL REFERENCES user_metrics(id) ON DELETE CASCADE,
    eyebrows_score INTEGER CHECK (eyebrows_score >= 0 AND eyebrows_score <= 100),
    eyes_score INTEGER CHECK (eyes_score >= 0 AND eyes_score <= 100),
    nose_score INTEGER CHECK (nose_score >= 0 AND nose_score <= 100),
    lips_score INTEGER CHECK (lips_score >= 0 AND lips_score <= 100),
    jaw_score INTEGER CHECK (jaw_score >= 0 AND jaw_score <= 100),
    skin_score INTEGER CHECK (skin_score >= 0 AND skin_score <= 100),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Recommendations
-- Actionable advice based on the face analysis (e.g., "Çene hattı için boyun egzersizi yap")
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL REFERENCES face_analyses(id) ON DELETE CASCADE,
    feature_name VARCHAR(50) NOT NULL, -- e.g., 'Çene', 'Cilt', 'Kaş'
    advice TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Physiognomy (Marifetname) Analyses
-- Psychological insights derived from physical traits based on Marifetname.
CREATE TABLE physiognomy_analyses (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER NOT NULL REFERENCES face_analyses(id) ON DELETE CASCADE,
    physical_trait VARCHAR(100) NOT NULL,
    psychological_trait VARCHAR(100) NOT NULL,
    detailed_comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Indexing for performance
-- ==============================================================================
CREATE INDEX idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX idx_user_metrics_recorded_at ON user_metrics(recorded_at);
CREATE INDEX idx_face_analyses_metric_id ON face_analyses(metric_id);
CREATE INDEX idx_recommendations_analysis_id ON recommendations(analysis_id);
CREATE INDEX idx_physiognomy_analyses_analysis_id ON physiognomy_analyses(analysis_id);
