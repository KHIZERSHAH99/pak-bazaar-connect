import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SiteMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SiteMetadata: React.FC<SiteMetadataProps> = ({
  title = "PakMandi - Pakistan's Leading B2B Marketplace",
  description = "Connect with verified wholesalers and retailers across Pakistan. Find quality products, compare prices, and grow your business on Pakistan's most trusted B2B platform.",
  keywords = "Pakistan B2B marketplace, wholesale trade Pakistan, Pakistani suppliers, retailers Pakistan, business-to-business Pakistan, trade platform Pakistan, wholesale products Pakistan",
  image = "/og-image.png",
  url = "https://pakmandi.com"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="PakMandi" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="PakMandi" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Geo tags for Pakistan */}
      <meta name="geo.region" content="PK" />
      <meta name="geo.country" content="Pakistan" />
      <meta name="geo.placename" content="Pakistan" />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1B5E20" />
      
      {/* Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "PakMandi",
          "description": "Pakistan's leading B2B marketplace connecting wholesalers and retailers",
          "url": "https://pakmandi.com",
          "logo": "https://pakmandi.com/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+92-314-9388513",
            "contactType": "customer service",
            "areaServed": "PK",
            "availableLanguage": "en"
          },
          "areaServed": {
            "@type": "Country",
            "name": "Pakistan"
          },
          "sameAs": [
            "https://facebook.com/pakmandi",
            "https://twitter.com/pakmandi",
            "https://linkedin.com/company/pakmandi"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SiteMetadata;