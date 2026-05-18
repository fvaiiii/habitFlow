package service

import (
	"context"

	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
	"github.com/fvaiiii/habitFlow/back/internal/auth"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type AuthService interface {
	Register(ctx context.Context, email, password string) error
	Login(ctx context.Context, email, password string) (string, error)
	GetByID(ctx context.Context, id uint) (*model.User, error)
}

type authService struct {
	users repository.UserRepository
}

func NewAuthService(users repository.UserRepository) AuthService {
	return &authService{
		users: users,
	}
}

func (s *authService) Register(ctx context.Context, email, password string) error {

	hash, err := auth.HashPassword(password)
	if err != nil {
		return apierrors.ErrValidation
	}

	user := &model.User{
		Email:        email,
		PasswordHash: hash,
		Role:         "user",
	}

	err = s.users.Create(ctx, user)
	if err != nil {
		return apierrors.ErrConflict
	}

	return nil
}

func (s *authService) Login(ctx context.Context, email, password string) (string, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		return "", apierrors.ErrNotFound
	}
	if !auth.CheckPassword(password, user.PasswordHash) {
		return "", apierrors.ErrUnauthorized
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		return "", apierrors.ErrInternal
	}

	return token, nil
}

func (s *authService) GetByID(ctx context.Context, id uint) (*model.User, error) {
	user, err := s.users.GetByID(ctx, id)
	if err != nil {
		return nil, apierrors.ErrNotFound
	}

	return user, nil
}
