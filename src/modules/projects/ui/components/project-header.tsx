import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  LucideChevronDown,
  LucideChevronLeft,
  LucideMonitor,
  LucideMoon,
  LucideSun,
  LucideSunMoon,
} from "lucide-react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";

type ProjectHeaderProps = {
  projectId: string;
};

const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOneProject.queryOptions({
      id: projectId,
    })
  );

  const { theme, setTheme } = useTheme();

  const toggleTheme = (value: string) => {
    setTheme(value);
  };

  return (
    <header className="p-2 flex justify-between items-center border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75
            transition-opacity pl-2"
          >
            <Image src="/bag.png" alt="bag" width={30} height={30} />
            <span className="text-sm font-medium pl-2">{project?.name}</span>
            <LucideChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
          <DropdownMenuItem asChild>
            <Link href="/projects">
              <LucideChevronLeft />
              <span>Go to Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <LucideSunMoon className="size-4 text-muted-foreground" />
              <span>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={toggleTheme}
                >
                  <DropdownMenuRadioItem
                    value="light"
                    className="flex items-center justify-start gap-2 pl-2"
                  >
                    <LucideSun className="size-4 text-muted-foreground" />
                    <span>Light</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="dark"
                    className="flex items-center justify-start gap-2 pl-2"
                  >
                    <LucideMoon className="size-4 text-muted-foreground" />
                    <span>Dark</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="system"
                    className="flex items-center justify-start gap-2 pl-2"
                  >
                    <LucideMonitor className="size-4 text-muted-foreground" />
                    <span>System</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export { ProjectHeader };
