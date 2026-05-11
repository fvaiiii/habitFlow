package api

import (
	"net/http"

	"github.com/fvaiiii/habitFlow/back/internal/api/handler"
	"github.com/gin-gonic/gin"
)


func registerRoutes(r *gin.Engine, habitHandler *handler.HabitHandler, analyticsHandler *handler.AnalyticsHandler) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	stats := r.Group("/stats")
	{
		stats.GET("/heatmap", analyticsHandler.GetHeatmap)
	}

	habits := r.Group("/habits")
	{
		habits.POST("", habitHandler.CreateHabit)
		habits.GET("", habitHandler.GetUserHabits)
		habits.GET("/:id", habitHandler.GetHabit)
		habits.GET("/:id/streak", analyticsHandler.GetHabitStreak)
		habits.PATCH("/:id", habitHandler.UpdateHabit)
		habits.DELETE("/:id", habitHandler.DeleteHabit)
	}


	

}