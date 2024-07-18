import ExerciseResponse from "@/interfaces/exercise_response";
import { useAuth } from "@clerk/clerk-react";
import { useToast } from "./ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CreateExerciseRequest from "@/interfaces/create_exercise_request";
import { SERVER_URL } from "@/App";
import APIError from "@/interfaces/api_error";
import UpdateExerciseRequest from "@/interfaces/update_exercise_request";
import { z } from "zod";
import Equipment from "@/interfaces/equipment";
import { useRef } from "react";
import MuscleGroup from "@/interfaces/muscle_group";
import { FormProvider, useForm } from "react-hook-form";
import { ScrollArea } from "./ui/scroll-area";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import toTitleCase from "@/utils/to_title_case";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import getMuscleGroups from "@/api/get_muscle_groups";
import getEquipment from "@/api/get_equipment";

export default function CreateUpdateExerciseForm({
  setOpen,
  exercise,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  exercise?: ExerciseResponse;
}) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /*
      useMutation<TData, TError, TVariables, TContext>
      Where:
            TData is the type of successful response data
            TError is the type of error
            TVariables is the type of variables the mutation function accepts
    */
  const createExerciseMutation = useMutation<
    ExerciseResponse,
    Error,
    CreateExerciseRequest
  >({
    mutationFn: async (ex) => {
      const token = await getToken();

      const response = await fetch(`${SERVER_URL}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ex),
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || "Failed to create exercise");
      }

      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      setOpen(false);
      toast({
        description: "Exercise created successfully.",
      });
    },
    onError: (error) => {
      setError("root", {
        message: error.message,
      });
    },
  });

  const updateExerciseMutation = useMutation<
    ExerciseResponse,
    Error,
    UpdateExerciseRequest
  >({
    mutationFn: async (ex) => {
      const token = await getToken();
      const response = await fetch(`${SERVER_URL}/exercises/${ex.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ex),
      });

      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || "Failed to update exercise");
      }

      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      setOpen(false);
      toast({
        description: "Exercise updated successfully.",
      });
    },
    onError: (error) => {
      setError("root", {
        message: error.message,
      });
    },
  });

  const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    mediaUrl: z.string().url({ message: "Invalid URL" }),
    note: z.string().optional(),
    primaryMuscleGroupId: z
      .string()
      .min(1, { message: "Primary muscle group is required" }),
    secondaryMuscleGroupId: z.string().optional(),
    equipmentId: z.string().optional(),
  });

  const defaultValues = {
    name: exercise?.name || "",
    mediaUrl: exercise?.mediaUrl || "",
    note: exercise?.note || "",
    primaryMuscleGroupId: exercise?.primaryMuscleGroup.id || "",
    secondaryMuscleGroupId: exercise?.secondaryMuscleGroups[0]?.id || "",
    equipmentId: exercise?.equipment[0]?.id || "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { isSubmitting, errors } = form.formState;
  const { setError } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const exerciseData = {
      name: values.name.trim(),
      mediaUrl: values.mediaUrl,
      note: values.note || "",
      primaryMuscleGroupId: values.primaryMuscleGroupId,
      secondaryMuscleGroupIds: values.secondaryMuscleGroupId
        ? [values.secondaryMuscleGroupId]
        : [],
      equipmentIds: values.equipmentId ? [values.equipmentId] : [],
    };

    if (exercise) {
      updateExerciseMutation.mutate({
        ...exerciseData,
        id: exercise.id,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      });
    } else {
      createExerciseMutation.mutate(exerciseData, {
        onSuccess: () => {
          form.reset();
        },
      });
    }
  }

  const formRef = useRef<HTMLFormElement>(null);

  const muscleGroupsQuery = useQuery<MuscleGroup[], Error>({
    queryKey: ["muscleGroups"],
    queryFn: () => getMuscleGroups(getToken),
  });

  const equipmentQuery = useQuery<Equipment[], Error>({
    queryKey: ["equipment"],
    queryFn: () => getEquipment(getToken),
  });

  return (
    <>
      <FormProvider {...form}>
        <ScrollArea className="h-[60vh] pr-4">
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Squat"
                      {...field}
                      onChange={(e) => {
                        const titleCaseValue = toTitleCase(e.target.value);
                        field.onChange(titleCaseValue);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of the new exercise.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://squat.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    The media URL of the exercise.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Set seat at pin 5"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add things like machine settings and form cues.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryMuscleGroupId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Primary Muscle Group</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? muscleGroupsQuery?.data &&
                              muscleGroupsQuery.data.find(
                                (muscleGroup) => muscleGroup.id === field.value
                              )?.name
                            : "Select muscle group"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandList>
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            {muscleGroupsQuery?.data &&
                              muscleGroupsQuery.data.map((muscleGroup) => (
                                <CommandItem
                                  value={muscleGroup.name}
                                  key={muscleGroup.id}
                                  onSelect={() => {
                                    console.log("Selected", muscleGroup.id);
                                    form.setValue(
                                      "primaryMuscleGroupId",
                                      muscleGroup.id
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      muscleGroup.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {muscleGroup.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is the primary muscle group that the exercise targets.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondaryMuscleGroupId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Secondary Muscle Group</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? muscleGroupsQuery.data &&
                              muscleGroupsQuery.data.find(
                                (muscleGroup) => muscleGroup.id === field.value
                              )?.name
                            : "Select muscle group"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search muscle group..." />
                        <CommandList>
                          <CommandEmpty>No muscle group found.</CommandEmpty>
                          <CommandGroup>
                            {muscleGroupsQuery.data &&
                              muscleGroupsQuery.data.map((muscleGroup) => (
                                <CommandItem
                                  value={muscleGroup.name}
                                  key={muscleGroup.id}
                                  onSelect={() => {
                                    form.setValue(
                                      "secondaryMuscleGroupId",
                                      muscleGroup.id
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      muscleGroup.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {muscleGroup.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is the secondary muscle group that the exercise
                    targets.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipmentId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Equipment</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? equipmentQuery.data &&
                              equipmentQuery.data.find(
                                (equipment) => equipment.id === field.value
                              )?.name
                            : "Select equipment"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search equipment..." />
                        <CommandList>
                          <CommandEmpty>No equipment found.</CommandEmpty>
                          <CommandGroup>
                            {equipmentQuery.data &&
                              equipmentQuery.data.map((equipment) => (
                                <CommandItem
                                  value={equipment.name}
                                  key={equipment.id}
                                  onSelect={() => {
                                    form.setValue("equipmentId", equipment.id);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      equipment.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {equipment.name}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The equipment used for this exercise.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errors.root && <FormMessage>{errors.root.message}</FormMessage>}

            <Button
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {createExerciseMutation.isPending ||
              updateExerciseMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {createExerciseMutation.isPending ||
              updateExerciseMutation.isPending
                ? "Please wait"
                : exercise
                ? "Update exercise"
                : "Add exercise"}
            </Button>
          </form>
        </ScrollArea>
      </FormProvider>
    </>
  );
}
