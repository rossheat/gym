package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
)

func DeleteExercise(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	exerciseID := c.Param("id")

	result, err := database.PostgresDB.ExecContext(c, `DELETE FROM exercises WHERE id = $1`, exerciseID)
	if err != nil {
		logger.LogHandlerError(c, err, "deleting exercise")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete exercise: %v", err)})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		logger.LogHandlerError(c, err, "getting rows affected")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to confirm exercise deletion: %v", err)})
		return
	}

	if rowsAffected == 0 {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "Exercise not found"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Exercise deleted successfully"})
}
