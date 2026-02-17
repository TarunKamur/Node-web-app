import { useEffect, useState } from "react";
import styles from "@/components/header-vesta/header.module.scss";
import { actions, useStore } from "@/store/store";
import Link from "next/link";
import useWindowScroll from "@/hooks/useWindowScroll";
import LanguageModal from "../popups/languages-modal/languages.component";
import PartnerModel from "../popups/partner-modal/partner.component";
import PopupModal from "../popups/generic/popup-modal";
import { signoutTheApp } from "@/services/data-manager.service";
import { appConfig } from "@/config/app.config";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { getAbsolutePath, setUserDetails } from "@/services/user.service";
import {
  getNookie,
  setItem,
  setNookie,
} from "@/services/local-storage.service";
import PinProfile from "../popups/profile/pin-profile-popup/pin-profile-popup.component";
import { useRouter } from "next/router";
import PageLoader from "../loader/page-loder.component";
import { DHeaderconstant } from "@/.i18n/locale";
import React from "react";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import { getPlansDetails } from "@/services/utility.service";

const DHeader = ({ pagePath }) => {
  const {
    state: {
      SystemConfig,
      userDetails,
      SystemFeature,
      PageData,
      navigateFrom,
      localLang,
    },
    dispatch,
  } = useStore();
  const { mutate: mutatePostProfileSelection, data: apiResponseProfile } =
    usePostApiMutate();
  const router = useRouter();
  const { mutate: mutateGetUData, data: apiUResponse } = useGetApiMutate();
  const [duplicatemenus, setDuplicateMenus] = useState([]);
  const [isloggedin, setIsLoggedIn] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrolledToppx } = useWindowScroll();
  const [activetedmenu, setselectedmenu] = useState("");
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [popupData, setPopUpData] = useState({});
  const [loder, setLoder] = useState(false);
  // default menu count 5
  const [Menucount, setMenucount] = useState(5);
  useEffect(() => {
    if (scrolledToppx !== null) {
      if (scrolledToppx >= 200) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
  }, [scrolledToppx]);

  useEffect(() => {
    if (!!SystemConfig) {
      getMenus();
    }
  }, [SystemConfig, pagePath]);

  useEffect(() => {
    if (!!SystemConfig && !!SystemConfig.configs.menusMore) {
      let Moremenusdata = JSON.parse(SystemConfig.configs.menusMore);
      let resolution = [];
      let stop = false;
      for (let res in Moremenusdata) {
        resolution.push(parseInt(res.split("_")[1]));
      }
      for (let i = 0; i < resolution.length; i++) {
        if (window.innerWidth >= resolution[i]) {
          for (let res in Moremenusdata) {
            if (resolution[i] >= parseInt(res.split("_")[1])) {
              setMenucount(parseInt(Moremenusdata[res]));
              stop = true;
              break;
            }
          }
        }
        if (!!stop) break;
      }
    }
  }, [SystemConfig]);

  useEffect(() => {
    if (!!userDetails) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [userDetails]);

  useEffect(() => {
    if (!!apiResponseProfile) {
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
      let url = process.env.initJson["api"] + "/service/api/auth/user/info";
      mutateGetUData(url);
    }
  }, [apiResponseProfile]);

  useEffect(() => {
    if (!!apiUResponse) {
      setUserDetails(apiUResponse.data.response);
      dispatch({
        type: actions.userDetails,
        payload: apiUResponse.data.response,
      });
      dispatch({ type: actions.PageRefresh, payload: true });
    }
  }, [apiUResponse]);

  const getMenus = () => {
    let dMenus = SystemConfig.menus;
    if (dMenus.length > 0) {
      dMenus[0].targetPath = "/";
      if (!!dMenus[0].subMenus && dMenus[0].subMenus.length > 0) {
        dMenus[0].subMenus[0].targetPath = "/";
      }
      setDuplicateMenus(dMenus);
    }
    let selected = selectedMenus(pagePath.path);
    setselectedmenu(selected);
  };

  const selectedMenus = (url) => {
    let Urlsplit = url.split("?")[0].split("/");
    return Urlsplit;
  };

  const toggleLanguageModal = (e) => {
    setIsLanguageModalOpen(!isLanguageModalOpen);
  };

  const togglePartnerModal = (e) => {
    setIsPartnerModalOpen(!isPartnerModalOpen);
  };

  const signoutHandler = () => {
    let pop = {
      type: "signout",
      isActive: true,
      title1:
        DHeaderconstant[localLang]?.Want_To_Signout ||
        "Are You sure, you want to sign out from this device?",
      yesButton1: DHeaderconstant[localLang]?.Cancel || "Cancel",
      yesButtonType: "primary",
      yesButtonTarget1: handleClose,
      noButton1: DHeaderconstant[localLang]?.Sign_Out || "Sign Out",
      noButtontarget1: proccedLogout,
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
    let url =
      process.env.initJson["api"] + "/service/api/auth/activate/user/profile";
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
      let url = process.env.initJson["api"] + "/service/api/auth/user/info";
      mutateGetUData(url);
    }
  };

  const setNavigation = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    sendEvent("signin", {});
  };

  const getActivatedMenuForMoreMenu = (arr) => {
    let res = arr.filter((ele) => {
      return ele.targetPath === activetedmenu[0];
    });
    return res.length > 0 ? true : false;
  };

  let Moremenus = [];

  return (
    <div
      className={` title ${styles.main_nav}  ${
        isScrolled ? `${styles.nav_fixed}` : `${styles.nav_transparent}`
      }`}
    >
      {!!appConfig?.header?.topHeader && (
        <div className={` ${styles.top_header} `}>
          <div className={`${styles.container}`}>
            {!!appConfig?.header?.partners && (
              <span
                className={`${styles.language}`}
                onClick={(e) => togglePartnerModal(e)}
              >
                <img
                  src={`${ImageConfig?.desktopHeader?.headerFilter}`}
                  alt=""
                ></img>
                {DHeaderconstant[localLang].Filter}
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
                ></img>
                {DHeaderconstant[localLang].Languages}
              </span>
            )}

            <Link className={`${styles.help}`} href="/support/about-us">
              <img
                src={`${ImageConfig?.desktopHeader?.headerAbout}`}
                alt=""
              ></img>
              {DHeaderconstant[localLang].About_us}
            </Link>
            <span className={`${styles.help}`}>
              <img
                src={`${ImageConfig?.desktopHeader?.headerMailSupport}`}
                alt=""
              ></img>
              <Link href="mailto:info@timesgroup.com">
                {DHeaderconstant[localLang].Support_mail}
              </Link>
            </span>
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
        <span className={` ${styles.header_gradient} `}></span>
        <div className={` title ${styles.nav_left} `}>
          <Link
            href={router.asPath === "/" ? "" : "/"}
            onClick={(e) => {
              if (router.asPath === "/") {
                e.preventDefault();
              }
            }}
            aria-label="app logo"
          >
            <img className={`${styles.logo}`} src={appConfig?.appLogo} />
          </Link>
          <>
            <ul>
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
                                <li key={subMenu.code}>
                                  <Link
                                    target={
                                      obj.params.targetPath == "internalbrowser"
                                        ? "_blank"
                                        : "_self"
                                    }
                                    href={subMenu.targetPath}
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
                            obj.params.targetPath == "internalbrowser"
                              ? "_blank"
                              : "_self"
                          }
                          href={
                            obj.subMenus.length > 0
                              ? ""
                              : obj.code == "home"
                                ? router.asPath == obj.targetPath
                                  ? ""
                                  : obj.targetPath
                                : router.asPath === "/" + obj.targetPath
                                  ? ""
                                  : `/${obj.targetPath}`
                          }
                          className={`${
                            obj.targetPath == activetedmenu ||
                            (obj.targetPath == "/" && activetedmenu == "")
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
                          }}
                        >
                          {obj.displayText}
                        </Link>
                      )}
                      <div className={`${styles.tag_class}`}>
                        {!!userDetails &&
                          !!obj.params.login_and_pack_marker &&
                          !!obj.params.login_and_no_pack_marker && (
                            <span
                              className={`${styles.tag} ${!!userDetails.packages && userDetails.packages.length > 0 ? `${styles.bp}` : ""}`}
                            >
                              {!!userDetails.packages &&
                              userDetails.packages.length > 0
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
                    className={`${styles.hasMoreDiv} ${getActivatedMenuForMoreMenu(Moremenus) ? `${styles.active}` : ""}`}
                  >
                    {DHeaderconstant[localLang].More}
                    <ul className={`${styles.dropdown}`}>
                      {Moremenus.map((subObj, j) => (
                        <li key={subObj.code}>
                          <Link
                            target={
                              subObj.params.targetPath === "internalbrowser"
                                ? "_blank"
                                : "_self"
                            }
                            href={subObj.targetPath}
                          >
                            {subObj.displayText}
                            {!!subObj.subMenus &&
                              subObj.subMenus.length > 0 && (
                                <ul className={`${styles.dropdown}`}>
                                  {subObj.subMenus.map((subMenu, j) => (
                                    <li key={subMenu.code}>
                                      <Link href={subMenu.targetPath}>
                                        {subMenu.displayText}
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
          </>
        </div>
        <div className={` title ${styles.nav_right} `}>
          <Link
            href="/search"
            className={` title ${styles.main_search} `}
            onClick={() => sendEvent("search_button", getPlansDetails())}
          >
            <img
              src={`${ImageConfig?.desktopHeader?.searchIcon}`}
              alt="search-icon"
            />
            <span className={` ${styles.search} `}>Search</span>
          </Link>
          {!isloggedin && (
            <Link href="/signin" onClick={setNavigation}>
              {DHeaderconstant[localLang].SIGN_IN}
            </Link>
          )}
          {!isloggedin && (
            <Link href="/signup" className={`primary`}>
              {DHeaderconstant[localLang].SIGN_UP}
            </Link>
          )}

          {isloggedin && (
            <div className={` ${styles.profile_menu_nav} `}>
              <span className={` ${styles.profile_name_block} `}>
                {!!SystemFeature &&
                  !!SystemFeature.userprofiles &&
                  SystemFeature.userprofiles.fields.is_userprofiles_supported ==
                    "true" &&
                  userDetails &&
                  userDetails.profileParentalDetails.map((ele, ind) => (
                    <React.Fragment key={ind}>
                      {ele.profileId == userDetails.profileId && (
                        <>
                          <span
                            className={` ${styles.profile_icon} ${styles.with_profiles} `}
                          >
                            <img
                              src={
                                !!ele.imageUrl
                                  ? getAbsolutePath(ele.imageUrl)
                                  : `${ImageConfig?.desktopHeader?.profileImage}`
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
                  ))}
                {(!!SystemFeature &&
                  !!SystemFeature.userprofiles &&
                  SystemFeature.userprofiles.fields.is_userprofiles_supported ==
                    "false") ||
                  (!!SystemFeature && !SystemFeature.userprofiles && (
                    <>
                      <span className={`${styles.profile_icon} `}>
                        {!!userDetails.name && userDetails?.name[0]}
                      </span>
                      <span className={` ${styles.profile_name}`}>
                        {userDetails?.name}
                      </span>
                    </>
                  ))}
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
                        onClick={() => sendEvent("my_favorites", {})}
                        href={SystemConfig.configs.favouritesTargetPath}
                      >
                        {DHeaderconstant[localLang].My_Watchlist}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/settings"
                      onClick={() =>
                        sendEvent("account_setting", getPlansDetails())
                      }
                    >
                      {DHeaderconstant[localLang].Account_Settings}
                    </Link>
                  </li>
                  <li className={`${styles.devider}`}></li>
                  <li>
                    <Link
                      href="/support/terms"
                      onClick={() =>
                        sendEvent("help_support", getPlansDetails())
                      }
                    >
                      {DHeaderconstant[localLang].Help_Support}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/support/terms"
                      onClick={() => sendEvent("faq", getPlansDetails())}
                    >
                      {DHeaderconstant[localLang].FAQ}
                    </Link>
                  </li>
                  <li onClick={signoutHandler}>
                    <div> {DHeaderconstant[localLang].Sign_Out} </div>
                  </li>
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
                              <li onClick={() => profileSwitch(obj)}>
                                <img
                                  className={` ${styles.user_icon} `}
                                  src={
                                    !!obj.imageUrl
                                      ? getAbsolutePath(obj.imageUrl)
                                      : `${ImageConfig?.desktopHeader?.profileImage}`
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
                      {userDetails.profileParentalDetails.length > 1 && (
                        <li className={`${styles.devider}`}></li>
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
      {popupData.isActive && popupData.type === "signout" && (
        <PopupModal popupData={popupData}></PopupModal>
      )}
      {!!popupData.isActive && popupData.type === "pinprofile" && (
        <PinProfile popupData={popupData}></PinProfile>
      )}
      {loder && <PageLoader></PageLoader>}
    </div>
  );
};

export default DHeader;
