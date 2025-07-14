"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { Suspense } from "react";
import { useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "@/modules/projects/ui/components/project-header";

type Props = {
  projectId: string;
};
const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          className="flex flex-col min-h-0"
          defaultSize={35}
          minSize={20}
        >
          <Suspense fallback={<div>Loading Project...</div>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<div>Loading Messages...</div>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50}>
          TODO: Preview
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export { ProjectView };
