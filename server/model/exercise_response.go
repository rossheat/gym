package model

type ExerciseResponse struct {
	Exercise
	Equipment             []Equipment   `json:"equipment"`
	PrimaryMuscleGroup    MuscleGroup   `json:"primaryMuscleGroup"`
	SecondaryMuscleGroups []MuscleGroup `json:"secondaryMuscleGroups"`
}
