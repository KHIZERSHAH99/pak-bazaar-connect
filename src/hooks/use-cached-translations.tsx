
import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Translation cache with expiration
const translationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface UseCachedTranslationsProps {
  namespace?: string;
  preload?: string[];
}

export const useCachedTranslations = ({ 
  namespace = 'common', 
  preload = [] 
}: UseCachedTranslationsProps = {}) => {
  const { language, t } = useLanguage();

  // Memoized translation function with caching
  const cachedT = useMemo(() => {
    const cacheKey = `${language}-${namespace}`;
    const cached = translationCache.get(cacheKey);
    const now = Date.now();

    // Return cached version if still valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    // Create new translation function
    const translationFunction = (key: string, options?: any) => {
      const translationKey = namespace ? `${namespace}.${key}` : key;
      return t(translationKey, options);
    };

    // Preload common translations
    const preloadedTranslations = preload.reduce((acc, key) => {
      acc[key] = translationFunction(key);
      return acc;
    }, {} as Record<string, string>);

    const result = {
      t: translationFunction,
      preloaded: preloadedTranslations
    };

    // Cache the result
    translationCache.set(cacheKey, {
      data: result,
      timestamp: now
    });

    return result;
  }, [language, namespace, t, preload]);

  return cachedT;
};

// Clear cache when language changes
export const clearTranslationCache = () => {
  translationCache.clear();
};
