package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/loggerpkg"
	"github.com/rossheat/gym/server/model"
)

func GetAllExercises(c *gin.Context) {
	logger := c.MustGet("logger").(*loggerpkg.Logger)

	name := c.Query("name")
	primaryMuscleGroupId := c.Query("primaryMuscleGroupId")
	equipmentId := c.Query("equipmentId")

	query := `
        SELECT DISTINCT e.id, e.name, e.media_url, e.note, e.created_at, e.updated_at,
               pmg.id AS primary_muscle_group_id, pmg.name AS primary_muscle_group_name,
               pmg.created_at AS primary_muscle_group_created_at, pmg.updated_at AS primary_muscle_group_updated_at
        FROM exercises e
        JOIN exercise_muscle_groups emg ON e.id = emg.exercise_id AND emg.is_primary = true
        JOIN muscle_groups pmg ON emg.muscle_group_id = pmg.id
        LEFT JOIN exercise_equipment ee ON e.id = ee.exercise_id
        WHERE 1=1
    `
	params := []interface{}{}

	if name != "" {
		query += " AND e.name ILIKE $" + strconv.Itoa(len(params)+1)
		params = append(params, "%"+name+"%")
	}

	if primaryMuscleGroupId != "" {
		query += " AND pmg.id = $" + strconv.Itoa(len(params)+1)
		params = append(params, primaryMuscleGroupId)
	}

	if equipmentId != "" {
		query += " AND ee.equipment_id = $" + strconv.Itoa(len(params)+1)
		params = append(params, equipmentId)
	}

	query += " ORDER BY e.name"

	rows, err := database.PostgresDB.QueryContext(c, query, params...)

	if err != nil {
		logger.LogHandlerError(c, err, "querying exercises")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve exercises: %v", err)})
		return
	}
	defer rows.Close()

	exerciseResponses := make([]model.ExerciseResponse, 0)
	for rows.Next() {
		var exercise model.Exercise
		var primaryMuscleGroup model.MuscleGroup

		if err := rows.Scan(
			&exercise.ID, &exercise.Name, &exercise.MediaURL, &exercise.Note, &exercise.CreatedAt, &exercise.UpdatedAt,
			&primaryMuscleGroup.ID, &primaryMuscleGroup.Name, &primaryMuscleGroup.CreatedAt, &primaryMuscleGroup.UpdatedAt,
		); err != nil {
			logger.LogHandlerError(c, err, "scanning exercise row")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to process exercise data: %v", err)})
			return
		}

		secondaryMuscleGroups, err := GetSecondaryMuscleGroups(c, exercise.ID)
		if err != nil {
			logger.LogHandlerError(c, err, "fetching secondary muscle groups")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch secondary muscle groups: %v", err)})
			return
		}

		equipment, err := GetEquipmentForExercise(c, exercise.ID)
		if err != nil {
			logger.LogHandlerError(c, err, "fetching equipment")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch equipment: %v", err)})
			return
		}

		exerciseResponse := model.ExerciseResponse{
			Exercise:              exercise,
			PrimaryMuscleGroup:    primaryMuscleGroup,
			SecondaryMuscleGroups: secondaryMuscleGroups,
			Equipment:             equipment,
		}
		exerciseResponses = append(exerciseResponses, exerciseResponse)
	}

	if err := rows.Err(); err != nil {
		logger.LogHandlerError(c, err, "iterating exercise rows")
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to retrieve all exercises: %v", err)})
		return
	}

	c.IndentedJSON(http.StatusOK, exerciseResponses)
}
