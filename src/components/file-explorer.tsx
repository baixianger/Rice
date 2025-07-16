import { LucideCopy, LucideEllipsis, LucideCheck } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";

import { Hint } from "./hint";
import { Button } from "@/components/ui/button";
import { CodeView } from "./code-view";
import { TreeView } from "./tree-view";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { convertFilesToTreeItems } from "@/lib/utils";
import { type FileCollection } from "@/lib/types";
import { toast } from "sonner";

const getLanguageFromExtension = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text";
};

type FileExplorerProps = {
  files: FileCollection;
};

const FileExplorerBreadcrumb = ({ selectedFile }: { selectedFile: string }) => {
  const pathSegments = selectedFile.split("/");
  const maxVisibleSegments = 3;
  const renderBreadcrumbItems = () => {
    if (pathSegments.length <= maxVisibleSegments) {
      return pathSegments.map((pathSegment, index) => {
        const isLast = index === pathSegments.length - 1;

        return (
          <Fragment key={pathSegment}>
            <BreadcrumbItem>
              <BreadcrumbPage
                className={!isLast ? "text-muted-foreground" : ""}
              >
                {pathSegment}
              </BreadcrumbPage>
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    } else {
      const firstSegment = pathSegments[0];
      const lastSegment = pathSegments[pathSegments.length - 1];
      const visibleSegments = [
        firstSegment,
        <LucideEllipsis key="ellipsis" />,
        lastSegment,
      ];

      return visibleSegments.map((pathSegment, index) => {
        const isLast = index === visibleSegments.length - 1;

        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              <BreadcrumbPage>{pathSegment}</BreadcrumbPage>
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  );
};

export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    // Pre-select the first file
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  const handleFileSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [files]
  );

  const [copied, setCopied] = useState(false);

  const handleCopyFileContent = () => {
    if (selectedFile && files[selectedFile]) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      // toast
      toast.info("File content copied to clipboard");
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={15} className="bg-sidebar">
        <TreeView
          data={treeData}
          onSelect={handleFileSelect}
          selectedFile={selectedFile}
        />
      </ResizablePanel>
      <ResizableHandle className="hover:bg-primary transition-colors" />
      <ResizablePanel defaultSize={80} minSize={70}>
        {selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center">
              <FileExplorerBreadcrumb selectedFile={selectedFile} />
              <Hint text="Copy file content" side="bottom">
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={handleCopyFileContent}
                  disabled={!selectedFile}
                >
                  {copied ? (
                    <LucideCheck className="size-4" />
                  ) : (
                    <LucideCopy className="size-4" />
                  )}
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
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
