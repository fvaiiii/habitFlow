package models

import "time"

type CheckIn struct {
	ID            int       `json:"id" gorm:"primaryKey"`
	HabitID       int       `json:"habit_id"`
	CompletedAt   time.Time `json:"completed_at"`
	CompletedDate time.Time `json:"completed_date"`
}