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

func GetExercise(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)
	exerciseID := c.Param("id")

	var exercise model.Exercise
	err := database.PostgresDB.QueryRowContext(c, `SELECT id, name, media_url, note, created_at, updated_at FROM exercises WHERE id = $1`, exerciseID).
		Scan(&exercise.ID, &exercise.Name, &exercise.MediaURL, &exercise.Note, &exercise.CreatedAt, &exercise.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "Exercise not found"})
			return
		}
		logger.LogHandlerError(c, err, "selecting exercise")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve exercise: %v", err)})
		return
	}

	rows, err := database.PostgresDB.QueryContext(c, `
				SELECT e.id, e.name, e.created_at, e.updated_at
				FROM equipment e
				JOIN exercise_equipment ee ON e.id = ee.equipment_id
				WHERE ee.exercise_id = $1`, exerciseID)

	if err != nil {
		logger.LogHandlerError(c, err, "selecting equipment")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve equipment: %v", err)})
		return
	}

	defer rows.Close()

	equipment := make([]model.Equipment, 0)
	for rows.Next() {
		var e model.Equipment
		if err := rows.Scan(&e.ID, &e.Name, &e.CreatedAt, &e.UpdatedAt); err != nil {
			logger.LogHandlerError(c, err, "scanning equipment row")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process equipment data: %v", err)})
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
		logger.LogHandlerError(c, err, "selecting muscle groups")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve muscle groups: %v", err)})
		return
	}

	defer rows.Close()

	var primaryMuscleGroup model.MuscleGroup
	secondaryMuscleGroups := make([]model.MuscleGroup, 0)
	for rows.Next() {
		var mg model.MuscleGroup
		var isPrimary bool
		if err := rows.Scan(&mg.ID, &mg.Name, &mg.CreatedAt, &mg.UpdatedAt, &isPrimary); err != nil {
			logger.LogHandlerError(c, err, "scanning muscle group row")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process muscle group data: %v", err)})
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
