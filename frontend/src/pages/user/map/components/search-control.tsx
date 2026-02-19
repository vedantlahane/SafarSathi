import { useState, useRef, useEffect, memo } from "react";
import { useMap } from "react-leaflet";
import { Search, Loader2, X, MapPin, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { hapticFeedback } from "@/lib/store";

interface SearchControlProps {
    onSelectDestination: (name: string, lat: number, lng: number) => void;
}

function SearchControlInner({ onSelectDestination }: SearchControlProps) {
    const map = useMap();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Array<{ name: string; lat: string; lon: string; type?: string }>>([]);
    const [showResults, setShowResults] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const handleSearch = async (q: string) => {
        if (!q.trim()) { setResults([]); setShowResults(false); return; }
        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", Assam, India")}&limit=6&addressdetails=1`);
            const data = await res.json();
            setResults(data.map((d: { display_name: string; lat: string; lon: string; type?: string }) => ({
                name: d.display_name.split(",").slice(0, 3).join(", "), lat: d.lat, lon: d.lon, type: d.type,
            })));
            setShowResults(true);
        } catch { /* silent */ } finally { setLoading(false); }
    };

    const selectResult = (r: { name: string; lat: string; lon: string }) => {
        hapticFeedback("light");
        const lat = parseFloat(r.lat); const lng = parseFloat(r.lon);
        map.flyTo([lat, lng], 15, { duration: 1.5 });
        onSelectDestination(r.name, lat, lng);
        setShowResults(false); setQuery(""); setResults([]);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShowResults(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="absolute top-4 left-4 right-4 z-[1000]">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" value={query}
                    onChange={(e) => { setQuery(e.target.value); handleSearch(e.target.value); }}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    placeholder="Search places, landmarks..."
                    className="pl-12 pr-12 h-14 rounded-2xl bg-white/95 backdrop-blur-lg shadow-xl border-0 text-base" />
                {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />}
                {query && !loading && (
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100"
                        onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}>
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                )}
            </div>
            {showResults && results.length > 0 && (
                <Card className="mt-2 shadow-xl border-0 overflow-hidden rounded-2xl">
                    <CardContent className="p-0 max-h-[300px] overflow-auto">
                        {results.map((r, i) => (
                            <button key={`search-${i}-${r.lat}-${r.lon}`} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b last:border-0" onClick={() => selectResult(r)}>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
                                <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{r.name}</p>{r.type && <p className="text-xs text-muted-foreground capitalize">{r.type}</p>}</div>
                                <ChevronUp className="h-4 w-4 text-muted-foreground rotate-90" />
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export const SearchControl = memo(SearchControlInner);
