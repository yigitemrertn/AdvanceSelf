-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL -- 255 for hash
);

CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    is_male BOOLEAN NOT NULL, -- true if male false if female
    height INTEGER NOT NULL, -- cm
    weight INTEGER NOT NULL, -- kg
    age INTEGER, -- optional
    face_shape VARCHAR(30) NOT NULL,
    body_type VARCHAR(30) NOT NULL,
    preferred_style VARCHAR(50) NOT NULL,
    skin_tone VARCHAR(30), -- optional
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to link user preferences to users
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
      REFERENCES users(id)
      ON DELETE CASCADE -- delete preferences if user is deleted
);