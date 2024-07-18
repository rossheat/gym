package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
)

func DeleteWorkout(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	userID := c.GetString("userId")
	workoutID := c.Param("id")

	tx, err := database.PostgresDB.BeginTx(c, nil)
	if err != nil {
		logger.LogHandlerError(c, err, "beginning transaction")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to begin transaction: %v", err)})
		return
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(c, `DELETE FROM sets WHERE workout_id = $1 AND user_id = $2`, workoutID, userID)
	if err != nil {
		logger.LogHandlerError(c, err, "deleting sets")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete sets: %v", err)})
		return
	}

	_, err = tx.ExecContext(c, `DELETE FROM workout_exercises WHERE workout_id = $1`, workoutID)
	if err != nil {
		logger.LogHandlerError(c, err, "deleting workout exercises")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete workout exercises: %v", err)})
		return
	}

	result, err := tx.ExecContext(c, `DELETE FROM workouts WHERE id = $1 AND user_id = $2`, workoutID, userID)
	if err != nil {
		logger.LogHandlerError(c, err, "deleting workout")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete workout: %v", err)})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		logger.LogHandlerError(c, err, "getting rows affected")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to confirm workout deletion: %v", err)})
		return
	}

	if rowsAffected == 0 {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "Workout not found"})
		return
	}

	if err := tx.Commit(); err != nil {
		logger.LogHandlerError(c, err, "committing transaction")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to commit transaction: %v", err)})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Workout deleted successfully"})
}
