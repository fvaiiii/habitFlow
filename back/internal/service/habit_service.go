package service

import (
	"context"
	"strings"

	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
)

type HabitService interface {
	CreateHabit(ctx context.Context, habit *model.Habit, tagNames []string) (*model.Habit, error)
	GetUserHabits(ctx context.Context, userId uint) ([]model.Habit, error)
	GetHabit(ctx context.Context, habitId, userId uint) (*model.Habit, error)
	UpdateHabit(ctx context.Context, habit *model.Habit, tagNames []string) (*model.Habit, error)
	DeleteHabit(ctx context.Context, habitId, userId uint) error
	CreateFromTemplate(ctx context.Context, templateID uint, userID uint) (*model.Habit, error)
	GetHabitTags(ctx context.Context, habitID uint, userID uint) ([]model.Tag, error)
    AddTagToHabit(ctx context.Context, habitID uint, tagID uint, userID uint) error
    RemoveTagFromHabit(ctx context.Context, habitID uint, tagID uint, userID uint) error
}

type habitService struct {
	habitRepo    repository.HabitRepository
	templateRepo repository.HabitTemplateRepository
	tagRepo      repository.TagRepository
}

func NewHabitService(
    habitRepo repository.HabitRepository, 
    templateRepo repository.HabitTemplateRepository,
    tagRepo repository.TagRepository,  // ← должен быть
) HabitService {
    return &habitService{
        habitRepo:    habitRepo,
        templateRepo: templateRepo,
        tagRepo:      tagRepo,  // ← сохранить
    }
}

func (s *habitService) CreateHabit(ctx context.Context, habit *model.Habit, tagNames []string) (*model.Habit, error) {
	if habit == nil {
		return nil, apierrors.ErrValidation
	}
	switch habit.Frequency {
	case "daily", "weekly":
	default:
		return nil, apierrors.ErrValidation
	}
	habit.Title = strings.TrimSpace(habit.Title)
	if habit.Title == "" {
		return nil, apierrors.ErrValidation
	}

	if err := s.habitRepo.Create(ctx, habit); err != nil {
		return nil, apierrors.ErrInternal
	}

	tags, err := s.syncHabitTags(ctx, habit.UserID, habit.ID, tagNames)
	if err != nil {
		return nil, apierrors.ErrInternal
	}
	habit.Tags = tags

	return habit, nil
}

func (s *habitService) GetUserHabits(ctx context.Context, userId uint) ([]model.Habit, error) {
	habits, err := s.habitRepo.GetByUserID(ctx, userId)
	if err != nil {
		return nil, apierrors.ErrInternal
	}
	return s.attachTags(ctx, habits)
}

func (s *habitService) GetHabit(ctx context.Context, habitId, userId uint) (*model.Habit, error) {
	habit, err := s.habitRepo.GetByID(ctx, habitId, userId)
	if err != nil {
		return nil, apierrors.ErrNotFound
	}

	tagsMap, err := s.tagRepo.GetByHabitIDs(ctx, []uint{habit.ID})
	if err != nil {
		return nil, apierrors.ErrInternal
	}
	habit.Tags = tagsMap[habit.ID]
	if habit.Tags == nil {
		habit.Tags = []model.Tag{}
	}

	return habit, nil
}

func (s *habitService) UpdateHabit(ctx context.Context, habit *model.Habit, tagNames []string) (*model.Habit, error) {
	if habit == nil {
		return nil, apierrors.ErrValidation
	}
	switch habit.Frequency {
	case "daily", "weekly":
	default:
		return nil, apierrors.ErrValidation
	}
	habit.Title = strings.TrimSpace(habit.Title)
	if habit.Title == "" {
		return nil, apierrors.ErrValidation
	}
	if err := s.habitRepo.Update(ctx, habit); err != nil {
		return nil, apierrors.ErrNotFound
	}

	tags, err := s.syncHabitTags(ctx, habit.UserID, habit.ID, tagNames)
	if err != nil {
		return nil, apierrors.ErrInternal
	}
	habit.Tags = tags

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

	habit.Tags = []model.Tag{}
	return habit, nil
}

func (s *habitService) syncHabitTags(ctx context.Context, userID, habitID uint, tagNames []string) ([]model.Tag, error) {
	normalized := normalizeTagNames(tagNames)
	tagIDs := make([]uint, 0, len(normalized))
	tags := make([]model.Tag, 0, len(normalized))

	for _, name := range normalized {
		tag, err := s.tagRepo.GetOrCreate(ctx, userID, name)
		if err != nil {
			return nil, err
		}
		tagIDs = append(tagIDs, tag.ID)
		tags = append(tags, *tag)
	}

	if err := s.tagRepo.SetHabitTags(ctx, habitID, tagIDs); err != nil {
		return nil, err
	}

	return tags, nil
}

func (s *habitService) attachTags(ctx context.Context, habits []model.Habit) ([]model.Habit, error) {
	if len(habits) == 0 {
		return habits, nil
	}

	ids := make([]uint, len(habits))
	for i, habit := range habits {
		ids[i] = habit.ID
	}

	tagsMap, err := s.tagRepo.GetByHabitIDs(ctx, ids)
	if err != nil {
		return nil, apierrors.ErrInternal
	}

	for i := range habits {
		habits[i].Tags = tagsMap[habits[i].ID]
		if habits[i].Tags == nil {
			habits[i].Tags = []model.Tag{}
		}
	}

	return habits, nil
}

func normalizeTagNames(tagNames []string) []string {
	seen := make(map[string]struct{}, len(tagNames))
	result := make([]string, 0, len(tagNames))

	for _, name := range tagNames {
		name = strings.TrimSpace(name)
		if name == "" {
			continue
		}
		key := strings.ToLower(name)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		result = append(result, name)
	}

	return result
}
func (s *habitService) GetHabitTags(ctx context.Context, habitID uint, userID uint) ([]model.Tag, error) {
    tagsMap, err := s.tagRepo.GetByHabitIDs(ctx, []uint{habitID})
    if err != nil {
        return nil, err
    }
    return tagsMap[habitID], nil
}

func (s *habitService) AddTagToHabit(ctx context.Context, habitID uint, tagID uint, userID uint) error {
    // Получаем текущие теги привычки
    currentTags, err := s.GetHabitTags(ctx, habitID, userID)
    if err != nil {
        return err
    }
    
    // Собираем ID существующих тегов
    tagIDs := make([]uint, len(currentTags))
    for i, tag := range currentTags {
        tagIDs[i] = tag.ID
    }
    
    // Проверяем, нет ли уже такого тега
    for _, id := range tagIDs {
        if id == tagID {
            return nil // уже есть
        }
    }
    
    // Добавляем новый тег
    tagIDs = append(tagIDs, tagID)
    
    // Сохраняем все теги
    return s.tagRepo.SetHabitTags(ctx, habitID, tagIDs)
}


func (s *habitService) RemoveTagFromHabit(ctx context.Context, habitID uint, tagID uint, userID uint) error {
    // Получаем текущие теги привычки
    currentTags, err := s.GetHabitTags(ctx, habitID, userID)
    if err != nil {
        return err
    }
    
    // Собираем ID существующих тегов, исключая удаляемый
    tagIDs := make([]uint, 0)
    for _, tag := range currentTags {
        if tag.ID != tagID {
            tagIDs = append(tagIDs, tag.ID)
        }
    }
    
    // Сохраняем оставшиеся теги
    return s.tagRepo.SetHabitTags(ctx, habitID, tagIDs)
}