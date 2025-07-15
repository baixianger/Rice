"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { Suspense } from "react";
import { useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "@/modules/projects/ui/components/project-header";
import { FragmentWeb } from "@/modules/projects/ui/components/fragment-web";
import { LucideCode, LucideCrown, LucideEye, LucidePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { type FileCollection } from "@/lib/types";

type ProjectViewProps = {
  projectId: string;
};
const ProjectView = ({ projectId }: ProjectViewProps) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          className="flex flex-col min-h-0"
          defaultSize={25}
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
        <ResizablePanel defaultSize={75} minSize={50}>
          <Tabs defaultValue="preview" className="h-full gap-y-0">
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md">
                  <LucideEye />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <LucideCode />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                <Button asChild size="sm" variant="default">
                  <Link href="/pricing">
                    <LucideCrown />
                    <span>Upgrade</span>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value="preview">
              {!!activeFragment ? (
                <FragmentWeb data={activeFragment} />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <LucidePlus className="w-4 h-4 mr-2" />
                  <span>Select a fragment to preview</span>
                </div>
              )}
            </TabsContent>
            <TabsContent value="code" className="flex-1 min-h-0">
              {!!activeFragment?.files ? (
                <FileExplorer files={activeFragment.files as FileCollection} />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <LucidePlus className="w-4 h-4 mr-2" />
                  <span>Select a fragment to view code</span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export { ProjectView };
