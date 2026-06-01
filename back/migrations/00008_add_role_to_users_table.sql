-- +goose Up
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- +goose Down
ALTER TABLE users 
DROP COLUMN role;