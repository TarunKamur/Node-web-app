import { appConfig } from "@/config/app.config";
import Script from "next/script";

const FlyerSDK = () => {
    if (!appConfig?.analyticsConfig?.adsFlyer) {
        return null; // If adsFlyer is not enabled, return null
    }
    
    return (
        <Script
            dangerouslySetInnerHTML={{
                __html: `
                    !function(t,e,n,s,a,c,i,o,p){t.AppsFlyerSdkObject=a,t.AF=t.AF||function(){
                    (t.AF.q=t.AF.q||[]).push([Date.now()].concat(Array.prototype.slice.call(arguments)))},
                    t.AF.id=t.AF.id||i,t.AF.plugins={},o=e.createElement(n),p=e.getElementsByTagName(n)[0],o.async=1,
                    o.src="https://websdk.appsflyer.com?"+(c.length>0?"st="+c.split(",").sort().join(",")+"&":"")+(i.length>0?"af_id="+i:""),
                    p.parentNode.insertBefore(o,p)}(window,document,"script",0,"AF","pba",{pba: {webAppId: "${process?.env?.APPS_FLYER_WEB_DEV_KEY}"}})
                `
            }}
        />
    );
};

export default FlyerSDK;
