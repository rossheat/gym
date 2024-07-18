import ExerciseListProps from "@/interfaces/exercise_list_props";
import ExerciseResponse from "@/interfaces/exercise_response";
import FilterOptions from "@/interfaces/filter_options";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import CreateUpdateExerciseDialog from "./CreateUpdateExerciseDialog";
import DeleteExerciseConfirmationDialog from "./DeleteExerciseConfirmationDialog";
import ExercisesListFilteringSection from "./ExerciseListFilteringSection";
import { Loader2 } from "lucide-react";
import ExerciseListItem from "./ExerciseListItem";
import getExercises from "@/api/get_exercises";

export default function ExerciseList({ onExerciseSelect }: ExerciseListProps) {
  const { getToken } = useAuth();
  const [selectedCreateUpdateExercise, setSelectedCreateUpdateExercise] =
    useState<ExerciseResponse | undefined>(undefined);
  const [selectedDeleteExercise] = useState<ExerciseResponse | undefined>(
    undefined
  );
  const [filters, setFilters] = useState<FilterOptions>({
    name: "",
    primaryMuscleGroupId: "",
    equipmentId: "",
  });
  const location = useLocation();
  const isExercisesPage = location.pathname.startsWith("/exercises");

  const exercisesQuery = useQuery<ExerciseResponse[], Error>({
    queryKey: ["exercises", filters],
    queryFn: () => getExercises(getToken, filters),
  });

  const [
    isCreateUpdateExerciseDialogOpen,
    setIsCreateUpdateExerciseDialogOpen,
  ] = useState(false);

  const [
    isShowDeleteConfirmationDialogOpen,
    setShowDeleteConfirmationDialogOpen,
  ] = useState(false);

  const handleCreateExercise = () => {
    setSelectedCreateUpdateExercise(undefined);
    setIsCreateUpdateExerciseDialogOpen(true);
  };

  return (
    <div className="p-4">
      <CreateUpdateExerciseDialog
        open={isCreateUpdateExerciseDialogOpen}
        setOpen={setIsCreateUpdateExerciseDialogOpen}
        exercise={selectedCreateUpdateExercise}
      />
      <DeleteExerciseConfirmationDialog
        open={isShowDeleteConfirmationDialogOpen}
        setOpen={setShowDeleteConfirmationDialogOpen}
        exercise={selectedDeleteExercise}
      />

      {/* Hide filtering section on smaller screens */}
      <div className={isExercisesPage ? "hidden xl:block" : ""}>
        <ExercisesListFilteringSection onFilterChange={setFilters} />
      </div>

      <div className="flex justify-start xl:justify-end mb-2">
        <span
          onClick={handleCreateExercise}
          className="text-blue-600 underline cursor-pointer hover:text-blue-800"
        >
          Add exercise
        </span>
      </div>

      {exercisesQuery.isLoading && (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      )}
      {exercisesQuery.isError && (
        <div className="text-red-500">
          Error: {exercisesQuery.error?.message || "Unknown error"}
        </div>
      )}
      {exercisesQuery.isSuccess && (
        <div
          className={`${
            isExercisesPage
              ? "xl:h-[calc(100vh-200px)] xl:overflow-y-auto overflow-x-auto"
              : "h-[calc(100vh-200px)] overflow-y-auto"
          }`}
        >
          <div
            className={`${
              isExercisesPage ? "xl:space-y-2 flex xl:flex-col" : "space-y-2"
            }`}
          >
            {exercisesQuery.data?.map((exercise) => (
              <div
                key={exercise.id}
                className={`${
                  isExercisesPage
                    ? "xl:w-full w-64 flex-shrink-0 mr-4 xl:mr-0"
                    : "w-full"
                }`}
              >
                <ExerciseListItem
                  exercise={exercise}
                  onExerciseSelect={onExerciseSelect}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
