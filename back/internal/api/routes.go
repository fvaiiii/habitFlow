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
	tagHandler *handler.TagHandler,
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

		tags := protected.Group("/tags")
		{
			tags.GET("", tagHandler.GetTags)
			tags.POST("", tagHandler.CreateTag)
			tags.PATCH("/:id", tagHandler.UpdateTag)
			tags.DELETE("/:id", tagHandler.DeleteTag)
		}
		protected.GET("/habits/:id/tags", habitHandler.GetHabitTags)
		protected.POST("/habits/:id/tags/:tag_id", habitHandler.AddTagToHabit)
		protected.DELETE("/habits/:id/tags/:tag_id", habitHandler.RemoveTagFromHabit)
	}

	admin := protected.Group("/admin")
	admin.Use(middleware.AdminOnly())
	{
		admin.GET("/users", authHandler.GetAllUsers)
		admin.POST("/templates", templateHandler.CreateTemplate)
		admin.DELETE("/templates/:id", templateHandler.DeleteTemplate)
		admin.PATCH("/templates/:id", templateHandler.UpdateTemplate)
	}
}
