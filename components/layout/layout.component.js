/* eslint-disable react/jsx-no-useless-fragment */
import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { actions, useStore } from "@/store/store";
import {
  validateSession,
  getNewSession,
  checkLocation,
  setNewSessionId,
  setnewBoxId,
  unAuthorisedHandler,
  getBoxId,
} from "@/services/data-manager.service";
import {
  checkSystemConfig,
  checkSystemFeature,
  getTemplatesList,
  checkUserLogin,
  isloggedinCheck,
  getTemplateData,
  getNewConfigdata,
  checkSystemLanguages,
  checkActivePack,
  setUserDetails,
} from "@/services/user.service";
import { getPagePath, getQueryParams } from "@/services/utility.service";
import useUserPackagesUpdate from "@/hooks/useUserPackagesUpdate";

import AcceptCookies from "@/components/acceptCookies/acceptCookies.component";

import dynamic from "next/dynamic";

import { appConfig } from "@/config/app.config";
import usePostApiMutate from "@/hooks/usePostApidata";
import useGetApiMutate from "@/hooks/useGetApidata";
import {
  AnalyticsnotificationSetup,
  initializeAnalytics,
} from "@/services/analytics.service";
import {
  getItem,
  getItemDirect,
  setItem,
  setItemDirect,
  clearStorage,
  deleteItem,
  getNookie,
  setNookie,
} from "../../services/local-storage.service";
import PageLoader from "../loader/page-loder.component";

const Header = dynamic(() => import("@/components/header/header.component"));
const VestaHeader = dynamic(
  () => import("@/components/header-vesta/header.component")
);
const DynamicFooter = dynamic(
  () => import("../footers/dynamicFooter.component")
);

function Layout(props) {
  const {
    state: { PageData, ThemeColor },
    dispatch,
  } = useStore();
  const router = useRouter();
  const [pagePath, setPagePath] = useState({});
  const [isSSOUser, setisSSOUser] = useState(false);
  const { mutate: mutatePostData, data: apiResponse } = usePostApiMutate();
  const { mutate: mutatedTokenSso, data: tokenssoApi } = useGetApiMutate();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const { updateActivePacakges } = useUserPackagesUpdate();
  const { mutate: mutatePostProfileSelection, data: apiResponseProfile } =
    usePostApiMutate();
  const [isLandingSso, setisLandingSso] = useState(false);
  const { mutate: mutateGetUData, data: apiUResponse } = useGetApiMutate();
  const [isSsogetUserDetails, setisSsogetUserDetails] = useState(false);
  let staticpaths = [
    "signup",
    "signin",
    "forget-passwrod",
    "profiles/",
    "change-password",
    "forgot-password",
    "set-password",
    "profiles/select-user-profile",
    "profiles/update-user-profile",
    "profiles/view-restrictions",
    "profiles/parental-controls",
    "profiles/add-your-profile",
    "profiles/add-profile-name",
    "profiles/image-upload",
    "profiles/profile-lock",
    "redeem",
    "activate/device",
    "delete-account",
    "openlink",
    "myaccount",
    "plans/subscribe",
    "buy/payment-success",
    "buy/payment-status",
    "languages",
    "genre",
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 991) {
        staticpaths.push("profiles/create-user-profile");
      } else {
        staticpaths = staticpaths.filter(
          (e) => e != "profiles/create-user-profile"
        );
      }
    }
  }, []);
  const footerStaticpaths = [
    ...staticpaths,
    "shorts",
    "support",
    "support/about-us",
    "support/terms",
    "support/swag-terms",
    "support/privacy-policy",
    "support/contact-us",
    "support/cookie-policy",
    "support/cancellation-policy",
    "support/refund-policy",
    "support/faq",
    "support/help-center",
    "support/grievance",
    "support/compliance",
    "support/content-guidelines",
  ];

  const acceptUnknowUrlLng = [
    // "profiles/update-user-profile",
    "profiles/view-restrictions",
    "activate/device",
  ];

  async function init() {
    // setlocation
    const _loc = await checkLocation();
    if (_loc) dispatch({ type: actions.Location, payload: _loc });

    if (validateSession()) {
      // session
      const _sec = await validateSession();
      if (_sec) dispatch({ type: actions.Session, payload: _sec });
      // system config
      const _SC = await checkSystemConfig();
      if (_SC) dispatch({ type: actions.SystemConfig, payload: _SC });
      // user login
      const _UserLogin = await isloggedinCheck();
      if (!!_UserLogin || !!isSSOUser) {
        const _UD = await checkUserLogin();
        if (_UD) dispatch({ type: actions.userDetails, payload: _UD });
      }
      if (!!_UserLogin || !!isSSOUser) {
        const _AP = await checkActivePack();
        if (_AP) dispatch({ type: actions.ActivePackages, payload: _AP?.data });
        if (_AP.expiry < new Date().getTime()) {
          updateActivePacakges();
        }
      }
      // system feature
      const _SF = await checkSystemFeature();
      if (_SF) dispatch({ type: actions.SystemFeature, payload: _SF });

      // static language
      const _SL = await checkSystemLanguages();
      if (_SL) dispatch({ type: actions.SystemLanguages, payload: _SL });

      // templatesData
      getTemplatesList();
    } else {
      const _SCDATA = await getNewSession();
      if (_SCDATA) {
        dispatch({ type: actions.Session, payload: _SCDATA });
        // system config
        const _SC = await checkSystemConfig();
        if (_SC) dispatch({ type: actions.SystemConfig, payload: _SC });
        // system feature
        const _SF = await checkSystemFeature();
        if (_SF) dispatch({ type: actions.SystemFeature, payload: _SF });

        // static language
        const _SL = await checkSystemLanguages();
        if (_SL) dispatch({ type: actions.SystemLanguages, payload: _SL });

        // templatesData
        getTemplateData();
      }
    }
  }

  async function ssoInit() {
    setisSSOUser(true);
    const pPath = router.asPath;
    const up = getQueryParams(pPath);
    const token = getItem("sessionId");
    if (token != undefined && up.si != token) {
      clearStorage();
    }
    console.log(up);
    // if (!!up.coi && !!up.rn && !!up.chi) {
    setItem("channel-id-order-summary", up?.chi || -1);
    setItem("content-id-order-summary", up?.coi || -1);
    setItem("rail-name", up?.rn || -1);
    // }
    if (!!up.si && !!up.bi) {
      setItem("isUtuser", true);
      setItem("boxId", up.bi);
      setnewBoxId(up.bi);
      setItem("sessionId", up.si);
      setNewSessionId(up.si);
      setItem(
        "profile-expiry-time",
        (new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toString()
      );
      setItem("isloggedin", true);
      const cUserData = getNookie("user-info") || {};
      const newUserData = {
        ...cUserData,
        expiryTime: new Date().getTime() + appConfig.profile.expiry * 1000,
        isLoggedIn: true,
        isUtUser: true,
      };
      setNookie("user-info", newUserData);
    }
    if (up["theme"] == "black" || up["theme"] == "white") {
      dispatch({ type: actions.ThemeColor, payload: up["theme"] });
    }
    if (up.ci) {
      setItem("clientId", up.ci);
    }
    if (up.validity) {
      setItem("utUserValidity", up.validity);
    } else {
      deleteItem("utUserValidity");
    }
    if (up.av) {
      setItem("app-version", up.av);
    }
    if (up.from) {
      setItem("from", up.from);
    }
    if (up.redirect) {
      setTimeout(() => {
        router.push(`/${up.redirect}`);
      }, 1000);
    }
    if (up.lang) {
      handleLanguageUpdate(up.lang.toLowerCase());
      setSelectedLanguage(up.lang.toLowerCase());
    }
  }
  useEffect(() => {
    const pPath = router.asPath;
    setPagePath({
      path: getPagePath(pPath),
      query: getQueryParams(pPath),
    });

    if (router.asPath.includes("[...") || router.asPath == "/delete-account") {
      return;
    }

    if (!!getItemDirect("v2-loggedIN")) {
      migrationSet();
    }

    if (getItem("isloggedin") != getNookie("user-info")?.isLoggedIn) {
      clearStorage();
    }

    if (router.asPath.includes("/sso/manage")) {
      ssoInit();
    } else if (
      router.asPath.includes("token=") &&
      router.asPath.includes("source=")
    ) {
      validateSsoUser();
    } else {
      init();
    }

    setisSSOUser(getItem("isUtuser"));
  }, [router.asPath]);

  const validateSsoUser = () => {
    const pPath = router.asPath;
    setPagePath({
      path: getPagePath(pPath),
      query: getQueryParams(pPath),
    });
    let query = getQueryParams(pPath);
    let path = getPagePath(pPath);
    let up = getQueryParams(pPath);
    let boxId = getItem("boxId");
    let ssoToken = getItem("ssoToken");
    let deviceId = getItem("clientId");
    // https://www.watcho.com/movie/love-sitara?source=kccl&token=SSSAIUIOPSAIKUMARSAZXCVBNM98765rftgv%20Open%20image-20241202-103727.png%20image-20241202-103727.png
    // if(boxId) boxId = JSON.parse(boxId);
    // if(ssoToken) ssoToken = JSON.parse(ssoToken);
    // if(deviceId) deviceId = JSON.parse(deviceId);
    let windowWidth = window.innerWidth;
    if (deviceId == null) {
      if (windowWidth <= 720) {
        deviceId = "61";
      } else {
        deviceId = "5";
      }
    }

    if (ssoToken != up["token"]) {
      let url =
        process.env.initJson["api"] +
        `/service/api/v1/get/token/details?token=${up["token"]}&vendor_code=${up["source"]}&version=2&box_id=${boxId ? boxId : getBoxId()}&device_id=${deviceId}`;
      // Add mobile params if rmn exists
      if (up["rmn"]) {
        url += `&mobile=${up["rmn"]}`;
      }
      mutatedTokenSso(url, {
        onSuccess: (response) => {
          let data = response.data;
          if (data["status"]) {
            // this.displayLoader = true;
            let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setItem(
              "profile-expiry-time",
              (new Date().getTime() - 1 * 24 * 60 * 60 * 1000).toString()
            );
            setItemDirect("isloggedin-v3", true);
            setItem("sessionId", data["response"].session_id);
            setItem("boxId", data["response"].box_id);
            setItem("timezone", timezone);
            setItem("ssoToken", up["token"]);
            const cUserData = getNookie("user-info") || {};
            const newUserData = {
              ...cUserData,
              expiryTime: "0000",
              isLoggedIn: true,
            };
            setNookie("user-info", newUserData);
            if (up["rmn"] || up["token"]) {
              validateSession();
              setisLandingSso(true);
              const url = `${process.env.initJson.api}/service/api/auth/user/info`;
              mutateGetUData(url);
            } else {
              router.push(`/profiles/select-user-profile?referer=${path}`);
            }
          } else {
            router.push(path);
          }
        },
      });
    } else if (!!up["token"]) {
      router.push(path);
    }
  };

  const migrationSet = () => {
    let getBoxSession = {
      boxid: getItemDirect("v2-BoxID"),
      sessionId: getItemDirect("v2-Token"),
    };
    setItemDirect("isloggedin-v3", true);
    setItemDirect("boxId-v3", getBoxSession.boxid);
    setItemDirect("sessionId-v3", getBoxSession.sessionId);
    const cUserData = getNookie("user-info") || {};
    const newUserData = {
      ...cUserData,
      expiryTime: new Date().getTime() + appConfig.profile.expiry * 1000,
      isLoggedIn: true,
    };
    setNookie("user-info", newUserData);
  };

  const proceedWithProfile = (postData) => {
    const url = `${process.env.initJson.api}/service/api/auth/activate/user/profile`;
    mutatePostProfileSelection({ url, apiData: postData });
  };

  useEffect(() => {
    if (apiResponseProfile) {
      setisSsogetUserDetails(true);
      setItem(
        "profile-expiry-time",
        new Date().getTime() + appConfig.profile.expiry * 1000
      );
      const cUserData = getNookie("user-info") || {};
      const newUserData = {
        ...cUserData,
        expiryTime: new Date().getTime() + appConfig.profile.expiry * 1000,
      };
      const url = `${process.env.initJson.api}/service/api/auth/user/info`;
      mutateGetUData(url);
      setNookie("user-info", newUserData);
      setItem("uDetails", btoa(JSON.stringify(newUserData)));
    }
  }, [apiResponseProfile]);

  useEffect(() => {
    if (!apiUResponse?.data?.response) return;

    const response = apiUResponse.data.response;

    if (isSsogetUserDetails) {
      setUserDetails(response);
      dispatch({
        type: actions.userDetails,
        payload: response,
      });
      let pPath = router.asPath;
      let pageQuery = {
        path: getPagePath(pPath),
        query: getQueryParams(pPath),
      };
      setisLandingSso(false);
      if (pageQuery.path) {
        router.push("/" + pageQuery.path);
      } else {
        router.push("/");
      }
    } else {
      const masterProfile = response.profileParentalDetails?.find(
        (value) => value.isMasterProfile
      );
      proceedWithProfile({ profileId: masterProfile?.profileId });
    }
  }, [apiUResponse]);

  useEffect(() => {
    if (ThemeColor == "white") {
      document.documentElement.classList.remove("theme-black");
      document.documentElement.classList.add("theme-white");
    } else {
      document.documentElement.classList.remove("theme-white");
      document.documentElement.classList.add("theme-black");
    }
  }, [ThemeColor]);

  const checkPath = (notAllowPaths) => {
    let showheader = false;
    notAllowPaths.forEach((path) => {
      // console.log(pagePath, path, pagePath?.path?.startsWith(path));
      if (
        pagePath?.path === path ||
        (typeof window !== "undefined" &&
          window.innerWidth <= 990 &&
          pagePath?.path?.startsWith(path))
      ) {
        showheader = true;
      }
    });

    if (acceptUnknowUrlLng.some((it) => pagePath?.path?.includes(it))) {
      showheader = true;
    }
    return showheader;
  };

  const checkFooterPaths = (notAllowPaths) => {
    let showheader = false;
    notAllowPaths.forEach((path) => {
      // console.log(pagePath, path, pagePath?.path?.startsWith(path));
      if (pagePath?.path === path || pagePath?.path?.startsWith(path)) {
        showheader = true;
      }
    });

    if (acceptUnknowUrlLng.some((it) => pagePath?.path?.includes(it))) {
      showheader = true;
    }
    return showheader;
  };

  useEffect(() => {
    initializeAnalytics();
    // notification push work-around
    setTimeout(() => {
      AnalyticsnotificationSetup();
    }, 2000);
  }, []);
  const handleLanguageUpdate = (selectedLang) => {
    const payload = {
      display_lang_code: selectedLang.toUpperCase(),
    };
    const url = `${process.env.initJson.api}/service/api/auth/update/session/preference`;
    try {
      mutatePostData({ url, apiData: payload });
    } catch (e) {
      // err
    }
  };

  useEffect(() => {
    (async () => {
      if (apiResponse?.data?.status) {
        setNookie("userLanguage", selectedLanguage);
        dispatch({
          type: actions.LocalLang,
          payload: selectedLanguage.toLowerCase(),
        });
        const _SC = await getNewConfigdata();
        if (_SC) {
          dispatch({ type: actions.SystemConfig, payload: _SC });
        }
      } else if (apiResponse?.data?.status === false) {
        if (
          apiResponse?.data?.error &&
          apiResponse?.data?.error?.code === 401
        ) {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: "Session expired!" },
          });
          unAuthorisedHandler();
        }
      }
    })();
  }, [apiResponse]);

  return (
    <>
      {!(checkPath(staticpaths) || isSSOUser) && (
        <>
          {appConfig.header.type == 1 ? (
            <Header pagePath={pagePath} />
          ) : (
            <VestaHeader pagePath={pagePath} />
          )}
        </>
      )}
      <main
        style={{ ...(router.asPath !== "/bookDTH" && { minHeight: "100vh" }) }}
      >
        {props?.children}
      </main>
      {!(checkFooterPaths(footerStaticpaths) || isSSOUser) && (
        <>
          <DynamicFooter pagePath={pagePath} />
          <AcceptCookies />
        </>
      )}
      {isLandingSso && <PageLoader />}
    </>
  );
}

export default Layout;
