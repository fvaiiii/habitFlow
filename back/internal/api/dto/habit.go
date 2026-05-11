package dto

import "time"

type CreateHabitRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Frequency   string `json:"frequency"`
	TemplateID  *uint  `json:"template_id,omitempty"`
}

type UpdateHabitRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Frequency   string `json:"frequency"`
}

type HabitResponse struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Frequency   string    `json:"frequency"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
