import PageLoader from "@/components/loader/page-loder.component";
import {
  getBoxId,
  getDeviceId,
  getSessionId,
} from "@/services/data-manager.service";
import { getCookie, getItemEnc, getItem } from "@/services/local-storage.service";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Plans() {
  const router = useRouter();
 let systemConfigs = getItem("systemConfigs");
 console.log(systemConfigs?.data?.configs,'//////')
  useEffect(() => {
    const ssoUrlGenerator = () => {
      let userDetails = getItemEnc("uDetails");
      let packageInfo = router.query.pi;
      let planId = router.query.planId;
      if (packageInfo) {
        packageInfo = atob(decodeURIComponent(packageInfo));
      }
      if (planId) {
        planId = atob(decodeURIComponent(planId));
      }
      let ssopp = {
        bi: getCookie("boxId") || getBoxId(),
        si: getSessionId(),
        ci: getDeviceId(),
        redirect: "home",
        validity: new Date().getTime() + 24 * 60 * 60 * 1000,
        OTTSMSID: !!userDetails?.externalUserId
          ? userDetails?.externalUserId
          : "-1",
        utm_source: "Web",
        mobile: !!userDetails?.phoneNumber
          ? userDetails?.phoneNumber?.split("-")[1]
          : "-1",
        auth_id: !!userDetails?.authToken ? userDetails?.authToken : "-1",
      };
      if (packageInfo) {
        ssopp.pi = packageInfo;
      }
      if (planId) {
        ssopp.planId = planId;
      }
      const url = encodeURI(
        btoa(
          Object.keys(ssopp)
            .map((k) => k + "===" + ssopp[k])
            .join("&&&")
        )
      );

      if (packageInfo) {
        let plans_url =
          systemConfigs?.data?.configs &&
          systemConfigs?.data?.configs?.flexiPlanRedirectionUrl
            ? systemConfigs?.data?.configs?.flexiPlanRedirectionUrl
            : `${process.env.plansUrl}/validateSession`;
        // window.open("https://plans-offers-qa.watcho.com/validateSession?ut=" + url, '_self');
        window.open(`${plans_url}?ut=${url}`, "_self");
      } else {
        let plans_url =
          systemConfigs?.data?.configs &&
          systemConfigs?.data?.configs?.flexiPlanUrl
            ? systemConfigs?.data?.configs?.flexiPlanUrl
            : `${process.env.plansUrl}/plans`;
        // window.open("https://plans-offers-qa.watcho.com/createSession?ut="+url ,'_self')
        window.open(`${plans_url}?ut=${url}`, "_self");
      }
    };
    ssoUrlGenerator();
  }, [router.query.pi]);

  return <PageLoader />;
}
