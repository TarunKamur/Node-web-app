import styles from "@/components/profiles/profiles-list.module.scss";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { actions, useStore } from "@/store/store";
import useGetApiMutate from "@/hooks/useGetApidata";
import { getAbsolutePath } from "@/services/user.service";
import { appConfig } from "@/config/app.config";
import PageLoader from "../loader/page-loder.component";
import { deleteItem, getItem, setItem } from "@/services/local-storage.service";
import { ManageuserProfileconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { userDetails } from "@/services/user.service";
const PinProfile = dynamic(
  () =>
    import("../popups/profile/pin-profile-popup/pin-profile-popup.component")
);
function ManageUserProfile() {
  const router = useRouter();
  const {
    mutate: mutateGetUserData,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const refetchUser = useRef(false);
  const [popupData, setPopUpData] = useState({});

  const {
    state: { userDetails, SystemConfig, SystemFeature, localLang,navigateFrom },
    dispatch,
  } = useStore();
  const [userProfiles, setUserProfile] = useState([]);
  const isUtUser = getItem("isUtuser");

  useEffect(() => {
    if (!!userDetails) {
      if (refetchUser.current === false) {
        refetchUser.current = true;
        setUserProfile(userDetails.profileParentalDetails);
        getUserProfiles();
      }
    }
  }, [userDetails]);

  useEffect(() => {
    if (!!apiResponse) {
      if (apiResponse?.data?.status) {
        setUserProfile(apiResponse.data.response);
        userDetails.profileParentalDetails = apiResponse.data.response;
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
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
    }
  }, [apiResponse]);

  const getUserProfiles = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/list/user/profile";
    mutateGetUserData(url);
  };

  useEffect(() => {
    if (router.pathname.startsWith("/profile")) {
      const originalPadding = document.body.style.padding;
      document.body.style.paddingBottom = "0";

      return () => {
        document.body.style.paddingBottom = originalPadding;
      };
    }
  }, [router.pathname]);
  const addPinvalidate = (data) => {
    if (data.subtype == "add") {
      closeTarget();
      router.push("/profiles/create-user-profile");
    }
  };

  const closeTarget = () => {
    setPopUpData({});
  };

  const navigateUpdate = (item) => {
    console.log(userDetails);
    // router.push(`/profiles/image-upload/${item.profileId}`);
    // dispatch({ type: actions.navigateFrom, payload: router.asPath });
    if (item.isMasterProfile && item?.name.toLowerCase() === "you") {
      router.push(`/profiles/image-upload/${item.profileId}`);
    } else {
      router.push(`/profiles/update-user-profile/${item.profileId}`);
    }
    if (isLoading) {
      // return(
      // <PageLoader ></PageLoader>
      // )
    }
  };

  const gotoSelectProfiles = () => {
    if (!!isUtUser) {
      deleteItem("redirection");
      window.location.href = SystemConfig?.configs?.siteURL;
    } else if (navigateFrom) {
      dispatch({ type: actions.navigateFrom, payload: null }); // Clear the stored path
      router.push(navigateFrom);
    }
    else {
      router.push("/profiles/select-user-profile");
    }
    // !!isUtUser
    //   ? (window.location.href = SystemConfig?.configs?.siteURL)
    //   : router.push("/profiles/select-user-profile");
  };

  if (!userDetails) return <></>;

  return (
    <>
      <div className={`${styles.manage_profile}`}>
        <div className={styles.navContainer}>
          <span>
            <img
              src={ImageConfig?.bookd2h?.back}
              className={styles.back}
              // onClick={() => router.push("/profiles/select-user-profile")}
              onClick={gotoSelectProfiles}
            />
            {ManageuserProfileconstant[localLang].Manage_Profiles}
          </span>
        </div>
        <button
          className={`${styles.manage__profile_btn} ${styles.theme_bg} `}
          onClick={gotoSelectProfiles}
        >
          {ManageuserProfileconstant[localLang].Done}
        </button>
        <div className={styles.centeredContainer}>
          <div className={styles.whosWatching}>
            <h4>Who’s Watching ?</h4>
            <p>Add upto 5 members</p>
          </div>
          <div className={`${styles.user_profiles}`}>
            {userProfiles?.map((profile, i) => (
              <div key={i} className={`${styles.profile}`}>
                <div
                  className={`${styles.profile}`}
                  onClick={() => navigateUpdate(profile)}
                >
                  <div className={`${styles.inner}`}>
                    {
                      <img
                        className={`${styles.profile_img}`}
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
                    }
                    {!!profile.isPinAvailable &&
                      !!profile.isProfileLockActive && (
                        <img
                          className={`${styles.lock}`}
                          src={`${appConfig.staticImagesPath}profile-lock.svg`}
                          alt="lock"
                        ></img>
                      )}
                    {/* {!!profile.isChildren && (
                      <span className={`${styles.is_children}`}>
                        {ManageuserProfileconstant[localLang].Children}
                      </span>
                    )} */}
                    <span className={`${styles.overlay}`}></span>
                    <img
                      className={`${styles.edit}`}
                      src={`https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-edit-icon.svg`}
                      alt="edit"
                    ></img>
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
                  </div>
                  <span className={`${styles.profile_name}`}>
                    {profile.name}
                  </span>
                </div>
              </div>
            ))}
            {!!SystemFeature?.userprofiles?.fields.max_profile_limit &&
              !!userProfiles &&
              SystemFeature?.userprofiles?.fields.max_profile_limit >
                userProfiles.length && (
                <div
                  className={`${styles.profile} ${styles.add_profile}`}
                  onClick={() => {
                    dispatch({
                      type: actions.navigateFrom,
                      payload: router.asPath,
                    });
                    if (!!isUtUser) {
                      setItem("redirection", true);
                    }
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
                  <span className={`${styles.profile_name}`}>
                    {ManageuserProfileconstant[localLang].Add_Profile}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>
      {!!popupData.isActive && <PinProfile popupData={popupData}></PinProfile>}
    </>
  );
}

export default ManageUserProfile;
