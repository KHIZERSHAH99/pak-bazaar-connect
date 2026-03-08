
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
}

interface SearchWithSuggestionsProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSuggestionsFetch?: (query: string) => Promise<SearchSuggestion[]>;
  suggestions?: SearchSuggestion[];
  className?: string;
  showClearButton?: boolean;
  debounceMs?: number;
  maxSuggestions?: number;
}

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  placeholder = "Search...",
  onSearch,
  onSuggestionsFetch,
  suggestions = [],
  className,
  showClearButton = true,
  debounceMs = 300,
  maxSuggestions = 5
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [fetchedSuggestions, setFetchedSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim() || !onSuggestionsFetch) {
        setFetchedSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const results = await onSuggestionsFetch(debouncedQuery);
        setFetchedSuggestions(results.slice(0, maxSuggestions));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setFetchedSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, onSuggestionsFetch, maxSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allSuggestions = [...suggestions, ...fetchedSuggestions]
    .slice(0, maxSuggestions)
    .filter((suggestion, index, self) => 
      self.findIndex(s => s.id === suggestion.id) === index
    );

  const handleSubmit = useCallback((searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : -1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > -1 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSubmit(allSuggestions[selectedIndex].text);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSubmit(suggestion.text);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showClearButton && query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit()}
            className="h-7 px-3"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (query.length > 0 || allSuggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary mx-auto mb-2"></div>
              <span className="text-sm font-poppins">Searching...</span>
            </div>
          )}
          
          {!loading && allSuggestions.length === 0 && query.trim() && (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              <span className="text-sm font-poppins">No suggestions found</span>
            </div>
          )}
          
          {allSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              ref={el => suggestionRefs.current[index] = el}
              className={cn(
                "px-4 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0",
                "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                selectedIndex === index && "bg-pakistani_green-50 dark:bg-pakistani_green-900/20"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center justify-between">
                <span className="font-poppins text-sm">{suggestion.text}</span>
                {suggestion.category && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-poppins">
                    {suggestion.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchWithSuggestions;
