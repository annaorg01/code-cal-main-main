
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface HeaderProps {
  toggleChat: () => void;
  showChat: boolean;
}

const Header = ({ toggleChat, showChat }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b">
      <div className="flex items-center space-x-2">
        <img 
          src="https://www.mashcal.co.il/media/ha3i2yy4/website.svg?v=1dba221cf85bb30" 
          alt="MASHCAL Logo" 
          className="h-8 ml-2" 
        />
        <h1 className="text-xl font-bold">קוד-כל</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleChat}
          className="flex items-center space-x-2 hover:scale-105 transition-transform"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{showChat ? "הסתר צ׳אט" : "הצג צ׳אט"}</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
