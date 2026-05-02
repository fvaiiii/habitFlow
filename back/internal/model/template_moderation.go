package models

import "time"

type TemplateModeration struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	TemplateID  int       `json:"template_id"`
	ModeratorID int       `json:"moderator_id"`
	Action      string    `json:"action"`
	Reason      string    `json:"reason"`
	CreatedAt   time.Time `json:"created_at"`
}