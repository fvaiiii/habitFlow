package models

type HabitTag struct {
	HabitID int `json:"habit_id" gorm:"primaryKey"`
	TagID   int `json:"tag_id" gorm:"primaryKey"`
}