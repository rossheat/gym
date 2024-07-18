export default interface UpdateExerciseRequest {
  id: string;
  name: string;
  mediaUrl: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  equipmentIds: string[];
  primaryMuscleGroupId: string;
  secondaryMuscleGroupIds: string[];
}
