import { appConfig } from "@/config/app.config";
import Script from "next/script";

const CleverTapScript = () => {
  const clevertapAccountId = process?.env?.clevertapAccountId;
  if (!appConfig?.analyticsConfig?.cleverTap) {
    return;
  }

  return (
    <>
      <Script
        type="text/javascript"
        id="clevertap-registration"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/clevertap_sw.js', { scope: '/' })
                .then(function(reg) {
                    // registration worked
                }).catch(function(error) {
                    // registration failed
                    //console.log('Registration failed with ' + error);
                });
            }
          `,
        }}
      />
      <Script
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
          var clevertap = {event:[], profile:[], account:[], onUserLogin:[], region:'in1', notifications:[], privacy:[]};
          clevertap.account.push({"id": "${clevertapAccountId}"});
          clevertap.privacy.push({optOut: false});
          clevertap.privacy.push({useIP: true});
          (function () {
            var wzrk = document.createElement('script');
            wzrk.type = 'text/javascript';
            wzrk.async = true;
            wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/clevertap.min.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(wzrk, s);
          })();
        `,
        }}
      />
    </>
  );
};

export default CleverTapScript;
