package handler

import (
	"net/http"
	"strconv"

	"github.com/fvaiiii/habitFlow/back/internal/api/dto"
	"github.com/fvaiiii/habitFlow/back/internal/model"
	"github.com/fvaiiii/habitFlow/back/internal/service"
	"github.com/gin-gonic/gin"
)

type HabitTemplateHandler struct {
	habitTemplateService service.HabitTemplateService
}

func NewHabitTemplateHandler(habitTemplateService service.HabitTemplateService) *HabitTemplateHandler {
	return &HabitTemplateHandler{
		habitTemplateService: habitTemplateService,
	}
}

// GetTemplates godoc
// @Summary Get all habit templates
// @Tags templates
// @Produce json
// @Success 200 {array} dto.HabitTemplateResponse
// @Router /templates [get]
func (h *HabitTemplateHandler) GetTemplates(c *gin.Context) {
	templates, err := h.habitTemplateService.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "failed to get templates",
		})
		return
	}

	resp := make([]dto.HabitTemplateResponse, 0, len(templates))

	for _, t := range templates {
		resp = append(resp, dto.HabitTemplateResponse{
			ID:          t.ID,
			Title:       t.Title,
			Description: t.Description,
			Frequency:   t.Frequency,
			CreatedAt:   t.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, resp)
}

// GetTemplate godoc
// @Summary Get template by id
// @Tags templates
// @Produce json
// @Param id path int true "template id"
// @Success 200 {object} dto.HabitTemplateResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /templates/{id} [get]
func (h *HabitTemplateHandler) GetTemplate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid id",
		})
		return
	}
	template, err := h.habitTemplateService.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "template not found",
		})
		return
	}

	c.JSON(http.StatusOK, dto.HabitTemplateResponse{
		ID:          template.ID,
		Title:       template.Title,
		Description: template.Description,
		Frequency:   template.Frequency,
		CreatedAt:   template.CreatedAt,
	})
}

// CreateTemplate godoc
// @Summary Create template
// @Tags admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body dto.CreateHabitTemplateRequest true "template data"
// @Success 201 {object} dto.HabitTemplateResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Router /admin/templates [post]
func (h *HabitTemplateHandler) CreateTemplate(c *gin.Context) {
	var req dto.CreateHabitTemplateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid request",
		})
		return
	}

	template := &model.HabitTemplate{
		Title:       req.Title,
		Description: req.Description,
		Frequency:   req.Frequency,
	}

	err := h.habitTemplateService.Create(c.Request.Context(), template)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.HabitTemplateResponse{
		ID:          template.ID,
		Title:       template.Title,
		Description: template.Description,
		Frequency:   template.Frequency,
		CreatedAt:   template.CreatedAt,
	})
}

// DeleteTemplate godoc
// @Summary Delete template
// @Tags admin
// @Security BearerAuth
// @Param id path int true "template id"
// @Success 204
// @Failure 403 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /admin/templates/{id} [delete]
func (h *HabitTemplateHandler) DeleteTemplate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "invalid id",
		})
		return
	}

	err = h.habitTemplateService.Delete(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error: "template not found",
		})
		return
	}

	c.Status(http.StatusNoContent)
}
// UpdateTemplate godoc
// @Summary Update template
// @Tags admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "template id"
// @Param request body dto.CreateHabitTemplateRequest true "template data"
// @Success 200 {object} dto.HabitTemplateResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Router /admin/templates/{id} [patch]
func (h *HabitTemplateHandler) UpdateTemplate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid id"})
		return
	}

	var req dto.CreateHabitTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid request"})
		return
	}

	template := &model.HabitTemplate{
		ID:          uint(id),
		Title:       req.Title,
		Description: req.Description,
		Frequency:   req.Frequency,
	}

	err = h.habitTemplateService.Update(c.Request.Context(), template)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.HabitTemplateResponse{
		ID:          template.ID,
		Title:       template.Title,
		Description: template.Description,
		Frequency:   template.Frequency,
		CreatedAt:   template.CreatedAt,
	})
}