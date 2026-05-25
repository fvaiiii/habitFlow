package service

import (
	"context"
	"strings"

	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type HabitTemplateService interface {
	GetAll(ctx context.Context) ([]model.HabitTemplate, error)
	GetByID(ctx context.Context, id uint) (*model.HabitTemplate, error)
	Create(ctx context.Context, template *model.HabitTemplate) error
	Delete(ctx context.Context, id uint) error
}

type habitTemplateService struct {
	repo repository.HabitTemplateRepository
}

func NewHabitTemplateService(repo repository.HabitTemplateRepository) HabitTemplateService {
	return &habitTemplateService{
		repo: repo,
	}
}

func (s *habitTemplateService) GetAll(ctx context.Context) ([]model.HabitTemplate, error) {
	templates, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, apierrors.ErrNotFound
	}
	return templates, nil
}

func (s *habitTemplateService) GetByID(ctx context.Context, id uint) (*model.HabitTemplate, error) {
	template, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apierrors.ErrNotFound
	}
	return template, nil
}

func (s *habitTemplateService) Create(ctx context.Context, template *model.HabitTemplate) error {
	if template == nil {
		return apierrors.ErrValidation
	}

	template.Title = strings.TrimSpace(template.Title)

	if template.Title == "" {
		return apierrors.ErrValidation
	}

	switch template.Frequency {
	case "daily", "weekly":
	default:
		return apierrors.ErrValidation
	}

	err := s.repo.Create(ctx, template)
	if err != nil {
		return apierrors.ErrInternal
	}

	return nil
}
func (s *habitTemplateService) Delete(ctx context.Context, id uint) error {
	err := s.repo.Delete(ctx, id)
	if err != nil {
		return apierrors.ErrNotFound
	}
	return nil
}
