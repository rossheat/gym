import Equipment from "./equipment";
import MuscleGroup from "./muscle_group";

export default interface ExerciseResponse {
  id: string;
  name: string;
  mediaUrl: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  equipment: Equipment[];
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
}
