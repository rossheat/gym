package handler

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/model"
)

func CalculateExerciseStatistics(c *gin.Context, exerciseID, timePeriod string) ([]model.ExerciseStatistics, error) {
	endDate := time.Now()
	startDate := CalculateStartDate(endDate, timePeriod)

	query := `
        SELECT DATE(w.performed_at) as date, SUM(s.weight * s.reps) as volume
        FROM workouts w
        JOIN sets s ON w.id = s.workout_id
        WHERE s.exercise_id = $1 AND w.performed_at BETWEEN $2 AND $3
        GROUP BY DATE(w.performed_at)
        ORDER BY DATE(w.performed_at)
    `

	rows, err := database.PostgresDB.QueryContext(c, query, exerciseID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []model.ExerciseStatistics
	for rows.Next() {
		var stat model.ExerciseStatistics
		err := rows.Scan(&stat.Date, &stat.Volume)
		if err != nil {
			return nil, err
		}
		stats = append(stats, stat)
	}

	return stats, nil
}
