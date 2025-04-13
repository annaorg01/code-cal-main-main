
import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useChatMemory } from "@/hooks/useChatMemory";
  
interface ChatHeaderProps {
  title?: string,
  onNewChat: () => void
}

const ChatHeader = ({ title = "קוד-כל - העוזר האישי שלך" ,onNewChat}: ChatHeaderProps) => {
  const { clearHistory, chatHistory } = useChatMemory();

  const handleDownloadCode = useCallback(async () => {
    // Get the last HTML code from the chat history
    const lastMessage = chatHistory.find(m=>m.codeBlocks);

    if (!lastMessage || !lastMessage.codeBlocks || lastMessage.codeBlocks.length === 0) {
      console.error("No HTML code found in chat history");
      alert('אופס! נראה שאין קוד זמין להורדה.')
      return;
    }
    const htmlCode = lastMessage.codeBlocks[0].code

    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "downloaded_code.html";
    link.click();
    URL.revokeObjectURL(url);
  }, [chatHistory]);

  return (
    <div className="flex items-center justify-between p-4 border-b" dir="rtl">
      <h2 className="font-medium text-lg">{title}</h2>
      <div className="flex space-x-2">
      
        <Button
          onClick={() => {
            if (window.confirm("האם אתה בטוח שברצונך למחוק את היסטורית השיחה?")) {
              
              clearHistory();
              
              // Reset HTML code in local storage
              try {
                localStorage.removeItem('last_generated_html');
                console.log("Cleared generated HTML from memory");
              } catch (e) {
                console.error("Error clearing HTML from memory:", e);
              }
              onNewChat()
            }        
          }}
          className="text-sm bg-transparent hover:bg-transparent  text-muted-foreground hover:text-foreground transition-colors"
          aria-label="New chat"
        >
          נקה היסטוריה
        </Button>
        <Button
          onClick={handleDownloadCode}
          className="text-sm bg-transparent hover:bg-transparent  text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Download Code"
        >
          הורד קוד
        </Button>
        
        <Button
          onClick={onNewChat}
        >+ New Chat</Button>
      </div>
    </div>
  );
};

export default ChatHeader;
