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
    console.log('UniversalHilTopBanner: Component mounted');
    
    if (containerRef.current && typeof window !== 'undefined') {
      console.log('UniversalHilTopBanner: Container available, initializing scripts');
      
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      // Create script elements with proper initialization
      const scripts = [
        {
          src: "//euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg",
          init: "(function(euun){console.log('Loading HilTop script 1');var d=document,s=d.createElement('script'),l=d.scripts[d.scripts.length-1];s.settings=euun||{};s.src='//euphoric-square.com/bmX.VJs/dfGNlJ0nYeWuck/ze-mr9kuqZMUblxkCPETnYN1NNWT/cyyZMnj/gVt/NDjCUX1ANdzoIhy/O_Qg';s.async=true;s.referrerPolicy='no-referrer-when-downgrade';l.parentNode.insertBefore(s,l);})({});"
        },
        {
          src: "//euphoric-square.com/bbXtV.sJdkGYlg0/YMWMcL/WeBmb9-uPZbUclVkCPWT/YD1iN/Txc/y/NkzsArtANujxU/1/NMz/II3PMXQ_",
          init: "(function(nob){console.log('Loading HilTop script 2');var d=document,s=d.createElement('script'),l=d.scripts[d.scripts.length-1];s.settings=nob||{};s.src='//euphoric-square.com/bbXtV.sJdkGYlg0/YMWMcL/WeBmb9-uPZbUclVkCPWT/YD1iN/Txc/y/NkzsArtANujxU/1/NMz/II3PMXQ_';s.async=true;s.referrerPolicy='no-referrer-when-downgrade';l.parentNode.insertBefore(s,l);})({});"
        },
        {
          src: "//euphoric-square.com/bEXPVqs/d.GFl/0NYIWUc-/_eqmC9KuFZfUMlwkCPWT/Y/1LNfTJcdz/MJDaAttxNLjcUM1xN/zPM/wiMJQQ",
          init: "(function(qh){console.log('Loading HilTop script 3');var d=document,s=d.createElement('script'),l=d.scripts[d.scripts.length-1];s.settings=qh||{};s.src='//euphoric-square.com/bEXPVqs/d.GFl/0NYIWUc-/_eqmC9KuFZfUMlwkCPWT/Y/1LNfTJcdz/MJDaAttxNLjcUM1xN/zPM/wiMJQQ';s.async=true;s.referrerPolicy='no-referrer-when-downgrade';l.parentNode.insertBefore(s,l);})({});"
        },
        {
          src: "//euphoric-square.com/b.X/V/sPdUGol/0tY/Wxcl/TeCmq9HuxZYUil-kMPFTdYe1kNwT/cdzlMaTVAJtxNxj/Uw1nN/zUMjxiMGQo",
          init: "(function(qym){console.log('Loading HilTop script 4');var d=document,s=d.createElement('script'),l=d.scripts[d.scripts.length-1];s.settings=qym||{};s.src='//euphoric-square.com/b.X/V/sPdUGol/0tY/Wxcl/TeCmq9HuxZYUil-kMPFTdYe1kNwT/cdzlMaTVAJtxNxj/Uw1nN/zUMjxiMGQo';s.async=true;s.referrerPolicy='no-referrer-when-downgrade';l.parentNode.insertBefore(s,l);})({});"
        }
      ];
      
      scripts.forEach((scriptConfig, index) => {
        setTimeout(() => {
          try {
            console.log(`Executing HilTop script ${index + 1}`);
            // Execute the initialization script
            eval(scriptConfig.init);
            console.log(`HilTop script ${index + 1} executed successfully`);
          } catch (error) {
            console.error(`Error loading HilTop script ${index + 1}:`, error);
          }
        }, index * 500);
      });
      
      // Check for ad content after scripts load
      setTimeout(() => {
        if (containerRef.current) {
          const hasContent = containerRef.current.children.length > 1 || 
                           containerRef.current.innerHTML.includes('script') ||
                           containerRef.current.innerHTML.includes('iframe');
          console.log('UniversalHilTopBanner: Ad content check:', hasContent);
          console.log('Container HTML:', containerRef.current.innerHTML);
        }
      }, 3000);
    } else {
      console.log('UniversalHilTopBanner: No container or window not available');
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`universal-hiltop-banner ${className}`}
      style={{
        width: '100%',
        height: 'auto',
        minHeight: '100px',
        position: 'relative',
        display: 'block',
        backgroundColor: '#f8f9fa',
        border: '1px dashed #dee2e6',
        borderRadius: '4px',
        ...style
      }}
    >
      {/* Fallback content while ads load */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100px',
        color: '#6c757d',
        fontSize: '14px'
      }}>
        Loading Advertisement...
      </div>
    </div>
  );
};

export default UniversalHilTopBanner;