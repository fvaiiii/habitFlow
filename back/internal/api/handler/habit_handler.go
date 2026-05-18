package handler

import (
	"net/http"
	"strconv"

	"github.com/fvaiiii/habitFlow/back/internal/api/dto"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/service"
	"github.com/gin-gonic/gin"
)

type HabitHandler struct {
	habitService service.HabitService
}

func NewHabitHandler(habitService service.HabitService) *HabitHandler {
	return &HabitHandler{
		habitService: habitService,
	}
}

// CreateHabit godoc
// @Summary Create habit
// @Tags habits
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body dto.CreateHabitRequest true "habit data"
// @Success 201 {object} dto.HabitResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /habits [post]
func (h *HabitHandler) CreateHabit(c *gin.Context) {
	var req dto.CreateHabitRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid request"})
		return
	}

	userID := c.GetUint("userID")

	habit := &model.Habit{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Frequency:   req.Frequency,
		TemplateID:  req.TemplateID,
	}

	res, err := h.habitService.CreateHabit(c.Request.Context(), habit)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.HabitResponse{
		ID:          res.ID,
		Title:       res.Title,
		Description: res.Description,
		Frequency:   res.Frequency,
		CreatedAt:   res.CreatedAt,
		UpdatedAt:   res.UpdatedAt,
	})
}

// GetUserHabits godoc
// @Summary Get user habits
// @Tags habits
// @Security BearerAuth
// @Produce json
// @Success 200 {array} dto.HabitResponse
// @Router /habits [get]
func (h *HabitHandler) GetUserHabits(c *gin.Context) {
	userID := c.GetUint("userID")

	habits, err := h.habitService.GetUserHabits(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: err.Error()})
		return
	}

	resp := make([]dto.HabitResponse, 0, len(habits))
	for _, habit := range habits {
		resp = append(resp, dto.HabitResponse{
			ID:          habit.ID,
			Title:       habit.Title,
			Description: habit.Description,
			Frequency:   habit.Frequency,
			CreatedAt:   habit.CreatedAt,
			UpdatedAt:   habit.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, resp)
}

// GetHabit godoc
// @Summary Get habit by id
// @Tags habits
// @Security BearerAuth
// @Produce json
// @Param id path int true "habit id"
// @Success 200 {object} dto.HabitResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /habits/{id} [get]
func (h *HabitHandler) GetHabit(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid id",
		})
		return
	}
	userID := c.GetUint("userID")

	habit, err := h.habitService.GetHabit(c.Request.Context(), uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.HabitResponse{
		ID:          habit.ID,
		Title:       habit.Title,
		Description: habit.Description,
		Frequency:   habit.Frequency,
		CreatedAt:   habit.CreatedAt,
		UpdatedAt:   habit.UpdatedAt,
	})
}

// UpdateHabit godoc
// @Summary Update habit
// @Tags habits
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "habit id"
// @Param request body dto.UpdateHabitRequest true "update data"
// @Success 200 {object} dto.HabitResponse
// @Router /habits/{id} [put]
func (h *HabitHandler) UpdateHabit(c *gin.Context) {
	var req dto.UpdateHabitRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid request"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid id",
		})
		return
	}
	userID := c.GetUint("userID")

	habit := &model.Habit{
		ID:          uint(id),
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Frequency:   req.Frequency,
	}

	res, err := h.habitService.UpdateHabit(c.Request.Context(), habit)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.HabitResponse{
		ID:          res.ID,
		Title:       res.Title,
		Description: res.Description,
		Frequency:   res.Frequency,
		CreatedAt:   res.CreatedAt,
		UpdatedAt:   res.UpdatedAt,
	})
}

// DeleteHabit godoc
// @Summary Delete habit
// @Tags habits
// @Security BearerAuth
// @Param id path int true "habit id"
// @Success 204
// @Router /habits/{id} [delete]
func (h *HabitHandler) DeleteHabit(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid id",
		})
		return
	}
	userID := c.GetUint("userID")

	if err := h.habitService.DeleteHabit(c.Request.Context(), uint(id), userID); err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
