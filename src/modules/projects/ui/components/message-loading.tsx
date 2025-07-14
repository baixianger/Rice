import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

const ShimmerMessages = () => {
  const messages = [
    "Thinking...",
    "Loading...",
    "Generating...",
    "Analyzing your request...",
    "Building your Website...",
    "Crafting component...",
    "Optimizing layout...",
    "Adding final touches...",
    "Almost ready...",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-base text-muted-foreground animate-pulse">
        {messages[currentMessageIndex]}
      </span>
    </div>
  );
};

export const MessageLoading = () => {
  return (
    <div className="flex flex-col group px-2 pb-4">
      <div className="flex items-center gap-2 pl-2 mb-2 animate-pulse">
        <Avatar className="rounded-lg">
          <AvatarImage src="/bowl.png" />
          <AvatarFallback>Rice</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">Rice</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(new Date(), "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>
      <div className="flex flex-col gap-y-4 pl-8.5">
        <ShimmerMessages />
      </div>
    </div>
  );
};
