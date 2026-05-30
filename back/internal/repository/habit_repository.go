package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HabitRepository interface {
	Create(ctx context.Context, habit *model.Habit) error
	GetByUserID(ctx context.Context, userID uint) ([]model.Habit, error)
	GetByID(ctx context.Context, id uint, userID uint) (*model.Habit, error)
	Update(ctx context.Context, habit *model.Habit) error
	Delete(ctx context.Context, id uint, userID uint) error
}

var _ HabitRepository = (*habitRepo)(nil)

type habitRepo struct {
	pool *pgxpool.Pool
}

func NewHabitRepo(pool *pgxpool.Pool) HabitRepository {
	return &habitRepo{
		pool: pool,
	}
}

func (r *habitRepo) Create(ctx context.Context, habit *model.Habit) error {
	query := `
		INSERT INTO habits (user_id, template_id, title, description, frequency)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	err := r.pool.QueryRow(ctx, query,
		habit.UserID,
		habit.TemplateID,
		habit.Title,
		habit.Description,
		habit.Frequency,
	).Scan(
		&habit.ID,
		&habit.CreatedAt,
		&habit.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("create habit: %w", err)
	}

	return nil
}

func (r *habitRepo) GetByUserID(ctx context.Context, userID uint) ([]model.Habit, error) {
	query := `
		SELECT id, user_id, template_id, title, description, frequency, created_at, updated_at
		FROM habits
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("get habits by user id: %w", err)
	}
	defer rows.Close()

	habits := make([]model.Habit, 0)

	for rows.Next() {
		var habit model.Habit
		err := rows.Scan(
			&habit.ID,
			&habit.UserID,
			&habit.TemplateID,
			&habit.Title,
			&habit.Description,
			&habit.Frequency,
			&habit.CreatedAt,
			&habit.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("get habit by user id: %w", err)
		}

		habits = append(habits, habit)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate habits: %w", err)
	}
	return habits, nil
}

func (r *habitRepo) GetByID(ctx context.Context, id uint, userID uint) (*model.Habit, error) {
	query := `
		SELECT id, user_id, template_id, title, description, frequency, created_at, updated_at
		FROM habits
		WHERE id = $1 and user_id = $2
	`

	var habit model.Habit
	err := r.pool.QueryRow(ctx, query, id, userID).Scan(
		&habit.ID,
		&habit.UserID,
		&habit.TemplateID,
		&habit.Title,
		&habit.Description,
		&habit.Frequency,
		&habit.CreatedAt,
		&habit.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get habit by id: %w", err)
	}
	return &habit, nil
}

func (r *habitRepo) Update(ctx context.Context, habit *model.Habit) error {
	query := `
		UPDATE habits
		SET 
			template_id = $3,
			title = $4,
			description = $5,
			frequency = $6,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND user_id = $2
		RETURNING updated_at
	`

	err := r.pool.QueryRow(ctx, query,
		habit.ID,
		habit.UserID,
		habit.TemplateID,
		habit.Title,
		habit.Description,
		habit.Frequency,
	).Scan(&habit.UpdatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrNotFound
		}
		return fmt.Errorf("update habit: %w", err)
	}

	return nil
}
func (r *habitRepo) Delete(ctx context.Context, id uint, userID uint) error {
	query := `
		DELETE FROM habits
		WHERE id = $1 and user_id = $2
	`

	result, err := r.pool.Exec(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("delete habit: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
