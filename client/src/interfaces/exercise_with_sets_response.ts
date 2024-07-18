import SetResponse from "./set_response";

export default interface ExerciseWithSetsResponse {
  id: string;
  name: string;
  mediaUrl: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  sets: SetResponse[];
}
