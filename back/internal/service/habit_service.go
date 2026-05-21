package service

import (
	"context"
	"strings"

	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type HabitService interface {
	CreateHabit(ctx context.Context, habit *model.Habit) (*model.Habit, error)
	GetUserHabits(ctx context.Context, userId uint) ([]model.Habit, error)
	GetHabit(ctx context.Context, habitId, userId uint) (*model.Habit, error)
	UpdateHabit(ctx context.Context, habit *model.Habit) (*model.Habit, error)
	DeleteHabit(ctx context.Context, habitId, userId uint) error
	CreateFromTemplate(ctx context.Context, templateID uint, userID uint) (*model.Habit, error)
}

type habitService struct {
	habitRepo    repository.HabitRepository
	templateRepo repository.HabitTemplateRepository
}

func NewHabitService(habitRepo repository.HabitRepository, templateRepo repository.HabitTemplateRepository) HabitService {
	return &habitService{
		habitRepo:    habitRepo,
		templateRepo: templateRepo,
	}
}

func (s *habitService) CreateHabit(ctx context.Context, habit *model.Habit) (*model.Habit, error) {
	if habit == nil {
		return nil, apierrors.ErrValidation
	}
	switch habit.Frequency {
	case "daily", "weekly":
		// ok
	default:
		return nil, apierrors.ErrValidation
	}
	habit.Title = strings.TrimSpace(habit.Title)
	if strings.TrimSpace(habit.Title) == "" {
		return nil, apierrors.ErrValidation
	}

	if err := s.habitRepo.Create(ctx, habit); err != nil {
		return nil, apierrors.ErrInternal
	}
	return habit, nil
}

func (s *habitService) GetUserHabits(ctx context.Context, userId uint) ([]model.Habit, error) {
	habits, err := s.habitRepo.GetByUserID(ctx, userId)
	if err != nil {
		return nil, apierrors.ErrInternal
	}
	return habits, nil
}
func (s *habitService) GetHabit(ctx context.Context, habitId, userId uint) (*model.Habit, error) {
	habit, err := s.habitRepo.GetByID(ctx, habitId, userId)
	if err != nil {
		return nil, apierrors.ErrNotFound
	}
	return habit, nil
}
func (s *habitService) UpdateHabit(ctx context.Context, habit *model.Habit) (*model.Habit, error) {
	if habit == nil {
		return nil, apierrors.ErrValidation
	}
	switch habit.Frequency {
	case "daily", "weekly":
		// ok
	default:
		return nil, apierrors.ErrValidation
	}
	habit.Title = strings.TrimSpace(habit.Title)
	if strings.TrimSpace(habit.Title) == "" {
		return nil, apierrors.ErrValidation
	}
	if err := s.habitRepo.Update(ctx, habit); err != nil {
		return nil, apierrors.ErrNotFound
	}
	return habit, nil
}
func (s *habitService) DeleteHabit(ctx context.Context, habitId, userId uint) error {

	if err := s.habitRepo.Delete(ctx, habitId, userId); err != nil {
		return apierrors.ErrNotFound
	}
	return nil
}

func (s *habitService) CreateFromTemplate(ctx context.Context, templateID uint, userID uint) (*model.Habit, error) {
	template, err := s.templateRepo.GetByID(ctx, templateID)
	if err != nil {
		return nil, apierrors.ErrInternal
	}

	habit := &model.Habit{
		UserID:      userID,
		Title:       template.Title,
		Description: template.Description,
		Frequency:   template.Frequency,
		TemplateID:  &template.ID,
	}

	err = s.habitRepo.Create(ctx, habit)
	if err != nil {
		return nil, apierrors.ErrInternal
	}

	return habit, nil
}
