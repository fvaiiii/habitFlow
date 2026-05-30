package model

type Tag struct {
	ID     uint   `json:"id"`
	UserID uint   `json:"user_id"`
	Name   string `json:"name"`
	Color  string `json:"color"`
}