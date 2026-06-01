package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/fvaiiii/habitFlow/back/internal/api/dto"
	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
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

// CreateCheckIn godoc
// @Summary Create check-in for habit
// @Tags check-ins
// @Security BearerAuth
// @Produce json
// @Param id path int true "habit id"
// @Success 201 {object} dto.CheckInResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /habits/{id}/check-ins [post]
func (h *CheckInHandler) CreateCheckIn(c *gin.Context) {
	habitID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid id",
		})
		return
	}
	
	checkIn := &model.CheckIn{
		HabitID:     uint(habitID),
		CompletedAt: time.Now(),
	}

	userID := c.GetUint("userID")

	res, err := h.checkInService.CreateCheckIn(c.Request.Context(), checkIn, userID)
	if err != nil {
		respondCheckInError(c, err)
		return
	}

	c.JSON(http.StatusCreated, dto.CheckInResponse{
		ID:          res.ID,
		HabitID:     res.HabitID,
		CompletedAt: res.CompletedAt,
	})
}

// GetHabitCheckIns godoc
// @Summary Get check-ins for habit
// @Tags check-ins
// @Security BearerAuth
// @Produce json
// @Param id path int true "habit id"
// @Success 200 {array} dto.CheckInResponse
// @Router /habits/{id}/check-ins [get]
func (h *CheckInHandler) GetHabitCheckIns(c *gin.Context) {
	habitID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid id",
		})
		return
	}

	userID := c.GetUint("userID")

	checkIns, err := h.checkInService.GetHabitCheckIns(c.Request.Context(), uint(habitID), userID)
	if err != nil {
		respondCheckInError(c, err)
		return
	}

	resp := make([]dto.CheckInResponse, 0, len(checkIns))
	for _, ci := range checkIns {
		resp = append(resp, dto.CheckInResponse{
			ID:          ci.ID,
			HabitID:     ci.HabitID,
			CompletedAt: ci.CompletedAt,
		})
	}

	c.JSON(http.StatusOK, resp)
}

func respondCheckInError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, apierrors.ErrNotFound):
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: err.Error()})
	case errors.Is(err, apierrors.ErrForbidden):
		c.JSON(http.StatusForbidden, dto.ErrorResponse{Error: err.Error()})
	case errors.Is(err, apierrors.ErrConflict):
		c.JSON(http.StatusConflict, dto.ErrorResponse{Error: err.Error()})
	case errors.Is(err, apierrors.ErrValidation):
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
}
