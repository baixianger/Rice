import { LucideCopy } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";

import { Hint } from "./hint";
import { Button } from "@/components/ui/button";
import { CodeView } from "./code-view";
import { TreeView } from "./tree-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import { type FileCollection } from "@/lib/types";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const getLanguageFromExtension = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text";
};

type FileExplorerProps = {
  files: FileCollection;
};

const FileExplorerExperiment = ({ files }: FileExplorerProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    // Pre-select the first file
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  const handleFileSelect = useCallback((filePath: string) => {
    if (files[filePath]) {
      setSelectedFile(filePath);
    }
  }, []);

  return (
    <SidebarProvider>
      <TreeView
        data={treeData}
        onSelect={handleFileSelect}
        selectedFile={selectedFile}
      />
      <SidebarInset>
        {selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {selectedFile &&
                    selectedFile.split("/").map((pathSegment, index, array) => {
                      const isLast = index === array.length - 1;

                      return (
                        <Fragment key={pathSegment}>
                          <BreadcrumbItem>
                            <BreadcrumbLink href="#">
                              {pathSegment}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                      );
                    })}
                </BreadcrumbList>
              </Breadcrumb>
              <Hint text="Copy file content" side="bottom">
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {}}
                  disabled={true}
                >
                  <LucideCopy className="size-4" />
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeView
                code={files[selectedFile]}
                language={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No file selected
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
};

export { FileExplorerExperiment };
