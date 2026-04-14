package model

import "time"

type Habit struct {
	ID          uint `gorm:"primaryKey"`
	UserID      uint `gorm:"not null"`
	User        User `gorm:"foreignKey:UserID"`
	TagID       *uint
	Tag         Tag    `gorm:"foreignKey:TagID"`
	Title       string `gorm:"not null;index:idx_user_title,unique"`
	Description string
	Frequency   string    `gorm:"not null"`
	IsTemplate  bool      `gorm:"default:false"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}
