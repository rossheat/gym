import { SERVER_URL } from "@/App";
import APIError from "@/interfaces/api_error";
import MuscleGroup from "@/interfaces/muscle_group";
import { GetTokenOptions } from "@clerk/types";

const getMuscleGroups = async (getToken: {
  (options?: GetTokenOptions): Promise<string | null>;
  (): any;
}): Promise<MuscleGroup[]> => {
  const token = await getToken();

  const response = await fetch(`${SERVER_URL}/muscle-groups`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData: APIError = await response.json();
    throw new Error(errorData.error || "Failed to fetch muscle groups");
  }

  return response.json();
};

export default getMuscleGroups;
