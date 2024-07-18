import { SERVER_URL } from "@/App";
import APIError from "@/interfaces/api_error";
import ExerciseStatisticsResponse from "@/interfaces/exercise_statistics_response";
import { GetTokenOptions } from "@clerk/types";

const getExerciseStatistics = async (
  getToken: { (options?: GetTokenOptions): Promise<string | null>; (): any },
  id: string,
  timePeriod: string
): Promise<ExerciseStatisticsResponse> => {
  const token = await getToken();

  const response = await fetch(
    `${SERVER_URL}/exercises/${id}/statistics?time_period=${timePeriod}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData: APIError = await response.json();
    throw new Error(errorData.error || "Failed to fetch exercise statistics");
  }

  return response.json();
};

export default getExerciseStatistics;
