package handler

import (
	"net/http"
	"strconv"

	"github.com/fvaiiii/habitFlow/back/internal/api/dto"
	"github.com/fvaiiii/habitFlow/back/internal/service"
	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	service service.AnalyticsService
}

func NewAnalyticsHandler(s service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		service: s,
	}
}

func (h *AnalyticsHandler) GetHabitStreak(c *gin.Context) {
	idStr := c.Param("id")
	habitID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid habit ID"})
		return
	}

	userID := c.GetUint("userID")

	streak, err := h.service.GetHabitStreak(c.Request.Context(), uint(habitID), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "habit not found or no data"})
		return
	}

	c.JSON(http.StatusOK, dto.StreakResponse{Streak: streak})
}

func (h *AnalyticsHandler) GetHeatmap(c *gin.Context) {
	userID := c.GetUint("userID")

	heatmap, err := h.service.GetHeatmapForLastMonth(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate heatmap"})
		return
	}

	c.JSON(http.StatusOK, heatmap)
}
