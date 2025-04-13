
import React, { useRef, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Message, CodeBlock } from "@/services/aiService";

import ChatMessage from "./ChatMessage";
import CodeBlockDisplay from "./CodeBlockDisplay";
import AdvancedLoader from "./AdvancedLoader";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isLongWait: boolean;
  error: string | null;
  onApplyCode?: (html: string, css: string, js: string) => void;
  onFixCode?: (message: string) => void;
}

const ChatMessages = ({ messages, isLoading, isLongWait, error, onApplyCode, onFixCode }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApplyCode = (codeBlock: CodeBlock) => {
    if (!onApplyCode) {
      console.error("onApplyCode function is not defined");
      return;
    }
    
    console.log("Applying code block from button click:", {
      language: codeBlock.language,
      codeLength: codeBlock.code.length,
      codePreview: codeBlock.code.substring(0, 100) + "..." // Log first 100 chars
    });
    
    // Apply the HTML code directly to the preview
    // Ensure it's a complete HTML document
    let htmlCode = codeBlock.code;
    if (!htmlCode.trim().startsWith("<!DOCTYPE") && 
        !htmlCode.trim().startsWith("<html")) {
      console.log("Wrapping code in HTML document");
      htmlCode = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>תצוגה מקדימה</title>
  <style>
    body {
      direction: rtl;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: right;
    }
    * {
      direction: inherit;
    }
  </style>
</head>
<body>
${htmlCode}
</body>
</html>`;
    }
    
    console.log("Final HTML code length:", htmlCode.length);
    
    // This will update both the preview and the editor content
    try {
      onApplyCode(htmlCode, "", "");
      console.log("Code successfully applied");
    } catch (error) {
      console.error("Error applying code:", error);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="m-4 animate-shake">
          <AlertTriangle className="h-4 w-4 ml-2" />
          <AlertDescription className="text-right">{error}</AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="flex-grow p-4 overflow-y-auto" dir="rtl">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              <ChatMessage message={msg} />

              {/* Code blocks */}
              {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                <div className="space-y-3">
                  {msg.codeBlocks.map((block, index) => (
                    <CodeBlockDisplay 
                      key={`${block.id || index}`} 
                      codeBlock={block} 
                      onApplyCode={handleApplyCode} 
                      onFixCode={onFixCode}
                      autoApplied={block.applied}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Show appropriate loader based on the loading duration */}
          {isLoading && (
            isLongWait ? <AdvancedLoader isLongWait={true} /> : <AdvancedLoader isLongWait={false} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </>
  );
};

export default ChatMessages;
