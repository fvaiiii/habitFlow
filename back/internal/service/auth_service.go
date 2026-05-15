package service

import (
	"context"
	"errors"

	"github.com/fvaiiii/habitFlow/back/internal/auth"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type AuthService interface {
	Register(ctx context.Context, email, password string) error
	Login(ctx context.Context, email, password string) (string, error)
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
		return err
	}

	user := &model.User{
		Email:        email,
		PasswordHash: hash,
		Role:         "user",
	}

	return s.users.Create(ctx, user)
}

func (s *authService) Login(ctx context.Context, email, password string) (string, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		return "", errors.New("user not found")
	}
	if !auth.CheckPassword(password, user.PasswordHash) {
		return "", errors.New("invalid password")
	}

	return auth.GenerateToken(user.ID)
}

func (s *authService) GetByID(ctx context.Context, id uint) (*model.User, error) {
    return s.users.GetByID(ctx, id)
}