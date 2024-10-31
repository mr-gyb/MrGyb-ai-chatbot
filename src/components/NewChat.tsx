"use client";

import { useRef, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MessageList from "./MessageList";
import TypingAnimation from "./TypingAnimation";
import MessageInput from "./MessageInput";
import { Message } from "@/types";

interface Agent {
  name: string;
  description: string;
}

export function NewChat() {
  const [selectedAgent, setSelectedAgent] = useState("Mr.GYB AI");

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Add this state
  const [isTTSEnabled, setIsTTSEnabled] = useState(false); // Add this line

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const agents: Agent[] = [
    {
      name: "Mr.GYB AI",
      description: "Your all-in-one business growth assistant",
    },
    {
      name: "CEO",
      description: "Strategic planning and business development expert",
    },
    {
      name: "COO",
      description: "Operations management specialist",
    },
    {
      name: "CHRO",
      description: "Human resources expert",
    },
    {
      name: "CTO",
      description: "Technology strategy consultant",
    },
    {
      name: "CMO",
      description: "Marketing expert",
    },
  ];

  const handleSendMessage = async (content: string) => {
    if (content.trim() === "") return;

    // setConversationStarted(true);

    const newMessage: Message = {
      id: Date.now(),
      content,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // TODO: Implement API call to OpenAI GPT
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const botMessage: Message = {
        id: Date.now(),
        content: data.message,
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Add TTS functionality here
      if (isTTSEnabled) {
        const audioResponse = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.message }),
        });

        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          audioRef.current = new Audio(audioUrl);
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      // Display error message to user
    } finally {
      setIsLoading(false);
      setIsTyping(false); // Stop typing animation
    }
  };

  const toggleTTS = () => {
    setIsTTSEnabled((prev) => {
      if (prev && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return !prev;
    });
  };

  return (
    <div className="fixed top-16 left-0 right-0 flex h-[calc(100vh-64px)] w-full flex-col bg-white">
      <div className="flex w-full items-center justify-between bg-navy-blue p-2 sm:p-4">
        <div className="flex items-center">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[180px] border-none bg-transparent text-white font-bold">
              <SelectValue placeholder="Select Agent" />
            </SelectTrigger>
            <SelectContent className="bg-white text-navy-blue">
              {agents.map((agent) => (
                <SelectItem
                  key={agent.name}
                  value={agent.name}
                  className="hover:bg-gray-100"
                >
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="bg-gold text-navy-blue hover:bg-gold/90 rounded-full flex items-center gap-2 text-xs sm:text-sm border-none"
        >
          <PlusCircle size={16} />
          New Chat
        </Button>
      </div>

      <div className="flex-grow w-full overflow-auto bg-gray-50">
        <MessageList messages={messages} />
        {isTyping && <TypingAnimation />}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isTTSEnabled={isTTSEnabled}
        toggleTTS={toggleTTS}
      />
    </div>
  );
}

export default NewChat;
