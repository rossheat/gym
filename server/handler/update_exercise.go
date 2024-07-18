package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/model"
)

func UpdateExercise(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	exerciseID := c.Param("id")

	var req model.CreateUpdateExerciseRequest
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

	updatedAt := time.Now()
	if _, err := tx.ExecContext(c, `UPDATE exercises SET name = $1, media_url = $2, note = $3, updated_at = $4 
											WHERE id = $5`,
		req.Name, req.MediaURL, req.Note, updatedAt, exerciseID); err != nil {
		logger.LogHandlerError(c, err, "updating exercise")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update exercise: %v", err)})
		return
	}

	if _, err := tx.ExecContext(c, `DELETE FROM exercise_equipment WHERE exercise_id = $1`, exerciseID); err != nil {
		logger.LogHandlerError(c, err, "deleting exercise equipment")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update equipment associations: %v", err)})
		return
	}

	for _, equipID := range req.EquipmentIDs {
		if _, err := tx.ExecContext(c, `INSERT INTO exercise_equipment (exercise_id, equipment_id) VALUES ($1, $2)`,
			exerciseID, equipID); err != nil {
			logger.LogHandlerError(c, err, "inserting exercise equipment")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update equipment associations: %v", err)})
			return
		}
	}

	if _, err := tx.ExecContext(c, `DELETE FROM exercise_muscle_groups WHERE exercise_id = $1`, exerciseID); err != nil {
		logger.LogHandlerError(c, err, "deleting exercise muscle groups")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update muscle group associations: %v", err)})
		return
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
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update secondary muscle group association: %v", err)})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		logger.LogHandlerError(c, err, "committing transaction")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to commit transaction: %v", err)})
		return
	}

	var exercise model.Exercise
	err = database.PostgresDB.QueryRowContext(c, `SELECT id, name, media_url, note, created_at, updated_at FROM exercises WHERE id = $1`, exerciseID).
		Scan(&exercise.ID, &exercise.Name, &exercise.MediaURL, &exercise.Note, &exercise.CreatedAt, &exercise.UpdatedAt)
	if err != nil {
		logger.LogHandlerError(c, err, "selecting updated exercise")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve updated exercise: %v", err)})
		return
	}

	rows, err := database.PostgresDB.QueryContext(c, `
        SELECT e.id, e.name, e.created_at, e.updated_at
        FROM equipment e
        JOIN exercise_equipment ee ON e.id = ee.equipment_id
        WHERE ee.exercise_id = $1`, exerciseID)
	if err != nil {
		logger.LogHandlerError(c, err, "selecting updated equipment")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve updated equipment: %v", err)})
		return
	}
	defer rows.Close()

	equipment := make([]model.Equipment, 0)
	for rows.Next() {
		var e model.Equipment
		if err := rows.Scan(&e.ID, &e.Name, &e.CreatedAt, &e.UpdatedAt); err != nil {
			logger.LogHandlerError(c, err, "scanning updated equipment row")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process updated equipment data: %v", err)})
			return
		}
		equipment = append(equipment, e)
	}

	rows, err = database.PostgresDB.QueryContext(c, `
        SELECT mg.id, mg.name, mg.created_at, mg.updated_at, emg.is_primary
        FROM muscle_groups mg
        JOIN exercise_muscle_groups emg ON mg.id = emg.muscle_group_id
        WHERE emg.exercise_id = $1`, exerciseID)
	if err != nil {
		logger.LogHandlerError(c, err, "selecting updated muscle groups")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve updated muscle groups: %v", err)})
		return
	}
	defer rows.Close()

	var primaryMuscleGroup model.MuscleGroup
	secondaryMuscleGroups := make([]model.MuscleGroup, 0)
	for rows.Next() {
		var mg model.MuscleGroup
		var isPrimary bool
		if err := rows.Scan(&mg.ID, &mg.Name, &mg.CreatedAt, &mg.UpdatedAt, &isPrimary); err != nil {
			logger.LogHandlerError(c, err, "scanning updated muscle group row")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process updated muscle group data: %v", err)})
			return
		}
		if isPrimary {
			primaryMuscleGroup = mg
		} else {
			secondaryMuscleGroups = append(secondaryMuscleGroups, mg)
		}
	}

	response := model.ExerciseResponse{
		Exercise:              exercise,
		Equipment:             equipment,
		PrimaryMuscleGroup:    primaryMuscleGroup,
		SecondaryMuscleGroups: secondaryMuscleGroups,
	}

	c.IndentedJSON(http.StatusOK, response)
}
