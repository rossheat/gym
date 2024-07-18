import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import WorkoutResponse from "@/interfaces/workout_response";
import { Loader2 } from "lucide-react";
import WorkoutListItem from "./WorkoutListItem";
import createWorkout from "@/api/create_workout";
import getWorkouts from "@/api/get_workouts";

export default function WorkoutList() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const workoutsQuery = useQuery<WorkoutResponse[], Error>({
    queryKey: ["workouts"],
    queryFn: () => getWorkouts(getToken),
  });

  const createWorkoutMutation = useMutation<WorkoutResponse, Error, void>({
    mutationFn: () => createWorkout(getToken),
    onSuccess: (newWorkout) => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      navigate(`/workouts/${newWorkout.id}`);
      toast({
        description: "New workout created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: `Failed to create workout: ${error.message}`,
      });
    },
  });

  const handleCreateWorkout = () => {
    createWorkoutMutation.mutate();
  };

  return (
    <div className="px-4">
      <div className="flex justify-start xl:justify-end mb-2">
        <span
          onClick={handleCreateWorkout}
          className="text-blue-600 underline cursor-pointer hover:text-blue-800"
        >
          Add workout
        </span>
      </div>

      {workoutsQuery.isLoading && (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      )}
      {workoutsQuery.isError && (
        <div className="text-red-500">
          Error: {workoutsQuery.error?.message || "Unknown error"}
        </div>
      )}
      {workoutsQuery.isSuccess && (
        <div className="xl:h-[calc(100vh-200px)] xl:overflow-y-auto overflow-x-auto">
          <div className="xl:space-y-2 flex xl:flex-col">
            {workoutsQuery.data?.map((workout) => (
              <div
                key={workout.id}
                className="xl:w-full w-64 flex-shrink-0 mr-4 xl:mr-0"
              >
                <WorkoutListItem workout={workout} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
