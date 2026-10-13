import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { _ } = useLanguage();

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="gap-1.5 h-8 px-2 text-xs"
      title={isDark ? _("theme_light") : _("theme_dark")}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">{_("theme_light")}</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-500" />
          <span className="hidden sm:inline">{_("theme_dark")}</span>
        </>
      )}
    </Button>
  );
}
