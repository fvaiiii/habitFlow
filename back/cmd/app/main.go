package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/fvaiiii/habitFlow/back/internal/config"
	"github.com/fvaiiii/habitFlow/back/internal/db"
	"github.com/fvaiiii/habitFlow/back/pkg/migrator"
	"github.com/gin-gonic/gin"
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

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s",
		cfg.Postgres.User,
		cfg.Postgres.Password,
		cfg.Postgres.Host,
		cfg.Postgres.Port,
		cfg.Postgres.DB,
		cfg.Postgres.SSLMode,
	)

	dbForMigrations, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("failed to open db for migrations: %v", err)
	}
	defer dbForMigrations.Close()

	migrator.Init(dbForMigrations, "./migrations")

	if err := migrator.Migrator().Up(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	addr := fmt.Sprintf("%s:%d", cfg.HTTP.Host, cfg.HTTP.Port)

	if err := r.Run(addr); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}

}
