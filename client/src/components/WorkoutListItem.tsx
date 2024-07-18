import WorkoutResponse from "@/interfaces/workout_response";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, DumbbellIcon } from "lucide-react";

export default function WorkoutListItem({
  workout,
}: {
  workout: WorkoutResponse;
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isSelected = id === workout.id;

  const handleClick = () => {
    navigate(`/workouts/${workout.id}`);
  };

  const exerciseCount = workout.exercises?.length ?? 0;
  const formattedDate = format(new Date(workout.performedAt), "do MMMM, yyyy");
  const formattedTime = format(new Date(workout.performedAt), "HH:mm");

  return (
    <div
      className={`flex items-center p-2 pl-4 pr-2 mb-1 rounded-lg cursor-pointer transition-colors duration-200 ${
        isSelected ? "bg-blue-100" : "hover:bg-gray-50"
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-col">
        <h3 className="text-md font-semibold flex items-center">
          <CalendarIcon className="inline-block mr-2 h-4 w-4" />
          <span>{formattedDate}</span>
          <span className="ml-2 text-sm text-gray-500">{formattedTime}</span>
        </h3>
        <p className="text-sm text-gray-500 flex items-center mt-1">
          <DumbbellIcon className="inline-block mr-2 h-4 w-4" />
          {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
