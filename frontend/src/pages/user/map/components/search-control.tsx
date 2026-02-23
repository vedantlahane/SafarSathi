// src/pages/user/map/components/search-control.tsx
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useMap } from "react-leaflet";
import { Search, Loader2, X, MapPin, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { hapticFeedback } from "@/lib/store";
import { SEARCH_DEBOUNCE_MS } from "../constants";
import type { SearchResult } from "../types";

interface SearchControlProps {
  onSelectDestination: (name: string, lat: number, lng: number) => void;
}

function SearchControlInner({ onSelectDestination }: SearchControlProps) {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q + ", Assam, India"
        )}&limit=6&addressdetails=1`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();
      const mapped: SearchResult[] = data.map(
        (
          d: {
            place_id: number;
            display_name: string;
            lat: string;
            lon: string;
            type?: string;
            address?: Record<string, string>;
          },
          idx: number
        ) => ({
          id: `search-${d.place_id}-${idx}`,
          name: d.display_name.split(",").slice(0, 3).join(", "),
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
          type: d.type,
          address: d.address
            ? [d.address.city, d.address.state].filter(Boolean).join(", ")
            : undefined,
        })
      );
      setResults(mapped);
      setShowResults(mapped.length > 0);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => performSearch(value),
        SEARCH_DEBOUNCE_MS
      );
    },
    [performSearch]
  );

  const selectResult = useCallback(
    (r: SearchResult) => {
      hapticFeedback("light");
      map.flyTo([r.lat, r.lng], 15, { duration: 1.5 });
      onSelectDestination(r.name, r.lat, r.lng);
      setShowResults(false);
      setQuery("");
      setResults([]);
    },
    [map, onSelectDestination]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    abortRef.current?.abort();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute top-4 left-4 right-4 z-[1000]">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search places, landmarks..."
          className="pl-12 pr-12 h-14 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl border-0 text-base"
          aria-label="Search map locations"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
        )}
        {query && !loading && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>
      {showResults && results.length > 0 && (
        <Card className="mt-2 shadow-xl border-0 overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <CardContent className="p-0 max-h-[300px] overflow-auto">
            {results.map((r) => (
              <button
                key={r.id}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-colors text-left border-b border-slate-100 dark:border-slate-800 last:border-0"
                onClick={() => selectResult(r)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  {r.address && (
                    <p className="text-xs text-muted-foreground truncate">
                      {r.address}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const SearchControl = memo(SearchControlInner);