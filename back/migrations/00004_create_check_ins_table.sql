-- +goose Up
CREATE TABLE check_ins (
    id SERIAL PRIMARY KEY,
    habit_id INT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_daily_checkin UNIQUE (habit_id, completed_date)
);

-- +goose Down
DROP TABLE IF EXISTS check_ins;