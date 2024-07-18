import ExerciseResponse from "@/interfaces/exercise_response";
import isVideo from "@/utils/is_video";
import { useNavigate, useParams } from "react-router-dom";

export default function ExerciseListItem({
  exercise,
  onExerciseSelect,
}: {
  exercise: ExerciseResponse;
  onExerciseSelect?: (exercise: ExerciseResponse) => void;
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isSelected = id === exercise.id;

  const handleClick = () => {
    if (location.pathname.startsWith("/exercises")) {
      navigate(`/exercises/${exercise.id}`);
    } else if (location.pathname.startsWith("/workouts") && onExerciseSelect) {
      onExerciseSelect(exercise);
    }
  };

  return (
    <div
      className={`flex items-center p-2 mb-1 rounded-lg cursor-pointer transition-colors duration-200 ${
        isSelected ? "bg-blue-100" : "hover:bg-gray-50"
      }`}
      onClick={handleClick}
    >
      <div className="w-16 h-16 mr-3 overflow-hidden rounded-md">
        {isVideo(exercise.mediaUrl) ? (
          <video
            src={exercise.mediaUrl}
            className="w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={exercise.mediaUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col">
        <h3 className="text-md font-semibold">{exercise.name}</h3>
        <p className="text-sm text-gray-500">
          {exercise.primaryMuscleGroup.name}
        </p>
      </div>
    </div>
  );
}
