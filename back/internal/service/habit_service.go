package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type HabitService interface {
	CreateHabit(ctx context.Context, habit *model.Habit) (*model.Habit, error)
	GetUserHabits(ctx context.Context, userId uint) ([]model.Habit, error)
	GetHabit(ctx context.Context, habitId, userId uint) (*model.Habit, error)
	UpdateHabit(ctx context.Context, habit *model.Habit) (*model.Habit, error)
	DeleteHabit(ctx context.Context, habitId, userId uint) error
}

type habitService struct {
	habitRepo repository.HabitRepository
}

func NewHabitService(habitRepo repository.HabitRepository) HabitService {
	return &habitService{
		habitRepo: habitRepo,
	}
}

func (s *habitService) CreateHabit(ctx context.Context, habit *model.Habit) (*model.Habit, error) {
	if habit == nil {
		return nil, fmt.Errorf("habit пустой")
	}
	switch habit.Frequency {
	case "daily", "weekly":
		// ok
	default:
		return nil, fmt.Errorf("frequency невалидный")
	}
	habit.Title = strings.TrimSpace(habit.Title)
	if strings.TrimSpace(habit.Title) == "" {
		return nil, fmt.Errorf("title обязателен")
	}
	if err := s.habitRepo.Create(ctx, habit); err != nil {
		return nil, fmt.Errorf("create habit: %w", err)
	}
	return habit, nil
}

func (s *habitService) GetUserHabits(ctx context.Context, userId uint) ([]model.Habit, error) {
	habits, err := s.habitRepo.GetByUserID(ctx, userId)
	if err != nil {
		return nil, fmt.Errorf("get user habits: %w", err)
	}
	return habits, nil
}
func (s *habitService) GetHabit(ctx context.Context, habitId, userId uint) (*model.Habit, error) {
	habit, err := s.habitRepo.GetByID(ctx, habitId, userId)
	if err != nil {
		return nil, fmt.Errorf("get habit: %w", err)
	}
	return habit, nil
}
func (s *habitService) UpdateHabit(ctx context.Context, habit *model.Habit) (*model.Habit, error) {
	if habit == nil {
		return nil, fmt.Errorf("habit пустой")
	}
	switch habit.Frequency {
	case "daily", "weekly":
		// ok
	default:
		return nil, fmt.Errorf("frequency невалидный")
	}
	habit.Title = strings.TrimSpace(habit.Title)
	if strings.TrimSpace(habit.Title) == "" {
		return nil, fmt.Errorf("title обязателен")
	}
	if err := s.habitRepo.Update(ctx, habit); err != nil {
		return nil, fmt.Errorf("update habit: %w", err)
	}
	return habit, nil
}
func (s *habitService) DeleteHabit(ctx context.Context, habitId, userId uint) error {

	if err := s.habitRepo.Delete(ctx, habitId, userId); err != nil {
		return fmt.Errorf("delete habit: %w", err)
	}
	return nil
}
