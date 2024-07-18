package handler

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/model"
)

func GetWorkout(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	userID := c.GetString("userId")
	workoutID := c.Param("id")

	var workout model.WorkoutResponse
	err := database.PostgresDB.QueryRowContext(c, `
        SELECT id, user_id, performed_at, note, created_at, updated_at
        FROM workouts
        WHERE id = $1 AND user_id = $2
    `, workoutID, userID).Scan(&workout.ID, &workout.UserID, &workout.PerformedAt, &workout.Note, &workout.CreatedAt, &workout.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "Workout not found"})
			return
		}
		logger.LogHandlerError(c, err, "querying workout")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve workout: %v", err)})
		return
	}

	exercisesQuery := `
        SELECT e.id, e.name, e.media_url, e.note, e.created_at, e.updated_at, we.order
        FROM workout_exercises we
        JOIN exercises e ON we.exercise_id = e.id
        WHERE we.workout_id = $1
        ORDER BY we.order
    `
	exerciseRows, err := database.PostgresDB.QueryContext(c, exercisesQuery, workoutID)
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
        SELECT id, exercise_id, weight, reps, rest_before, "order", note, created_at, updated_at
        FROM sets
        WHERE workout_id = $1
        ORDER BY exercise_id, "order"
    `
	setRows, err := database.PostgresDB.QueryContext(c, setsQuery, workoutID)
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

	c.IndentedJSON(http.StatusOK, workout)
}
