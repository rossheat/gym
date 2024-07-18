import ExerciseResponse from "@/interfaces/exercise_response";
import ExerciseStatisticsResponse from "@/interfaces/exercise_statistics_response";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  Edit,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import isVideo from "@/utils/is_video";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import CreateUpdateExerciseDialog from "../components/CreateUpdateExerciseDialog";
import DeleteExerciseConfirmationDialog from "../components/DeleteExerciseConfirmationDialog";
import getExercise from "@/api/get_exercise";
import getExerciseStatistics from "@/api/get_exercise_statistics";

export default function ExercisePage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1year");

  const handleEditClick = () => setIsUpdateDialogOpen(true);
  const handleDeleteClick = () => setIsDeleteDialogOpen(true);

  const exerciseQuery = useQuery<ExerciseResponse, Error>({
    queryKey: ["exercises", id],
    queryFn: () => getExercise(getToken, id ?? ""),
  });

  const statisticsQuery = useQuery<ExerciseStatisticsResponse, Error>({
    queryKey: ["exerciseStatistics", id, selectedTimePeriod],
    queryFn: () =>
      getExerciseStatistics(getToken, id ?? "", selectedTimePeriod),
    enabled: !!id,
  });

  const chartConfig = {
    volume: {
      label: "Volume",
      color: "#3b82f6",
    },
  } satisfies ChartConfig;

  if (exerciseQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (exerciseQuery.isError) {
    return (
      <div className="text-center text-red-500 p-8">
        <p className="text-2xl font-bold mb-2">Error Loading Exercise</p>
        <p>{exerciseQuery.error.message}</p>
      </div>
    );
  }

  const exercise = exerciseQuery.data;

  if (!exercise) {
    return (
      <div className="text-center text-red-500 p-8">
        <p className="text-2xl font-bold mb-2">Error</p>
        <p>Exercise not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{exercise.name}</h1>
        <div className="space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            className="bg-white hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="aspect-video w-full">
          {isVideo(exercise.mediaUrl) ? (
            <video
              src={exercise.mediaUrl}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={exercise.mediaUrl}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <Badge className="text-sm py-1.5 px-3 bg-blue-100 text-blue-800">
            {exercise.primaryMuscleGroup.name}
          </Badge>
          {exercise.secondaryMuscleGroups.map((group) => (
            <Badge
              key={group.id}
              variant="outline"
              className="text-sm py-1.5 px-3 border-gray-300 text-gray-700"
            >
              {group.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row mb-4">
        <div className="flex-1 mb-4 md:mb-0 md:mr-8">
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-700">{exercise.note}</p>
          </div>
        </div>
        <div className="md:w-1/3">
          <ul className="space-y-1">
            {exercise.equipment.map((item) => (
              <li
                key={item.id}
                className="flex items-center text-black font-bold"
              >
                <CheckIcon className="w-5 h-5 mr-1 text-green-500" />
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Volume Trend</h2>
            <p className="text-sm text-gray-500">
              Total volume (weight x sets x reps) in kilograms
            </p>
          </div>
          <Select
            value={selectedTimePeriod}
            onValueChange={setSelectedTimePeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5year">5 Years</SelectItem>
              <SelectItem value="3year">3 Years</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="1month">1 Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {statisticsQuery.isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : statisticsQuery.isError ? (
          <div className="text-center text-red-500 h-64 flex items-center justify-center">
            <p>Error loading statistics: {statisticsQuery.error.message}</p>
          </div>
        ) : statisticsQuery.data ? (
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={statisticsQuery.data.data}
              margin={{ left: 12, right: 12 }}
            >
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Area
                dataKey="volume"
                type="monotone"
                fill="url(#colorVolume)"
                fillOpacity={1}
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : null}
      </div>

      <div className="flex items-center text-sm text-gray-500">
        <CalendarIcon className="w-4 h-4 mr-1" />
        <span className="mr-4">
          Created: {new Date(exercise.createdAt).toLocaleDateString()}
        </span>
        <ClockIcon className="w-4 h-4 mr-1" />
        <span>
          Updated: {new Date(exercise.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {isUpdateDialogOpen && (
        <CreateUpdateExerciseDialog
          open={isUpdateDialogOpen}
          setOpen={setIsUpdateDialogOpen}
          exercise={exercise}
        />
      )}
      {isDeleteDialogOpen && (
        <DeleteExerciseConfirmationDialog
          open={isDeleteDialogOpen}
          setOpen={setIsDeleteDialogOpen}
          exercise={exercise}
        />
      )}
    </div>
  );
}
