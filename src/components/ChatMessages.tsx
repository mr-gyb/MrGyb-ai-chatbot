"use client";

import { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollArea className="flex-1 p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex mb-4",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-2 sm:p-3",
              message.role === "user"
                ? "bg-gold text-navy-blue"
                : "bg-navy-blue text-white"
            )}
          >
            <p className="text-sm sm:text-base">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
}
