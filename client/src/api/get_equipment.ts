import { SERVER_URL } from "@/App";
import APIError from "@/interfaces/api_error";
import Equipment from "@/interfaces/equipment";
import { GetTokenOptions } from "@clerk/types";

const getEquipment = async (getToken: {
  (options?: GetTokenOptions): Promise<string | null>;
  (): any;
}): Promise<Equipment[]> => {
  const token = await getToken();

  const response = await fetch(`${SERVER_URL}/equipment`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData: APIError = await response.json();
    throw new Error(errorData.error || "Failed to fetch equipment");
  }

  return response.json();
};

export default getEquipment;
