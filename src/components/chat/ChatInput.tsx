
import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ isLoading, onSendMessage }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="text-xs text-muted-foreground mb-2 text-right">
        הקלד את שאלתך או בקשתך כאן
      </div>
      <div className="flex space-x-reverse space-x-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="מה תרצה ליצור היום?"
          className="resize-none bg-background"
          rows={3}
          dir="rtl"
        />
        <Button 
          onClick={handleSendMessage} 
          className="self-end hover:scale-105 transition-transform"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
