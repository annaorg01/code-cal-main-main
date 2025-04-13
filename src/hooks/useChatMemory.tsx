
import { useState, useEffect } from 'react';
import { Message } from '@/services/aiService';

// Hook to manage chat memory persistence
export function useChatMemory() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load chat history from localStorage on initial mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chat_history');
      if (savedHistory) {
        // Parse stored history and fix dates (they're stored as strings)
        const parsedHistory = JSON.parse(savedHistory).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setChatHistory(parsedHistory);
      } else {
        // Initialize with default welcome message if no history exists
        setChatHistory([{
          id: "1",
          content: "היי אני קוד-כל המתכנת האישי שלך ברשויות המקומיות",
          role: "assistant",
          timestamp: new Date(),
        }]);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Fall back to default message on error
      setChatHistory([{
        id: "1",
        content: "היי אני קוד-כל המתכנת האישי שלך ברשויות המקומיות",
        role: "assistant",
        timestamp: new Date(),
      }]);
      setIsLoaded(true);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && chatHistory.length > 0) {
      try {
        localStorage.setItem('chat_history', JSON.stringify(chatHistory));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [chatHistory, isLoaded]);

  // Add a message to history
  const addMessage = (message: Message) => {
    setChatHistory(prev => [...prev, message]);
  };

  // Add multiple messages to history
  const addMessages = (messages: Message[]) => {
    setChatHistory(prev => [...prev, ...messages]);
  };

  // Clear chat history
  const clearHistory = () => {
    setChatHistory([{
      id: "1",
      content: "היי אני קוד-כל המתכנת האישי שלך ברשויות המקומיות",
      role: "assistant",
      timestamp: new Date(),
    }]);
  };

  return {
    chatHistory,
    addMessage,
    addMessages,
    clearHistory,
    isLoaded
  };
}
