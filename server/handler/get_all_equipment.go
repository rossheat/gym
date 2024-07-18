package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/model"
)

func GetAllEquipment(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)

	rows, err := database.PostgresDB.QueryContext(c, `SELECT id, name, created_at, updated_at FROM equipment ORDER BY name`)
	if err != nil {
		logger.LogHandlerError(c, err, "querying equipment")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve equipment: %v", err)})
		return
	}
	defer rows.Close()

	equipmentList := make([]model.Equipment, 0)
	for rows.Next() {
		var eq model.Equipment
		if err := rows.Scan(&eq.ID, &eq.Name, &eq.CreatedAt, &eq.UpdatedAt); err != nil {
			logger.LogHandlerError(c, err, "scanning equipment row")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process equipment data: %v", err)})
			return
		}
		equipmentList = append(equipmentList, eq)
	}

	if err := rows.Err(); err != nil {
		logger.LogHandlerError(c, err, "iterating equipment rows")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve all equipment: %v", err)})
		return
	}

	c.IndentedJSON(http.StatusOK, equipmentList)
}
