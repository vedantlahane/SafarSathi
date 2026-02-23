import { memo } from "react";
import { Globe, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Language selector placeholder — currently English only.
 * Shows "Coming Soon" badge for future multi-language support.
 */
function LanguageSelectorInner() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Language</div>
                <div className="text-xs text-muted-foreground">English</div>
            </div>
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                Coming Soon
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
        </div>
    );
}

export const LanguageSelector = memo(LanguageSelectorInner);
