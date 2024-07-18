package utils

import "math"

func CalculateOneRepMax(weight float64, reps int, fatigueFactor float64) float64 {
	if reps <= 0 || weight <= 0 || fatigueFactor < 0 || fatigueFactor >= 100 {
		return 0
	}
	oneRepMax := weight * (1 + float64(reps)/30) * (1 - fatigueFactor/100)
	return math.Round(oneRepMax*100) / 100 // Round to 2 decimal places
}
