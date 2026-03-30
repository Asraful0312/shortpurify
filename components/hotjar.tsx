
'use client'; 

import Script from 'next/script';

const HotJar = () => {
  // Optional: only run in production
  if (process.env.NODE_ENV === 'production') {
    return (
      <Script
        id="hotjar-script"
        strategy="afterInteractive" // Loads the script after the page is interactive
        dangerouslySetInnerHTML={{
          __html: `
            (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:6679664,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `,
        }}
      />
    );
  }
  return null;
};

export default HotJar;
