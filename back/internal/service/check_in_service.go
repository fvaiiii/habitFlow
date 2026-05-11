package service

import (
	"context"
	"fmt"

	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type CheckInService interface {
	CreateCheckIn(ctx context.Context, checkIn *model.CheckIn) (*model.CheckIn, error)
	GetHabitCheckIns(ctx context.Context, habitID uint) ([]model.CheckIn, error)
}

type checkInService struct {
	checkInRepo repository.CheckInRepository
}

func NewCheckInService(checkInRepo repository.CheckInRepository) CheckInService {
	return &checkInService{
		checkInRepo: checkInRepo,
	}
}

func (s *checkInService) CreateCheckIn(ctx context.Context, checkIn *model.CheckIn) (*model.CheckIn, error) {
	if checkIn == nil {
		return nil, fmt.Errorf("checkIn is empty")
	}

	existing, err := s.checkInRepo.GetByHabitIDAndDate(
		ctx,
		checkIn.HabitID,
		checkIn.CompletedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("check checkin by date: %w", err)
	}

	if existing != nil {
		return nil, fmt.Errorf("habit already completed today")
	}

	if err := s.checkInRepo.Create(ctx, checkIn); err != nil {
		return nil, fmt.Errorf("create checkin: %w", err)
	}

	return checkIn, nil
}

func (s *checkInService) GetHabitCheckIns(ctx context.Context, habitID uint) ([]model.CheckIn, error) {
	checkIns, err := s.checkInRepo.GetByHabitID(ctx, habitID)
	if err != nil {
		return nil, fmt.Errorf("get checkins: %w", err)
	}

	return checkIns, nil
}
