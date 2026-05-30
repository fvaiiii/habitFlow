package api

import (
	"github.com/fvaiiii/habitFlow/back/internal/api/handler"
	"github.com/fvaiiii/habitFlow/back/internal/api/middleware"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func registerRoutes(
	r *gin.Engine,
	authHandler *handler.AuthHandler,
	habitHandler *handler.HabitHandler,
	checkInHandler *handler.CheckInHandler,
	analyticsHandler *handler.AnalyticsHandler,
	templateHandler *handler.HabitTemplateHandler,
) {

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)

	r.GET("/templates", templateHandler.GetTemplates)
	r.GET("/templates/:id", templateHandler.GetTemplate)

	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/me", authHandler.Me)

		protected.POST("/templates/:id/use", habitHandler.CreateFromTemplate)

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

		stats := protected.Group("/stats")
		{
			stats.GET("/heatmap", analyticsHandler.GetHeatmap)
		}
	}

	admin := protected.Group("/admin")
	admin.Use(middleware.AdminOnly())
	{
		admin.GET("/users", authHandler.GetAllUsers)
		admin.POST("/templates", templateHandler.CreateTemplate)
		admin.DELETE("/templates/:id", templateHandler.DeleteTemplate)
	}
}
