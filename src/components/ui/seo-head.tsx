import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'PakMandi - Pakistan\'s Leading B2B Wholesale Marketplace',
  description = 'Pakistan ka sabse bara B2B wholesale marketplace. Karachi, Lahore, Islamabad aur pure Pakistan mein wholesalers aur retailers ko connect karein. Thok mein khareedein, munafa kamaein!',
  keywords = 'pakistan wholesale, b2b pakistan, thok bazar, wholesale market pakistan, karachi wholesale, lahore wholesale, islamabad wholesale, pakistani suppliers, wholesale products pakistan, bulk buying pakistan, wholesale clothing pakistan, wholesale electronics pakistan',
  image = '/pm-logo.png',
  url,
  type = 'website'
}) => {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) || 
                 document.querySelector(`meta[name="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Pakistan Geo-targeting meta tags
    updateMetaTag('geo.region', 'PK');
    updateMetaTag('geo.placename', 'Pakistan');
    updateMetaTag('geo.position', '30.3753;69.3451');
    updateMetaTag('ICBM', '30.3753, 69.3451');
    updateMetaTag('language', 'ur-PK, en-PK');
    updateMetaTag('content-language', 'ur, en');
    
    // Mobile optimization
    updateMetaTag('mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    updateMetaTag('format-detection', 'telephone=yes');

    // Open Graph tags (Pakistan focused)
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:locale', 'ur_PK');
    updateMetaTag('og:locale:alternate', 'en_PK');
    updateMetaTag('og:site_name', 'PakMandi');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@pakmandi');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Add hreflang for Pakistani languages
    const addHreflang = (lang: string, href: string) => {
      let link = document.querySelector(`link[hreflang="${lang}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };
    
    addHreflang('ur-PK', currentUrl);
    addHreflang('en-PK', currentUrl);
    addHreflang('x-default', currentUrl);

  }, [title, description, keywords, image, currentUrl, type]);

  return null;
};

export default SEOHead;
