import WorkoutResponse from "./workout_response";

export default interface DeleteWorkoutConfirmationDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  workout?: WorkoutResponse;
}
