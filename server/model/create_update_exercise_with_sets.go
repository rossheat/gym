package model

type CreateUpdateExerciseWithSets struct {
	ExerciseID string            `json:"exerciseId" db:"exercise_id"`
	Sets       []CreateUpdateSet `json:"sets"`
}
