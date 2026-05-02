package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AnalyticsRepository interface {
	GetCurrentStreak(ctx context.Context, habitID uint) (int, error)
}

type analyticsRepo struct {
	pool *pgxpool.Pool
}

func NewAnalyticsRepo(pool *pgxpool.Pool) AnalyticsRepository {
	return &analyticsRepo{
		pool: pool,
	}
}

func (r *analyticsRepo) GetCurrentStreak(ctx context.Context, habitID uint) (int, error) {
	query := `
		WITH streaks AS (
			SELECT
				completed_at,
				completed_at - (ROW_NUMBER() OVER (ORDER BY completed_at ASC))::int AS grp
			FROM check_ins
			WHERE habit_id = $1
		),
		counted_streaks AS (
			SELECT COUNT(*) as streak_len, MAX(completed_at) as end_date
			FROM streaks
			GROUP BY grp
		)
		SELECT streak_len
		FROM counted_streaks
		WHERE end_date >= CURRENT_DATE - 1
		ORDER BY end_date DESC
		LIMIT 1;
	`

	var streak int
	err := r.pool.QueryRow(ctx, query, habitID).Scan(&streak)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, nil
		}
		return 0, fmt.Errorf("calculate current streak: %w", err)
	}

	return streak, nil
}