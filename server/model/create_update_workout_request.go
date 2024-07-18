package model

import "time"

type CreateUpdateWorkoutRequest struct {
	UserID      string                         `json:"userId" db:"user_id"`
	PerformedAt time.Time                      `json:"performedAt" db:"performed_at"`
	Note        string                         `json:"note" db:"note"`
	Exercises   []CreateUpdateExerciseWithSets `json:"exercises"`
}
