import { appConfig } from "@/config/app.config";
import Script from "next/script";

const GoogleTagManager = () => {
  if (!appConfig?.analyticsConfig?.GTM) {
    return null; // If GTM is not enabled, return null
  }

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process?.env?.GTMId}');
            `,
        }}
      />

      {/* runs when javascript is disabled */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${process?.env?.GTMId}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        }}
      />
    </>
  );
};

export default GoogleTagManager;
