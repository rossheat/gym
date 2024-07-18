import ExerciseWithSetsResponse from "./exercise_with_sets_response";

export default interface WorkoutResponse {
  id: string;
  userId: string;
  performedAt: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  exercises: ExerciseWithSetsResponse[];
}
