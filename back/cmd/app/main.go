package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"

	"github.com/fvaiiii/habitFlow/back/internal/api"
	"github.com/fvaiiii/habitFlow/back/internal/auth"
	"github.com/fvaiiii/habitFlow/back/internal/config"
	"github.com/fvaiiii/habitFlow/back/internal/db"
	"github.com/fvaiiii/habitFlow/back/pkg/migrator"

	_ "github.com/fvaiiii/habitFlow/back/docs"
)

func main() {
	_ = godotenv.Load("../.env")

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	if err := auth.Init(cfg.JWT.JWTSecret, cfg.JWT.AccessTTL); err != nil {
		log.Fatalf("jwt init error: %v", err)
	}

	pool, err := db.NewPostgresPool(cfg.Postgres)
	if err != nil {
		log.Fatalf("db error: %v", err)
	}
	defer pool.Close()

	dsn := config.DSNBuilder(&cfg.Postgres)

	sqlDB, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("migration db error: %v", err)
	}
	defer sqlDB.Close()

	migrator.Init(sqlDB, "./migrations")

	if err := migrator.Migrator().Up(); err != nil {
		log.Fatalf("migrations failed: %v", err)
	}

	server := api.NewServer(pool, cfg)

	httpServer := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", cfg.HTTP.Host, cfg.HTTP.Port),
		Handler: server.Router(),
	}

	go func() {
		log.Printf("server started on %s", httpServer.Addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutdown started")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Fatalf("shutdown error: %v", err)
	}

	log.Println("server stopped")
}
