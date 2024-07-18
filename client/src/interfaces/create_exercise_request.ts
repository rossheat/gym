export default interface CreateExerciseRequest {
  name: string;
  mediaUrl: string;
  note: string;
  equipmentIds: string[];
  primaryMuscleGroupId: string;
  secondaryMuscleGroupIds: string[];
}
