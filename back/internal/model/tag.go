package models

type Tag struct {
	ID     int    `json:"id" gorm:"primaryKey"`
	UserID int    `json:"user_id"`
	Name   string `json:"name"`
	Color  string `json:"color"`
}