package model

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey"`
	Email        string    `gorm:"uniqueIndex;not null"`
	PasswordHash string    `gorm:"not null"`
	Role         string    `gorm:"type:text;default:'user';not null"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
}