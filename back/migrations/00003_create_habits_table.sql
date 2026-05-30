-- +goose Up
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id INT REFERENCES habit_templates(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE IF EXISTS habits;