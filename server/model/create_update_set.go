package model

type CreateUpdateSet struct {
	ExerciseID string  `json:"exerciseId" db:"exercise_id"`
	Weight     float64 `json:"weight" db:"weight"`
	Reps       int     `json:"reps" db:"reps"`
	RestBefore int     `json:"restBefore" db:"rest_before"`
	Order      int     `json:"order" db:"order"`
	Note       string  `json:"note" db:"note"`
}
