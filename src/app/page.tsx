"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.hello.queryOptions({ text: '白翔' }));
  return (
    <div> 
      <Button>{data?.greeting}</Button>
    </div>
  );
}
