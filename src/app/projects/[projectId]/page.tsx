import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { Suspense } from "react";

type Props = {
  params: {
    projectId: string;
  };
};

const Page = async ({ params }: Props) => {
  const { projectId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.messages.getManyMessages.queryOptions({
      projectId,
    })
  );
  void queryClient.prefetchQuery(
    trpc.projects.getOneProject.queryOptions({
      id: projectId,
    })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectView projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
