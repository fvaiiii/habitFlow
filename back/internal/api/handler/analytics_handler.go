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

// GetHabitStreak godoc
// @Summary Get habit streak
// @Tags analytics
// @Security BearerAuth
// @Produce json
// @Param id path int true "habit id"
// @Success 200 {object} dto.StreakResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /habits/{id}/streak [get]
func (h *AnalyticsHandler) GetHabitStreak(c *gin.Context) {
	habitID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid id",
		})
		return
	}
	userID := c.GetUint("userID")

	streak, err := h.service.GetHabitStreak(c.Request.Context(), uint(habitID), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "habit not found"})
		return
	}

	c.JSON(http.StatusOK, dto.StreakResponse{
		Streak: streak,
	})
}

// GetHeatmap godoc
// @Summary Get heatmap for user
// @Tags analytics
// @Security BearerAuth
// @Produce json
// @Success 200 {object} dto.HeatmapResponse
// @Router /analytics/heatmap [get]
func (h *AnalyticsHandler) GetHeatmap(c *gin.Context) {
	userID := c.GetUint("userID")

	data, err := h.service.GetHeatmapForLastMonth(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to generate heatmap",
		})
		return
	}

	c.JSON(http.StatusOK, dto.HeatmapResponse{
		Data: data,
	})
}
