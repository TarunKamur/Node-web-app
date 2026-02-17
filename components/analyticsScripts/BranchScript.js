import { appConfig } from "@/config/app.config";
import Script from "next/script";

const Branchio = () => {
  const branch_io_key = process?.env?.branch_io_key;
  if (!appConfig?.analyticsConfig?.branchio) {
    return;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        onLoad={() => {}}
        dangerouslySetInnerHTML={{
          __html: `
      // Load Branch
      (function(b,r,a,n,c,h,_,s,d,k){
        if(!b[n]||!b[n]._q){
          for(;s<_.length;)c(h,_[s++]);
          d=r.createElement(a);d.async=1;
          d.src="https://cdn.branch.io/branch-latest.min.js";
         
          k=r.getElementsByTagName(a)[0];
          k.parentNode.insertBefore(d,k);
          b[n]=h;
        }
      })(window,document,"script","branch",function(b,r){
        b[r]=function(){b._q.push([r,arguments])}
      },{
        _q:[],_v:1
      },
      "addListener applyCode autoAppIndex banner closeBanner closeJourney creditHistory credits data deepview deepviewCta first getCode init link logout redeem referrals removeListener sendSMS setBranchViewData setIdentity track validateCode trackCommerceEvent logEvent disableTracking qrCode".split(" "), 0);

      // Initialize Branch
      if (window.branch) {
        branch.init("${branch_io_key}", function(err, data) {
        });
      } else {
      }
    `,
        }}
      />
    </>
  );
};

export default Branchio;
