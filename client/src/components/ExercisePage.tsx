import { useParams } from "react-router-dom";

export default function ExercisePage() {
  const { id } = useParams<{ id?: string }>();

  if (!id) {
    return (
      <div>
        <p>Please select an exercise from the list to view its details.</p>
      </div>
    );
  }

  return <ExercisePage />;
}
