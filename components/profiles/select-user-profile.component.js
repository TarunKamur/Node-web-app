import styles from "@/components/profiles/profiles-list.module.scss";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { actions, useStore } from "@/store/store";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { getAbsolutePath } from "@/services/user.service";
import { setUserDetails } from "@/services/user.service";
import {
  getPagePath,
  getQueryParams,
  jsonToQueryParams,
} from "@/services/utility.service";
import {
  setItem,
  deleteItem,
  getNookie,
  setNookie,
} from "@/services/local-storage.service";
import { appConfig } from "@/config/app.config";
import Loader from "../loader/loader.component";
import { SelectuserProfileconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import { sendProfileAnalyticsEvent } from "@/services/analytics.service";
import { unAuthorisedHandler } from "@/services/data-manager.service";

const PinProfile = dynamic(
  () =>
    import("../popups/profile/pin-profile-popup/pin-profile-popup.component")
);
export default function SelectUserProfile({ redirectionPath }) {
  const router = useRouter();
  const { mutate: mutateGetUserData, data: apiResponse } = useGetApiMutate();
  const {
    mutate: mutatePostProfileSelection,
    data: apiResponseProfile,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();
  const { mutate: mutateGetUData, data: apiUResponse } = useGetApiMutate();
  const [popupData, setPopUpData] = useState({});
  const refetchUser = useRef(false);
  const [Loadervalue, Setlodervalue] = useState();
  const {
    state: { userDetails, SystemFeature, navigateFrom, localLang },
    dispatch,
  } = useStore();
  const [userProfiles, setUserProfile] = useState([]);

  useEffect(() => {
    if (!!userDetails) {
      if (refetchUser.current === false) {
        deleteItem("profile-expiry-time");
        const cUserData = getNookie("user-info") || {};
        const newUserData = { ...cUserData, expiryTime: null };
        setNookie("user-info", newUserData);
        refetchUser.current = true;
        if (userDetails.profileParentalDetails) {
          setUserProfile(userDetails.profileParentalDetails);
        }
        getUserProfiles();
      }
    }
  }, [userDetails]);

  useEffect(() => {
    if (!!apiResponse) {
      if (apiResponse.data?.status === true) {
        setUserProfile(apiResponse.data.response);
        userDetails.profileParentalDetails = apiResponse.data.response;
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
        let masterProfileData = apiResponse.data.response?.filter(
          (profile) => !!profile.isMasterProfile
        );
        let phoneno =
          /^(?:(0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/;
        if (
          masterProfileData?.length > 0 &&
          !!masterProfileData[0] &&
          (masterProfileData[0]?.name == "" || !masterProfileData[0]?.name)
        ) {
          let pageQuery = getQueryParams(router.asPath);
          let routeTO = "/profiles/add-profile-name";
          if (pageQuery && pageQuery?.referer) {
            routeTO = routeTO + "?referer=" + pageQuery?.referer;
          }
          router.push(routeTO);
        }
      } else if (
        apiResponse?.data?.status === false &&
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
  }, [apiResponse]);

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
      setItem("uDetails", btoa(JSON.stringify(newUserData)));
      let url = process.env.initJson["api"] + "/service/api/auth/user/info";
      mutateGetUData(url);
    }
  }, [apiResponseProfile]);

  useEffect(() => {
    if (!!apiUResponse) {
      setUserDetails(apiUResponse.data.response);
      sendProfileAnalyticsEvent(apiUResponse.data.response, "clevertap");
      dispatch({
        type: actions.userDetails,
        payload: apiUResponse.data.response,
      });
      let pPath = router.asPath;
      let pageQuery = {
        path: getPagePath(pPath),
        query: getQueryParams(pPath),
      };

      if (pageQuery?.query?.referer) {
        let routeTO;
        if (pageQuery?.query?.referer.startsWith("/")) {
          routeTO = pageQuery?.query?.referer;
        } else {
          routeTO = "/" + pageQuery?.query?.referer;
        }

        console.log(routeTO);
        console.log(JSON.stringify(routeTO));
        router.replace(routeTO + `?cb=${new Date().getTime()}`);
      } else if (redirectionPath) {
        router.push(redirectionPath);
      } else if (!!navigateFrom) {
        dispatch({ type: actions.navigateFrom, payload: null });
        router.push(navigateFrom);
      }
      //  else if (pageQuery?.query?.referer) {
      //   let routeTO = window.location.origin + "/" + pageQuery?.query?.referer;
      //   console.log("going to rotue to");
      //   router.push(routeTO);
      // }
      else {
        router.push("/");
      }
    }
  }, [apiUResponse]);
  const getUserProfiles = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/list/user/profile";
    mutateGetUserData(url);
  };

  const pProfile = (profile, i) => {
    Setlodervalue(i);
    if (!!profile.isPinAvailable && !!profile.isProfileLockActive) {
      setPopUpData({
        type: "pinprofile",
        subtype: "select",
        isActive: true,
        userProfiles: profile,
        closeTarget: closeTarget,
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
      closeTarget();
      let url = process.env.initJson["api"] + "/service/api/auth/user/info";
      mutateGetUData(url);
    }
  };

  const addPinvalidate = (data) => {
    if (data.subtype == "add") {
      closeTarget();
      router.push("/profiles/create-user-profile");
    }
  };

  const closeTarget = () => {
    setPopUpData({});
  };

  return (
    <div>
      <img
        className={` ${styles.tablet_logo}`}
        src={appConfig?.appLogo}
        alt="Logo"
      />
      <div className={`${styles.select_profile_main}`}>
        <div className={`${styles.btn_div}`}>
          <img
            className={` ${styles.tablet_logo}`}
            src={appConfig?.appLogo}
            alt="Logo"
          />
          <button
            className={`${styles.manage_mobile__btn} `}
            onClick={() => router.push("/profiles/manage-user-profile")}
          >
            <img src={ImageConfig.profile.manage_profile_icon} />
            {SelectuserProfileconstant[localLang].Manage_Profiles}
          </button>
        </div>
        {/* <div className={`${styles.login_toastmsg}`}>
          <img src={ImageConfig.profile.login_success_icon}/>
           <span className={`${styles.text}`}>Logged in successfully</span>
        </div> */}
        <div className={`${styles.select_profile}`}>
          <h2>{SelectuserProfileconstant[localLang].Who_watching}</h2>
          <p className={`${styles.subText}`}>
            Add up to 5 members for a personalised experience
          </p>
          <p className={`${styles.fiveMember}`}>Add upto 5 members</p>
          <div className={`${styles.user_profiles}`}>
            {userProfiles?.map((profile, i) => (
              <div key={i} className={`${styles.profile}`}>
                <div
                  className={`${styles.inner}`}
                  onClick={() => pProfile(profile, i)}
                >
                  {isLoading && Loadervalue == i && (
                    <div className={`${styles.btn_loader}`}>
                      <Loader type={"button"}></Loader>
                    </div>
                  )}
                  <img
                    className={`${styles.profile_img} ${isLoading && Loadervalue == i ? `${styles.loader_active}` : ""}`}
                    src={
                      !!profile.imageUrl
                        ? getAbsolutePath(profile.imageUrl)
                        : "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/dummy-profile-img.png"
                    }
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src =
                        "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/dummy-profile-img.png";
                    }}
                    alt={profile.name}
                  />
                  {!!profile.isChildren && (
                    <span className={`${styles.kids_tag}`}>Kids</span>
                  )}
                  {!!profile.isPinAvailable &&
                    !!profile.isProfileLockActive && (
                      <div className={`${styles.lock}`}>
                        <img
                          src={`${appConfig.staticImagesPath}profile-lock.svg`}
                          alt="lock"
                        ></img>
                      </div>
                    )}
                  {/* {!!profile.isChildren && (
                    <span className={`${styles.is_children}`}>
                      {SelectuserProfileconstant[localLang].Children}
                    </span>
                  )} */}
                  {/* {<img src="https://d2ivesio5kogrp.cloudfront.net/static/gotv/images/loader-icon.png" className={`${styles.rotate}`} alt="rotate" /> } */}
                </div>
                <span className={`${styles.profile_name}`}>{profile.name}</span>
              </div>
            ))}
            {!!SystemFeature?.userprofiles?.fields.max_profile_limit &&
              !!userProfiles &&
              SystemFeature?.userprofiles?.fields.max_profile_limit >
                userProfiles.length && (
                <div
                  className={`${styles.profile} ${styles.add_profile}`}
                  onClick={() => router.push("/profiles/create-user-profile")}
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

          <button
            className={`${styles.manage__profile__btn} ${styles.theme_bg}`}
            onClick={() => router.push("/profiles/manage-user-profile")}
          >
            <img src={ImageConfig.profile.manage_profile_icon} />
            {SelectuserProfileconstant[localLang].Manage_Profiles}
          </button>
        </div>
      </div>
      {!!popupData.isActive && <PinProfile popupdata={popupData}></PinProfile>}
    </div>
  );
}
