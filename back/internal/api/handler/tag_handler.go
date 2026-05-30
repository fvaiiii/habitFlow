package handler

import (
	"net/http"
	"strconv"

	"github.com/fvaiiii/habitFlow/back/internal/api/dto"
	"github.com/fvaiiii/habitFlow/back/internal/apierrors"
	"github.com/fvaiiii/habitFlow/back/internal/service"
	"github.com/gin-gonic/gin"
)

type TagHandler struct {
	tagService service.TagService
}

func NewTagHandler(tagService service.TagService) *TagHandler {
	return &TagHandler{tagService: tagService}
}

// GetTags godoc
// @Summary Get user tags
// @Tags tags
// @Security BearerAuth
// @Produce json
// @Success 200 {array} dto.TagResponse
// @Router /tags [get]
func (h *TagHandler) GetTags(c *gin.Context) {
	userID := c.GetUint("userID")

	tags, err := h.tagService.GetUserTags(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.TagsFromModels(tags))
}

// CreateTag godoc
// @Summary Create tag
// @Tags tags
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body dto.CreateTagRequest true "tag data"
// @Success 201 {object} dto.TagResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 409 {object} dto.ErrorResponse
// @Router /tags [post]
func (h *TagHandler) CreateTag(c *gin.Context) {
	var req dto.CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid request"})
		return
	}

	userID := c.GetUint("userID")

	tag, err := h.tagService.CreateTag(c.Request.Context(), userID, req.Name, req.Color)
	if err != nil {
		writeTagError(c, err)
		return
	}

	c.JSON(http.StatusCreated, dto.TagFromModel(*tag))
}

// UpdateTag godoc
// @Summary Update tag
// @Tags tags
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path int true "tag id"
// @Param request body dto.UpdateTagRequest true "tag data"
// @Success 200 {object} dto.TagResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 409 {object} dto.ErrorResponse
// @Router /tags/{id} [patch]
func (h *TagHandler) UpdateTag(c *gin.Context) {
	var req dto.UpdateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid request"})
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid id"})
		return
	}

	userID := c.GetUint("userID")

	tag, err := h.tagService.UpdateTag(c.Request.Context(), userID, uint(id), req.Name, req.Color)
	if err != nil {
		writeTagError(c, err)
		return
	}

	c.JSON(http.StatusOK, dto.TagFromModel(*tag))
}

// DeleteTag godoc
// @Summary Delete tag
// @Tags tags
// @Security BearerAuth
// @Param id path int true "tag id"
// @Success 204
// @Failure 404 {object} dto.ErrorResponse
// @Router /tags/{id} [delete]
func (h *TagHandler) DeleteTag(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid id"})
		return
	}

	userID := c.GetUint("userID")

	if err := h.tagService.DeleteTag(c.Request.Context(), userID, uint(id)); err != nil {
		writeTagError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func writeTagError(c *gin.Context, err error) {
	switch err {
	case apierrors.ErrValidation:
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	case apierrors.ErrConflict:
		c.JSON(http.StatusConflict, dto.ErrorResponse{Error: err.Error()})
	case apierrors.ErrNotFound:
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
}
