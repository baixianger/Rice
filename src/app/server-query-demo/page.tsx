import { caller } from '@/trpc/server';

const Page = async () => {
  const data = await caller.hello({ text: '白翔' });
  return <div>{data.greeting}</div>;
};

export default Page;
