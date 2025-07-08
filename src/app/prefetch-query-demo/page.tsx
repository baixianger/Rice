// https://trpc.io/docs/client/tanstack-react-query/server-components#using-your-api
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import { ClientGreeting } from './client-greeting';
export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    // 这里的fetching内容必须跟client-greeting.tsx中的内容一致
    trpc.hello.queryOptions({
      text: '白翔',
    }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>...</div>
      {/** ... */}
      <ClientGreeting />
    </HydrationBoundary>
  );
}
