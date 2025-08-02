import React, { useEffect, useRef } from 'react';

interface UniversalHilTopBannerProps {
  className?: string;
  style?: React.CSSProperties;
}

const UniversalHilTopBanner: React.FC<UniversalHilTopBannerProps> = ({
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined') {
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      // Create constrained container for ads
      const adContainer = document.createElement('div');
      adContainer.style.cssText = `
        position: relative !important;
        width: 100% !important;
        height: auto !important;
        overflow: hidden !important;
        display: block !important;
        margin: 0 auto !important;
        max-width: 100% !important;
      `;
      
      containerRef.current.appendChild(adContainer);
      
      // Inject scripts with containment
      const scripts = [
        "//euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg",
        "//euphoric-square.com/bbXtV.sJdkGYlg0/YMWMcL/WeBmb9-uPZbUclVkCPWT/YD1iN/Txc/y/NkzsArtANujxU/1/NMz/II3PMXQ_",
        "//euphoric-square.com/bEXPVqs/d.GFl/0NYIWUc-/_eqmC9KuFZfUMlwkCPWT/Y/1LNfTJcdz/MJDaAttxNLjcUM1xN/zPM/wiMJQQ",
        "//euphoric-square.com/b.X/V/sPdUGol/0tY/Wxcl/TeCmq9HuxZYUil-kMPFTdYe1kNwT/cdzlMaTVAJtxNxj/Uw1nN/zUMjxiMGQo"
      ];
      
      scripts.forEach((src, index) => {
        setTimeout(() => {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          script.src = src;
          script.referrerPolicy = 'no-referrer-when-downgrade';
          
          // Override any positioning attempts
          script.onload = () => {
            // Force containment after script loads
            setTimeout(() => {
              const allElements = document.querySelectorAll('*');
              allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' && !el.closest('.navbar, .toast, .modal, .dropdown')) {
                  (el as HTMLElement).style.position = 'static';
                }
              });
            }, 100);
          };
          
          adContainer.appendChild(script);
        }, index * 500); // Stagger script loading
      });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`universal-hiltop-banner ${className}`}
      style={{
        width: '100%',
        minHeight: '100px',
        position: 'relative',
        overflow: 'hidden',
        display: 'block',
        zIndex: 1,
        ...style
      }}
    />
  );
};

export default UniversalHilTopBanner;