import CreateUpdateExerciseWithSets from "./create_update_exercise_with_sets";

export default interface CreateUpdateWorkoutRequest {
  userId: string;
  performedAt: string;
  note: string;
  exercises: CreateUpdateExerciseWithSets[];
}
