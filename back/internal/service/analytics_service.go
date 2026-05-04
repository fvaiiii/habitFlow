package service

import (
	"context"
	"time"

	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type AnalyticsService interface {
	GetHabitStreak(ctx context.Context, habitID uint) (int, error)
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

func (s *analyticsService) GetHabitStreak(ctx context.Context, habitID uint) (int, error) {
	return s.repo.GetCurrentStreak(ctx, habitID)
}

func (s *analyticsService) GetHeatmapForLastMonth(ctx context.Context, userID uint) (map[string]int, error) {
	startDate := time.Now().AddDate(0, 0, -30)
	
	return s.repo.GetUserHeatmap(ctx, userID, startDate)
}