package db

import (
	"context"
	"fmt"
	"log"

	"github.com/fvaiiii/habitFlow/back/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPostgresPool(cfg config.PostgresConfig) (*pgxpool.Pool, error) {
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.DB,
		cfg.SSLMode,
	)

	ctx, cancel := context.WithTimeout(context.Background(), cfg.Timeout)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("failed to connect postgres pool: %v", err)
	}

	if err := pool.Ping(ctx); err != nil {
		defer pool.Close()
		log.Fatalf("failed to ping postgres: %v", err)
	}

	return pool, nil
}
