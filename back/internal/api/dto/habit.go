package dto

import (
	"time"

	"github.com/fvaiiii/habitFlow/back/internal/model"
)

type CreateHabitRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Frequency   string   `json:"frequency"`
	TemplateID  *uint    `json:"template_id,omitempty"`
	Tags        []uint `json:"tags,omitempty"`
}

type UpdateHabitRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Frequency   string   `json:"frequency"`
	Tags        []string `json:"tags"`
}

type HabitResponse struct {
	ID          uint          `json:"id"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Frequency   string        `json:"frequency"`
	Tags        []TagResponse `json:"tags"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

func HabitFromModel(habit *model.Habit) HabitResponse {
	if habit == nil {
		return HabitResponse{Tags: []TagResponse{}}
	}
	return HabitResponse{
		ID:          habit.ID,
		Title:       habit.Title,
		Description: habit.Description,
		Frequency:   habit.Frequency,
		Tags:        TagsFromModels(habit.Tags),
		CreatedAt:   habit.CreatedAt,
		UpdatedAt:   habit.UpdatedAt,
	}
}
