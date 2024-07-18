import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const addSetFormSchema = z.object({
  weight: z.number().int().min(0, "Weight must be a non-negative integer"),
  reps: z.number().int().min(1, "Reps must be at least 1"),
  restBefore: z
    .number()
    .int()
    .min(0, "Rest time must be a non-negative integer"),

  note: z.string().optional(),
});

type AddSetDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onAddSet: (set: z.infer<typeof addSetFormSchema>) => void;
};

export function AddSetDialog({ open, setOpen, onAddSet }: AddSetDialogProps) {
  const form = useForm<z.infer<typeof addSetFormSchema>>({
    resolver: zodResolver(addSetFormSchema),
    defaultValues: {
      weight: 60,
      reps: 8,
      restBefore: 3,
      note: "",
    },
  });

  function onSubmit(values: z.infer<typeof addSetFormSchema>) {
    onAddSet(values);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Set</DialogTitle>
          <DialogDescription>
            Enter the details for the new set.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reps</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="restBefore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rest Before (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </FormControl>
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
                      {...field}
                      placeholder="Add a note for this set"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Set</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
