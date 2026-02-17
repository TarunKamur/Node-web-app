import React, { useEffect, useState, useRef } from "react";
import styles from "@/components/header/header.module.scss";
import { actions, useStore } from "@/store/store";
import Link from "next/link";
import useWindowScroll from "@/hooks/useWindowScroll";
import { appConfig } from "@/config/app.config";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { getAbsolutePath, setUserDetails } from "@/services/user.service";
import {
  getItem,
  getNookie,
  setItem,
  setNookie,
} from "@/services/local-storage.service";
import { useRouter } from "next/router";
import { DHeaderconstant, Packagesconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import {
  sendEvent,
  sendProfileAnalyticsEvent,
} from "@/services/analytics.service";
import { getPlansDetails, getSelectedMenu } from "@/services/utility.service";
import {
  getBoxId,
  getSessionId,
  getDeviceId,
  signoutTheApp,
} from "@/services/data-manager.service";
import { setTabName } from "@/services/myReco.service";
import PageLoader from "../loader/page-loder.component";
import PartnerModel from "../popups/partner-modal/partner.component";
import { debounceFunction } from "@/services/utility.service";
import { getCurrentTime } from "@/services/utility.service";

const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const PinProfile = dynamic(
  () =>
    import("../popups/profile/pin-profile-popup/pin-profile-popup.component")
);
const LanguageModal = dynamic(
  () => import("../popups/languages-modal/languages.component")
);

const DHeader = ({ pagePath }) => {
  const {
    state: {
      SystemConfig,
      userDetails,
      ActivePackages,
      SystemFeature,
      PageData,
      localLang,
      Location,
    },
    dispatch,
  } = useStore();
  const { mutate: mutatePostProfileSelection, data: apiResponseProfile } =
    usePostApiMutate();
  const router = useRouter();
  const { mutate: mutateGetUData, data: apiUResponse } = useGetApiMutate();
  const [duplicatemenus, setDuplicateMenus] = useState([]);
  const [isloggedin, setIsLoggedIn] = useState(
    (!!router.query.rmn && getItem("isloggedin")) || null
  );
  const [changePlan, setChangePlan] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrolledToppx } = useWindowScroll();
  const [activetedmenu, setselectedmenu] = useState("");
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [popupData, setPopUpData] = useState({});
  const [loder, setLoder] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  // default menu count 5
  const [Menucount, setMenucount] = useState(5);
  const [displaySubscribe, setDisplaySubscribe] = useState(false);
  const headerMenusMoreRef = useRef(null);
  const moremenuCount = useRef(1);
  const Moremenus = [];
  const [isCobranding, setCobrand] = useState("");
  const [localActivePack, setLocalActivePack] = useState({});
  const [showMarker, setshowMarker] = useState(false);
  useEffect(() => {
    if (scrolledToppx !== null) {
      if (router.asPath.includes("cpcontent")) {
        if (scrolledToppx >= 10) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      } else {
        if (scrolledToppx >= 200) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }
    }
  }, [scrolledToppx]);
  const staticPaths = [
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

  useEffect(() => {
    if (SystemConfig) {
      getMenus();
      if (SystemConfig?.configs?.showPackages) {
        setDisplaySubscribe(SystemConfig?.configs?.showPackages == "true");
      } else {
        setDisplaySubscribe(appConfig.header.pricing);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [SystemConfig, pagePath]);

  const handleResize = () => {
    debounceFunction(menusSet(), 500);
  };

  useEffect(() => {
    if (!!SystemConfig && !!SystemConfig.configs.menusMore) {
      menusSet();
    }
  }, [SystemConfig, localLang]);

  useEffect(() => {
    if (userDetails) {
      setIsLoggedIn(true);
      setChangePlan(
        userDetails?.packages?.some((data) => data.expiryDate > Date.now()) ||
          false
      );
      userDetails?.showCoBrandingLogo &&
        userDetails?.coBrandingLogoUrl &&
        setCobrand(userDetails?.coBrandingLogoUrl);
    } else {
      setCobrand("");
      !getItem("isloggedin") && setIsLoggedIn(false);
    }
  }, [userDetails]);

  useEffect(() => {
    if (ActivePackages && ActivePackages.length) {
      setLocalActivePack(ActivePackages);
      if (
        !!ActivePackages.filter(
          (pack) => pack.customAttributes?.groupCode != "FreedomTv"
        ).length
      ) {
        setshowMarker(true);
      }
    }
  }, [ActivePackages]);

  useEffect(() => {
    if (apiResponseProfile) {
      setItem(
        "profile-expiry-time",
        new Date().getTime() + appConfig.profile.expiry * 1000
      );
      const cUserData = getNookie("user-info") || {};
      const newUserData = {
        ...cUserData,
        expiryTime: new Date().getTime() + appConfig.profile.expiry * 1000,
      };
      setNookie("user-info", newUserData);
      const url = `${process.env.initJson.api}/service/api/auth/user/info`;
      mutateGetUData(url);
    }
  }, [apiResponseProfile]);

  useEffect(() => {
    if (apiUResponse) {
      setUserDetails(apiUResponse.data.response);
      sendProfileAnalyticsEvent(apiUResponse?.data?.response, "clevertap");
      dispatch({
        type: actions.userDetails,
        payload: apiUResponse.data.response,
      });
      dispatch({ type: actions.PageRefresh, payload: true });
    }
  }, [apiUResponse]);

  useEffect(() => {
    if (PageData?.banners?.length) {
      setIsTransparent(true);
    } else {
      setIsTransparent(false);
    }
  }, [PageData]);

  useEffect(() => {
    setPopUpData({});
  }, [router.asPath]);

  const menusSet = (isMore = "") => {
    if (!SystemConfig?.configs?.menusMore) {
      return;
    }
    let Moremenusdata = JSON.parse(SystemConfig.configs.menusMore);
    const resolution = [];
    let stop = false;
    for (const res in Moremenusdata) {
      resolution.push(parseInt(res.split("_")[1]));
    }
    for (let i = 0; i < resolution.length; i++) {
      if (window.innerWidth >= resolution[i]) {
        for (const res in Moremenusdata) {
          if (resolution[i] >= parseInt(res.split("_")[1])) {
            let cardNum;
            if (isMore === "") cardNum = parseInt(Moremenusdata[res]);
            if (isMore) {
              cardNum = parseInt(Moremenusdata[res]) - moremenuCount.current;
              moremenuCount.current += 1;
            }
            setMenucount(cardNum);
            stop = true;
            break;
          }
        }
      }
      if (stop) break;
    }
    setTimeout(() => {
      checkMeusOver();
    }, 100);
  };

  const checkMeusOver = () => {
    const element = headerMenusMoreRef.current;
    const hasOverflowX = element?.scrollWidth > element?.clientWidth;
    if (hasOverflowX) {
      menusSet(hasOverflowX);
    } else {
      moremenuCount.current = 1;
    }
  };

  const getMenus = () => {
    let dMenus = SystemConfig.menus;
    if (dMenus?.length > 0) {
      dMenus[0].targetPath = "/";
      if (!!dMenus[0].subMenus && dMenus[0].subMenus.length > 0) {
        dMenus[0].subMenus[0].targetPath = "";
      }
      if (!!appConfig.configVersionApi) {
        if (window.innerWidth > 991) {
          dMenus = dMenus.filter((ele) => ele.params.web == "true");
        } else {
          dMenus = dMenus.filter((ele) => ele.params.web == "false");
        }
      }
      setDuplicateMenus(dMenus);
    }
    const selected = selectedMenus(pagePath.path)[0];
    setselectedmenu(
      selected === ""
        ? "home"
        : pagePath.path == "partner/fliqs"
          ? "partner/fliqs"
          : selected
    );
  };

  const selectedMenus = (url) => {
    const Urlsplit = url.split("?")[0].split("/");
    return Urlsplit;
  };

  const toggleLanguageModal = (e) => {
    sendEvent("filter_channel_partner", {});
    setIsLanguageModalOpen(!isLanguageModalOpen);
  };

  const togglePartnerModal = (e) => {
    setIsPartnerModalOpen(!isPartnerModalOpen);
  };

  const signoutHandler = () => {
    const pop = {
      type: "signout",
      isActive: true,
      title1:
        DHeaderconstant[localLang]?.Want_To_Signout ||
        "Are You sure, you want to sign out from this device?",
      yesButton1: DHeaderconstant[localLang]?.Sign_Out || "Sign Out",
      yesButtonType: "primary",
      yesButtonTarget1: proccedLogout,
      noButton1: DHeaderconstant[localLang]?.Cancel || "Cancel",
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const handleClose = () => {
    setPopUpData({});
  };

  const proccedLogout = () => {
    sendEvent("signout", getPlansDetails(true));
    setLoder(true);
    handleClose();
    signoutTheApp();
  };

  const profileSwitch = (profile) => {
    if (!!profile.isPinAvailable && !!profile.isProfileLockActive) {
      setPopUpData({
        type: "pinprofile",
        subtype: "select",
        isActive: true,
        userProfiles: profile,
        closeTarget: handleClose,
        validated: profilePinvalidate,
      });
    } else {
      proceedWithProfile({ profileId: profile.profileId });
    }
  };

  const proceedWithProfile = (postData) => {
    const url = `${process.env.initJson.api}/service/api/auth/activate/user/profile`;
    mutatePostProfileSelection({ url, apiData: postData });
  };

  const profilePinvalidate = (data) => {
    if (data.subtype == "select") {
      setItem(
        "profile-expiry-time",
        new Date().getTime() + appConfig.profile.expiry * 1000
      );
      const cUserData = getNookie("user-info") || {};
      const newUserData = {
        ...cUserData,
        expiryTime: new Date().getTime() + appConfig.profile.expiry * 1000,
      };
      setNookie("user-info", newUserData);
      handleClose();
      const url = `${process.env.initJson.api}/service/api/auth/user/info`;
      mutateGetUData(url);
    }
  };

  const setNavigation = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    const facebookAnalyticsData = {
      eventType: "trackCustom",
      fbPixelId: process.env.fbPixelId,
      analyticsService: "facebook",
    };
    sendEvent("signin", {}, facebookAnalyticsData);
  };

  const getActivatedMenuForMoreMenu = (arr) => {
    const res = arr.filter((ele) => {
      return ele.targetPath === activetedmenu[0];
    });
    return res.length > 0 ? true : false;
  };

  const swagRidirect = () => {
    let ssopp = {
      bi: getBoxId(),
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

    const url = encodeURI(
      btoa(
        Object.keys(ssopp)
          .map(function (k) {
            return k + "===" + ssopp[k];
          })
          .join("&&&")
      )
    );

    return SystemConfig?.configs?.swagurl + "?ut=" + url;
  };

  const navigateToSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signin");
  };

  function LoadHelpCenter() {
    if (userDetails) {
      window.open(
        `https://help.watcho.com/?a_t=${userDetails?.authToken}&sid=${userDetails?.externalUserId}&mno=${userDetails?.phoneNumber}`
      );
    } else {
      let pop = {
        type: "signin",
        isActive: true,
        title1: DHeaderconstant[localLang]?.Please_Sign_In_To_Connect_With_Our,
        yesButton1: DHeaderconstant[localLang]?.Cancel,
        yesButtonType: "secondary",
        yesButtonTarget1: handleClose,
        noButton1: DHeaderconstant[localLang]?.SIGN_IN,
        noButtontarget1: navigateToSignIn,
        noButtonType: "primary",
        close: true,
        closeTarget: handleClose,
      };
      setPopUpData(pop);
    }
  }

  function LoadFAQ() {
    if (userDetails) {
      window.open(`https://faq.watcho.com/`);
    }
  }
  const menuClick = (obj, setTabname = true) => {
    // console.log("12345", obj);
    !!setTabname && setTabName(obj.targetPath);
    if (obj.code == "swag__v2") {
      sendEvent("freedomTV", {
        header_button: obj.targetPath || "",
        cpCode: "freedom",
      });
    }
    sendEvent("home_top_navigation", {
      header_button: getSelectedMenu(obj.targetPath),
    });
  };

  const listRedirection = (content) => {
    router.push({
      pathname: "/list",
      query: { content }, // Pass the content as a query parameter
    });
  };
  return (
    <div
      className={` title ${styles.main_nav}  ${
        isScrolled
          ? `${styles.nav_fixed}`
          : `${isTransparent ? styles.nav_transparent : ""}`
      }`}
    >
      {appConfig.header.topHeader && !staticPaths.includes(pagePath.path) && (
        <div className={`${styles.top_header} container-fluid`}>
          <div className={`${styles.container}`}>
            {!!appConfig?.header?.partners &&
              (Location?.ipInfo?.countryCode === "IN" ||
                Location?.ipInfo?.countryCode === "US") && (
                <span
                  className={`${styles.language}`}
                  onClick={(e) => togglePartnerModal(e)}
                >
                  <img
                    src={`${ImageConfig?.desktopHeader?.headerFilter}`}
                    alt=""
                  />
                  {DHeaderconstant[localLang]?.Filter}
                </span>
              )}
            {!!appConfig?.header?.languages && (
              <span
                className={`${styles.language}`}
                onClick={(e) => toggleLanguageModal(e)}
              >
                <img
                  src={`${ImageConfig?.desktopHeader?.languageSelectionIcon}`}
                  alt=""
                />
                {DHeaderconstant[localLang]?.Languages}
              </span>
            )}

            {appConfig.header.aboutus && (
              <Link className={`${styles.help}`} href="/support/about-us">
                <img
                  src={`${ImageConfig?.desktopHeader?.headerAbout}`}
                  alt=""
                />
                {DHeaderconstant[localLang]?.About_us}
              </Link>
            )}

            {appConfig.header.help_and_support &&
              (Location?.ipInfo?.countryCode === "IN" ||
                Location?.ipInfo?.countryCode === "US") && (
                <span
                  className={`${styles.help}`}
                  onClick={(e) => {
                    sendEvent("help_support", getPlansDetails());
                    LoadHelpCenter(e);
                  }}
                >
                  <img
                    src={`${ImageConfig?.desktopHeader?.headerAbout}`}
                    alt=""
                  />
                  {DHeaderconstant[localLang]?.Help_Support}
                </span>
              )}
            {appConfig.header.become_swag_creator &&
              SystemConfig?.configs?.showBecomeFliqsCreator == "true" &&
              !isCobranding &&
              (Location?.ipInfo?.countryCode === "IN" ||
                Location?.ipInfo?.countryCode === "US") && (
                <Link
                  className={`${styles.help}`}
                  href="https://ancillary.watcho.com/BecomeSwagCreator"
                  onClick={() =>
                    sendEvent("become_swag_partner", {
                      ...getPlansDetails(),
                      mobile_number:
                        !!userDetails && userDetails?.phoneNumber
                          ? userDetails?.phoneNumber
                          : "-1",
                    })
                  }
                  target="_balnk"
                >
                  <img
                    src={`${ImageConfig?.desktopHeader?.swagCreator}`}
                    alt=""
                  />{" "}
                  {DHeaderconstant[localLang]?.Become_swag_partner}
                  {/* Become a Swag Creator */}
                </Link>
              )}
            {appConfig.header.become_our_partner &&
              (Location?.ipInfo?.countryCode === "IN" ||
                Location?.ipInfo?.countryCode === "US") && (
                <Link
                  className={`${styles.help}`}
                  href="https://ancillary.watcho.com/BecomeOurPartner"
                  target="_balnk"
                >
                  <img
                    src={`${ImageConfig?.desktopHeader?.becomeOurPartner}`}
                    alt=""
                  />{" "}
                  {DHeaderconstant[localLang]?.Become_Our_Partner}
                </Link>
              )}

            {appConfig.header.Support_mail && (
              <span className={`${styles.help}`}>
                <img
                  src={`${ImageConfig?.desktopHeader?.headerMailSupport}`}
                  alt=""
                />
                <Link
                  href={`mailto:${DHeaderconstant[localLang]?.Support_mail}`}
                >
                  {DHeaderconstant[localLang]?.Support_mail}
                </Link>
              </span>
            )}
          </div>
        </div>
      )}
      <div
        className={` title ${styles.nav} ${
          PageData?.banners?.length > 0 ||
          (PageData?.info?.pageType === "details" &&
            PageData?.info?.attributes?.contentType !== "network")
            ? ""
            : `${styles.nav_bg}`
        } `}
      >
        <span className={` ${styles.header_gradient} `} />
        <div className={` title ${styles.nav_left} `}>
          <Link
            href={router.asPath === "/" ? "" : "/"}
            onClick={(e) => {
              if (router.asPath === "/") {
                e.preventDefault();
              }
            }}
            prefetch={false}
            aria-label="app logo"
          >
            {!!isCobranding ? (
              <img
                className="app-logo cobranding"
                src={isCobranding}
                alt="logo"
              />
            ) : (
              <img className="app-logo" src={ImageConfig?.logo} alt="logo" />
            )}
          </Link>
          {
            <span
              style={{
                display: staticPaths.includes(pagePath.path) ? "none" : "block",
              }}
            >
              <ul
                className={`${styles.headerMenusMore}`}
                ref={headerMenusMoreRef}
              >
                {duplicatemenus.map((obj, i) => {
                  if (!!Menucount && i < Menucount - 1) {
                    return (
                      <li
                        key={obj.code}
                        className={`${
                          obj.subMenus.length > 0 ? styles.more_menu : ""
                        }`}
                      >
                        {obj.subMenus.length > 0 ? (
                          <div
                            className={`${styles.hasMoreDiv} ${getActivatedMenuForMoreMenu(obj.subMenus) ? `${styles.active}` : ""}`}
                          >
                            {obj.displayText}
                            {!!obj.subMenus && obj.subMenus.length > 0 && (
                              <ul className={`${styles.dropdown}`}>
                                {obj.subMenus.map((subMenu, j) => (
                                  <li
                                    key={subMenu.code}
                                    className={`${subMenu.code}`}
                                  >
                                    <Link
                                      target={
                                        subMenu.params.targetPath ==
                                        "externalbrowser"
                                          ? //   ||
                                            // subMenu.code == "swag" ||
                                            // subMenu.code == "swag_mobile" ||
                                            // subMenu.code == "swag_mobile__v2" ||
                                            // subMenu.code == "swag__v2"
                                            "_blank"
                                          : "_self"
                                      }
                                      href={
                                        subMenu.code == "swag" ||
                                        subMenu.code == "swag_mobile" ||
                                        subMenu.code == "swag_mobile__v2" ||
                                        subMenu.code == "swag__v2"
                                          ? //   ? swagRidirect()
                                            `/${subMenu.targetPath}?cpcontent=all`
                                          : `/${subMenu.targetPath} `
                                      }
                                      onClick={() => menuClick(subMenu)}
                                    >
                                      {subMenu.displayText}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            target={
                              obj.params.targetPath == "externalbrowser"
                                ? //  ||                              obj.code == "swag" ||
                                  // obj.code == "swag_mobile" ||
                                  // obj.code == "swag_mobile__v2" ||
                                  // obj.code == "swag__v2"
                                  "_blank"
                                : "_self"
                            }
                            href={
                              obj.subMenus.length > 0
                                ? ""
                                : obj.code == "home" || obj.code == "home__v2"
                                  ? router.asPath == `/${obj.targetPath}`
                                    ? ""
                                    : `/${obj.targetPath}`
                                  : router.asPath === `/${obj.targetPath}`
                                    ? ""
                                    : obj.code == "swag" ||
                                        obj.code == "swag_mobile" ||
                                        obj.code == "swag_mobile__v2" ||
                                        obj.code == "swag__v2"
                                      ? //   ? swagRidirect()
                                        `/${obj.targetPath}?cpcontent=all`
                                      : `/${obj.targetPath}`
                            }
                            className={`${
                              obj.targetPath == activetedmenu ||
                              ((obj.targetPath == "/" ||
                                obj.targetPath == "home") &&
                                activetedmenu == "")
                                ? styles.active
                                : ""
                            }`}
                            onClick={(e) => {
                              if (
                                router.asPath === obj.targetPath ||
                                router.asPath === "/" + obj.targetPath ||
                                obj.subMenus.length > 0
                              ) {
                                e.preventDefault();
                              }
                              menuClick(obj);
                            }}
                          >
                            {/* {console.log(
                              obj.targetPath,
                              "><<>>",
                              activetedmenu
                            )} */}
                            {obj.targetPath == activetedmenu && (
                              <h1> {obj.displayText}</h1>
                            )}
                            {obj.targetPath != activetedmenu && (
                              <> {obj.displayText} </>
                            )}
                          </Link>
                        )}
                        <div className={`${styles.tag_class}`}>
                          {!!userDetails &&
                            !!obj.params.login_and_pack_marker &&
                            !!obj.params.login_and_no_pack_marker && (
                              <span
                                className={`${styles.tag} ${!!showMarker ? `${styles.bp}` : ""}`}
                              >
                                {!!showMarker
                                  ? obj.params.login_and_pack_marker
                                  : obj.params.login_and_no_pack_marker}
                              </span>
                            )}
                          {!userDetails && !!obj.params.non_login_marker && (
                            <span className={`${styles.tag}`}>
                              {obj.params.non_login_marker}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  } else {
                    Moremenus.push(obj);
                  }
                })}
                {/* more menus */}
                {Moremenus.length > 0 && (
                  <li key="" className={`${styles.more_menu}`}>
                    <div
                      style={{ cursor: "pointer" }}
                      className={`${styles.hasMoreDiv} ${getActivatedMenuForMoreMenu(Moremenus) ? `${styles.active}` : ""}`}
                    >
                      {DHeaderconstant[localLang]?.More}

                      <ul
                        className={`${styles.dropdown} ${styles.moreMenuList}`}
                      >
                        {Moremenus.map((subObj, j) => (
                          <li
                            key={subObj.code}
                            className={`${subObj.code} more`}
                          >
                            <Link
                              target={
                                subObj.params.targetPath == "internalbrowser"
                                  ? //  ||
                                    // subObj.code == "swag" ||
                                    // subObj.code == "swag_mobile" ||
                                    // subObj.code == "swag_mobile__v2" ||
                                    // subObj.code == "swag__v2"
                                    "_blank"
                                  : "_self"
                              }
                              href={
                                subObj.code == "swag" ||
                                subObj.code == "swag_mobile" ||
                                subObj.code == "swag_mobile__v2" ||
                                subObj.code == "swag__v2"
                                  ? //   ? swagRidirect()
                                    `/${subObj.targetPath}?cpcontent=all`
                                  : subObj.targetPath?.startsWith("http")
                                    ? `${subObj.targetPath}`
                                    : `/${subObj.targetPath}`
                              }
                              onClick={() => menuClick(subObj, false)}
                            >
                              {subObj.displayText}
                              {subObj?.subMenus?.length > 0 && (
                                <ul className={`${styles.subMenu}`}>
                                  {subObj.subMenus.map((subMenu, j) => (
                                    <li
                                      key={subMenu.code}
                                      className={`${subMenu.code}`}
                                    >
                                      <Link
                                        target={
                                          subMenu.params?.targetPath ===
                                          "externalbrowser"
                                            ? "_blank"
                                            : "_self"
                                        }
                                        href={
                                          subMenu.code == "swag" ||
                                          subMenu.code == "swag_mobile" ||
                                          subMenu.code == "swag_mobile__v2" ||
                                          subMenu.code == "swag__v2"
                                            ? //   ? swagRidirect()
                                              `${subMenu.targetPath}?cpcontent=all `
                                            : `${subMenu.targetPath} `
                                        }
                                        onClick={() =>
                                          menuClick(subMenu, false)
                                        }
                                      >
                                        {subMenu.targetPath ==
                                          activetedmenu && (
                                          <h1> {subMenu.displayText}</h1>
                                        )}
                                        {subMenu.targetPath !=
                                          activetedmenu && (
                                          <> {subMenu.displayText} </>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )}
              </ul>
            </span>
          }
        </div>
        <div className={` title ${styles.nav_right} `}>
          {!staticPaths.includes(pagePath.path) && (
            <>
              <Link
                href="/search"
                prefetch={false}
                className={` title ${styles.main_search} `}
                onClick={() => {
                  sendEvent("search_button", getPlansDetails());
                  setTabName("SEARCH");
                }}
              >
                <img
                  src={`${ImageConfig?.desktopHeader?.searchIcon}`}
                  alt="search-icon"
                />
              </Link>
              {isloggedin == false && (
                <Link href="/plans/list" style={{ textDecoration: "none" }}>
                  <div
                    className={styles.upgradebtn}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/SubscribeBtnNew.png"
                      alt="Subscribe"
                    />
                  </div>
                </Link>
              )}
              {userDetails?.eligiblePackAction && (
                <>
                  <Link href="/plans/list" style={{ textDecoration: "none" }}>
                    <div
                      className={styles.upgradebtn}
                      style={{ cursor: "pointer" }}
                    >
                      {(userDetails?.eligiblePackAction?.toLowerCase() ===
                        "subscribe" ||
                        !isloggedin) && (
                        <img
                          src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/SubscribeBtnNew.png"
                          alt="Subscribe"
                        />
                      )}

                      {userDetails?.eligiblePackAction?.toLowerCase() ===
                        "renew" && (
                        <img
                          src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/RenewbtnNew.png"
                          alt="Renew"
                        />
                      )}

                      {userDetails?.eligiblePackAction?.toLowerCase() ===
                        "upgrade" && (
                        <img
                          src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/UpgradeBtnNew.png"
                          alt="Upgrade"
                        />
                      )}
                    </div>
                  </Link>
                </>
              )}
              {appConfig?.header?.displaySettings && (
                <Link
                  href="/settings"
                  prefetch={false}
                  className={styles.settingsIconContainer}
                >
                  <img
                    src={ImageConfig?.desktopHeader?.settingsIcon}
                    alt="settings"
                  />
                </Link>
              )}
              {displaySubscribe && (
                <Link
                  href="/buy/packages-list"
                  prefetch={false}
                  className={` ${styles.plans} `}
                >
                  {changePlan
                    ? Packagesconstant[localLang]?.Change_Plan
                    : Packagesconstant[localLang]?.Pricing}
                </Link>
              )}
            </>
          )}

          {isloggedin === false && (
            <Link
              href="/signin"
              onClick={setNavigation}
              className={!appConfig.header.signup ? "primary" : ""}
            >
              {DHeaderconstant[localLang]?.SIGN_IN}
            </Link>
          )}

          {!isloggedin && appConfig.header.signup && (
            <Link
              href="/signup"
              className={appConfig.header.signin ? `primary` : ""}
            >
              {DHeaderconstant[localLang]?.SIGN_UP}
            </Link>
          )}

          {isloggedin && userDetails && (
            <div className={` ${styles.profile_menu_nav} `}>
              <span className={` ${styles.profile_name_block} `}>
                {!!SystemFeature &&
                !!SystemFeature.userprofiles &&
                SystemFeature.userprofiles.fields.is_userprofiles_supported ==
                  "true" &&
                userDetails ? (
                  userDetails?.profileParentalDetails?.map((ele, ind) => (
                    <React.Fragment key={ind}>
                      {ele.profileId == userDetails.profileId && (
                        <>
                          <span
                            className={` ${styles.profile_icon} ${styles.with_profiles} `}
                          >
                            <img
                              src={
                                ele.imageUrl
                                  ? getAbsolutePath(ele.imageUrl)
                                  : `https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/dummy-profile-img.png`
                              }
                              alt=""
                            />
                          </span>
                          <span className={` ${styles.profile_name}`}>
                            {ele.name}
                          </span>
                        </>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <span className={`${styles.profile_icon} `}>
                      {!!userDetails?.name && userDetails?.name[0]}
                    </span>
                    <span className={` ${styles.profile_name}`}>
                      {userDetails?.name}
                    </span>
                  </>
                )}
              </span>

              <div
                className={` ${styles.profile_menu} ${
                  !!SystemFeature &&
                  !!SystemFeature.userprofiles &&
                  SystemFeature.userprofiles.fields.is_userprofiles_supported ==
                    "true"
                    ? styles.has__profiles
                    : ""
                } `}
              >
                <ul>
                  {!!SystemConfig?.configs?.favouritesTargetPath && (
                    <li>
                      <Link
                        href={"/" + SystemConfig.configs.favouritesTargetPath}
                        onClick={() => {
                          sendEvent("my_favorites", {});
                          setTabName("MY FAVOURITES");
                        }}
                      >
                        {DHeaderconstant[localLang]?.My_Watchlist}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/settings"
                      prefetch={false}
                      onClick={() =>
                        sendEvent("account_setting", getPlansDetails())
                      }
                    >
                      {DHeaderconstant[localLang].Account_Settings}
                    </Link>
                  </li>
                  {SystemConfig?.configs?.myPurchasesTargetPathWeb && (
                    <li>
                      <Link
                        href={`/${SystemConfig.configs.myPurchasesTargetPathWeb}`}
                      >
                        {DHeaderconstant[localLang]?.My_Purchases}
                      </Link>
                    </li>
                  )}
                  <li className={`${styles.devider}`} />
                  {(Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") &&
                    SystemConfig?.configs?.enableSideMenuPages == "true" && (
                      <li
                        onClick={(e) => {
                          const content = "Channels";
                          listRedirection(content);
                        }}
                      >
                        <span className={`${styles.profileMenu_list}`}>
                          {DHeaderconstant[localLang]?.Channels}{" "}
                        </span>{" "}
                      </li>
                    )}
                  {(Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") &&
                    SystemConfig?.configs?.enableSideMenuPages == "true" && (
                      <li
                        onClick={(e) => {
                          const content = "purchasedcontent";
                          listRedirection(content);
                          sendEvent("purchase_content", {
                            time: getCurrentTime(),
                            device: "web",
                            cpCode: "freedom",
                          });
                        }}
                      >
                        {" "}
                        <span className={`${styles.profileMenu_list}`}>
                          {" "}
                          {DHeaderconstant[localLang]?.Purchased_Content}{" "}
                        </span>{" "}
                      </li>
                    )}
                  {SystemConfig?.configs?.enableSideMenuPages == "true" && (
                    <li
                      className={`${styles.profileSwitch_menus}`}
                      onClick={(e) => {
                        const content = "mylikedvideos";
                        listRedirection(content);
                        sendEvent("my_liked_videos", { cpCode: "freedom" });
                      }}
                    >
                      <div> {DHeaderconstant[localLang]?.My_Liked_Videos} </div>
                    </li>
                  )}
                </ul>
                {!!SystemFeature &&
                  !!SystemFeature.userprofiles &&
                  SystemFeature.userprofiles.fields.is_userprofiles_supported ==
                    "true" && (
                    <ul className={`${styles.users_section}`}>
                      {!!userDetails &&
                        !!userDetails.profileParentalDetails &&
                        userDetails.profileParentalDetails.map((obj, key) => (
                          <React.Fragment key={key}>
                            {obj.profileId != userDetails.profileId && (
                              <li
                                onClick={() => profileSwitch(obj)}
                                className={`${styles.profileSwitch_menus}`}
                              >
                                <img
                                  className={` ${styles.user_icon} `}
                                  src={
                                    obj.imageUrl
                                      ? getAbsolutePath(obj.imageUrl)
                                      : `https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/dummy-profile-img.png`
                                  }
                                  alt=""
                                />
                                <span className={` ${styles.profile_name_el} `}>
                                  {obj.name}
                                </span>
                                {obj?.isProfileLockActive && (
                                  <img
                                    className={`${styles.profile_lock_icon}`}
                                    alt="lock"
                                    src={`${ImageConfig?.desktopHeader?.lockIcon}`}
                                  />
                                )}
                              </li>
                            )}
                          </React.Fragment>
                        ))}
                      {userDetails?.profileParentalDetails?.length > 1 && (
                        <li className={`${styles.devider}`} />
                      )}
                      <li>
                        <Link href="/profiles/select-user-profile">
                          {DHeaderconstant[localLang].Exit_profile}
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/profiles/manage-user-profile"
                          onClick={() => sendEvent("manage_profile", {})}
                        >
                          {DHeaderconstant[localLang].Manage_profiles}
                        </Link>
                      </li>
                      <li className={`${styles.devider}`} />
                      {Location?.ipInfo?.countryCode === "IN" && (
                        <li>
                          <span
                            className={`${styles.profileMenu_list}`}
                            onClick={() => {
                              sendEvent("help_support", getPlansDetails());
                              LoadHelpCenter();
                            }}
                          >
                            {DHeaderconstant[localLang]?.Help_Support}{" "}
                          </span>{" "}
                        </li>
                      )}
                      {Location?.ipInfo?.countryCode === "IN" && (
                        <li>
                          {" "}
                          <span
                            className={`${styles.profileMenu_list}`}
                            onClick={() => {
                              sendEvent("faq", getPlansDetails());
                              LoadFAQ();
                            }}
                          >
                            {" "}
                            {DHeaderconstant[localLang]?.FAQ}{" "}
                          </span>{" "}
                        </li>
                      )}
                      <li
                        onClick={signoutHandler}
                        className={`${styles.profileSwitch_menus}`}
                      >
                        <div> {DHeaderconstant[localLang]?.Sign_Out} </div>
                      </li>
                    </ul>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
      {isLanguageModalOpen && (
        <LanguageModal
          open={isLanguageModalOpen}
          onClose={() => toggleLanguageModal()}
        />
      )}
      {isPartnerModalOpen && (
        <PartnerModel
          open={isPartnerModalOpen}
          onClose={() => togglePartnerModal()}
        />
      )}
      {popupData.isActive &&
        (popupData.type === "signout" || popupData.type === "signin") && (
          <PopupModal popupData={popupData} />
        )}
      {!!popupData.isActive && popupData.type === "pinprofile" && (
        <PinProfile popupdata={popupData} />
      )}
      {loder && <PageLoader />}
    </div>
  );
};

export default DHeader;
