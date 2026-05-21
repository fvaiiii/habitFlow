package repository

import (
	"context"

	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HabitTemplateRepository interface {
	GetAll(ctx context.Context) ([]model.HabitTemplate, error)
	GetByID(ctx context.Context, id uint) (*model.HabitTemplate, error)
	Create(ctx context.Context, template *model.HabitTemplate) error
	Delete(ctx context.Context, id uint) error
}

type habitTemplateRepo struct {
	pool *pgxpool.Pool
}

func NewHabitTemplateRepo(pool *pgxpool.Pool) HabitTemplateRepository {
	return &habitTemplateRepo{
		pool: pool,
	}
}

func (r *habitTemplateRepo) GetAll(ctx context.Context) ([]model.HabitTemplate, error) {
	query := `
		SELECT id, title, description, frequency, created_at
		FROM habit_templates
		ORDER BY id DESC
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var templates []model.HabitTemplate
	for rows.Next() {
		var t model.HabitTemplate
		err := rows.Scan(
			&t.ID,
			&t.Title,
			&t.Description,
			&t.Frequency,
			&t.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		templates = append(templates, t)
	}

	return templates, nil
}

func (r *habitTemplateRepo) GetByID(ctx context.Context, id uint) (*model.HabitTemplate, error) {
	query := `
		SELECT id, title, description, frequency, created_at
		FROM habit_templates
		WHERE id = $1 
	`

	var t model.HabitTemplate
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&t.ID,
		&t.Title,
		&t.Description,
		&t.Frequency,
		&t.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *habitTemplateRepo) Create(ctx context.Context, template *model.HabitTemplate) error {
	query := `
		INSERT INTO habit_templates (
			title, 
			description,
			frequency
		)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	return r.pool.QueryRow(
		ctx,
		query,
		template.Title,
		template.Description,
		template.Frequency,
	).Scan(
		&template.ID,
		&template.CreatedAt,
	)
}

func (r *habitTemplateRepo) Delete(ctx context.Context, id uint) error {
	query := `
		DELETE FROM habit_templates
		WHERE id = $1
	`

	_, err := r.pool.Query(ctx, query, id)

	return err
}
