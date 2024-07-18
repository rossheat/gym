package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/loggerpkg"
)

func GetExerciseStatistics(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	id := c.Param("id")
	timePeriod := c.Query("time_period")

	if timePeriod == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "time_period query parameter is required"})
		return
	}

	stats, err := CalculateExerciseStatistics(c, id, timePeriod)
	if err != nil {
		logger.LogHandlerError(c, err, "calculating exercise statistics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to calculate exercise statistics: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       stats,
		"timePeriod": timePeriod,
	})
}
