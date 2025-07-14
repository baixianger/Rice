import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { LucideArrowUp, LucideLoaderCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";

type MessageFormProps = {
  projectId: string;
};

const formSchema = z.object({
  userInput: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content is too long"),
});

const MessageForm = ({ projectId }: MessageFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createMessage = useMutation(
    trpc.messages.createUserMessage.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries({
          queryKey: trpc.messages.getManyMessages.queryKey({
            projectId,
          }),
        });
        // TODO: Invalidate usage status
      },
      onError: (error) => {
        toast.error(error.message);
        // TODO: Redirect to procing page if specific error
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userInput: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      userInput: values.userInput,
      projectId,
    });
  };

  const [isFocused, setIsFocused] = useState(false);
  const showUsage = false;
  const isPending = createMessage.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border px-3 pt-3 pb-2 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xm",
          showUsage && "border-t-none"
        )}
      >
        <FormField
          control={form.control}
          name="userInput"
          render={({ field }) => (
            <Textarea
              {...field}
              rows={8}
              placeholder="What would you like to build?"
              className="min-h-[80px] resize-none border-none w-full outline-none bg-transparent shadow-none"
              disabled={isPending}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)();
                }
              }}
            />
          )}
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd
              className="ml-auto pointer-events-none inline-flex h-5
             select-none items-center gap-1 rounded-full border bg-muted
             px-1.5 py-2 font-mono text-[10px] font-medium"
            >
              <span>⌘</span>Enter
            </kbd>
            &nbsp;to submit
          </div>
          <Button
            type="submit"
            disabled={isButtonDisabled}
            className={cn(
              "size-8",
              isButtonDisabled && "bg-muted-foreground border"
            )}
          >
            {isPending ? (
              <LucideLoaderCircle className="size-3 rounded-full animate-spin" />
            ) : (
              <LucideArrowUp
                className={cn(
                  "size-3 rounded-full",
                  isFocused && "animate-pulse"
                )}
              />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { MessageForm };
