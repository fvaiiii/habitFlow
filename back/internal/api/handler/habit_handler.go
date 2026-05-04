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

func (h *HabitHandler) CreateHabit(c *gin.Context) {
	var req dto.CreateHabitRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	habit := &model.Habit{
		UserID:      1,
		Title:       req.Title,
		Description: req.Description,
		Frequency:   req.Frequency,
		TemplateID:  req.TemplateID,
	}

	resHabit, err := h.habitService.CreateHabit(c.Request.Context(), habit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp := dto.HabitResponse{
		ID:          resHabit.ID,
		Title:       resHabit.Title,
		Description: resHabit.Description,
		Frequency:   resHabit.Frequency,
		CreatedAt:   resHabit.CreatedAt,
		UpdatedAt:   resHabit.UpdatedAt,
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *HabitHandler) GetUserHabits(c *gin.Context) {
	userId := uint(1) // поменяю чуть позже
	habits, err := h.habitService.GetUserHabits(c.Request.Context(), userId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
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

func (h *HabitHandler) GetHabit(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userId := uint(1) // поменяю чуть позже
	habit, err := h.habitService.GetHabit(c.Request.Context(), uint(id), userId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	resp := dto.HabitResponse{
		ID:          habit.ID,
		Title:       habit.Title,
		Description: habit.Description,
		Frequency:   habit.Frequency,
		CreatedAt:   habit.CreatedAt,
		UpdatedAt:   habit.UpdatedAt,
	}

	c.JSON(http.StatusOK, resp)
}

func (h *HabitHandler) UpdateHabit(c *gin.Context) {
	var req dto.UpdateHabitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userID := uint(1) // поменяю чуть позже

	habit := &model.Habit{
		ID:          uint(id),
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Frequency:   req.Frequency,
	}
	habitResp, err := h.habitService.UpdateHabit(c.Request.Context(), habit)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	resp := dto.HabitResponse{
		ID:          habitResp.ID,
		Title:       habitResp.Title,
		Description: habitResp.Description,
		Frequency:   habitResp.Frequency,
		CreatedAt:   habitResp.CreatedAt,
		UpdatedAt:   habitResp.UpdatedAt,
	}

	c.JSON(http.StatusOK, resp)

}

func (h *HabitHandler) DeleteHabit(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userId := uint(1) // поменяю чуть позже
	if err := h.habitService.DeleteHabit(c.Request.Context(), uint(id), userId); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
