
import React, { useCallback } from "react";
import { useChatLogic } from "@/hooks/useChatLogic";

import ChatHeader from "./ChatHeader";
import { generateAIResponse } from "@/services/aiService";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface ChatContainerProps {
  onRunCode?: (html: string, css: string, js: string) => void;
  setEditorContent?: (content: string) => void;
  prompt?: string;
}

const ChatContainer = ({ onRunCode, setEditorContent }: ChatContainerProps) => {
  // Log to verify props are correctly passed
  console.log("ChatContainer received props:", {
    hasOnRunCode: !!onRunCode,
    hasSetEditorContent: !!setEditorContent
  });

  const { messages, clearMessages, isLoading, isLongWait, error, handleSendMessage } = useChatLogic({
    onRunCode,
    setEditorContent,
  });

 const handleApplyCode = useCallback((html: string, css: string, js: string) => {
    console.log("ChatContainer.handleApplyCode called:", {
      htmlLength: html.length,
      htmlSample: html.substring(0, 50) + "..."
    });

    if (onRunCode) {
      console.log("Calling onRunCode from ChatContainer");
      onRunCode(html, css, js);
    }

    if (setEditorContent) {
      console.log("Calling setEditorContent from ChatContainer");
      setEditorContent(html);
    }
  }, [onRunCode, setEditorContent]);

 
  
 
 
    const onFixCode = useCallback(async (message: string) => { // Define onFixCode callback
    // Call handleSendMessage to trigger AI code fix
    await handleSendMessage(message);
    // Directly apply the fixed code to the preview & editor
    // Assuming the AI response structure includes the fixed HTML in the last message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.codeBlocks && lastMessage.codeBlocks.length > 0) {
      // Extract HTML from the last code block
      const fixedHtml = lastMessage.codeBlocks[lastMessage.codeBlocks.length - 1].code;
      handleApplyCode(fixedHtml, "", "");
      }
  }, [messages, handleSendMessage, handleApplyCode]);
  

  const onNewChat = useCallback(() => {
    clearMessages(); // Clear messages using the clearMessages function
  }, [clearMessages]);




    return (
        <div className="flex flex-col h-full border-r bg-card animate-fade-in" dir="rtl">
            <ChatHeader onNewChat={onNewChat} />
            <ChatMessages
                messages={messages}
                isLoading={isLoading}
                isLongWait={isLongWait}
                error={error}
                onFixCode={onFixCode}
                onApplyCode={handleApplyCode}
            />
            <ChatInput isLoading={isLoading} onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatContainer;
