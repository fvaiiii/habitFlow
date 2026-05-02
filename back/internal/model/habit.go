package model

import "time"

type Habit struct {
	ID          uint      `json:"id"`
	UserID      uint      `json:"user_id"`
	TemplateID  *uint     `json:"template_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Frequency   string    `json:"frequency"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
