import React from 'react';

interface UniversalHilTopBannerProps {
  className?: string;
  style?: React.CSSProperties;
}

const UniversalHilTopBanner: React.FC<UniversalHilTopBannerProps> = ({
  className = '',
  style = {}
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined') {
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      // Create ad script elements
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
          
          // Add script to container
          containerRef.current?.appendChild(script);
          
          // Monitor for floating ads and contain them
          script.onload = () => {
            setTimeout(() => {
              // Find any elements that might be floating and contain them
              const floatingElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
              floatingElements.forEach(el => {
                const elementSrc = (el as HTMLElement).innerHTML || '';
                if (elementSrc.includes('euphoric-square.com') || el.closest('[src*="euphoric-square.com"]')) {
                  (el as HTMLElement).style.position = 'static';
                  (el as HTMLElement).style.left = 'auto';
                  (el as HTMLElement).style.right = 'auto';
                  (el as HTMLElement).style.bottom = 'auto';
                  (el as HTMLElement).style.top = 'auto';
                }
              });
            }, 200);
          };
        }, index * 300);
      });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`universal-hiltop-banner ${className}`}
      style={{
        width: '100%',
        height: 'auto',
        minHeight: '50px',
        position: 'relative',
        display: 'block',
        ...style
      }}
    />
  );
};

export default UniversalHilTopBanner;