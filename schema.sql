CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User_Profiles (
    user_id INTEGER PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender VARCHAR(50),
    height INTEGER, -- in cm
    body_shape VARCHAR(100),
    face_shape VARCHAR(100),
    preferred_styles JSONB
);

CREATE TABLE Analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_first_analysis BOOLEAN DEFAULT FALSE,
    weight DECIMAL(5,2),
    photo_url TEXT,
    skin_type VARCHAR(100),
    facial_proportions JSONB
);

CREATE TABLE Recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    analysis_id INTEGER REFERENCES Analyses(id) ON DELETE CASCADE,
    category VARCHAR(100),
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
