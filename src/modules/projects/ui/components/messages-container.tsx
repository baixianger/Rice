import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useRef, useEffect } from "react";

type MessagesContainerProps = {
  projectId: string;
};

const MessagesContainer = ({ projectId }: MessagesContainerProps) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getManyMessages.queryOptions({
      projectId,
    })
  );

  useEffect(() => {
    const lastAssistantMessage = messages?.findLast(
      (message) => message.role === "ASSISTANT"
    );
    if (lastAssistantMessage) {
      // TODO: Set active fragment to the last assistant message's
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

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
              isActivateFragment={false}
              onFragmentClick={() => {}}
              type={message.type}
            />
          ))}
          <div ref={bottomRef} /> {/* 用于滚动到底部 */}
        </div>
      </div>
      <div className="relative p-3 pt-0">
        <div
          className="absolute -top-20 left-0 right-0 h-20
        bg-gradient-to-b from-transparent to-background/90
        pointer-events-none"
        />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};

export { MessagesContainer };
