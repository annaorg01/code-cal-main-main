
import { cn } from "@/lib/utils";

interface LanguageTabsProps {
  activeLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const LanguageTabs = ({
  activeLanguage,
  onSelectLanguage,
}: LanguageTabsProps) => {
  // Only include HTML tab now
  const languages = [
    { id: "html", label: "HTML" },
  ];

  return (
    <div className="flex bg-secondary rounded-t-md">
      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onSelectLanguage(lang.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeLanguage === lang.id
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageTabs;
