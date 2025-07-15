import { type TreeItem } from "@/lib/types";
import { LucideChevronRight, LucideFile, LucideFolder } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  SidebarProvider,
} from "@/components/ui/sidebar";

type TreeViewProps = {
  data: TreeItem[];
  onSelect: (file: string) => void;
  selectedFile: string | null;
};

export function TreeView({ data, onSelect, selectedFile }: TreeViewProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="none" className="w-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.map((item, index) => (
                  <Tree
                    key={index}
                    onSelect={onSelect}
                    selectedFile={selectedFile}
                    item={item}
                    parentPath=""
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}

type TreeProps = {
  onSelect?: (file: string) => void;
  selectedFile: string | null;
  item: TreeItem;
  parentPath: string;
};
function Tree({ onSelect, selectedFile, item, parentPath }: TreeProps) {
  const [name, ...items] = Array.isArray(item) ? item : [item];
  const currentPath = parentPath ? `${parentPath}/${name}` : name;

  if (!items.length) {
    const isSelected = currentPath === selectedFile;
    return (
      <SidebarMenuButton
        isActive={isSelected}
        className="data-[active=true]:bg-transparent"
        onClick={() => onSelect?.(currentPath)}
      >
        <LucideFile />
        <span className="truncate">{name}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === "components" || name === "ui"}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <LucideChevronRight className="transition-transform" />
            <LucideFolder />
            <span className="truncate">{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                onSelect={onSelect}
                selectedFile={selectedFile}
                item={subItem as TreeItem}
                parentPath={currentPath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
