import ExerciseResponse from "@/interfaces/exercise_response";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import deleteExercise from "@/api/delete_exercise";

export default function DeleteExerciseConfirmationDialog({
  open,
  setOpen,
  exercise,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  exercise?: ExerciseResponse;
}) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteExerciseMutation = useMutation<void, Error, string>({
    mutationFn: (exercise) => deleteExercise(exercise, getToken),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      setOpen(false);
      toast({
        variant: "destructive",
        description: "Exercise deleted successfully.",
      });
      navigate("/exercises");
    },
  });

  const onConfirm = () => {
    if (exercise) {
      deleteExerciseMutation.mutate(exercise.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Movie-Source URL</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this movie-source URL? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteExerciseMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleteExerciseMutation.isPending}
            className={cn(
              "bg-red-500 hover:bg-red-600",
              deleteExerciseMutation.isPending &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {deleteExerciseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
        {deleteExerciseMutation.isError && (
          <div className="mt-4 text-sm text-red-500">
            Error: {deleteExerciseMutation.error.message}
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
