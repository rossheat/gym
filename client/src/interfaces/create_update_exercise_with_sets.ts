import CreateUpdateSet from "./create_update_set";

export default interface CreateUpdateExerciseWithSets {
  exerciseId: string;
  sets: CreateUpdateSet[];
}
