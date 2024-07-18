import { SERVER_URL } from "@/App";
import WorkoutResponse from "@/interfaces/workout_response";

const createWorkout = async (
  getToken: () => Promise<string | null>
): Promise<WorkoutResponse> => {
  const token = await getToken();
  const response = await fetch(`${SERVER_URL}/workouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      performedAt: new Date().toISOString(),
      note: "",
      exercises: [],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create workout");
  }

  return response.json();
};

export default createWorkout;
