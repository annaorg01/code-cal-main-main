
import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, Code, Sparkles } from "lucide-react";

interface AdvancedLoaderProps {
  isLongWait: boolean;
}

const AdvancedLoader: React.FC<AdvancedLoaderProps> = ({ isLongWait }) => {
  const [animationStep, setAnimationStep] = useState(0);
  
  // Cycle through animation steps
  useEffect(() => {
    if (isLongWait) {
      const interval = setInterval(() => {
        setAnimationStep(prev => (prev + 1) % 3);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLongWait]);
  
  // If it's not a long wait, show the simple loader
  if (!isLongWait) {
    return (
      <div className="flex justify-start animate-fade-in">
        <div className="bg-muted p-3 rounded-lg flex items-center space-x-2 mr-4">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <div className="code-thinking text-right">
              <span className="text-sm ml-2">חושב</span>
              <span className="typing-indicator"></span>
            </div>
          </div>
          <div className="code-animation">
            <pre className="text-xs font-mono animate-pulse">
              <code className="text-green-500">{'{'}</code>
              <code className="text-blue-500">{'\n  "status": '}</code>
              <code className="text-orange-500">{"מעבד"}</code>
              <code className="text-blue-500">{',\n  "generating": '}</code>
              <code className="text-green-500">{"true"}</code>
              <code className="text-blue-500">{'\n}'}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced loader for long waits
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl shadow-lg border border-primary/20 max-w-md w-full animate-scale-in">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-20 h-20">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/60 animate-spin"></div>
            
            {/* Inner icon that changes */}
            <div className="absolute inset-0 flex items-center justify-center">
              {animationStep === 0 && <RefreshCw className="h-10 w-10 text-primary animate-pulse" />}
              {animationStep === 1 && <Code className="h-10 w-10 text-primary animate-pulse" />}
              {animationStep === 2 && <Sparkles className="h-10 w-10 text-primary animate-pulse" />}
            </div>
          </div>
          
          <h3 className="font-bold text-lg text-center">המערכת עובדת על הקוד...</h3>
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            מכיוון שהשאלה מורכבת, אנו עובדים על יצירת פתרון מושלם. תודה על הסבלנות שלך.
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{
              width: '100%',
              backgroundSize: '200% 100%',
              backgroundImage: 'linear-gradient(90deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 1) 50%, rgba(37, 99, 235, 0.3) 100%)',
              animation: 'code-building 2s linear infinite'
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedLoader;
