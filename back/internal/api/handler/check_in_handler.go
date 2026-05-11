package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/fvaiiii/habitFlow/back/internal/api/dto"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/service"
	"github.com/gin-gonic/gin"
)

type CheckInHandler struct {
	checkInService service.CheckInService
}

func NewCheckInHandler(checkInService service.CheckInService) *CheckInHandler {
	return &CheckInHandler{
		checkInService: checkInService,
	}
}

func (h *CheckInHandler) CreateCheckIn(c *gin.Context) {
	idStr := c.Param("id")

	habitID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid habit id",
		})
		return
	}

	checkIn := &model.CheckIn{
		HabitID:     uint(habitID),
		CompletedAt: time.Now(),
	}

	createdCheckIn, err := h.checkInService.CreateCheckIn(
		c.Request.Context(),
		checkIn,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	resp := dto.CheckInResponse{
		ID:          createdCheckIn.ID,
		HabitID:     createdCheckIn.HabitID,
		CompletedAt: createdCheckIn.CompletedAt,
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *CheckInHandler) GetHabitCheckIns(c *gin.Context) {
	idStr := c.Param("id")

	habitID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid habit id",
		})
		return
	}

	checkIns, err := h.checkInService.GetHabitCheckIns(
		c.Request.Context(),
		uint(habitID),
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	resp := make([]dto.CheckInResponse, 0, len(checkIns))

	for _, checkIn := range checkIns {
		resp = append(resp, dto.CheckInResponse{
			ID:          checkIn.ID,
			HabitID:     checkIn.HabitID,
			CompletedAt: checkIn.CompletedAt,
		})
	}

	c.JSON(http.StatusOK, resp)
}
