"use client";

import { useRef, useState } from "react";
import {
  Send,
  //   ChevronDown,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  Folder,
  Mic,
  Video,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import MessageList from "./MessageList";
import TypingAnimation from "./TypingAnimation";
import MessageInput from "./MessageInput";
import { Message } from "@/types";
// interface Message {
//   role: "user" | "assistant";
//   content: string;
// }

interface Agent {
  name: string;
  description: string;
}

export function NewChat() {
  //   const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Mr.GYB AI");
  //   const [messages, setMessages] = useState<Message[]>([]);
  //   const fileInputRef = useRef<HTMLInputElement>(null);
  //   const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Add this state
  const [isTTSEnabled, setIsTTSEnabled] = useState(false); // Add this line
  //   const [conversationStarted, setConversationStarted] = useState(false);
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
    setIsTyping(true); // Start typing animation

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
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-navy-blue p-2 sm:p-4">
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
          {/* <ChevronDown className="text-white ml-2" size={16} /> */}
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

      {/* Chat Messages */}
      {/* <ScrollArea className="flex-1 p-4 space-y-4">
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
      </ScrollArea> */}

      <div className="flex-grow overflow-auto bg-gray-50">
        <MessageList messages={messages} />
        {isTyping && <TypingAnimation />} {/* Add this line */}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isTTSEnabled={isTTSEnabled}
        toggleTTS={toggleTTS}
      />

      {/* Input Area
      <div className="p-2 sm:p-4 border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-full">
          <div className="flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-navy-blue"
            >
              <Camera size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-600 hover:text-navy-blue"
            >
              <ImageIcon size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-navy-blue"
            >
              <Folder size={16} />
            </Button>
          </div>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Message"
            className="flex-grow bg-transparent border-none focus:ring-0 text-navy-blue text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2"
          />

          <div className="flex items-center space-x-1 sm:space-x-2 px-1 sm:px-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-navy-blue"
            >
              <Mic size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-navy-blue"
            >
              <Headphones size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-navy-blue"
            >
              <Video size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSendMessage}
              className="text-navy-blue hover:text-blue-600"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) console.log("File selected:", file.name);
        }}
      /> */}
    </div>
  );
}

export default NewChat;
