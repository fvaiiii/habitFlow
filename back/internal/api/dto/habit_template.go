package dto

import "time"

type CreateHabitTemplateRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Frequency   string `json:"frequency"`
}

type HabitTemplateResponse struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Frequency   string    `json:"frequency"`
	CreatedAt   time.Time `json:"created_at"`
}
