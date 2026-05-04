package api

import (
	"github.com/fvaiiii/habitFlow/back/internal/api/handler"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
	"github.com/fvaiiii/habitFlow/back/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	router *gin.Engine
}

func NewServer(pool *pgxpool.Pool) *Server {
	r := gin.Default()
	if err := r.SetTrustedProxies(nil); err != nil {
		panic(err)
	}
	habitRepo := repository.NewHabitRepo(pool)
	habitService := service.NewHabitService(habitRepo)
	habitHandler := handler.NewHabitHandler(habitService)

	registerRoutes(r, habitHandler)

	return &Server{
		router: r,
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}
