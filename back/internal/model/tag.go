package model

type Tag struct {
	ID     uint   `gorm:"primaryKey"`
	UserID uint   `gorm:"not null"`
	User   User   `gorm:"foreignKey:UserID"`
	Name   string `gorm:"not null"`
	Color  string `gorm:"type:varchar(7)"` }