"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.createProject.mutationOptions({
      onSuccess: (data) => {
        toast.success("Project created successfully");
        router.push(`/projects/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button
          disabled={createProject.isPending}
          onClick={() => createProject.mutate({ userInput })}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Page;
