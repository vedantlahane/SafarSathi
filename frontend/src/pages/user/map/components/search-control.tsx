// src/pages/user/map/components/search-control.tsx
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useMap } from "react-map-gl/mapbox";
import { Search, Loader2, X, MapPin, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { hapticFeedback } from "@/lib/store";
import { SEARCH_DEBOUNCE_MS } from "../constants";
import type { SearchResult } from "../types";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface SearchControlProps {
  onSelectDestination: (name: string, lat: number, lng: number) => void;
}

function SearchControlInner({ onSelectDestination }: SearchControlProps) {
  const { current: map } = useMap();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);
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
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q
        )}.json?country=in&limit=6&proximity=75.7,31.2&access_token=${MAPBOX_TOKEN}`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();
      const mapped: SearchResult[] = data.features.map(
        (f: any, idx: number) => ({
          id: `search-${f.id}-${idx}`,
          name: f.text,
          lat: f.center[1],
          lng: f.center[0],
          type: f.place_type?.[0],
          address: f.place_name.split(", ").slice(1).join(", "),
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
      map?.flyTo({ center: [r.lng, r.lat], zoom: 15, duration: 1500 });
      onSelectDestination(r.name, r.lat, r.lng);
      setShowResults(false);
      setQuery("");
      setResults([]);
      setFocused(false);
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
        setFocused(false);
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
      <motion.div 
        animate={{ 
          scale: focused ? 1.01 : 1,
          boxShadow: focused ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "0 10px 15px -3px rgba(0,0,0,0.1)"
        }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl overflow-hidden bg-white/80 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 dark:border-white/10"
      >
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${focused ? "text-primary" : "text-muted-foreground"}`} />
          <Input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (results.length > 0) setShowResults(true);
            }}
            placeholder="Search places, landmarks..."
            className="pl-12 pr-12 h-14 bg-transparent border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            aria-label="Search map locations"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
          )}
          {query && !loading && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showResults && results.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="border-t border-white/10 dark:border-white/5"
            >
              <div className="max-h-[300px] overflow-auto py-2">
                {results.map((r, i) => (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={r.id}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors text-left"
                    onClick={() => selectResult(r)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{r.name}</p>
                      {r.address && (
                        <p className="text-xs text-muted-foreground truncate">
                          {r.address}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export const SearchControl = memo(SearchControlInner);