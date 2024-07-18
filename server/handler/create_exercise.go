package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/model"
)

func CreateExercise(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)

	var req model.CreateUpdateExerciseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.LogHandlerError(c, err, "binding JSON")
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	exerciseID := "exercise_" + uuid.New().String()
	exercise := model.Exercise{
		ID:        exerciseID,
		Name:      req.Name,
		MediaURL:  req.MediaURL,
		Note:      req.Note,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	tx, err := database.PostgresDB.BeginTx(c, nil)
	if err != nil {
		logger.LogHandlerError(c, err, "beginning transaction")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to begin transaction: %v", err)})
		return
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(c, `INSERT INTO exercises (id, name, media_url, note, created_at, updated_at) 
										   VALUES ($1, $2, $3, $4, $5, $6)`,
		exercise.ID, exercise.Name, exercise.MediaURL, exercise.Note, exercise.CreatedAt, exercise.UpdatedAt); err != nil {
		logger.LogHandlerError(c, err, "inserting exercise")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create exercise: %v", err)})
		return
	}

	for _, equipID := range req.EquipmentIDs {
		if _, err := tx.ExecContext(c, `INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES ($1, $2)`,
			exerciseID, equipID); err != nil {
			logger.LogHandlerError(c, err, "inserting exercise equipment")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to associate equipment: %v", err)})
			return
		}
	}

	if _, err := tx.ExecContext(c, `INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary) 
	VALUES ($1, $2, $3)`,
		exerciseID, req.PrimaryMuscleGroupID, true); err != nil {
		if pqErr, ok := err.(*pq.Error); ok {
			switch pqErr.Code.Name() {
			case "foreign_key_violation":
				c.IndentedJSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("foreign_key_violation: Invalid primary muscle group ID: %v", req.PrimaryMuscleGroupID)})
			default:
				logger.LogHandlerError(c, err, "inserting primary muscle group")
				c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update primary muscle group association: %v", err)})
			}
		} else {
			logger.LogHandlerError(c, err, "inserting primary muscle group")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update primary muscle group association: %v", err)})
		}
		return
	}

	for _, muscleID := range req.SecondaryMuscleGroupIDs {
		if _, err := tx.ExecContext(c, `INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary) 
                                    VALUES ($1, $2, $3)`,
			exerciseID, muscleID, false); err != nil {
			logger.LogHandlerError(c, err, "inserting secondary muscle group")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to associate secondary muscle group: %v", err)})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		logger.LogHandlerError(c, err, "committing transaction")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to commit transaction: %v", err)})
		return
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"id": exerciseID})
}
