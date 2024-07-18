package model

import "time"

type WorkoutResponse struct {
	ID          string                     `json:"id" db:"id"`
	UserID      string                     `json:"userId" db:"user_id"`
	PerformedAt time.Time                  `json:"performedAt" db:"performed_at"`
	Note        string                     `json:"note" db:"note"`
	CreatedAt   time.Time                  `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time                  `json:"updatedAt" db:"updated_at"`
	Exercises   []ExerciseWithSetsResponse `json:"exercises"`
}
