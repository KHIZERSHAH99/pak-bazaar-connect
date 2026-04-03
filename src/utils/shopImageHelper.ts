/**
 * Helper function to get shop image source with fallback to PakMandi logo
 * @param logo - The shop logo URL from database
 * @returns The image source URL
 */
export const getShopImageSrc = (logo?: string | null): string => {
  // If logo exists and is not a placeholder, use it
  if (logo && !logo.includes('placeholder.svg') && logo.trim() !== '') {
    // Handle both absolute and relative URLs
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    // For relative URLs, prepend the storage bucket URL if needed
    if (logo.startsWith('/')) {
      return logo;
    }
    return `/${logo}`;
  }
  
  // Use PakMandi logo as default
  return '/pm-logo.png';
};