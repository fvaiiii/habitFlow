package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AnalyticsRepository interface {
	GetCurrentStreak(ctx context.Context, habitID uint, userID uint) (int, error)
	GetUserHeatmap(ctx context.Context, userID uint, startDate time.Time) (map[string]int, error)
}

type analyticsRepo struct {
	pool *pgxpool.Pool
}

func NewAnalyticsRepo(pool *pgxpool.Pool) AnalyticsRepository {
	return &analyticsRepo{
		pool: pool,
	}
}

func (r *analyticsRepo) GetCurrentStreak(ctx context.Context, habitID uint, userID uint) (int, error) {
	query := `
		WITH streaks AS (
			SELECT
				c.completed_at,
				c.completed_at - (ROW_NUMBER() OVER (ORDER BY c.completed_at ASC))::int AS grp
			FROM check_ins c
			JOIN habits h ON c.habit_id = h.id
			WHERE c.habit_id = $1 AND h.user_id = $2 AND h.frequency = 'daily'
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
	err := r.pool.QueryRow(ctx, query, habitID, userID).Scan(&streak)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, nil
		}
		return 0, fmt.Errorf("calculate current streak: %w", err)
	}

	return streak, nil
}

func (r *analyticsRepo) GetUserHeatmap(ctx context.Context, userID uint, startDate time.Time) (map[string]int, error) {
	query := `
		SELECT DATE(c.completed_at), COUNT(c.id)
		FROM check_ins c
		JOIN habits h ON c.habit_id = h.id
		WHERE h.user_id = $1 AND c.completed_at >= $2
		GROUP BY DATE(c.completed_at)
		ORDER BY DATE(c.completed_at) ASC
	`

	rows, err := r.pool.Query(ctx, query, userID, startDate)
	if err != nil {
		return nil, fmt.Errorf("query heatmap: %w", err)
	}
	defer rows.Close()

	heatmap := make(map[string]int)

	for rows.Next() {
		var date time.Time
		var count int
		
		if err := rows.Scan(&date, &count); err != nil {
			return nil, fmt.Errorf("scan heatmap row: %w", err)
		}
		
		heatmap[date.Format("2006-01-02")] = count
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate heatmap rows: %w", err)
	}

	return heatmap, nil
}