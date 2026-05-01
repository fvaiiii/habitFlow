-- +goose Up
CREATE TABLE habit_tags (
    habit_id INT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (habit_id, tag_id)
);

-- +goose Down
DROP TABLE IF EXISTS habit_tags;