package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/model"
)

func UpdateWorkout(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	userID := c.GetString("userId")
	workoutID := c.Param("id")

	var req model.CreateUpdateWorkoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.LogHandlerError(c, err, "binding JSON")
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	tx, err := database.PostgresDB.BeginTx(c, nil)
	if err != nil {
		logger.LogHandlerError(c, err, "beginning transaction")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to begin transaction: %v", err)})
		return
	}
	defer tx.Rollback()

	now := time.Now()

	_, err = tx.ExecContext(c, `
        UPDATE workouts
        SET performed_at = $1, note = $2, updated_at = $3
        WHERE id = $4 AND user_id = $5
    `, req.PerformedAt, req.Note, now, workoutID, userID)
	if err != nil {
		logger.LogHandlerError(c, err, "updating workout")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update workout: %v", err)})
		return
	}

	_, err = tx.ExecContext(c, `DELETE FROM workout_exercises WHERE workout_id = $1`, workoutID)
	if err != nil {
		logger.LogHandlerError(c, err, "deleting workout exercises")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update workout exercises: %v", err)})
		return
	}

	_, err = tx.ExecContext(c, `DELETE FROM sets WHERE workout_id = $1`, workoutID)
	if err != nil {
		logger.LogHandlerError(c, err, "deleting sets")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update sets: %v", err)})
		return
	}

	for i, exercise := range req.Exercises {
		workoutExerciseID := uuid.New().String()
		_, err = tx.ExecContext(c, `
            INSERT INTO workout_exercises (id, workout_id, exercise_id, "order")
            VALUES ($1, $2, $3, $4)
        `, workoutExerciseID, workoutID, exercise.ExerciseID, i+1)
		if err != nil {
			logger.LogHandlerError(c, err, "inserting workout exercise")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update workout exercise: %v", err)})
			return
		}

		for _, set := range exercise.Sets {
			setID := uuid.New().String()
			_, err = tx.ExecContext(c, `
                INSERT INTO sets (id, user_id, workout_id, exercise_id, weight, reps, rest_before, "order", note, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, setID, userID, workoutID, exercise.ExerciseID, set.Weight, set.Reps, set.RestBefore, set.Order, set.Note, now, now)
			if err != nil {
				logger.LogHandlerError(c, err, "inserting set")
				c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update set: %v", err)})
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		logger.LogHandlerError(c, err, "committing transaction")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to commit transaction: %v", err)})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Workout updated successfully"})
}
