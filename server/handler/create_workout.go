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

func CreateWorkout(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	userID := c.GetString("userId")

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

	workoutID := "workout_" + uuid.New().String()
	now := time.Now()

	_, err = tx.ExecContext(c, `
        INSERT INTO workouts (id, user_id, performed_at, note, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, workoutID, userID, req.PerformedAt, req.Note, now, now)
	if err != nil {
		logger.LogHandlerError(c, err, "inserting workout")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create workout: %v", err)})
		return
	}

	for i, exercise := range req.Exercises {
		_, err = tx.ExecContext(c, `
            INSERT INTO workout_exercises (workout_id, exercise_id, "order")
            VALUES ($1, $2, $3)
        `, workoutID, exercise.ExerciseID, i+1)
		if err != nil {
			logger.LogHandlerError(c, err, "inserting workout exercise")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create workout exercise: %v", err)})
			return
		}

		for _, set := range exercise.Sets {
			setID := "set_" + uuid.New().String()
			_, err = tx.ExecContext(c, `
                INSERT INTO sets (id, user_id, workout_id, exercise_id, weight, reps, rest_before, "order", note, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, setID, userID, workoutID, exercise.ExerciseID, set.Weight, set.Reps, set.RestBefore, set.Order, set.Note, now, now)
			if err != nil {
				logger.LogHandlerError(c, err, "inserting set")
				c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create set: %v", err)})
				return
			}
		}
	}

	if err := tx.Commit(); err != nil {
		logger.LogHandlerError(c, err, "committing transaction")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to commit transaction: %v", err)})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"id": workoutID})
}
