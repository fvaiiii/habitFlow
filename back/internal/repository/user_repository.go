package repository

import (
	"context"

	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	GetById(ctx context.Context, id uint) (*model.User, error)
	Create(ctx context.Context, user *model.User) error
}

type userRepo struct {
	pool *pgxpool.Pool
}

func NewUserRepo(pool *pgxpool.Pool) UserRepository {
	return &userRepo{
		pool: pool,
	}
}

func (r *userRepo) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	query := `
		SELECT id, email, password_hash, role, created_at
		FROM users
		WHERE email = $1
	`

	var user model.User
	err := r.pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetById(ctx context.Context, id uint) (*model.User, error) {
	query := `
		SELECT id, email, password_hash, role, created_at
		FROM users
		WHERE id = $1
	`

	var user model.User
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&user.ID, 
		&user.Email, 
		&user.PasswordHash, 
		&user.Role, 
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err 
	}

	return &user, nil
}
func (r *userRepo) Create(ctx context.Context, user *model.User) error {
	query := `
		INSERT INTO users (email, password_hash, role, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id
	`
	return r.pool.QueryRow(
		ctx,
		query,
		user.Email,
		user.PasswordHash,
		user.Role,
	).Scan(&user.ID)
}
