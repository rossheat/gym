import ExerciseResponse from "@/interfaces/exercise_response";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateUpdateExerciseForm from "./CreateUpdateExerciseForm";

export default function CreateUpdateExerciseDialog({
  open,
  setOpen,
  exercise,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  exercise?: ExerciseResponse;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {exercise ? "Update exercise" : "Add exercise"}
          </DialogTitle>
          <DialogDescription>
            {exercise
              ? "Update an existing exercise in your library."
              : "Add a new exercise to your library."}
          </DialogDescription>
        </DialogHeader>
        <CreateUpdateExerciseForm setOpen={setOpen} exercise={exercise} />
      </DialogContent>
    </Dialog>
  );
}
