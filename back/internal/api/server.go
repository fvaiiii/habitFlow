package api

import (
	"github.com/fvaiiii/habitFlow/back/internal/api/handler"
	"github.com/fvaiiii/habitFlow/back/internal/config"
	"github.com/fvaiiii/habitFlow/back/internal/repository"
	"github.com/fvaiiii/habitFlow/back/internal/seed"
	"github.com/fvaiiii/habitFlow/back/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	router *gin.Engine
}

func NewServer(pool *pgxpool.Pool, cfg *config.Config) *Server {

	r := gin.Default()
	_ = r.SetTrustedProxies(nil)

	seed.Seed(pool)

	templateRepo := repository.NewHabitTemplateRepo(pool)
	templateService := service.NewHabitTemplateService(templateRepo)
	templateHandler := handler.NewHabitTemplateHandler(templateService)

	habitRepo := repository.NewHabitRepo(pool)
	tagRepo := repository.NewTagRepo(pool)
	habitService := service.NewHabitService(habitRepo, templateRepo, tagRepo)
	habitHandler := handler.NewHabitHandler(habitService)

	analyticsRepo := repository.NewAnalyticsRepo(pool)
	analyticsService := service.NewAnalyticsService(analyticsRepo)
	analyticsHandler := handler.NewAnalyticsHandler(analyticsService)

	checkInRepo := repository.NewCheckInRepo(pool)
	checkInService := service.NewCheckInService(checkInRepo, habitRepo)
	checkInHandler := handler.NewCheckInHandler(checkInService)

	userRepo := repository.NewUserRepo(pool)
	authService := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authService)

	registerRoutes(
		r,
		authHandler,
		habitHandler,
		checkInHandler,
		analyticsHandler,
		templateHandler,
	)

	return &Server{router: r}
}

func (s *Server) Router() *gin.Engine {
	return s.router
}
