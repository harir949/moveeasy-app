import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, coords?: {lat: number, lng: number}) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  place_id: string;
  description: string;
  matched_substrings: Array<{
    length: number;
    offset: number;
  }>;
}

export function LocationAutocomplete({ value, onChange, placeholder, className }: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock Greek locations for demo - In production, integrate with Google Places API
  const mockGreekLocations = [
    "Athens, Greece",
    "Thessaloniki, Greece", 
    "Patras, Greece",
    "Heraklion, Greece",
    "Larissa, Greece",
    "Volos, Greece",
    "Rhodes, Greece",
    "Ioannina, Greece",
    "Chania, Greece",
    "Chalcis, Greece",
    "Serres, Greece",
    "Alexandroupoli, Greece",
    "Xanthi, Greece",
    "Katerini, Greece",
    "Agrinio, Greece",
    "Kalamata, Greece",
    "Kavala, Greece",
    "Tripoli, Greece",
    "Livadeia, Greece",
    "Corinth, Greece"
  ];

  const searchLocations = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filtered = mockGreekLocations
        .filter(location => 
          location.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
        .map((location, index) => ({
          place_id: `mock_${index}`,
          description: location,
          matched_substrings: [{
            length: query.length,
            offset: location.toLowerCase().indexOf(query.toLowerCase())
          }]
        }));

      setSuggestions(filtered);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.description, { lat: 37.9838, lng: 23.7275 }); // Mock coordinates for Athens
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => value && searchLocations(value)}
          placeholder={placeholder}
          className={className}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-sm">{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}