import { useParams } from "react-router-dom";
import WorkoutPage from "../pages/WorkoutPage";

export default function WorkoutShell() {
  const { id } = useParams<{ id?: string }>();

  if (!id) {
    return (
      <div>
        <p>Please select a workout from the list to view its details.</p>
      </div>
    );
  }

  return <WorkoutPage />;
}
