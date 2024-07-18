package model

import "time"

type Exercise struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	MediaURL  string    `json:"mediaUrl" db:"media_url"`
	Note      string    `json:"note" db:"note"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}
