import DeleteWorkoutConfirmationDialogProps from "@/interfaces/delete_workout_confirmation_dialog_props";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "@/App";
import APIError from "@/interfaces/api_error";
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

export default function DeleteWorkoutConfirmationDialog({
  open,
  setOpen,
  workout,
}: DeleteWorkoutConfirmationDialogProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteWorkoutMutation = useMutation<void, Error, string>({
    mutationFn: async (workoutId) => {
      const token = await getToken();
      const response = await fetch(`${SERVER_URL}/workouts/${workoutId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || "Failed to delete workout");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      setOpen(false);
      toast({
        description: "Workout deleted successfully.",
      });
      navigate("/workouts");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: `Failed to delete workout: ${error.message}`,
      });
    },
  });

  const onConfirm = () => {
    if (workout) {
      deleteWorkoutMutation.mutate(workout.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this workout? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteWorkoutMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleteWorkoutMutation.isPending}
            className={cn(
              "bg-red-500 hover:bg-red-600",
              deleteWorkoutMutation.isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            {deleteWorkoutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
        {deleteWorkoutMutation.isError && (
          <div className="mt-4 text-sm text-red-500">
            Error: {deleteWorkoutMutation.error.message}
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
