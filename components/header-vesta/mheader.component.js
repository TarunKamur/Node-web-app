import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import styles from "@/components/header-vesta/header.module.scss";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import useWindowScroll from "@/hooks/useWindowScroll";
import { ImageConfig } from "@/config/ImageConfig";

const menuItem = (obj, imgPath, activeMenu) => {
  return (
    <div
      className={`${obj.targetPath == activeMenu || (obj.targetPath == "/" && activeMenu == "") ? styles.active : ""}`}
    >
      <Link
        href={obj.code == "account" ? "/myaccount" : `/${obj.targetPath}`}
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
    state: { SystemConfig, PageData },
  } = useStore();
  const [duplicatemenus, setDuplicateMenus] = useState({});
  const [activetedmenu, setselectedmenu] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrolledToppx } = useWindowScroll();
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [showHeaderTop, setShowHeaderTop] = useState(true);
  const favoritePath = SystemConfig?.configs?.favouritesTargetPath;
  const hideHeaderTopPaths = [
    "search",
    "shorts",
    "settings",
    "settings/edit-profile",
    favoritePath,
    "buy/packages-list",
    "buy/order-summary/",
    "/profiles"
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

  return (
    <div
      className={`${isScrolled ? ` ${styles.headerMobile_fixed}` : `${styles.nav_transparent}`} ${
        (scrolledToppx < 200 && PageData?.banners?.length > 0) ||
        PageData?.info?.pageType === "details"
          ? `${styles.has_trans}`
          : `${styles.no_trans}`
      }`}
    >
      {!hideHeaderTopPaths.includes(pagePath?.path) && showHeaderTop && (
        <div className={`${styles.mobile_header}`}>
          <div className={`${styles.mobile_header_top}`}>
            <Link href="/" aria-label="app logo">
              <img
                className={`${styles.logo}`}
                src={appConfig?.appLogo}
                alt="Logo"
              />
            </Link>
            <Link href="/search" aria-label="search icon">
              <img
                className={`${styles.searchIcon}`}
                src={`${ImageConfig?.mobileHeader?.searchIcon}`}
                alt=""
              />
            </Link>
          </div>
          <ul className={`${styles.headerMenus}`}>
            {duplicatemenus?.top_menus?.map((obj, i) => {
              return (
                <li key={i}>
                  <Link
                    href={`/${obj.targetPath}`}
                    className={`${obj.targetPath == activetedmenu || (obj.targetPath == "/" && activetedmenu == "") ? styles.active : ""}`}
                  >
                    {obj.displayText}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <ul className={`${styles.bottom_menus}`}>
        {duplicatemenus?.bottom_menus?.map((obj, i) => {
          return (
            <li key={i}>
              {obj.code.includes("home") &&
                menuItem(obj, "home", activetedmenu)}
              {obj.code === "search" && menuItem(obj, "serach", activetedmenu)}
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
                menuItem(obj, "swag", activetedmenu)}
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
              {obj.code === "shorts" && menuItem(obj, "Shorts", activetedmenu)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MHeader;
