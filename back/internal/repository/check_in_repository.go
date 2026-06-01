package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CheckInRepository interface {
	Create(ctx context.Context, checkIn *model.CheckIn) error
	GetByHabitID(ctx context.Context, habitID uint) ([]model.CheckIn, error)
	GetByHabitIDAndDate(ctx context.Context, habitID uint, date time.Time) (*model.CheckIn, error)
}

var _ CheckInRepository = (*checkInRepo)(nil)

type checkInRepo struct {
	pool *pgxpool.Pool
}

func NewCheckInRepo(pool *pgxpool.Pool) CheckInRepository {
	return &checkInRepo{
		pool: pool,
	}
}

func (r *checkInRepo) Create(ctx context.Context, checkIn *model.CheckIn) error {
	query := `
		INSERT INTO check_ins (habit_id, completed_at)
		VALUES ($1, $2)
		RETURNING id, completed_at
	`
	err := r.pool.QueryRow(ctx, query,
		checkIn.HabitID,
		checkIn.CompletedAt,
	).Scan(
		&checkIn.ID,
		&checkIn.CompletedAt,
	)

	if err != nil {
		return fmt.Errorf("create check in: %w", err)
	}
	return nil
}

func (r *checkInRepo) GetByHabitID(ctx context.Context, habitId uint) ([]model.CheckIn, error) {
	query := `
		SELECT id, habit_id, completed_at
		FROM check_ins
		WHERE habit_id = $1
		ORDER BY completed_at DESC
	`

	rows, err := r.pool.Query(ctx, query, habitId)
	if err != nil {
		return nil, fmt.Errorf("get check in by habit id: %w", err)
	}
	defer rows.Close()

	checkIns := make([]model.CheckIn, 0)
	for rows.Next() {
		var checkIn model.CheckIn
		err := rows.Scan(
			&checkIn.ID,
			&checkIn.HabitID,
			&checkIn.CompletedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("get check in by user id: %w", err)
		}
		checkIns = append(checkIns, checkIn)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate checkIns: %w", err)
	}
	return checkIns, nil
}

func (r *checkInRepo) GetByHabitIDAndDate(ctx context.Context, habitID uint, date time.Time) (*model.CheckIn, error) {
    // Приводим дату к началу дня в UTC
    startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
    endOfDay := startOfDay.Add(24 * time.Hour)

    query := `
        SELECT id, habit_id, completed_at 
        FROM check_ins
        WHERE habit_id = $1 AND completed_at >= $2 AND completed_at < $3
    `
    var checkIn model.CheckIn
    err := r.pool.QueryRow(ctx, query, habitID, startOfDay, endOfDay).Scan(
        &checkIn.ID,
        &checkIn.HabitID,
        &checkIn.CompletedAt,
    )
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, nil
        }
        return nil, fmt.Errorf("get check in by habit id and date: %w", err)
    }
    return &checkIn, nil
}
