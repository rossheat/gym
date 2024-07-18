import { SERVER_URL } from "@/App";
import WorkoutResponse from "@/interfaces/workout_response";

const getWorkouts = async (
  getToken: () => Promise<string | null>
): Promise<WorkoutResponse[]> => {
  const token = await getToken();
  const response = await fetch(`${SERVER_URL}/workouts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch workouts");
  }

  return response.json();
};

export default getWorkouts;
