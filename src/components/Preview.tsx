
import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewProps {
  html: string;
  css: string;
  javascript: string;
  onFixCode?: (message: string) => void; // Optional prop for fixing code
}

const Preview = ({ html, onFixCode, key }: PreviewProps & { key?: number }) => {
  const [hasSyntaxError, setHasSyntaxError] = useState(false);
  const tagRegex = /<[^>]*>/g; // Regex to match HTML tags
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    console.log("Preview component received HTML:", { 
      htmlExists: !!html,
      htmlLength: html ? html.length : 0,
      htmlSample: html ? html.substring(0, 50) + "..." : "none" 
    });
    
    if (!iframeRef.current) {
      console.error("iframeRef.current is null");
      return;
    }

     // Check for syntax errors after receiving new HTML
    if (html) {
      const tags = html.match(tagRegex);
      const unclosedTags = tags ? tags.filter((tag, i, arr) => {
        const closingTag = `</${tag.slice(1)}`;
        return tag[1] !== '/' && !arr.slice(i + 1).includes(closingTag);
      }) : [];

      if (unclosedTags.length > 0) {
        console.error("Syntax errors found in HTML:", unclosedTags);
        setHasSyntaxError(true);
      } else {
        setHasSyntaxError(false);
      }
    }
    
    if (!html || html.trim() === '') {
      console.warn("Empty HTML received in Preview component");
      return;
    }
    
    // Immediate rendering with safety measures
    try {
      const iframe = iframeRef.current;
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.error('Cannot access iframe document');
        return;
      }
      
      console.log("Updating iframe content");
      
      // Clear existing content and write new HTML
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      
      // Add event listeners for interaction within iframe
      setTimeout(() => {
        try {
          // Make buttons work by adding sandbox attribute support
          iframe.setAttribute('sandbox', 'allow-scripts allow-modals allow-forms allow-same-origin allow-popups');
          
          // Try re-executing any inline scripts
          const scripts = iframeDoc.querySelectorAll('script');
          scripts.forEach(oldScript => {
            const newScript = iframeDoc.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode?.replaceChild(newScript, oldScript);
          });
          
          console.log("Scripts re-executed in iframe");
        } catch (err) {
          console.error("Error adding event handlers to iframe:", err);
        }
      }, 100);
      
      console.log("Preview updated successfully:", { 
        htmlLength: html.length,
        htmlPreview: html.substring(0, 100) + "..." // Log first 100 chars for debugging
      });
    } catch (e) {
      console.error('Error rendering preview:', e);
      console.error(e);
    }
  }, [html]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-background' : 'w-full h-full'} flex flex-col`}>
      <div className="bg-secondary p-2 rounded-t-md flex items-center justify-between">
        <div className="flex space-x-reverse space-x-1 ml-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
          <div className="text-xs text-center flex-1 font-mono">תצוגה מקדימה</div>
          {hasSyntaxError && onFixCode && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 mr-2 w-auto"
              onClick={() => onFixCode("Fix the HTML code syntax.")}>
              Fix the code
            </Button>
          )}
          {onFixCode && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 mr-2 w-auto"
              onClick={() => onFixCode("Please make my UI beautiful and try to use the latest data.")}>פרומפט חכם</Button>
          )}
          {onFixCode && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 mr-2 w-auto"
              onClick={() => onFixCode("Please make my UI beautiful and try to use the latest data.")}>פרומפט חכם</Button>
          )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-6 w-6" 
          onClick={toggleFullScreen}
        >
          {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 bg-white rounded-b-md overflow-hidden">
        <iframe
          title="preview"
          ref={iframeRef}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; xr-spatial-tracking"
        />
      </div>
    </div>
  );
};

export default Preview;
