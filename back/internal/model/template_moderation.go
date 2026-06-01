package model

import "time"

type TemplateModeration struct {
	ID          uint      `json:"id"`
	TemplateID  uint      `json:"template_id"`
	ModeratorID uint      `json:"moderator_id"`
	Action      string    `json:"action"`
	Reason      string    `json:"reason"`
	CreatedAt   time.Time `json:"created_at"`
}
