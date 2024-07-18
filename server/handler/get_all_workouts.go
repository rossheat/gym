package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/model"
)

func GetAllWorkouts(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	userID := c.GetString("userId")

	query := `
        SELECT id, user_id, performed_at, note, created_at, updated_at
        FROM workouts
        WHERE user_id = $1
        ORDER BY performed_at DESC
    `
	rows, err := database.PostgresDB.QueryContext(c, query, userID)
	if err != nil {
		logger.LogHandlerError(c, err, "querying workouts")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve workouts: %v", err)})
		return
	}
	defer rows.Close()

	workouts := []model.WorkoutResponse{}
	for rows.Next() {
		var workout model.WorkoutResponse
		if err := rows.Scan(&workout.ID, &workout.UserID, &workout.PerformedAt, &workout.Note, &workout.CreatedAt, &workout.UpdatedAt); err != nil {
			logger.LogHandlerError(c, err, "scanning workout row")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process workout data: %v", err)})
			return
		}

		exercisesQuery := `
            SELECT e.id, e.name, e.media_url, e.note, e.created_at, e.updated_at, we.order
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = $1
            ORDER BY we.order
        `
		exerciseRows, err := database.PostgresDB.QueryContext(c, exercisesQuery, workout.ID)
		if err != nil {
			logger.LogHandlerError(c, err, "querying exercises")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve exercises: %v", err)})
			return
		}
		defer exerciseRows.Close()

		exercisesMap := make(map[string]*model.ExerciseWithSetsResponse)
		for exerciseRows.Next() {
			var exercise model.ExerciseWithSetsResponse
			if err := exerciseRows.Scan(
				&exercise.ID, &exercise.Name, &exercise.MediaURL, &exercise.Note, &exercise.CreatedAt, &exercise.UpdatedAt, &exercise.Order,
			); err != nil {
				logger.LogHandlerError(c, err, "scanning exercise row")
				c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process exercise data: %v", err)})
				return
			}
			exercisesMap[exercise.ID] = &exercise
		}

		setsQuery := `
            SELECT s.id, s.exercise_id, s.weight, s.reps, s.rest_before, s.order, s.note, s.created_at, s.updated_at
            FROM sets s
            WHERE s.workout_id = $1
        `
		setRows, err := database.PostgresDB.QueryContext(c, setsQuery, workout.ID)
		if err != nil {
			logger.LogHandlerError(c, err, "querying sets")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve sets: %v", err)})
			return
		}
		defer setRows.Close()

		for setRows.Next() {
			var set model.SetResponse
			var exerciseID string
			if err := setRows.Scan(
				&set.ID, &exerciseID, &set.Weight, &set.Reps, &set.RestBefore, &set.Order, &set.Note, &set.CreatedAt, &set.UpdatedAt,
			); err != nil {
				logger.LogHandlerError(c, err, "scanning set row")
				c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process set data: %v", err)})
				return
			}
			if exercise, ok := exercisesMap[exerciseID]; ok {
				exercise.Sets = append(exercise.Sets, set)
			}
		}

		for _, exercise := range exercisesMap {
			workout.Exercises = append(workout.Exercises, *exercise)
		}

		workouts = append(workouts, workout)
	}

	if err := rows.Err(); err != nil {
		logger.LogHandlerError(c, err, "iterating workout rows")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve all workouts: %v", err)})
		return
	}

	c.IndentedJSON(http.StatusOK, workouts)
}
