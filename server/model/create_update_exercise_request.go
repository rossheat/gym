package model

type CreateUpdateExerciseRequest struct {
	Name                    string   `json:"name"`
	MediaURL                string   `json:"mediaUrl"`
	Note                    string   `json:"note"`
	EquipmentIDs            []string `json:"equipmentIds"`
	PrimaryMuscleGroupID    string   `json:"primaryMuscleGroupId"`
	SecondaryMuscleGroupIDs []string `json:"secondaryMuscleGroupIds"`
}
