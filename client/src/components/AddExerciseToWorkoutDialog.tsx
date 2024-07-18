import ExerciseResponse from "@/interfaces/exercise_response";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import ExerciseList from "./ExerciseList";

export default function AddExerciseToWorkoutDialog({
  open,
  setOpen,
  onExerciseSelect,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onExerciseSelect: (exercise: ExerciseResponse) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Exercise to Workout</DialogTitle>
          <DialogDescription>
            Select an exercise to add to your workout.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <ExerciseList
            onExerciseSelect={(exercise) => {
              onExerciseSelect(exercise);
              setOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
