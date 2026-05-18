package service

import (
	"context"
	"time"

	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type AnalyticsService interface {
	GetHabitStreak(ctx context.Context, habitID uint, userID uint) (int, error)
	GetHeatmapForLastMonth(ctx context.Context, userID uint) (map[string]int, error)
}

type analyticsService struct {
	repo repository.AnalyticsRepository
}

func NewAnalyticsService(repo repository.AnalyticsRepository) AnalyticsService {
	return &analyticsService{
		repo: repo,
	}
}

func (s *analyticsService) GetHabitStreak(ctx context.Context, habitID uint, userID uint) (int, error) {
	streak, err := s.repo.GetCurrentStreak(ctx, habitID, userID)
	if err != nil {
		return 0, apierrors.ErrNotFound
	}

	return streak, nil
}

func (s *analyticsService) GetHeatmapForLastMonth(ctx context.Context, userID uint) (map[string]int, error) {
	start := time.Now().UTC().AddDate(0, 0, -30)

	data, err := s.repo.GetUserHeatmap(ctx, userID, start)
	if err != nil {
		return nil, apierrors.ErrInternal
	}

	return data, nil
}
