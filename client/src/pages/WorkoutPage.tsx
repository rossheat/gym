import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../components/ui/use-toast";
import { SERVER_URL } from "@/App";
import WorkoutResponse from "@/interfaces/workout_response";
import CreateUpdateWorkoutRequest from "@/interfaces/create_update_workout_request";
import APIError from "@/interfaces/api_error";
import { format, parseISO } from "date-fns";
import ExerciseResponse from "@/interfaces/exercise_response";
import {
  CalendarIcon,
  ChevronDownIcon,
  Loader2,
  PlusIcon,
  Trash2,
} from "lucide-react";
import ReactDatePicker from "react-datepicker";
import { Button } from "../components/ui/button";
import { cn } from "@/lib/utils";
import AddExerciseToWorkoutDialog from "../components/AddExerciseToWorkoutDialog";
import * as Collapsible from "@radix-ui/react-collapsible";
import "react-datepicker/dist/react-datepicker.css";
import DeleteWorkoutConfirmationDialog from "../components/DeleteWorkoutConfirmationDialog";
import { AddSetDialog } from "../components/AddSetDialog";
import DeleteSetConfirmation from "../components/DeleteSetConfirmation";

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [isAddSetDialogOpen, setIsAddSetDialogOpen] = useState(false);
  const [isDeleteSetDialogOpen, setIsDeleteSetDialogOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const workoutQuery = useQuery({
    queryKey: ["workouts", id],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${SERVER_URL}/workouts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || "Failed to fetch workout details");
      }

      return response.json() as Promise<WorkoutResponse>;
    },
    enabled: !!id,
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: async (updatedWorkout: CreateUpdateWorkoutRequest) => {
      const token = await getToken();
      const response = await fetch(`${SERVER_URL}/workouts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedWorkout),
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || "Failed to update workout");
      }

      return response.json() as Promise<WorkoutResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", id] });
      toast({
        description: "Workout updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        description: `Failed to update workout: ${error.message}`,
      });
    },
  });

  const handleDeleteClick = () => setIsDeleteDialogOpen(true);
  const handleAddExerciseClick = () => setIsAddExerciseDialogOpen(true);

  const handleAddSetClick = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setIsAddSetDialogOpen(true);
  };

  const handleDeleteSetClick = (exerciseId: string, setId: string) => {
    setSelectedExerciseId(exerciseId);
    setSelectedSetId(setId);
    setIsDeleteSetDialogOpen(true);
  };

  const [performedAt, setPerformedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (workoutQuery.data) {
      setPerformedAt(parseISO(workoutQuery.data.performedAt));
    }
  }, [workoutQuery.data]);

  const handleDateChange = (date: Date | null) => {
    setPerformedAt(date);
    if (date && workoutQuery.data) {
      const updatedWorkout: CreateUpdateWorkoutRequest = {
        userId: workoutQuery.data.userId,
        performedAt: date.toISOString(),
        note: workoutQuery.data.note,
        exercises:
          workoutQuery.data.exercises?.map((exercise) => ({
            exerciseId: exercise.id,
            sets:
              exercise.sets?.map((set) => ({
                exerciseId: exercise.id,
                weight: set.weight,
                reps: set.reps,
                restBefore: set.restBefore,
                order: set.order,
                note: set.note || "",
              })) || [],
          })) || [],
      };
      updateWorkoutMutation.mutate(updatedWorkout);
    }
  };

  const handleAddExercise = (exercise: ExerciseResponse) => {
    if (workoutQuery.data) {
      const updatedWorkout: CreateUpdateWorkoutRequest = {
        userId: workoutQuery.data.userId,
        performedAt: workoutQuery.data.performedAt,
        note: workoutQuery.data.note,
        exercises: [
          ...(workoutQuery.data.exercises || []).map((e) => ({
            exerciseId: e.id,
            sets: (e.sets || []).map((s) => ({
              exerciseId: e.id,
              weight: s.weight,
              reps: s.reps,
              restBefore: s.restBefore,
              order: s.order,
              note: s.note,
            })),
          })),
          {
            exerciseId: exercise.id,
            sets: [],
          },
        ],
      };
      updateWorkoutMutation.mutate(updatedWorkout);
    }
  };

  const handleAddSet = (newSet: {
    weight: number;
    reps: number;
    restBefore: number;
    note?: string;
  }) => {
    if (workoutQuery.data && selectedExerciseId) {
      const updatedWorkout: CreateUpdateWorkoutRequest = {
        userId: workoutQuery.data.userId,
        performedAt: workoutQuery.data.performedAt,
        note: workoutQuery.data.note,
        exercises: (workoutQuery.data.exercises || []).map((exercise) => {
          if (exercise.id === selectedExerciseId) {
            const existingSets = exercise.sets || [];
            const newSetOrder = existingSets.length + 1;
            return {
              exerciseId: exercise.id,
              sets: [
                ...existingSets.map((s) => ({
                  exerciseId: exercise.id,
                  weight: s.weight,
                  reps: s.reps,
                  restBefore: s.restBefore,
                  order: s.order,
                  note: s.note,
                })),
                {
                  ...newSet,
                  exerciseId: selectedExerciseId,
                  order: newSetOrder,
                  note: newSet.note || "",
                },
              ],
            };
          }
          return {
            exerciseId: exercise.id,
            sets: (exercise.sets || []).map((s) => ({
              exerciseId: exercise.id,
              weight: s.weight,
              reps: s.reps,
              restBefore: s.restBefore,
              order: s.order,
              note: s.note,
            })),
          };
        }),
      };
      updateWorkoutMutation.mutate(updatedWorkout);
    } else {
      console.error("Workout data or selected exercise is not available");
    }
  };

  const handleDeleteSet = () => {
    if (workoutQuery.data && selectedExerciseId && selectedSetId) {
      const updatedWorkout: CreateUpdateWorkoutRequest = {
        userId: workoutQuery.data.userId,
        performedAt: workoutQuery.data.performedAt,
        note: workoutQuery.data.note,
        exercises: (workoutQuery.data.exercises || []).map((exercise) => {
          if (exercise.id === selectedExerciseId) {
            return {
              exerciseId: exercise.id,
              sets: (exercise.sets || [])
                .filter((set) => set.id !== selectedSetId)
                .map((s) => ({
                  exerciseId: exercise.id,
                  weight: s.weight,
                  reps: s.reps,
                  restBefore: s.restBefore,
                  order: s.order,
                  note: s.note,
                })),
            };
          }
          return {
            exerciseId: exercise.id,
            sets: (exercise.sets || []).map((s) => ({
              exerciseId: exercise.id,
              weight: s.weight,
              reps: s.reps,
              restBefore: s.restBefore,
              order: s.order,
              note: s.note,
            })),
          };
        }),
      };
      updateWorkoutMutation.mutate(updatedWorkout);
    } else {
      console.error(
        "Workout data, selected exercise, or selected set is not available"
      );
    }
    setIsDeleteSetDialogOpen(false);
  };
  const handleDeleteExercise = (exerciseId: string) => {
    if (workoutQuery.data) {
      const updatedWorkout: CreateUpdateWorkoutRequest = {
        userId: workoutQuery.data.userId,
        performedAt: workoutQuery.data.performedAt,
        note: workoutQuery.data.note,
        exercises: (workoutQuery.data.exercises || [])
          .filter((e) => e.id !== exerciseId)
          .map((e) => ({
            exerciseId: e.id,
            sets: (e.sets || []).map((s) => ({
              exerciseId: e.id,
              weight: s.weight,
              reps: s.reps,
              restBefore: s.restBefore,
              order: s.order,
              note: s.note,
            })),
          })),
      };
      updateWorkoutMutation.mutate(updatedWorkout);
    }
  };

  if (workoutQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (workoutQuery.isError) {
    return (
      <div className="text-center text-red-500 p-8">
        <p className="text-2xl font-bold mb-2">Error Loading Workout</p>
        <p>{workoutQuery.error.message}</p>
      </div>
    );
  }

  const workout = workoutQuery.data;

  if (!workout) {
    return (
      <div className="text-center text-red-500 p-8">
        <p className="text-2xl font-bold mb-2">Error</p>
        <p>Workout not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
      <div className="bg-white rounded-lg overflow-hidden mb-8">
        <div className="">
          <div className="flex items-center">
            <ReactDatePicker
              selected={performedAt}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              customInput={
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !performedAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {performedAt ? (
                    format(performedAt, "PPP p")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              }
            />
          </div>
        </div>
      </div>
      <div className="mb-8 flex justify-between items-center">
        <div className="space-x-3">
          <Button
            onClick={handleAddExerciseClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Exercise
          </Button>
          <Button
            onClick={handleDeleteClick}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Workout
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {workout?.exercises && workout.exercises.length > 0 ? (
          workout.exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <div className="px-6 py-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {index + 1}. {exercise.name}
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Exercise
                  </Button>
                </div>
                <div className="space-y-4">
                  {exercise?.sets?.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className="bg-gray-50 rounded-md p-4 mb-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 mr-3">
                            Set {setIndex + 1}:
                          </span>
                          <span className="text-gray-700">
                            {set.weight}kg x {set.reps} reps
                          </span>
                          {set.restBefore > 0 && (
                            <span className="ml-3 text-gray-500">
                              Rest: {set.restBefore} min
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteSetClick(exercise.id, set.id)
                          }
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                      {set.note && (
                        <div className="mt-2 text-sm text-gray-600">
                          {set.note}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSetClick(exercise.id)}
                    className="mt-2"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Set
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-gray-500">
            No exercises added to this workout yet.
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mt-8">
          <Collapsible.Root className="w-full">
            <Collapsible.Trigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <span className="mr-2">Debug Output</span>
                <Collapsible.CollapsibleTrigger asChild>
                  <ChevronDownIcon aria-hidden className="h-4 w-4" />
                </Collapsible.CollapsibleTrigger>
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content className="mt-4">
              <div className="rounded-md border border-gray-200 p-4">
                <h2 className="text-xl font-bold mb-2">Workout Data (JSON)</h2>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(workout, null, 2)}
                </pre>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      </div>

      <DeleteWorkoutConfirmationDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        workout={workout}
      />

      <AddExerciseToWorkoutDialog
        open={isAddExerciseDialogOpen}
        setOpen={setIsAddExerciseDialogOpen}
        onExerciseSelect={handleAddExercise}
      />

      <AddSetDialog
        open={isAddSetDialogOpen}
        setOpen={setIsAddSetDialogOpen}
        onAddSet={handleAddSet}
      />

      <DeleteSetConfirmation
        open={isDeleteSetDialogOpen}
        setOpen={setIsDeleteSetDialogOpen}
        onConfirm={handleDeleteSet}
      />
    </div>
  );
}
