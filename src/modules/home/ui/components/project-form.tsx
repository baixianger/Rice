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
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "@/lib/constants";
import { useClerk } from "@clerk/nextjs";

const formSchema = z.object({
  userInput: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content is too long"),
});

const ProjectForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const clerk = useClerk();
  const queryClient = useQueryClient();
  // createProject在调用tRPC的时候内部会有middleware验证用户信息，如果用户未登录会自动跳转到Clerk登录页面
  const createProject = useMutation(
    trpc.projects.createProject.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.projects.getManyProjects.queryKey(),
        }); // 让缓存失效
        queryClient.invalidateQueries({
          queryKey: trpc.usage.getUsageStatus.queryKey(),
        });
        router.push(`/projects/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }
        if (error.data?.code === "TOO_MANY_REQUESTS") {
          router.push("/pricing");
        }
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
    await createProject.mutateAsync({
      userInput: values.userInput,
    });
  };

  const onSelect = (template: string) => {
    form.setValue("userInput", template, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const [isFocused, setIsFocused] = useState(false);
  const isPending = createProject.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;

  return (
    <Form {...form}>
      <section className="space-y-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "relative border px-3 pt-3 pb-2 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
            isFocused && "shadow-xm"
          )}
        >
          <FormField
            control={form.control}
            name="userInput"
            render={({ field }) => (
              <Textarea
                {...field}
                rows={4}
                placeholder="What would you like to build?"
                className="min-h-[80px] resize-none border-none w-full outline-none bg-transparent shadow-none
              focus-visible:ring-0"
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
                "size-9 rounded-full",
                isButtonDisabled && "bg-muted-foreground border"
              )}
            >
              {isPending ? (
                <LucideLoaderCircle className="size-4 rounded-full animate-spin" />
              ) : (
                <LucideArrowUp
                  className={cn(
                    "size-4 rounded-full",
                    isFocused && "animate-pulse"
                  )}
                />
              )}
            </Button>
          </div>
        </form>
        <div className="flex-wrap justify-center gap-2 hidden md:flex max-w-3xl">
          {PROJECT_TEMPLATES.map((template) => (
            <Button
              key={template.title}
              variant="outline"
              size="sm"
              className="bg-white dark:bg-sidebar"
              onClick={() => onSelect(template.prompt)}
            >
              {template.emoji} {template.title}
            </Button>
          ))}
        </div>
      </section>
    </Form>
  );
};

export { ProjectForm };
