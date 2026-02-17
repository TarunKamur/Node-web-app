import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import styles from "@/components/header/header.module.scss";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import useWindowScroll from "@/hooks/useWindowScroll";
import { ImageConfig } from "@/config/ImageConfig";
import {
  getBoxId,
  getSessionId,
  getDeviceId,
} from "@/services/data-manager.service";
import { getPlansDetails, getSelectedMenu } from "@/services/utility.service";
import { sendEvent } from "@/services/analytics.service";
import { useRouter } from "next/router";
import { getItem } from "@/services/local-storage.service";

const menuItem = (obj, imgPath, activeMenu) => {
  const {
    state: { SystemConfig, userDetails, Location },
  } = useStore();
  if (!!obj?.params && obj?.params.web == "true") {
    return;
  }
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
  const sendAnaltics = (menu) => {
    sendEvent("bottom_panel_clicked", {
      footer_button: getSelectedMenu(menu?.targetPath),
    });
  };
  return (
    <div
      className={`${obj.targetPath == activeMenu || (obj.targetPath == "/" && activeMenu == "") ? styles.active : ""}`}
    >
      <Link
        target={
          obj?.params?.targetPath == "externalbrowser"
            ? //  ||
              // obj.code == "swag" ||
              // obj.code == "swag_mobile" ||
              // obj.code == "swag_mobile__v2"
              "_blank"
            : "_self"
        }
        href={
          obj.code == "account" ||
          obj.code == "account__v2" ||
          obj.code == "account__dubai__v2"
            ? "/myaccount"
            : obj.code == "swag" ||
                obj.code == "swag_mobile" ||
                obj.code == "swag_mobile__v2"
              ? `${obj.targetPath}?cpcontent=all`
              : // ? swagRidirect()
                `${obj.targetPath}`
        }
        onClick={() => sendAnaltics(obj)}
        className={`${obj.targetPath == activeMenu || (obj.targetPath == "/" && activeMenu == "") ? styles.active : ""}`}
      >
        <div className={`${styles.imageDiv}`}>
          <img
            className={`${styles.default}`}
            src={`${appConfig.staticImagesPath}bottom-menu-${imgPath}-default.svg`}
            alt={obj.displayText}
          />
          <img
            className={`${styles.selected}`}
            src={`${appConfig.staticImagesPath}bottom-menu-${imgPath}-active.svg`}
            alt={obj.displayText}
          />
        </div>
        {obj.displayText}
      </Link>
    </div>
  );
};

const MHeader = ({ pagePath }) => {
  const {
    state: { SystemConfig, PageData, userDetails, Location },
  } = useStore();
  const [duplicatemenus, setDuplicateMenus] = useState({});
  const [activetedmenu, setselectedmenu] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrolledToppx } = useWindowScroll();
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [showHeaderTop, setShowHeaderTop] = useState(true);
  const favoritePath = SystemConfig?.configs?.favouritesTargetPath;
  const purchasedPath = SystemConfig?.configs?.myPurchasesTargetPathWeb;
  const [isCobranding, setCobrand] = useState("");
  const isloggedin = getItem("isloggedin");
  const { asPath } = useRouter();
  const hideHeaderTopPaths = [
    "search",
    "shorts",
    "settings",
    "settings/edit-profile",
    "tvguide",
    favoritePath,
    "buy/packages-list",
    "buy/order-summary/",
    "transaction",
    purchasedPath,
  ];

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
    if (!!SystemConfig) {
      getMenus();
    }
  }, [SystemConfig, pagePath]);

  useEffect(() => {
    removeHeaderTopinPlayerAndDetailsPage();
  }, [PageData]);

  useEffect(() => {
    if (scrolledToppx !== null) {
      if (scrolledToppx < 200 || prevScrollPos > scrolledToppx) {
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
      }
      setPrevScrollPos(scrolledToppx);
    }
  }, [scrolledToppx]);

  useEffect(() => {
    userDetails?.showCoBrandingLogo && userDetails?.coBrandingLogoUrl
      ? setCobrand(userDetails?.coBrandingLogoUrl)
      : setCobrand("");
  }, [userDetails]);

  const getMenus = () => {
    let menuData = {
      bottom_menus: SystemConfig.menus,
    };
    if (menuData.bottom_menus.length > 0) {
      menuData.bottom_menus[0].targetPath = "/";
      if (
        !!menuData.bottom_menus[0].subMenus &&
        menuData.bottom_menus[0].subMenus.length > 0
      ) {
        menuData.top_menus = menuData.bottom_menus[0].subMenus;
        menuData.bottom_menus[0].subMenus[0].targetPath = "/";
      }
      setDuplicateMenus(menuData);
    }
    setselectedmenu(pagePath.path);
  };

  const removeHeaderTopinPlayerAndDetailsPage = () => {
    let width = window.innerWidth;
    if (
      width <= 991 &&
      (PageData?.info?.pageType === "player" ||
        PageData?.info?.pageType === "details")
    ) {
      setShowHeaderTop(false);
    } else {
      setShowHeaderTop(true);
    }
  };
  const sendAnaltics = (menu) => {
    sendEvent("home_top_navigation", {
      header_button: getSelectedMenu(menu?.targetPath),
    });
  };

  return (
    <div
      className={`${isScrolled ? ` ${styles.headerMobile_fixed}` : `${styles.nav_transparent}`} ${
        (scrolledToppx < 200 && PageData?.banners?.length > 0) ||
        PageData?.info?.pageType === "details"
          ? `${styles.has_trans}`
          : `${styles.no_trans}`
      }`}
    >
      {!(
        hideHeaderTopPaths.includes(pagePath?.path) ||
        staticPaths.includes(pagePath?.path) ||
        pagePath?.path?.includes("buy/order-summary/") ||
        asPath.includes("/profiles/profile-lock/")
      ) &&
        showHeaderTop && (
          <div id="mobile_header" className={`${styles.mobile_header}`}>
            <div className={`${styles.mobile_header_top}`}>
              <Link href="/" aria-label="app logo">
                {!!isCobranding ? (
                  <img
                    className="app-logo mbl_co_branding"
                    src={isCobranding}
                    alt="logo"
                  />
                ) : (
                  <img
                    className="app-logo"
                    src={ImageConfig?.logo}
                    alt="logo"
                  />
                )}
              </Link>
              <div className={`${styles.mobileHeader_rightIcons}`}>
                {(Location?.ipInfo?.countryCode === "IN" ||
                  Location?.ipInfo?.countryCode === "US") &&
                  SystemConfig?.configs?.showBecomeFliqsCreator == "true" && (
                    <Link
                      className={`${styles.icons} ${styles.swagCreator}`}
                      onClick={() =>
                        sendEvent("become_swag_partner", {
                          ...getPlansDetails(),
                          mobile_number:
                            !!userDetails && userDetails?.phoneNumber
                              ? userDetails?.phoneNumber
                              : "-1",
                        })
                      }
                      href="https://ancillary.watcho.com/BecomeSwagCreator"
                      target="_blank"
                      aria-label="search icon"
                    >
                      <img
                        className={`${styles.swag}`}
                        src={`${ImageConfig?.mobileHeader?.swagCreatorM}`}
                        alt=""
                      />
                    </Link>
                  )}
                {/* {appConfig.header.become_our_partner &&
                  (Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") && (
                    <Link
                      className={`${styles.icons} ${styles.become_partner}`}
                      href="https://ancillary.watcho.com/BecomeOurPartner"
                      target="_balnk"
                    >
                      <img
                        src={`${ImageConfig?.mobileHeader?.becomeOurPartner}`}
                        alt=""
                      />{" "}
                    </Link>
                  )} */}
                {!isloggedin && (
                  <div className={`${styles.subscription_button_container}`}>
                    <Link
                      href="/plans/list"
                      className={`${styles.action_button}`}
                    >
                      <img
                        className={`${styles.btn_img}`}
                        src={ImageConfig.mobileHeader.Subscribe_btn_mobile}
                        alt={userDetails?.eligiblePackAction?.toLowerCase()}
                      />
                      <img
                        className={`${styles.star}`}
                        src={ImageConfig.mobileHeader.Dishtvone_star_icon}
                        alt=""
                      />
                    </Link>
                  </div>
                )}
                {(userDetails?.eligiblePackAction && isloggedin) && (
                  <div className={`${styles.subscription_button_container}`}>
                    <Link
                      href="/plans/list"
                      className={`${styles.action_button}`}
                    >
                      <img
                        className={`${styles.btn_img}`}
                        src={
                          userDetails.eligiblePackAction === "Subscribe"
                            ? ImageConfig.mobileHeader.Subscribe_btn_mobile
                            : userDetails.eligiblePackAction === "upgrade"
                              ? ImageConfig.mobileHeader.Upgrade_btn_mobile
                              : userDetails.eligiblePackAction === "renew"
                                ? ImageConfig.mobileHeader.Renew_btn_mobile
                                : ""
                        }
                        alt={userDetails?.eligiblePackAction?.toLowerCase()}
                      />
                      {userDetails.eligiblePackAction == "Subscribe" && (
                        <img
                        className={`${styles.star}`}
                        src={ImageConfig.mobileHeader.Dishtvone_star_icon}
                        alt=""
                      />
                      )}
                    </Link>
                  </div>
                )}
                <Link
                  href=""
                  aria-label="search icon"
                  className={`${styles.search_icon}`}
                >
                  <img
                    src={`${ImageConfig?.mobileHeader?.notification_icon}`}
                    alt="search_icon"
                  />
                </Link>
                <Link
                  href="/search"
                  aria-label="search icon"
                  className={`${styles.search_icon}`}
                >
                  <img
                    src={`${ImageConfig?.mobileHeader?.searchIcon}`}
                    alt="search_icon"
                  />
                </Link>
              </div>
            </div>
            {duplicatemenus?.top_menus?.length > 0 && (
              <ul className={`${styles.headerMenus}`}>
                {duplicatemenus?.top_menus?.map((obj) => {
                  return (
                    <li key={obj.code}>
                      <Link
                        href={`${obj.targetPath}`}
                        target={
                          obj.params.targetType == "externalbrowser" ||
                          obj.code == "swag" ||
                          obj.code == "swag_mobile" ||
                          obj.code == "swag_mobile__v2" ||
                          obj.code == "swag__v2" ||
                          obj.params.web == "true"
                            ? "_blank"
                            : "_self"
                        }
                        onClick={() => sendAnaltics(obj)}
                        className={`${obj.targetPath == activetedmenu || (obj.targetPath == "/" && activetedmenu == "") ? styles.active : ""}`}
                      >
                        {obj.targetPath == activetedmenu ||
                        (obj.targetPath == "/" && activetedmenu == "") ? (
                          <h1>{obj.displayText}</h1>
                        ) : (
                          <>{obj.displayText}</>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      {!staticPaths.includes(pagePath?.path) && (
        <ul className={`${styles.bottom_menus}`}>
          {duplicatemenus?.bottom_menus?.map((obj, i) => {
            return (
              <li key={i}>
                {obj.code.includes("home") &&
                  menuItem(obj, "home", activetedmenu)}
                {obj.code === "search" &&
                  menuItem(obj, "search", activetedmenu)}
                {obj.code.includes("favourites") &&
                  menuItem(obj, "favourites", activetedmenu)}
                {obj.code.includes("watchlist") &&
                  menuItem(obj, "watchlist", activetedmenu)}
                {obj.code.includes("kids") &&
                  menuItem(obj, "kids", activetedmenu)}
                {obj.code.includes("account") &&
                  menuItem(obj, "myaccount", activetedmenu)}
                {obj.code.includes("guide") &&
                  menuItem(obj, "guide", activetedmenu)}
                {obj.code.includes("swag") &&
                  menuItem(obj, "fliqs", activetedmenu)}
                {(obj.code.includes("book") ||
                  obj.code.includes("dish") ||
                  obj.code.includes("d2h") ||
                  obj.code.includes("siti")) &&
                  menuItem(obj, "mydish", activetedmenu)}
                {obj.code.includes("plans") &&
                  menuItem(obj, "plans", activetedmenu)}
                {obj.code === "watch_now" &&
                  menuItem(obj, "watchnow", activetedmenu)}
                {obj.code === "catchup" &&
                  menuItem(obj, "catchup", activetedmenu)}
                {obj.code === "settings" &&
                  menuItem(obj, "settings", activetedmenu)}
                {obj.code === "quizzop" &&
                  menuItem(obj, "myaccount", activetedmenu)}
                {obj.code === "shorts" &&
                  menuItem(obj, "Shorts", activetedmenu)}
                {(obj.code === "live_tv_mobile" ||
                  obj.code === "live_tv_mobile__v2") &&
                  menuItem(obj, "live-tv", activetedmenu)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MHeader;
