
import { useState, useEffect } from "react";
import MonacoEditor from "./MonacoEditor";
import Preview from "./Preview";
import LanguageTabs from "./LanguageTabs";
import ResizableLayout from "./ResizableLayout";
import ChatInterface from "./ChatInterface";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";

// Default code example - just HTML now
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>קוד-כל</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f7f7f7;
      color: #333;
      direction: rtl;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { color: #2563eb; }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
    button:hover { background: #1d4ed8; }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://www.mashcal.co.il/media/ha3i2yy4/website.svg?v=1dba221cf85bb30" alt="לוגו" class="logo">
    <h1>ברוכים הבאים לקוד-כל</h1>
    <p>תוכלו לערוך את הקוד ולראות את השינויים באופן מיידי</p>
    <button id="demo-button" onclick="alert('כפתור נלחץ! 🎉')">לחצו עליי!</button>
  </div>
  
  <script>
    // Make sure all interactive elements work in the preview
    document.addEventListener('DOMContentLoaded', function() {
      const demoButton = document.getElementById('demo-button');
      if (demoButton) {
        demoButton.addEventListener('click', function() {
          alert('כפתור נלחץ! 🎉');
        });
      }
    });
  </script>
</body>
</html>`;

const CodeEditor = () => {
  const { toast } = useToast();
  const [html, setHtml] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("html");
  const [showChat, setShowChat] = useState(true);
  
  // Initialize with saved HTML or default HTML
  useEffect(() => {
    if (!html || html.trim() === '') {
      // Try to load previously generated HTML from memory
      try {
        const savedHtml = localStorage.getItem('last_generated_html');
        if (savedHtml && savedHtml.trim() !== '') {
          console.log("Loading previously generated HTML from memory");
          setHtml(savedHtml);
        } else {
          setHtml(DEFAULT_HTML);
        }
      } catch (e) {
        console.error("Error loading saved HTML:", e);
        setHtml(DEFAULT_HTML);
      }
      
      setActiveLanguage("html");
    }
  }, []);
  
  useEffect(() => {
    // Log updates to preview for debugging
    console.log("Editor content updated:", { 
      htmlLength: html.length,
      htmlPreview: html.substring(0, 100) + "..."  // Log first 100 chars
    });
  }, [html]);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const handleCodeExecution = (newHtml: string, newCss: string, newJs: string) => {
    console.log("CodeEditor.handleCodeExecution called:", { 
      htmlExists: !!newHtml,
      htmlLength: newHtml ? newHtml.length : 0,
      htmlSample: newHtml ? newHtml.substring(0, 100) + "..." : "none"
    });
    
    // Update the editor content based on what code was provided
    if (newHtml && newHtml.trim() !== "") {
      // Preserve context by saving to local storage
      try {
        localStorage.setItem('last_generated_html', newHtml);
      } catch (e) {
        console.error("Error saving generated code:", e);
      }
      
      console.log("Setting HTML in editor state");
      
      // Set the HTML content and update editor
      setHtml(newHtml);
      setActiveLanguage("html");
      
      toast({
        title: "הקוד יושם",
        description: "הקוד עודכן בעורך ובתצוגה המקדימה",
        duration: 2000,
      });
      
      console.log("handleCodeExecution complete");
    } else {
      console.warn("Empty HTML passed to handleCodeExecution");
    }
  };

  // Direct method to paste and run code
  const pasteAndRunCode = (codeString: string) => {
    if (codeString && codeString.trim() !== "") {
      // Force a state update to ensure the preview updates
      setHtml("");
      
      // Use setTimeout to ensure the state update cycle completes
      setTimeout(() => {
        setHtml(codeString);
        
        toast({
          title: "הקוד הודבק",
          description: "הקוד שהודבק הוחל על התצוגה המקדימה",
          duration: 2000,
        });
      }, 50);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    // Log that we're updating the HTML value
    console.log("Updating HTML content from editor:", {
      length: value.length,
      preview: value.substring(0, 100) + "..."
    });
    
    // Update the state with the new value and automatically run the code
    setHtml(value);
    
    // No need for additional actions as the useEffect in Preview component
    // will automatically render the updated HTML
  };

  // Handle paste from user directly  
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName !== 'TEXTAREA' && 
          document.activeElement?.tagName !== 'INPUT') {
        const pastedCode = e.clipboardData?.getData('text');
        if (pastedCode && pastedCode.includes('<!DOCTYPE html>')) {
          e.preventDefault(); // Prevent default paste behavior
          pasteAndRunCode(pastedCode);
        }
      }
    };
    
    // Add event listener for paste events
    document.addEventListener('paste', handlePaste);
    
    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Force re-render of Preview when html changes
  useEffect(() => {
    console.log("HTML state changed, forcing preview update");
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      // Force a DOM update by toggling a class
      previewContainer.classList.add('updating');
      setTimeout(() => previewContainer.classList.remove('updating'), 50);
    }
  }, [html]);

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <Header 
        toggleChat={toggleChat}
        showChat={showChat}
      />
      <div className="flex-grow overflow-hidden">
        <ResizableLayout>
          {showChat && (
            <div className="w-80">
              <ChatInterface 
                onRunCode={handleCodeExecution} 
                setEditorContent={(content: string) => {
                  console.log("Setting editor content from ChatInterface:", {
                    contentLength: content.length
                  });
                  setHtml(content);
                  setActiveLanguage("html");
                }}
              />
            </div>
          )}
          <ResizableLayout className="editor-preview-container" direction="vertical">
            <Card className="h-full flex flex-col overflow-hidden animate-fade-in">
              <LanguageTabs
                activeLanguage={activeLanguage}
                onSelectLanguage={setActiveLanguage}
              />
              <div className="flex-grow overflow-hidden">
                <MonacoEditor
                  language={activeLanguage}
                  value={html}
                  onChange={handleCodeChange}
                />
              </div>
            </Card>
            <Card className="h-full bg-white overflow-hidden animate-fade-in preview-container">
              <div className="w-full h-full overflow-hidden">
                <Preview
                  html={html}
                  css=""
                  javascript=""
                  key={html ? html.length : 0} // Force re-mount when html changes
                />
              </div>
            </Card>
          </ResizableLayout>
        </ResizableLayout>
      </div>
    </div>
  );
};

export default CodeEditor;
