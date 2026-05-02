package model

import "time"

type CheckIn struct {
	ID          uint      `json:"id"`
	HabitID     uint      `json:"habit_id"`
	CompletedAt time.Time `json:"completed_at"`
}
