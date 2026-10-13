import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function LangToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLang}
      className="gap-1 font-semibold text-xs px-2 h-8 min-w-[3rem]"
    >
      <span className={lang === "en" ? "text-primary" : "text-muted-foreground"}>EN</span>
      <span className="text-muted-foreground">/</span>
      <span className={lang === "tr" ? "text-primary" : "text-muted-foreground"}>TR</span>
    </Button>
  );
}
