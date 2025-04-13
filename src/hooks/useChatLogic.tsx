
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateAIResponse, Message, CodeBlock } from "@/services/aiService";
import { useChatMemory } from "./useChatMemory";

type UseChatLogicProps = {
  onRunCode?: (html: string, css: string, js: string) => void;
  // New prop to set editor content
  setEditorContent?: (content: string) => void;
};

export function useChatLogic({ onRunCode, setEditorContent }: UseChatLogicProps) {
  // Use the chat memory hook instead of local state
  const { chatHistory: messages, addMessage, clearHistory, isLoaded } = useChatMemory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [isLongWait, setIsLongWait] = useState(false);
  const { toast } = useToast();

  // Effect to track long loading times
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLoading && loadingStartTime) {
      timer = setTimeout(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - loadingStartTime;
        
        // If it's been more than 10 seconds, show enhanced loader
        if (elapsedTime > 10000) {
          setIsLongWait(true);
        }
      }, 10000);
    } else {
      setIsLongWait(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, loadingStartTime]);

  const extractAndApplyCode = useCallback((codeBlocks: CodeBlock[]) => {
    if (!codeBlocks || codeBlocks.length === 0 || !onRunCode) return;
    
    console.log("Extracting HTML code from blocks:", codeBlocks);
    
    // Find the first HTML code block or use the first code block as HTML
    const htmlBlock = codeBlocks.find(block => 
      block.language.toLowerCase() === "html"
    ) || codeBlocks[0];
    
    if (htmlBlock) {
      // Log the HTML code being applied
      console.log("Applying HTML code to preview:", { 
        codeLength: htmlBlock.code.length,
        codePreview: htmlBlock.code.substring(0, 100) + "..." // Log first 100 chars
      });
      
      // Ensure the code is a complete HTML document
      let finalHtml = htmlBlock.code;
      
      // If it's not a complete HTML document, wrap it
      if (!htmlBlock.code.trim().startsWith("<!DOCTYPE") && 
          !htmlBlock.code.trim().startsWith("<html")) {
        finalHtml = `<!DOCTYPE html>
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
  </style>
</head>
<body>
${htmlBlock.code}
</body>
</html>`;
      }
      
      // Apply the code to the preview
      setTimeout(() => {
        onRunCode(finalHtml, "", "");
        
        // Also update the editor content with the HTML code
        if (setEditorContent) {
          setEditorContent(finalHtml);
        }
      }, 50);
      
      return { combinedHtml: finalHtml };
    }
    
    return null;
  }, [onRunCode]);

  const handleSendMessage = async (input: string) => {
    setError(null);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    // Add to persistent chat memory
    addMessage(userMessage);
    setIsLoading(true);
    setLoadingStartTime(Date.now());

    toast({
      title: "מייצר תשובה",
      description: "המערכת עובדת על התשובה...",
    });

    try {
      
      // Generate AI response
      const aiResponse = await generateAIResponse(input);

      // Check if this is a "Fix the code" request
      if (!input.includes("Fix the HTML code syntax.")) {
          // Add to persistent chat memory
        addMessage(aiResponse);
      }
    
      
      if (aiResponse.codeBlocks && aiResponse.codeBlocks.length > 0) {
        // Extract and apply code immediately
        const result = extractAndApplyCode(aiResponse.codeBlocks);
        
        if (result) {
          // Since we can't modify the chat history directly through setMessages anymore,
          // we'll need to add the updated message with applied code blocks
          // This will be addressed in a more comprehensive way in aiService later
          
          toast({
            title: "הקוד הופעל",
            description: "הקוד שולב אוטומטית בתצוגה",
            variant: "default",
            className: "bg-green-100 border-green-200",
          });
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setError(error instanceof Error ? error.message : "אירעה שגיאה. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
      setIsLongWait(false);
    }
  };

  const clearMessages = () => {
    clearHistory();
  };

  return {
    messages,
    isLoading,
    isLongWait,
    error,
    handleSendMessage,
    clearMessages
  };
};
