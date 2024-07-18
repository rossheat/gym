import ExerciseStatistics from "./exercise_statistics";

export default interface ExerciseStatisticsResponse {
  data: ExerciseStatistics[];
  timePeriod: string;
}
