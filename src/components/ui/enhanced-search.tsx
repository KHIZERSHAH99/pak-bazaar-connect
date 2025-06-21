
import React, { useState, useCallback } from 'react';
import SearchWithSuggestions from './search-with-suggestions';
import { getMarketplaceProducts } from '@/lib/marketplace';
import { Product } from '@/lib/types';

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onSearch,
  placeholder = "Search products, suppliers, or categories...",
  className
}) => {
  const [recentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pak-bazaar-recent-searches') || '[]');
    } catch {
      return [];
    }
  });

  const fetchSuggestions = useCallback(async (query: string) => {
    try {
      // Fetch product suggestions
      const products = await getMarketplaceProducts({
        search: query,
        limit: 3
      });

      const suggestions = [
        // Recent searches
        ...recentSearches
          .filter(search => search.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 2)
          .map(search => ({
            id: `recent-${search}`,
            text: search,
            category: 'Recent'
          })),
        
        // Product suggestions
        ...products.map((product: Product) => ({
          id: `product-${product.id}`,
          text: product.name,
          category: 'Products'
        }))
      ];

      return suggestions;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  }, [recentSearches]);

  const handleSearch = useCallback((query: string) => {
    // Save to recent searches
    const updatedSearches = [
      query,
      ...recentSearches.filter(search => search !== query)
    ].slice(0, 5);
    
    try {
      localStorage.setItem('pak-bazaar-recent-searches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }

    onSearch(query);
  }, [onSearch, recentSearches]);

  return (
    <SearchWithSuggestions
      placeholder={placeholder}
      onSearch={handleSearch}
      onSuggestionsFetch={fetchSuggestions}
      className={className}
      showClearButton={true}
      debounceMs={300}
      maxSuggestions={5}
    />
  );
};

export default EnhancedSearch;
