package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/fvaiiii/habitFlow/back/internal/api"
	"github.com/fvaiiii/habitFlow/back/internal/config"
	"github.com/fvaiiii/habitFlow/back/internal/db"
	"github.com/fvaiiii/habitFlow/back/pkg/migrator"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("error loading .env file")
	}

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	pool, err := db.NewPostgresPool(cfg.Postgres)
	if err != nil {
		log.Fatalf("failed to init postgres: %v", err)
	}
	defer pool.Close()

	dsn := config.DSNBuilder(&cfg.Postgres)

	dbForMigrations, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("failed to open db for migrations: %v", err)
	}
	defer dbForMigrations.Close()

	migrator.Init(dbForMigrations, "./migrations")

	if err := migrator.Migrator().Up(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	srv := api.NewServer(pool)

	addr := fmt.Sprintf("%s:%d", cfg.HTTP.Host, cfg.HTTP.Port)

	if err := srv.Run(addr); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}

}
