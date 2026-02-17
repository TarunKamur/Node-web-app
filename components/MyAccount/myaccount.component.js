/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styles from "@/components/MyAccount/myaccount.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import { actions, useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import { getAbsolutePath, setUserDetails } from "@/services/user.service";
import {
  signoutTheApp,
  unAuthorisedHandler,
} from "@/services/data-manager.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import {
  getNookie,
  setItem,
  setNookie,
  getItem,
} from "@/services/local-storage.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import { MyAccountconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import { getPlansDetails } from "@/services/utility.service";
import { DHeaderconstant } from "@/.i18n/locale";
import PartnerModel from "../popups/partner-modal/partner.component";

const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const PinProfile = dynamic(
  () =>
    import("../popups/profile/pin-profile-popup/pin-profile-popup.component")
);
const LanguageModal = dynamic(
  () => import("../popups/languages-modal/languages.component")
);

const MyAccount = () => {
  const router = useRouter();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [popupData, setPopUpData] = useState({});
  const isLoggedIn = getItem("isloggedin");
  const [isProfileValidation, setIsProfileValidation] = useState(false);

  const {
    state: {
      SystemConfig,
      SystemFeature,
      userDetails,
      navigateFrom,
      localLang,
      Location,
    },
    dispatch,
  } = useStore();
  const [isCobranding, setCobrand] = useState("");

  const { mutate: mutatePostProfileSelection, data: apiResponseProfile } =
    usePostApiMutate();
  const { mutate: mutateGetUData, data: apiUResponse } = useGetApiMutate();

  // Enhanced profile selection logic with fallback
  const getSelectedProfile = (userDetails) => {
    if (!userDetails || !userDetails.profileParentalDetails) return null;

    const selectedProfile = userDetails.profileParentalDetails.find(
      (profile) => profile.profileId === userDetails.profileId
    );
    if (!selectedProfile) {
      return (
        userDetails.profileParentalDetails.find(
          (profile) => profile.isMasterProfile === true
        ) || userDetails.profileParentalDetails[0]
      );
    }
    return selectedProfile;
  };

  const selectedProfile = getSelectedProfile(userDetails);
  
  const [isVideoQualityOpen, setIsVideoQualityOpen] = useState(false);
  const [qualitySettings, setQualitySettings] = useState();
  const [selectedQuality, setSelectedQuality] = useState(
    !!getItem("selectedBitRate") ? getItem("selectedBitRate") : "Auto"
  );

  useEffect(() => {
    if (!!userDetails) {
      setCobrand(userDetails?.coBrandingLogoUrl);
    } else {
      setCobrand("");
    }
  }, [userDetails]);

  // Add profile validation on userDetails change and component mount
  useEffect(() => {
    if (userDetails && userDetails.profileParentalDetails) {
      const currentProfileId = userDetails.profileId;
      const availableProfiles = userDetails.profileParentalDetails;

      const currentProfileExists = availableProfiles.some(
        (profile) => profile.profileId === currentProfileId
      );

      if (!currentProfileExists) {
        const masterProfile =
          availableProfiles.find(
            (profile) => profile.isMasterProfile === true
          ) || availableProfiles[0];

        if (masterProfile && masterProfile.profileId !== currentProfileId) {
          setItem(
            "profile-expiry-time",
            new Date().getTime() + appConfig.profile.expiry * 1000
          );
          const cUserData = getNookie("user-info") || {};
          const newUserData = {
            ...cUserData,
            profileId: masterProfile.profileId,
            expiryTime: new Date().getTime() + appConfig.profile.expiry * 1000,
          };
          setNookie("user-info", newUserData);
          const updatedUserDetails = {
            ...userDetails,
            profileId: masterProfile.profileId,
          };

          setUserDetails(updatedUserDetails);
          dispatch({
            type: actions.userDetails,
            payload: updatedUserDetails,
          });
        }
      }
    }
  }, [userDetails]); // Runs on userDetails change and initial mount

  // Call user info API on page refresh/mount to ensure fresh data
  useEffect(() => {
    if (userDetails && userDetails.authToken) {
      setIsProfileValidation(true);
      const url = `${process.env.initJson.api}/service/api/auth/user/info`;
      mutateGetUData(url);
    }
  }, []);

  useEffect(() => {
    if (apiResponseProfile) {
      if (apiResponseProfile?.data?.status === true) {
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
      } else if (apiResponseProfile?.data?.status === false) {
        if (apiResponseProfile?.data?.error?.code === 401) {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: "Session expired!" },
          });
          unAuthorisedHandler();
        }
      }
    }
  }, [apiResponseProfile]);

  useEffect(() => {
    if (apiUResponse) {
      if (apiUResponse.data?.status === true) {
        setUserDetails(apiUResponse.data.response);
        dispatch({
          type: actions.userDetails,
          payload: apiUResponse.data.response,
        });
        dispatch({ type: actions.PageRefresh, payload: true });

        if (!isProfileValidation) {
          if (navigateFrom) {
            dispatch({ type: actions.navigateFrom, payload: router.asPath });
            router.push(navigateFrom);
          } else {
            router.push("/");
          }
        } else {
          setIsProfileValidation(false);
        }
      } else if (apiUResponse?.data?.status === false) {
        if (apiUResponse?.data?.error?.code === 401) {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: "Session expired!" },
          });
          unAuthorisedHandler();
        }
      }
    }
  }, [apiUResponse]);

  const navigateTo = (state) => {
    // eslint-disable-next-line default-case
    switch (state) {
      case "signin": {
        router.push("/signin");
        const facebookAnalyticsData = {
          eventType: "trackCustom",
          fbPixelId: process.env.fbPixelId,
          analyticsService: "facebook",
        };
        sendEvent("signin", {}, facebookAnalyticsData);
        break;
      }
      case "fav":
        sendEvent("my_favorites", {});
        router.push(`/${SystemConfig.configs.favouritesTargetPath}`);
        dispatch({ type: actions.navigateFrom, payload: router.asPath });
        break;
      case "signup":
        router.push("/signup");
        break;
      case "favourites": {
        router.push(`/${SystemConfig.favouritesTargetPath}`);
        sendEvent("my_favorites", {});
        break;
      }
      case "settings":
        router.push("/settings");
        dispatch({ type: actions.navigateFrom, payload: router.asPath });
        break;
      case "bookDTH":
        router.push("/bookDTH");
        break;
      case "support":
        router.push("/support");
        sendEvent("help_support", getPlansDetails());
        break;
      case "purchased-movies":
        router.push(`/${SystemConfig?.myPurchasesTargetPathWeb}`);
        break;
      case "purchased-movies-config":
        router.push(`/${SystemConfig.configs.myPurchasesTargetPathWeb}`);
        break;
      case "language":
        toggleLanguageModal(true);
        break;
      case "filter":
        togglePartnerModal(true);
        break;
      case "video_quality":
        setIsVideoQualityOpen(true);
        break;
      case "help": {
        if (!!userDetails) {
          sendEvent("help_support", getPlansDetails());
          window.open(
            `https://help-qa.watcho.com/?a_t=${userDetails?.authToken}&sid=${userDetails?.externalUserId}&mno=${userDetails?.phoneNumber}`
          );
        } else {
          let pop = {
            type: "signin",
            isActive: true,
            title1:
              DHeaderconstant[localLang]?.Please_Sign_In_To_Connect_With_Our,
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
        break;
      }
      case "help-center":
        router.push("/support/help-center");
        break;
      case "terms":
        router.push("/support/terms");
        break;
      case "privacy-policy":
        router.push("/support/privacy-policy");
        break;
      case "cookie-policy":
        router.push("/support/cookie-policy");
        break;
      case "contact-us":
        router.push("/support/contact-us");
        break;
      case "aboutus":
        router.push("/support/about-us");
        break;
      case "refund-policy":
        router.push("/support/refund-policy");
        break;
      case "faq":
        // router.push("/support/faq");
        sendEvent("faq", getPlansDetails());
        window.open("https://faq.watcho.com/", "_blank");
        break;
      case "becomepartner":
        window.open("https://ancillary.watcho.com/BecomeOurPartner", "_blank");
        break;
      case "grievance":
        router.push("/support/grievance");
        break;
      case "compliance":
        router.push("/support/compliance");
        break;
      case "packages":
        router.push("buy/packages-list");
        break;
      case "my_liked_videos": {
        router.push("list?content=mylikedvideos");
        break;
      }
      case "Channels": {
        router.push("list?content=Channels");
        break;
      }
      case "Purchased_content": {
        router.push("list?content=purchasedcontent");
        break;
      }
      case "activateTV": {
        dispatch({ type: actions.navigateFrom, payload: router.asPath });
        sendEvent("activate_TV_initiated", getPlansDetails());
        router.push("/activate/device?nf=settings");
        break;
      }
      case "swag_creator": {
        let mobileNumber =
          !!userDetails && !!userDetails?.phoneNumber
            ? userDetails?.phoneNumber
            : "-1";
        sendEvent("become_swag_partner", {
          ...getPlansDetails(),
          mobile_number: mobileNumber,
        });
        window.open("https://ancillary.watcho.com/BecomeSwagCreator", "_blank");
        break;
      }
      default: {
        router.push(state);
      }
    }
  };

  const navigateToSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signin");
  };
  const toggleLanguageModal = () => {
    setIsLanguageModalOpen(!isLanguageModalOpen);
  };

  const togglePartnerModal = () => {
    setIsPartnerModalOpen(!isPartnerModalOpen);
    sendEvent("filter_channel_partner", {});
  };

  const signoutHandler = () => {
    const pop = {
      type: "signout",
      isActive: true,
      title1:
        MyAccountconstant[localLang]?.Want_To_Signout ||
        "Are You sure, you want to sign out from this device?",
      yesButton1: MyAccountconstant[localLang]?.Sign_Out || "Sign Out",
      yesButtonType: "primary",
      yesButtonTarget1: proccedLogout,
      noButton1: MyAccountconstant[localLang]?.Cancel || "Cancel",
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
    handleClose();
    signoutTheApp();
  };

  const onBack = (event) => {
    event.stopPropagation();
    if (navigateFrom) {
      dispatch({ type: actions.navigateFrom, payload: null });
      router.push(navigateFrom);
    } else {
      router.push("/");
    }
  };

  const proceedWithProfile = (postData) => {
    const url = `${process.env.initJson.api}/service/api/auth/activate/user/profile`;
    mutatePostProfileSelection({ url, apiData: postData });
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

  const scprops = {
    border: "none",
    backgroundColor: "transparent !important",
    boxShadow: "none",
    margin: "0px !important",
  };

  const handleQualityChange = (quality) => {
    setItem("selectedBitRate", quality);
    setSelectedQuality(quality);
    setIsVideoQualityOpen(false);
  };

  useEffect(() => {
    // setGlobalCCEnabled(getItem("closedCaption"))
    if (!!SystemConfig && SystemConfig?.configs?.videoQualitySettings) {
      let bitrate = !!getItem("selectedBitRate")
        ? getItem("selectedBitRate")
        : "Auto";
      const videoQ = JSON.parse(SystemConfig?.configs?.videoQualitySettings);
      setQualitySettings(videoQ);
      setSelectedQuality(bitrate);
    }
  }, [SystemConfig]);

 const redirectToPlansList = () => {
   router.push("/plans/list");
  };

  return (
    <>
      <div className={`${styles.my_account}`}>
        <div className={`${styles.mega_menu}`}>
          <div className={`${styles.mega_menu_parent}`}>
            <div className={`${styles.mega_menu_inner}`}>
                <div className={`${styles.mega_menu_header}`}>
                  <span className={`${styles.menu_header}`}>
                    <span onClick={onBack} className={`${styles.back_btn}`}>
                      <img
                        src={`${ImageConfig?.myAccount?.helpBackArrow}`}
                        alt="back"
                      />
                    </span>
                    <h1> My Account </h1>
                  </span>
                </div>
              <div className={`${styles.myAccount_menu_list}`}>
                {!isLoggedIn && !userDetails && (
                  <div className={`${styles.without_login}`}>
                    <img src={`${ImageConfig?.myAccount?.myAccountIocn}`} />
                    <h3>Don't Be A Guest At Your Own Party Log In Now!</h3>
                  </div>
                )}
                {!isLoggedIn && !userDetails && (
                  <div className={`${styles.login_btn}`}>
                    <Link href="/signin" prefetch={false}>
                      Log In To Your Account
                    </Link>
                  </div>
                )}
                    {!!userDetails && (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {!!SystemFeature &&
                  !!SystemFeature.userprofiles &&
                  SystemFeature.userprofiles.fields.is_userprofiles_supported ==
                    "true" ? (
                    <div className={`${styles.profiles_container}`}>
                       <p className={`${styles.profile_hd}`}>My Profiles</p>
                    <img
                      className={`${styles.edit}`}   onClick={() => {
                        dispatch({ type: actions.navigateFrom, payload: router.asPath });
                        router.push("/profiles/manage-user-profile");
                      }}
                      src={`https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_edit_icon.svg`}
                      alt="edit"
                    ></img>
                      <div className={`${styles.profiles_list}`}>
                          <div className={`${styles.accountMobile_Info}`}>
                            <div className={`${styles.profile_info}`}>
                              <div className={`${styles.profile_icon} ${styles.selected}`}>
                              <img
                                className={`${styles.profile_img}`}
                                src={
                                  selectedProfile?.imageUrl
                                    ? getAbsolutePath(selectedProfile?.imageUrl)
                                    : `${ImageConfig?.myAccount?.defaultProfilePic}`
                                }
                                alt={selectedProfile?.name}
                                onError={({ currentTarget }) => {
                                  currentTarget.onerror = null; // prevents looping
                                  currentTarget.src = `${ImageConfig?.myAccount?.helpBackArrow}`;
                                }}
                              />
                               {!!selectedProfile?.isChildren && (
                                 <span className={`${styles.kids_tag}`}>Kids</span>
                                 )}
                                  {!!selectedProfile.isPinAvailable &&
                                    !!selectedProfile.isProfileLockActive && (
                                      <img
                                        className={`${styles.lock}`}
                                        src={`${appConfig.staticImagesPath}profile-lock.svg`}
                                        alt="lock"
                                      ></img>
                                    )}
                              </div>
                              <span className={`${styles.profile_name}`}>{selectedProfile?.name}</span>
                          
                          </div>
                        </div>
                        <div
                          className={`${styles.profile_details}`}
                        >
                          <ul className={`${styles.profile_details_inner}`}>
                            <li className={`${styles.profile_info}`}>
                              <ul className={`${styles.subprofile_list}`}>
                                {userDetails?.profileParentalDetails.map(
                                  (profile) => {
                                    if (
                                      profile.profileId != userDetails.profileId
                                    ) {
                                      return (
                                        <li
                                          className={`${styles.profileData}`}
                                          key={profile?.profileId}
                                          onClick={() => profileSwitch(profile)}
                                        >
                                          <div
                                            className={`${styles.profileDetails}`}
                                          >
                                            <div className={`${styles.profile_icon}`}>
                                            <img
                                              className={`${styles.subprofile_img}`}
                                              src={
                                                profile.imageUrl
                                                  ? getAbsolutePath(
                                                      profile.imageUrl
                                                    )
                                                  : `${ImageConfig?.myAccount?.defaultProfilePic}`
                                              }
                                              alt="name"
                                            />
                                             {!!profile.isChildren && (
                                                  <span className={`${styles.kids_tag}`}>Kids</span>
                                                )}
                                                  {!!profile.isPinAvailable &&
                                                  !!profile.isProfileLockActive && (
                                                    <img
                                                      className={`${styles.lock}`}
                                                      src={`${appConfig.staticImagesPath}profile-lock.svg`}
                                                      alt="lock"
                                                    ></img>
                                                  )}
                                                </div>
                                            <span
                                              className={`${styles.profile_name}`}
                                            >
                                              {profile.name}
                                            </span>
                                          </div>
                                        </li>
                                      );
                                    }
                                    return null;
                                  }
                                )}
                                
                              </ul>
                            </li>
                          </ul>
                        </div>
                          {!!SystemFeature?.userprofiles?.fields.max_profile_limit &&
                          parseInt(SystemFeature?.userprofiles?.fields.max_profile_limit) >
                           userDetails?.profileParentalDetails.length && (
                            <div
                              className={`${styles.profile} ${styles.add_profile}`}
                               onClick={() => {
                                  dispatch({ type: actions.navigateFrom, payload: router.asPath });
                                  router.push("/profiles/create-user-profile");
                                }}
                            >
                              <div className={`${styles.inner}`}>
                                <img
                                  className={`${styles.add_icon}`}
                                  src={`${ImageConfig.profile.addProfile}`}
                                  alt="add profile"
                                ></img>
                              </div>

                              <span className={`${styles.profile_name}`}>Add profile</span>
                            </div>
                          )}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`${styles.mega_menu_headerAcc} ${styles.normalMobile_header}`}
                    >
                      <div className={`${styles.profileNameTop}`}>
                        <div
                          className={`${styles.accountMobile_Info} ${styles.accountMobile_Info_noPfl}`}
                        >
                          <div className={`${styles.profile_info}`}>
                            <span
                              onClick={onBack}
                              className={`${styles.back_btn}`}
                            >
                              <img
                                src={`${ImageConfig?.myAccount?.helpBackArrow}`}
                                alt="back"
                              />
                            </span>
                            {!!SystemFeature &&
                            !!SystemFeature.userprofiles &&
                            SystemFeature.userprofiles.fields
                              .is_userprofiles_supported == "true" &&
                            userDetails ? (
                              <img
                                className={`${styles.profile_img}  ${!selectedProfile?.imageUrl && styles.OrkprofileFile}`}
                                src={
                                  selectedProfile?.imageUrl
                                    ? getAbsolutePath(selectedProfile?.imageUrl)
                                    : `${ImageConfig?.myAccount?.userProfilePic}`
                                }
                                alt={selectedProfile?.name}
                                onError={({ currentTarget }) => {
                                  currentTarget.onerror = null; // prevents looping
                                  currentTarget.src = `${ImageConfig?.myAccount?.userProfilePic}`;
                                }}
                              />
                            ) : (
                              <span className={`${styles.profile_img} `}>
                                {!!userDetails.name && userDetails?.name[0]}
                              </span>
                            )}
                            <span>{userDetails?.name}</span>
                          </div>
                        
                        </div>
                      </div>
                    </div>
                  )}
                </>
                   )}
                {!!userDetails?.eligiblePackAction && (
                        <div className={`${styles.subscription_button_container}`}>
                          <button 
                            className={`${styles.action_button} ${
                              userDetails.eligiblePackAction === "Subscribe" ? styles.subscribe_button :
                              userDetails.eligiblePackAction === "upgrade" ? styles.upgrade_button :
                              userDetails.eligiblePackAction === "renew" ? styles.renew_button : ""
                            }`}
                           onClick={(e) => {redirectToPlansList()}}
                          >
                            <img 
                              src={
                                userDetails.eligiblePackAction === "Subscribe" ? ImageConfig.myAccount.myaccountSubscribe :
                                userDetails.eligiblePackAction === "upgrade" ? ImageConfig.myAccount.myaccountUpgrade :
                                userDetails.eligiblePackAction === "renew" ? ImageConfig.myAccount.myaccountRenew : ImageConfig.myAccount.myaccountSubscribe
                              }
                              alt={userDetails.eligiblePackAction.toLowerCase()}
                            />
                            {userDetails.eligiblePackAction === "Subscribe" ? "Subscribe Now" :
                             userDetails.eligiblePackAction === "upgrade" ? "Upgrade Your Plan" :
                             userDetails.eligiblePackAction === "renew" ? "Renew Your Plan" : ""}
                              <img
                                className={`${styles.arrow}`}
                                src={
                                  userDetails.eligiblePackAction === "Subscribe" || 
                                  userDetails.eligiblePackAction === "upgrade" 
                                    ? ImageConfig.myAccount.myAccountBlackArrow 
                                    : userDetails.eligiblePackAction === "renew" 
                                      ? ImageConfig.myAccount.myAccountArrow
                                      : ImageConfig.myAccount.myAccountBlackArrow
                                }
                                alt="arrow"
                              />
                          </button>
                        </div>
                          )}
                <div className={`${styles.account_menus}`}>
                  {Object.entries(appConfig?.myAccountlist || {}).map(
                    ([groupKey, groupData]) => {
                      if (groupData?.postLoginMenu && !userDetails) {
                        return null; 
                      }

                      const visibleMenus = groupData?.menus?.filter(
                        (menuItem) => {
                          if (
                            !menuItem?.show ||
                            (!!isCobranding &&
                              menuItem?.targetPath == "swag_creator")
                          ) {
                            return false;
                          }

                          if (menuItem.postLoginMenu && !userDetails) {
                            return false;
                          }

                          if (
                            menuItem.systemConfigKey &&
                            !menuItem?.systemConfigValue &&
                            !SystemConfig?.configs?.[menuItem?.systemConfigKey]
                          ) {
                            return false;
                          }

                          let MenusforIND = [
                            "Help_Support",
                            "FAQs",
                            "Become_our_Partner",
                            "Activate_TV",
                            "grienavce_redressal",
                            "become_a_swag_creator",
                            "Privacy_Policy"
                          ];

                          if (
                            Location?.ipInfo?.countryCode !== "IN" &&
                            Location?.ipInfo?.countryCode !== "US" &&
                            MenusforIND.includes(menuItem.displayName)
                          ) {
                            return false;
                          }

                          // Menu visibility is based on system config with particular value
                          if (
                            menuItem.systemConfigKey &&
                            menuItem?.systemConfigValue &&
                            SystemConfig?.configs?.[
                              menuItem?.systemConfigKey
                            ] != menuItem.systemConfigValue
                          ) {
                            return false;
                          }

                          return true; 
                        }
                      );
                      if (!visibleMenus || visibleMenus.length === 0) {
                        return null;
                      }

                      return (
                        <div key={groupKey} className={`${styles.menu_group}`}>
                          <p className={`${styles.title}`}>
                            {groupData?.title}
                          </p>
                          <div className={`${styles.menu_list}`}>
                            <ul
                              className={`${userDetails ? "" : `${styles.ulPadTop}`}`}
                            >
                              {visibleMenus.map((menuItem) => {
                                let { displayName } = menuItem;
                                if (
                                  menuItem.displayName == "SUBSCRIBE" &&
                                  userDetails?.packages?.some(
                                    (data) => data.expiryDate > Date.now()
                                  )
                                ) {
                                  displayName = menuItem.ifSubscribed;
                                }

                                const icon = menuItem?.icon;

                                return (
                                  <li
                                    className={`${styles.accordian} ${displayName}`}
                                    onClick={() =>
                                      navigateTo(menuItem.targetPath)
                                    }
                                    key={menuItem.targetPath}
                                  >
                                    {icon && (
                                      <img
                                        src={icon}
                                        alt={displayName}
                                        className={`${styles.menu_icon}`}
                                      />
                                    )}
                                    <span className={`${styles.menu_text}`}>
                                      {
                                        MyAccountconstant?.[localLang]?.[
                                          displayName
                                        ]
                                      }
                                    </span>
                                    <img
                                      className={`${styles.arrow}`}
                                      src={ImageConfig.myAccount.myAccountArrow}
                                      alt="arrow"
                                    />
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      );
                    }
                  )}
                  {!!userDetails && (
                  <button
                    type="button"
                    onClick={signoutHandler}
                    className={`${styles.sign_out}`}
                  >
                    <img src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_signout_icon.svg" />
                    {MyAccountconstant[localLang].Sign_Out}
                  </button>
                )}
              
                </div>
              </div>
            </div>
          </div>
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
      {isVideoQualityOpen && (
        <div className={`${styles.my_account} ${styles.qualitySettings}`}>
          <div className={`${styles.mega_menu}`}>
            <div className={`${styles.mega_menu_parent}`}>
              <div className={`${styles.mega_menu_inner}`}>
                <div className={`${styles.mega_quality_menu_inner}`}>
                  <div className={`${styles.mega_menu_header}`}>
                    <div className={`${styles.menu_header}`}>
                      <h5>{MyAccountconstant[localLang].videoquality}</h5>
                      <span
                        onClick={() => setIsVideoQualityOpen(false)}
                        className={`${styles.back_btn}`}
                      >
                        <img
                          src={`${appConfig.staticImagesPath}lan-popup-close.png`}
                          alt="back"
        />
                      </span>
                    </div>
                  </div>
                  <div className={`${styles.mobile_oth_menu}`}>
                    <ul className={`${`${styles.ulPadTop}`}`}>
                      {qualitySettings?.map((quality) => (
                        <li key={quality.code}>
                          <label className={styles.vdQuality}>
                            <input
                              type="radio"
                              name="videoQuality"
                              className={`${styles.radio} ${selectedQuality === quality.displayTitle ? styles.selected : ""}`}
                              onChange={() =>
                                handleQualityChange(quality.displayTitle)
                              }
                            />
                            <span className={styles.sm_label}>
                              {MyAccountconstant[localLang][quality.code]}
                            </span>
                            <span className={styles.check_radio}></span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyAccount;
