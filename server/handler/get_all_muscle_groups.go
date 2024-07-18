package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/model"
)

func GetAllMuscleGroups(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)

	rows, err := database.PostgresDB.QueryContext(c, `SELECT id, name, created_at, updated_at FROM muscle_groups ORDER BY name`)
	if err != nil {
		logger.LogHandlerError(c, err, "querying muscle groups")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve muscle groups: %v", err)})
		return
	}
	defer rows.Close()

	muscleGroups := make([]model.MuscleGroup, 0)
	for rows.Next() {
		var mg model.MuscleGroup
		if err := rows.Scan(&mg.ID, &mg.Name, &mg.CreatedAt, &mg.UpdatedAt); err != nil {
			logger.LogHandlerError(c, err, "scanning muscle group row")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process muscle group data: %v", err)})
			return
		}
		muscleGroups = append(muscleGroups, mg)
	}

	if err := rows.Err(); err != nil {
		logger.LogHandlerError(c, err, "iterating muscle group rows")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve all muscle groups: %v", err)})
		return
	}

	c.IndentedJSON(http.StatusOK, muscleGroups)
}
