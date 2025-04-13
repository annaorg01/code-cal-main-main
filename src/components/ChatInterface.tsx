
import React, { useState, useEffect, useRef, useCallback } from "react";
import ChatContainer from "./chat/ChatContainer";
import { Button } from "@/components/ui/button";


interface ChatInterfaceProps {
  onRunCode?: (html: string, css: string, js: string) => void;
  setEditorContent?: (content: string) => void;
  userPrompt?:string
}

const ChatInterface = ({
    onRunCode,
    setEditorContent,
    userPrompt,
}: ChatInterfaceProps) => {
    const [showInitialOptions, setShowInitialOptions] = useState(false);
    const [showMunicipalityOptions, setShowMunicipalityOptions] = useState(false);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [originalPrompt, setOriginalPrompt] = useState<string | undefined>(
        userPrompt
    );
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleFreeCoding = () => {
        setShowInitialOptions(false);
        setSelectedOption("freeCoding");
    };

    const handleMunicipalityInfo = () => {
        setShowInitialOptions(false);
        setShowMunicipalityOptions(true);
    };
    
    const handleStart = useCallback(() => {
        setShowInitialOptions(true);
    },[]);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
        setShowMunicipalityOptions(false);
        switch (option) {
            case "option1":
                setPreviewContent(`// Preview for Option 1`);
                break;
            case "option2":
                setPreviewContent(`// Preview for Option 2`);
                break;
            case "option3":
                setPreviewContent(`// Preview for Option 3`);
                break;
            case "option4":
                setPreviewContent(`// Preview for Option 4`);
                break;
            default:
                setPreviewContent(null);
        }
    };
    useEffect(() => {
        if(userPrompt) handleStart()
    }, [userPrompt,handleStart])
    useEffect(() => {        
        setOriginalPrompt(userPrompt);
    }, [userPrompt]);

    useEffect(() => {
        if (showInitialOptions) {
            timeoutRef.current = setTimeout(() => {
                handleFreeCoding(); // Default to free coding after timeout
            }, 10000);
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [showInitialOptions,handleFreeCoding]); useEffect(() => {
        if (selectedOption) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [selectedOption]);

    return (
        <>
            {!showInitialOptions && !selectedOption && userPrompt && (
                <Button onClick={handleStart}>Start</Button>
            )}
            {showInitialOptions && !showMunicipalityOptions && (
                <div className="flex flex-col gap-4 p-4 border rounded-md">
                    <p>Choose an option:</p>
                    <Button onClick={handleFreeCoding} className="w-full">
                        Free Coding
                    </Button>
                    <Button onClick={handleMunicipalityInfo} className="w-full">
                        Municipal Information
                    </Button>
                </div>
            )}
            {showMunicipalityOptions && (
                <div className="flex flex-col gap-4 p-4 border rounded-md">
                    <p>Select Municipal Information:</p>
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => handleOptionSelect("option1")}
                            className="w-full"
                        >
                            Option 1
                        </Button>
                        <Button
                            onClick={() => handleOptionSelect("option2")}
                            className="w-full"
                        >
                            Option 2
                        </Button>
                        <Button
                            onClick={() => handleOptionSelect("option3")}
                            className="w-full"
                        >
                            Option 3
                        </Button>
                        <Button
                            onClick={() => handleOptionSelect("option4")}
                            className="w-full"
                        >
                            Option 4
                        </Button>
                    </div>
                </div>
            )}

            {previewContent && (
                <div className="p-4 border rounded-md my-4">
                    <h3 className="text-lg font-semibold">Preview:</h3>
                    <pre className="bg-gray-100 p-2 rounded-md overflow-auto">
                        {previewContent}
                    </pre>
                </div>
            )}

            <ChatContainer
                onRunCode={onRunCode}
                setEditorContent={setEditorContent}
                prompt={
                    (selectedOption && originalPrompt) ||
                    (!showInitialOptions &&
                        selectedOption === "freeCoding" &&
                        originalPrompt)
                }
            />
        </>
    );
};
export default ChatInterface;
