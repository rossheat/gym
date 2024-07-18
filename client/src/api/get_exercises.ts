import { SERVER_URL } from "@/App";
import APIError from "@/interfaces/api_error";
import ExerciseResponse from "@/interfaces/exercise_response";
import FilterOptions from "@/interfaces/filter_options";
import { GetTokenOptions } from "@clerk/types";

const getExercises = async (
  getToken: { (options?: GetTokenOptions): Promise<string | null>; (): any },
  filters: FilterOptions
): Promise<ExerciseResponse[]> => {
  const token = await getToken();

  const queryParams = new URLSearchParams();
  if (filters.name) queryParams.append("name", filters.name);
  if (filters.primaryMuscleGroupId)
    queryParams.append("primaryMuscleGroupId", filters.primaryMuscleGroupId);
  if (filters.equipmentId)
    queryParams.append("equipmentId", filters.equipmentId);

  const response = await fetch(
    `${SERVER_URL}/exercises?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData: APIError = await response.json();
    throw new Error(errorData.error || "Failed to fetch exercises");
  }

  return response.json();
};

export default getExercises;
