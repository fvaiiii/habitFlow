package dto

import "github.com/fvaiiii/habitFlow/back/internal/model"

type TagResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color,omitempty"`
}

func TagFromModel(tag model.Tag) TagResponse {
	return TagResponse{
		ID:    tag.ID,
		Name:  tag.Name,
		Color: tag.Color,
	}
}

func TagsFromModels(tags []model.Tag) []TagResponse {
	if len(tags) == 0 {
		return []TagResponse{}
	}
	resp := make([]TagResponse, 0, len(tags))
	for _, tag := range tags {
		resp = append(resp, TagFromModel(tag))
	}
	return resp
}
