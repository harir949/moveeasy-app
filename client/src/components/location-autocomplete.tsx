import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, coords?: {lat: number, lng: number}) => void;
  placeholder?: string;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

export function LocationAutocomplete({ value, onChange, placeholder, className }: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (error) {
          // Ignore abort errors during cleanup
        }
      }
    };
  }, []);

  const searchPlaces = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (error) {
        // Ignore abort errors when cancelling previous requests
      }
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      // Try multiple search strategies for better results
      const searchQueries = [
        input, // Original query
      ];

      let allResults: NominatimResult[] = [];

      for (const query of searchQueries) {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '8',
          countrycodes: 'gr',
          'accept-language': 'el,en',
          dedupe: '1'
        });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${params}`,
            {
              signal: abortControllerRef.current.signal,
              headers: {
                'User-Agent': 'MoveEasy-Booking-App'
              }
            }
          ).catch(error => {
            // Handle fetch errors, especially AbortError
            if (error.name === 'AbortError') {
              return null; // Return null for aborted requests
            }
            throw error; // Re-throw other errors
          });

          if (response && response.ok) {
            const results: NominatimResult[] = await response.json();
            allResults = [...allResults, ...results];
          }
        } catch (queryError) {
          // Continue with next query if one fails (ignore abort errors)
          if (queryError instanceof Error && queryError.name !== 'AbortError') {
            console.warn('Query failed:', query, queryError);
          }
        }

        // Small delay between requests (only if not aborted)
        if (searchQueries.indexOf(query) < searchQueries.length - 1 && !abortControllerRef.current?.signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Remove duplicates based on place_id and sort by importance
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.place_id, item])).values()
      );

      const sortedResults = uniqueResults
        .filter(result => result.importance > 0.00001) // Very low threshold to include all relevant results
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10); // Limit final results

      // console.log('Search results for:', input, sortedResults); // Commented out debug logging

      setSuggestions(sortedResults);
      setShowSuggestions(true);
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Error fetching places:', error);
      setIsLoading(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(value);
    }, 300); // Debounce requests

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, searchPlaces]);

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    const coords = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    };
    
    onChange(suggestion.display_name, coords);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Format display name to be more readable
  const formatDisplayName = (displayName: string) => {
    const parts = displayName.split(',');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(',') + '...';
    }
    return displayName;
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              ref={el => suggestionRefs.current[index] = el}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
                selectedIndex === index && "bg-blue-100"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="text-sm text-gray-900">
                {formatDisplayName(suggestion.display_name)}
              </div>
              <div className="text-xs text-gray-500">
                {suggestion.type}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {value.length > 2 && !isLoading && suggestions.length === 0 && showSuggestions && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
          <div className="text-sm text-gray-600">
            No locations found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  );
}