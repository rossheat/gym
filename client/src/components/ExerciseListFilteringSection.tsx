import FilterOptions from "@/interfaces/filter_options";
import FilterProps from "@/interfaces/filter_props";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import getEquipment from "@/api/get_equipment";
import getMuscleGroups from "@/api/get_muscle_groups";

export default function ExercisesListFilteringSection({
  onFilterChange,
}: FilterProps) {
  const [name, setName] = useState("");
  const [primaryMuscleGroupId, setPrimaryMuscleGroupId] = useState("all");
  const [equipmentId, setEquipmentId] = useState("all");
  const { getToken } = useAuth();

  const muscleGroupsQuery = useQuery({
    queryKey: ["muscleGroups"],
    queryFn: () => getMuscleGroups(getToken),
  });

  const equipmentQuery = useQuery({
    queryKey: ["equipment"],
    queryFn: () => getEquipment(getToken),
  });

  useEffect(() => {
    const filters: FilterOptions = {
      name,
      primaryMuscleGroupId:
        primaryMuscleGroupId === "all" ? "" : primaryMuscleGroupId,
      equipmentId: equipmentId === "all" ? "" : equipmentId,
    };
    onFilterChange(filters);
  }, [name, primaryMuscleGroupId, equipmentId, onFilterChange]);

  return (
    <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="name">Exercise Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Filter by name"
        />
      </div>
      <div className="flex flex-col space-y-2">
        <Label htmlFor="muscleGroup">Primary Muscle Group</Label>
        <Select
          value={primaryMuscleGroupId}
          onValueChange={setPrimaryMuscleGroupId}
        >
          <SelectTrigger id="muscleGroup">
            <SelectValue placeholder="Select a muscle group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All muscle groups</SelectItem>
            {muscleGroupsQuery.data?.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col space-y-2">
        <Label htmlFor="equipment">Equipment</Label>
        <Select value={equipmentId} onValueChange={setEquipmentId}>
          <SelectTrigger id="equipment">
            <SelectValue placeholder="Select equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All equipment</SelectItem>
            {equipmentQuery.data?.map((eq) => (
              <SelectItem key={eq.id} value={eq.id}>
                {eq.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
