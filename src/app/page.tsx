"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

const Page = () => {
  const [userInput, setUserInput] = useState("");
  const trpc = useTRPC();
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message created successfully");
      },
    })
  );
  return (
    <>
      <div className="p-4 max-w-7xl mx-auto flex flex-col gap-4 items-center">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button
          disabled={createMessage.isPending}
          onClick={() => createMessage.mutate({ userInput })}
        >
          Create Message
        </Button>
      </div>
      <div className="p-4 max-w-7xl mx-auto flex flex-col gap-4 items-center">
        {JSON.stringify(messages)}
      </div>
    </>
  );
};

export default Page;
