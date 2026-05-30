package service

import (
	"context"
	"strings"

	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type TagService interface {
	GetUserTags(ctx context.Context, userID uint) ([]model.Tag, error)
	CreateTag(ctx context.Context, userID uint, name, color string) (*model.Tag, error)
	UpdateTag(ctx context.Context, userID, tagID uint, name, color string) (*model.Tag, error)
	DeleteTag(ctx context.Context, userID, tagID uint) error
}

type tagService struct {
	tagRepo repository.TagRepository
}

func NewTagService(tagRepo repository.TagRepository) TagService {
	return &tagService{tagRepo: tagRepo}
}

func (s *tagService) GetUserTags(ctx context.Context, userID uint) ([]model.Tag, error) {
	tags, err := s.tagRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, apierrors.ErrInternal
	}
	return tags, nil
}

func (s *tagService) CreateTag(ctx context.Context, userID uint, name, color string) (*model.Tag, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, apierrors.ErrValidation
	}
	color = strings.TrimSpace(color)

	tag, err := s.tagRepo.Create(ctx, userID, name, color)
	if err != nil {
		if err == repository.ErrAlreadyExists {
			return nil, apierrors.ErrConflict
		}
		return nil, apierrors.ErrInternal
	}

	return tag, nil
}

func (s *tagService) UpdateTag(ctx context.Context, userID, tagID uint, name, color string) (*model.Tag, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, apierrors.ErrValidation
	}
	color = strings.TrimSpace(color)

	tag := &model.Tag{
		ID:     tagID,
		UserID: userID,
		Name:   name,
		Color:  color,
	}

	if err := s.tagRepo.Update(ctx, tag); err != nil {
		if err == repository.ErrAlreadyExists {
			return nil, apierrors.ErrConflict
		}
		if err == repository.ErrNotFound {
			return nil, apierrors.ErrNotFound
		}
		return nil, apierrors.ErrInternal
	}

	return s.tagRepo.GetByID(ctx, tagID, userID)
}

func (s *tagService) DeleteTag(ctx context.Context, userID, tagID uint) error {
	if err := s.tagRepo.Delete(ctx, tagID, userID); err != nil {
		if err == repository.ErrNotFound {
			return apierrors.ErrNotFound
		}
		return apierrors.ErrInternal
	}
	return nil
}
