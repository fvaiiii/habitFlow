-- +goose Up
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    CONSTRAINT unique_user_tag UNIQUE (user_id, name)
);

-- +goose Down
DROP TABLE IF EXISTS tags;