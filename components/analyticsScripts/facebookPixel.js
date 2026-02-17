/* eslint-disable @next/next/no-img-element */
import { appConfig } from "@/config/app.config";
import Script from "next/script";

const FacebookPixel = () => {
  if (!appConfig?.analyticsConfig?.facebook) {
    return null; // If Facebook is not enabled, return null
  }

  return (
    <>
      <Script
        id="FbPixel"
        dangerouslySetInnerHTML={{
          __html: `  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${process?.env?.fbPixelId}');
  fbq('init', '${process?.env?.fbPixelId2}');
  fbq('track', 'PageView');`,
        }}
      />
      <noscript>
        <img
          alt="fb"
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${process?.env?.fbPixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
};

export default FacebookPixel;
