package dto

type StreakResponse struct {
	Streak int `json:"streak"`
}

type HeatmapResponse struct {
	Data map[string]int `json:"data"`
}
