package api

import (
	"net/http"

	"github.com/fvaiiii/habitFlow/back/internal/api/handler"
	"github.com/gin-gonic/gin"
)

func registerRoutes(r *gin.Engine,
	habitHandler *handler.HabitHandler,
	checkInHandler *handler.CheckInHandler) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	habits := r.Group("/habits")
	{
		habits.POST("", habitHandler.CreateHabit)
		habits.GET("", habitHandler.GetUserHabits)
		habits.GET("/:id", habitHandler.GetHabit)
		habits.PATCH("/:id", habitHandler.UpdateHabit)
		habits.DELETE("/:id", habitHandler.DeleteHabit)

		habits.POST("/:id/check-ins", checkInHandler.CreateCheckIn)
		habits.GET("/:id/check-ins", checkInHandler.GetHabitCheckIns)
	}

}
