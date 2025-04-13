
import React from "react";
import { User, Bot } from "lucide-react";
import { Message } from "@/services/aiService";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-scale-in`}
    >
      <div
        className={`
          max-w-[80%] p-3 rounded-lg 
          ${message.role === "user" 
            ? "bg-primary text-primary-foreground ml-4" 
            : "bg-muted mr-4"
          }
        `}
      >
        <div className="flex items-center mb-1">
          {message.role === "assistant" ? (
            <Bot className="h-4 w-4 ml-2" />
          ) : (
            <User className="h-4 w-4 ml-2" />
          )}
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
