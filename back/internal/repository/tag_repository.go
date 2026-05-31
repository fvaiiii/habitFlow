package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TagRepository interface {
	GetOrCreate(ctx context.Context, userID uint, name string) (*model.Tag, error)
	Create(ctx context.Context, userID uint, name, color string) (*model.Tag, error)
	GetByUserID(ctx context.Context, userID uint) ([]model.Tag, error)
	GetByID(ctx context.Context, id, userID uint) (*model.Tag, error)
	Update(ctx context.Context, tag *model.Tag) error
	Delete(ctx context.Context, id, userID uint) error
	SetHabitTags(ctx context.Context, habitID uint, tagIDs []uint) error
	GetByHabitIDs(ctx context.Context, habitIDs []uint) (map[uint][]model.Tag, error)
}

var _ TagRepository = (*tagRepo)(nil)

type tagRepo struct {
	pool *pgxpool.Pool
}

func NewTagRepo(pool *pgxpool.Pool) TagRepository {
	return &tagRepo{pool: pool}
}

func (r *tagRepo) GetOrCreate(ctx context.Context, userID uint, name string) (*model.Tag, error) {
	query := `
		INSERT INTO tags (user_id, name)
		VALUES ($1, $2)
		ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
		RETURNING id, user_id, name, COALESCE(color, '')
	`

	var tag model.Tag
	err := r.pool.QueryRow(ctx, query, userID, name).Scan(
		&tag.ID,
		&tag.UserID,
		&tag.Name,
		&tag.Color,
	)
	if err != nil {
		return nil, fmt.Errorf("get or create tag: %w", err)
	}

	return &tag, nil
}

func (r *tagRepo) Create(ctx context.Context, userID uint, name, color string) (*model.Tag, error) {
	query := `
		INSERT INTO tags (user_id, name, color)
		VALUES ($1, $2, NULLIF($3, ''))
		RETURNING id, user_id, name, COALESCE(color, '')
	`

	var tag model.Tag
	err := r.pool.QueryRow(ctx, query, userID, name, color).Scan(
		&tag.ID,
		&tag.UserID,
		&tag.Name,
		&tag.Color,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrAlreadyExists
		}
		return nil, fmt.Errorf("create tag: %w", err)
	}

	return &tag, nil
}

func (r *tagRepo) GetByUserID(ctx context.Context, userID uint) ([]model.Tag, error) {
	query := `
		SELECT id, user_id, name, COALESCE(color, '')
		FROM tags
		WHERE user_id = $1
		ORDER BY name
	`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("get tags by user id: %w", err)
	}
	defer rows.Close()

	tags := make([]model.Tag, 0)
	for rows.Next() {
		var tag model.Tag
		if err := rows.Scan(&tag.ID, &tag.UserID, &tag.Name, &tag.Color); err != nil {
			return nil, fmt.Errorf("scan tag: %w", err)
		}
		tags = append(tags, tag)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate tags: %w", err)
	}

	return tags, nil
}

func (r *tagRepo) GetByID(ctx context.Context, id, userID uint) (*model.Tag, error) {
	query := `
		SELECT id, user_id, name, COALESCE(color, '')
		FROM tags
		WHERE id = $1 AND user_id = $2
	`

	var tag model.Tag
	err := r.pool.QueryRow(ctx, query, id, userID).Scan(
		&tag.ID,
		&tag.UserID,
		&tag.Name,
		&tag.Color,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get tag by id: %w", err)
	}

	return &tag, nil
}

func (r *tagRepo) Update(ctx context.Context, tag *model.Tag) error {
	query := `
		UPDATE tags
		SET name = $3, color = NULLIF($4, '')
		WHERE id = $1 AND user_id = $2
	`

	result, err := r.pool.Exec(ctx, query, tag.ID, tag.UserID, tag.Name, tag.Color)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrAlreadyExists
		}
		return fmt.Errorf("update tag: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *tagRepo) Delete(ctx context.Context, id, userID uint) error {
	query := `DELETE FROM tags WHERE id = $1 AND user_id = $2`

	result, err := r.pool.Exec(ctx, query, id, userID)
	if err != nil {
		return fmt.Errorf("delete tag: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *tagRepo) SetHabitTags(ctx context.Context, habitID uint, tagIDs []uint) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `DELETE FROM habit_tags WHERE habit_id = $1`, habitID); err != nil {
		return fmt.Errorf("clear habit tags: %w", err)
	}

	for _, tagID := range tagIDs {
		if _, err := tx.Exec(ctx,
			`INSERT INTO habit_tags (habit_id, tag_id) VALUES ($1, $2)`,
			habitID, tagID,
		); err != nil {
			return fmt.Errorf("set habit tag: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit habit tags: %w", err)
	}

	return nil
}

func (r *tagRepo) GetByHabitIDs(ctx context.Context, habitIDs []uint) (map[uint][]model.Tag, error) {
	result := make(map[uint][]model.Tag)
	if len(habitIDs) == 0 {
		return result, nil
	}

	query := `
		SELECT ht.habit_id, t.id, t.user_id, t.name, COALESCE(t.color, '')
		FROM habit_tags ht
		JOIN tags t ON t.id = ht.tag_id
		WHERE ht.habit_id = ANY($1)
		ORDER BY t.name
	`

	rows, err := r.pool.Query(ctx, query, habitIDs)
	if err != nil {
		return nil, fmt.Errorf("get tags by habit ids: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var habitID uint
		var tag model.Tag
		if err := rows.Scan(&habitID, &tag.ID, &tag.UserID, &tag.Name, &tag.Color); err != nil {
			return nil, fmt.Errorf("scan habit tag: %w", err)
		}
		result[habitID] = append(result[habitID], tag)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate habit tags: %w", err)
	}

	return result, nil
}
