import { SERVER_URL } from "@/App";
import APIError from "@/interfaces/api_error";
import { GetTokenOptions } from "@clerk/types";

const deleteExercise = async (
  id: string,
  getToken: { (options?: GetTokenOptions): Promise<string | null>; (): any }
): Promise<void> => {
  const token = await getToken();

  const response = await fetch(`${SERVER_URL}/exercises/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData: APIError = await response.json();
    throw new Error(errorData.error || "Failed to delete exercise");
  }

  return;
};

export default deleteExercise;
