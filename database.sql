-- PostgreSQL schema matching backend/app/models.py
-- Usage:
--   CREATE DATABASE advanceself;
--   \c advanceself
--   \i database.sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    gender VARCHAR(20) NOT NULL DEFAULT 'unspecified',
    height_cm INTEGER,
    weight_kg INTEGER,
    age INTEGER,
    face_shape VARCHAR(40),
    body_type VARCHAR(40),
    preferred_style VARCHAR(80),
    skin_tone VARCHAR(40),
    CONSTRAINT fk_profiles_user
      FOREIGN KEY(user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category VARCHAR(40) NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recommendations_user
      FOREIGN KEY(user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON recommendations(category);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_messages_user
      FOREIGN KEY(user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

CREATE TABLE IF NOT EXISTS community_outfits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    style_tag VARCHAR(80) NOT NULL DEFAULT 'general',
    likes INTEGER NOT NULL DEFAULT 0,
    anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_outfits_user
      FOREIGN KEY(user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
);