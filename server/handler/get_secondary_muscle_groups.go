package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/model"
)

func GetSecondaryMuscleGroups(c *gin.Context, exerciseID string) ([]model.MuscleGroup, error) {
	query := `
        SELECT mg.id, mg.name, mg.created_at, mg.updated_at
        FROM muscle_groups mg
        JOIN exercise_muscle_groups emg ON mg.id = emg.muscle_group_id
        WHERE emg.exercise_id = $1 AND emg.is_primary = false
    `
	rows, err := database.PostgresDB.QueryContext(c, query, exerciseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var muscleGroups []model.MuscleGroup
	for rows.Next() {
		var mg model.MuscleGroup
		if err := rows.Scan(&mg.ID, &mg.Name, &mg.CreatedAt, &mg.UpdatedAt); err != nil {
			return nil, err
		}
		muscleGroups = append(muscleGroups, mg)
	}
	return muscleGroups, rows.Err()
}
