'use client';

// https://trpc.io/docs/client/tanstack-react-query/server-components#using-your-api
// <-- hooks can only be used in client components
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
export function ClientGreeting() {
  const trpc = useTRPC();
  const greeting = useQuery(trpc.hello.queryOptions({ text: '白翔' }));
  if (!greeting.data) return <div>Loading...</div>;
  return <div>{greeting.data.greeting}</div>;
}
