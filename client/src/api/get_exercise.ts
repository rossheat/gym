import { SERVER_URL } from "@/App";
import APIError from "@/interfaces/api_error";
import ExerciseResponse from "@/interfaces/exercise_response";
import { GetTokenOptions } from "@clerk/types";

const getExercise = async (
  getToken: { (options?: GetTokenOptions): Promise<string | null>; (): any },
  id: string
): Promise<ExerciseResponse> => {
  const token = await getToken();

  const response = await fetch(`${SERVER_URL}/exercises/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData: APIError = await response.json();
    throw new Error(errorData.error || "Failed to fetch exercise");
  }

  return response.json();
};

export default getExercise;
