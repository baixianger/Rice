"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const Page = () => {
  const [value, setValue] = useState("");
  const [codePrompt, setCodePrompt] = useState("");
  const trpc = useTRPC();
  const invoke = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        toast.success("Background job invoked successfully");
      },
    })
  );
  const codeAgent = useMutation(
    trpc.codeAgent.mutationOptions({
      onSuccess: () => {
        toast.success("Background code generation task invoked successfully");
      },
    })
  );
  return (
    <>
      <div className="p-4 max-w-7xl mx-auto flex flex-col gap-4 items-center">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button
          disabled={invoke.isPending}
          onClick={() => invoke.mutate({ inputValue2tRPC: value })}
        >
          Invoke Background Job
        </Button>
      </div>
      <Separator />
      <div className="p-4 max-w-7xl mx-auto flex flex-col gap-4 items-center">
        <Input
          value={codePrompt}
          onChange={(e) => setCodePrompt(e.target.value)}
        />
        <Button
          disabled={codeAgent.isPending}
          onClick={() => codeAgent.mutate({ codePrompt: codePrompt })}
        >
          Invoke Background Code Generation Task
        </Button>
      </div>
    </>
  );
};

export default Page;
