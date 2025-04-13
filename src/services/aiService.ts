
import { toast } from "@/hooks/use-toast";

// AI Message types
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  codeBlocks?: CodeBlock[];
  context?: {
    previousCodeVersion?: string;
    codeChanges?: string[];
    userIntentions?: string[];
  };
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  applied: boolean;
}

const API_KEY = "sk-0a1073d17c8b4b1f96c4bc52cecfd492";
// DeepSeek API endpoint
const API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

// Code memory functions
const saveGeneratedCode = (code: string): void => {
  try {
    localStorage.setItem('last_generated_html', code);
  } catch (e) {
    console.error("Error saving generated code:", e);
  }
};

const getPreviouslyGeneratedCode = (): string => {
  try {
    return localStorage.getItem('last_generated_html') || '';
  } catch (e) {
    console.error("Error retrieving previous code:", e);
    return '';
  }
};

// Get chat history context for AI requests
const getChatHistoryContext = (): string => {
  try {
    const chatHistory = localStorage.getItem('chat_history');
    if (!chatHistory) return '';
    
    const history = JSON.parse(chatHistory);
    // Get last 5 messages to provide context
    const recentMessages = history.slice(-5);
    
    // Format context for the API
    return recentMessages.map((msg: any) => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
  } catch (e) {
    console.error("Error getting chat history context:", e);
    return '';
  }
};

export const generateAIResponse = async (prompt: string): Promise<Message> => {
  try {
    const cityKeywords = ["עיריית מודיעין", "עיריית מודיעין-מכבים-רעות", "מודיעין"];

    const mapKeywords = ["map", "location", "osm", "openstreetmap", "מפה"];
    const enhancedPrompt = mapKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    ) ? prompt + " please use osm as a base map" : prompt;

    if (enhancedPrompt !== prompt) {
      console.log("Prompt enhanced to:", enhancedPrompt);
    }

    // Use the enhanced prompt
    prompt = enhancedPrompt;

    console.log("Sending request to DeepSeek API...", { prompt });
    
    // Get context from previous interactions
    const previousCode = getPreviouslyGeneratedCode();
    const chatHistory = getChatHistoryContext();
    
    let systemMessage = "You are a helpful AI coding assistant for a web-based code editor. ";
    
    if (cityKeywords.some(keyword => prompt.includes(keyword))) {
      try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbwxRkDjDHn5CWvmQH7rNhLy5dA-AbRVGw73VUqdKFT2BKhVNYYKcG7CuE-ZrY-ORlyb/exec");
        const data = await response.json();
        const modiinData = JSON.stringify(data);
        systemMessage += `The following JSON provides structured data about Modiin. The JSON data: ${modiinData}\n\n`;
      } catch (error) {
        console.error("Error fetching Modiin data:", error);
        systemMessage += "There was an error retrieving data about Modiin. Please refer to general knowledge for now.\n\n";
      }
    }




    // Add code context if available
    if (previousCode) {
      systemMessage += "Here is the current HTML code the user is working with:\n\n```html\n" + 
                      previousCode + "\n```\n\n";
      systemMessage += "When generating HTML code, build upon this existing code unless the user explicitly wants to start fresh. ";
    }
    
    // Add chat history context
    if (chatHistory) {
      systemMessage += "Here is our recent conversation history for context:\n\n" + chatHistory + "\n\n";
    }
    
    systemMessage += "When asked to write code, provide complete working examples that can be directly inserted into the editor. " +
                    "Always format code blocks with markdown triple backticks and the appropriate language identifier (html, css, or javascript). " +
                    "Focus on helping users create web content using HTML, CSS, and JavaScript.";

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-coder",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      
      // Detailed error handling based on status code
      switch (response.status) {
        case 401:
          toast({
            title: "Authentication Error",
            description: "Invalid API key. Please check your DeepSeek API credentials.",
            variant: "destructive"
          });
          break;
        case 402:
          toast({
            title: "Billing Error",
            description: "Insufficient balance in your DeepSeek API account.",
            variant: "destructive"
          });
          break;
        default:
          toast({
            title: "API Request Failed",
            description: `Status: ${response.status}. Please try again later.`,
            variant: "destructive"
          });
      }

      throw new Error(`API request failed with status: ${response.status}. ${errorData?.error?.message || ''}`);
    }

    const data = await response.json();
    
    // Extract response text - adapted for DeepSeek API response format
    const responseText = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response";
    
    // Extract code blocks from markdown format with improved regex
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const codeBlocks: CodeBlock[] = [];
    
    let match;
    while ((match = codeBlockRegex.exec(responseText)) !== null) {
      // Create the code block
      const codeBlock = {
        id: `code-${Date.now()}-${codeBlocks.length}`,
        language: match[1].toLowerCase() || "javascript",
        code: match[2].trim(),
        applied: false
      };
      
      // Log extracted code block for debugging
      console.log("Extracted code block:", { 
        language: codeBlock.language,
        codePreview: codeBlock.code.substring(0, 100) + "..." 
      });
      
      // Save HTML code for future context if it's HTML
      if (codeBlock.language.toLowerCase() === 'html') {
        saveGeneratedCode(codeBlock.code);
      }
      
      codeBlocks.push(codeBlock);
    }

    // Create clean response without code blocks for display
    let cleanResponse = responseText.replace(codeBlockRegex, "").trim();
    
    const message: Message = {
      id: Date.now().toString(),
      content: cleanResponse,
      role: "assistant",
      timestamp: new Date(),
      codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
      context: {
        previousCodeVersion: previousCode || undefined,
        userIntentions: [prompt]
      }
    };

    return message;
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    toast({
      title: "Error",
      description: "Failed to generate AI response. Please check your internet connection and API settings.",
      variant: "destructive",
    });
    
    return {
      id: Date.now().toString(),
      content: "Sorry, I encountered an error while processing your request. Please try again.",
      role: "assistant",
      timestamp: new Date()
    };
  }
};
