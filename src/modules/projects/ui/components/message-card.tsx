import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageRole, Fragment, MessageType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LucideChevronRight, LucideCode2 } from "lucide-react";

// Base message type with common properties
type BaseMessageProps = {
  content: string;
  createdAt: Date;
};

type UserMessageProps = BaseMessageProps;

type AssistantMessageProps = BaseMessageProps & {
  type: MessageType;
  fragment?: Fragment;
  isActivateFragment: boolean;
  onFragmentClick: (fragment?: Fragment) => void;
};

type MessageCardProps = AssistantMessageProps &
  UserMessageProps & {
    role: MessageRole;
  };

type FragmentCardProps = {
  fragment: Fragment;
  isActivateFragment: boolean;
  onFragmentClick: (fragment?: Fragment) => void;
};

const UserMessage = ({ content, createdAt }: UserMessageProps) => {
  return (
    <div className="flex flex-col group items-end pb-4 pr-2">
      <div className="flex items-center gap-2 pr-2 mb-2">
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
        <span className="text-sm font-medium">User</span>
        <Avatar className="rounded-lg">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>User</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex">
        <Card className="rounded-lg bg-muted px-4 py-2 shadow-none max-w-[100%] break-words">
          {content}
        </Card>
      </div>
    </div>
  );
};

const AssistantMessage = ({
  content,
  fragment,
  createdAt,
  isActivateFragment,
  onFragmentClick,
  type,
}: AssistantMessageProps) => {
  return (
    <div
      className={cn(
        "flex flex-col group px-2 pb-4",
        type === "ERROR" && "text-red-700 dark:text-red-500"
      )}
    >
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Avatar className="rounded-lg">
          <AvatarImage src="/logo.png" />
          <AvatarFallback>Rice</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">Rice</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>
      <div className="flex flex-col gap-y-4 pl-8.5">
        <span>{content}</span>
        {fragment && type === "RESULT" && (
          <FragmentCard
            fragment={fragment}
            isActivateFragment={isActivateFragment}
            onFragmentClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  );
};

const FragmentCard = ({
  fragment,
  isActivateFragment,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <Button
      variant="ghost"
      disabled={isActivateFragment}
      className="flex items-start border bg-muted w-fit h-fit rounded-lg"
      onClick={() => onFragmentClick(fragment)}
    >
      <LucideCode2 className="w-4 h-4 mt-0.5" />
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium line-clamp-1">
          {fragment.title}
        </span>
        <span className="text-xs">Preview</span>
      </div>
      <LucideChevronRight className="w-4 h-4 mt-0.5" />
    </Button>
  );
};

const MessageCard = ({
  content,
  role,
  fragment,
  createdAt,
  isActivateFragment,
  onFragmentClick,
  type,
}: MessageCardProps) => {
  if (role === "ASSISTANT") {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        createdAt={createdAt}
        isActivateFragment={isActivateFragment}
        onFragmentClick={onFragmentClick}
        type={type}
      />
    );
  }
  return <UserMessage content={content} createdAt={createdAt} />;
};

export { MessageCard };
