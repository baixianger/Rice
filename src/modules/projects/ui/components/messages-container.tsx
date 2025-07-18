import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MessageCard } from "./message-card";
import { UserMessageForm } from "./message-form";
import { useRef, useEffect } from "react";
import { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./message-loading";
import { MESSAGES_POLLING_INTERVAL } from "@/lib/constants";

type MessagesContainerProps = {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
};

const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: MessagesContainerProps) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageIdRef = useRef<string | null>(null);
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getManyMessages.queryOptions(
      {
        projectId,
      },
      {
        refetchInterval: MESSAGES_POLLING_INTERVAL,
      }
    )
  );

  useEffect(() => {
    const lastAssistantMessage = messages?.findLast(
      (message) => message.role === "ASSISTANT" && message.fragment !== null
    );
    if (
      lastAssistantMessage?.fragment &&
      lastAssistantMessage.id !== lastAssistantMessageIdRef.current
    ) {
      setActiveFragment(lastAssistantMessage.fragment);
      lastAssistantMessageIdRef.current = lastAssistantMessage.id;
    }
  }, [messages, setActiveFragment]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages?.length]);

  const lastMessage = messages?.[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "USER";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages?.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragment ?? undefined} // 严格类型，fragment如果是null，需要转换为undefined
              createdAt={message.createdAt}
              isActivateFragment={message.fragment?.id === activeFragment?.id}
              onFragmentClick={() => setActiveFragment(message.fragment)}
              type={message.type}
            />
          ))}
          {isLastMessageUser && <MessageLoading />}
          <div ref={bottomRef} /> {/* 用于滚动到底部 */}
        </div>
      </div>
      <div className="relative p-3 pt-0">
        <div
          className="absolute -top-10 left-0 right-0 h-10
        bg-gradient-to-b from-transparent to-background/90
        pointer-events-none"
        />
        <UserMessageForm projectId={projectId} />
      </div>
    </div>
  );
};

export { MessagesContainer };
