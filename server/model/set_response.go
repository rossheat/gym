package model

import "time"

type SetResponse struct {
	ID         string    `json:"id" db:"id"`
	Weight     float64   `json:"weight" db:"weight"`
	Reps       int       `json:"reps" db:"reps"`
	RestBefore int       `json:"restBefore" db:"rest_before"`
	Order      int       `json:"order" db:"order"`
	Note       string    `json:"note" db:"note"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time `json:"updatedAt" db:"updated_at"`
}
