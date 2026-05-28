package service

import (
	"context"
	"errors"

	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type CheckInService interface {
	CreateCheckIn(ctx context.Context, checkIn *model.CheckIn, userId uint) (*model.CheckIn, error)
	GetHabitCheckIns(ctx context.Context, habitID uint, userId uint) ([]model.CheckIn, error)
}

type checkInService struct {
	checkInRepo repository.CheckInRepository
	habitRepo   repository.HabitRepository
}

func NewCheckInService(
	checkInRepo repository.CheckInRepository,
	habitRepo repository.HabitRepository,
) CheckInService {
	return &checkInService{
		checkInRepo: checkInRepo,
		habitRepo:   habitRepo,
	}
}

func (s *checkInService) CreateCheckIn(ctx context.Context, checkIn *model.CheckIn, userId uint) (*model.CheckIn, error) {
	if checkIn == nil {
		return nil, apierrors.ErrValidation
	}

	if _, err := s.habitRepo.GetByID(ctx, checkIn.HabitID, userId); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, apierrors.ErrNotFound
		}
		return nil, apierrors.ErrInternal
	}

	existing, err := s.checkInRepo.GetByHabitIDAndDate(
		ctx,
		checkIn.HabitID,
		checkIn.CompletedAt,
	)
	if err != nil {
		return nil, apierrors.ErrInternal
	}

	if existing != nil {
		return nil, apierrors.ErrConflict
	}

	if err := s.checkInRepo.Create(ctx, checkIn); err != nil {
		return nil, apierrors.ErrInternal
	}

	return checkIn, nil
}

func (s *checkInService) GetHabitCheckIns(ctx context.Context, habitID uint, userId uint) ([]model.CheckIn, error) {

	if _, err := s.habitRepo.GetByID(ctx, habitID, userId); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, apierrors.ErrNotFound
		}
		return nil, apierrors.ErrInternal
	}

	checkIns, err := s.checkInRepo.GetByHabitID(ctx, habitID)
	if err != nil {
		return nil, apierrors.ErrInternal
	}

	return checkIns, nil
}
