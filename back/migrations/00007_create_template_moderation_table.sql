-- +goose Up
CREATE TABLE template_moderation (
    id SERIAL PRIMARY KEY,
    template_id INT NOT NULL REFERENCES habit_templates(id) ON DELETE CASCADE,
    moderator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'hidden', 'deleted')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE IF EXISTS template_moderation;