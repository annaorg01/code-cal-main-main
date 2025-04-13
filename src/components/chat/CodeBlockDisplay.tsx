
import React, { useState } from "react";
import { Code, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CodeBlock } from "@/services/aiService";
import Preview from "../Preview";

interface CodeBlockDisplayProps {
  codeBlock: CodeBlock;
  onApplyCode: (codeBlock: CodeBlock) => void;
  autoApplied?: boolean;
  onFixCode?: (message: string) => void;
}

const CodeBlockDisplay = ({ codeBlock, onApplyCode, autoApplied = false, onFixCode }: CodeBlockDisplayProps) => {
  const handleApplyCode = () => {
    console.log("Button clicked - applying code:", codeBlock.language);
    onApplyCode(codeBlock);
  };
  
  return (
    <div className="mr-8 ml-4 animate-fade-in">
      <div className="bg-secondary/20 rounded-lg p-3 border border-secondary/30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-reverse space-x-2">
            <Code className="h-4 w-4" />
            <span className="text-xs font-mono text-muted-foreground">
              {codeBlock.language}
            </span>
          </div>
          <div className="flex items-center space-x-reverse space-x-2">
            {autoApplied ? (
              <div className="text-xs flex items-center text-green-600">
                <Check className="h-3 w-3 ml-1" />
                <span>הקוד הופעל אוטומטית</span>
              </div>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="text-xs flex items-center h-7 bg-green-600 hover:bg-green-700"
                onClick={handleApplyCode}
              >
                <Play className="h-3 w-3 ml-1" />
                <span>הפעל קוד</span>
              </Button>
            )}
          </div>
        </div>
        <pre className="bg-background p-2 rounded text-xs font-mono overflow-x-auto">
          <code>{codeBlock.code}</code>
        </pre>
      </div>
      {codeBlock.language == 'html' &&(
         <Preview html={codeBlock.code} onFixCode={onFixCode} css="" javascript=""/>
      )}
    </div>
  );
};

export default CodeBlockDisplay;
