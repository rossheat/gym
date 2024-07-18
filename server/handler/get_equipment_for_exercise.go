package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/rossheat/gym/server/database"
	"github.com/rossheat/gym/server/model"
)

func GetEquipmentForExercise(c *gin.Context, exerciseID string) ([]model.Equipment, error) {
	query := `
        SELECT e.id, e.name, e.created_at, e.updated_at
        FROM equipment e
        JOIN exercise_equipment ee ON e.id = ee.equipment_id
        WHERE ee.exercise_id = $1
    `
	rows, err := database.PostgresDB.QueryContext(c, query, exerciseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var equipment []model.Equipment
	for rows.Next() {
		var eq model.Equipment
		if err := rows.Scan(&eq.ID, &eq.Name, &eq.CreatedAt, &eq.UpdatedAt); err != nil {
			return nil, err
		}
		equipment = append(equipment, eq)
	}
	return equipment, rows.Err()
}
