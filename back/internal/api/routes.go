package api

import (
	"net/http"

	"github.com/fvaiiii/habitFlow/back/internal/api/handler"
	"github.com/fvaiiii/habitFlow/back/internal/api/middleware"
	"github.com/gin-gonic/gin"
)

func registerRoutes(
	r *gin.Engine,
	authHandler *handler.AuthHandler,
	habitHandler *handler.HabitHandler,
	checkInHandler *handler.CheckInHandler,
	analyticsHandler *handler.AnalyticsHandler,
) {

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)

	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())

	stats := protected.Group("/stats")
	{
		stats.GET("/heatmap", analyticsHandler.GetHeatmap)
	}

	habits := protected.Group("/habits")
	{
		habits.POST("", habitHandler.CreateHabit)
		habits.GET("", habitHandler.GetUserHabits)
		habits.GET("/:id", habitHandler.GetHabit)

		habits.GET("/:id/streak", analyticsHandler.GetHabitStreak)

		habits.PATCH("/:id", habitHandler.UpdateHabit)
		habits.DELETE("/:id", habitHandler.DeleteHabit)

		habits.POST("/:id/check-ins", checkInHandler.CreateCheckIn)
		habits.GET("/:id/check-ins", checkInHandler.GetHabitCheckIns)
	}
}
