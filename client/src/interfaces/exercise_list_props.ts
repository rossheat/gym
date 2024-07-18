import ExerciseResponse from "./exercise_response";

export default interface ExerciseListProps {
  onExerciseSelect?: (exercise: ExerciseResponse) => void;
}
