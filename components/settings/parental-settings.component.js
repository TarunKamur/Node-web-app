import styles from "@/components/settings/profile-settings.module.scss";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getAbsolutePath } from "@/services/user.service";
import { actions, useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import ProfileOtp from "../popups/profile/profile-otp/profile-otp-popup.component";
import { appConfig } from "@/config/app.config";
import usePostApiMutate from "@/hooks/usePostApidata";
import { ProfileSettingsconstant, Settingsconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
const ProfilePassword = dynamic(
  () =>
    import(
      "../popups/profile/profile-password/profile-password-popup.component"
    )
);
const LanguageModal = dynamic(
  () => import("../popups/languages-modal/languages.component")
);
export default function ParentalSettings() {
  const [userProfile, setUserProfile] = useState([]);
  const [popupData, setPopUpData] = useState({});
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(false);
  let moreLangNum = "";
  const {
    mutate: mutatePostData,
    data: apiPostResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();

  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();

  useEffect(() => {
    if (!!userDetails) {
      setUserProfile(userDetails);
    }
  }, [userDetails]);

  useEffect(() => {
    if (!!apiPostResponse?.data) {
      if (!!apiPostResponse.data.status) {
        let dd = profilesList.map((profile) => {
          if (profile.profileId == selectedProfile.profileId) {
            profile.langs = selectedProfile.langs;
          }
          return profile;
        });
        userDetails.profileParentalDetails = dd;
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
      }
    }
  }, [apiPostResponse]);

  const verifyView = (userProfile) => {
    if (appConfig.profile.type === "password") {
      setPopUpData({
        type: "pinpassword",
        subtype: "view",
        isActive: true,
        hasSetPassword: userDetails.hasPassword,
        userProfile: userProfile,
        isParentalControl: true,
        closeTarget: closeTarget,
      });
    } else {
      setPopUpData({
        type: "pinotp",
        subtype: "view",
        isActive: true,
        hasSetPassword: userDetails.hasPassword,
        userProfile: userProfile,
        isParentalControl: true,
        closeTarget: closeTarget,
      });
    }
  };

  const verifyPin = (userProfile) => {
    if (appConfig.profile.type === "password") {
      setPopUpData({
        type: "pinpassword",
        subtype: "pin",
        isActive: true,
        userProfile: userProfile,
        hasSetPassword: userDetails.hasPassword,
        closeTarget: closeTarget,
      });
    } else {
      setPopUpData({
        type: "pinotp",
        subtype: "pin",
        isActive: true,
        userProfile: userProfile,
        hasSetPassword: userDetails.hasPassword,
        closeTarget: closeTarget,
      });
    }
  };

  const closeTarget = () => {
    setPopUpData({});
  };

  const toggleLanguageModal = (e) => {
    if (!isLanguageModalOpen == false) {
      setSelectedProfile({});
    }
    setIsLanguageModalOpen(!isLanguageModalOpen);
  };

  const setProfileLangs = (pr) => {
    setSelectedProfile(pr);
    toggleLanguageModal();
  };

  const selectedLang = (data) => {
    selectedProfile.langs = data;
    setSelectedProfile({ ...selectedProfile });
    toggleLanguageModal();
    setTimeout(() => {
      let url =
        process.env.initJson["api"] + "/service/api/auth/update/user/profile";
      let postData = {
        profileId: selectedProfile.profileId,
        profileName: selectedProfile.name,
        langs: data,
        image: selectedProfile.imageUrl,
        isProfileLockActive: selectedProfile.isProfileLockActive,
        isChildren: selectedProfile.isChildren,
      };
      mutatePostData({ url, apiData: postData });
    }, 200);
  };

  const displayLanguageFormate = (data) => {
    let selectedAllLang;
    let selectedLangs;
    let selectedLang;
    if (!!data) {
      selectedAllLang = data.split(",");
      selectedLangs = selectedAllLang;
      selectedLang = selectedAllLang[0];
      if (selectedAllLang.length > 3) {
        for (let i = 1; i < 3; i++) {
          selectedLang = selectedLang + ", " + selectedAllLang[i];
        }
        moreLangNum = "+" + (selectedAllLang.length - 3) + " more…";
        return selectedLang;
      } else {
        return data;
      }
    }
  };
  return (
    <>
      <div className={` profile_settings ${styles.profile_settings}`}>
        <Accordion className={`${styles.profile_info}`} expanded={true}>
          <AccordionSummary
            className={`profile_inner ${styles.profile_inner}`}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <div className={`${styles.profile_summary}`}>
              <div className={`${styles.user_image}`}>
                <img
                  src={
                    !!userProfile.imageUrl
                      ? getAbsolutePath(userProfile.imageUrl)
                      : "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg"
                  }
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src =
                      "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg";
                  }}
                  alt={userProfile.name}
                />
              </div>

              <div className={`${styles.user_maturity}`}>
                <h4 className={`${styles.profile_hd}`}>{userProfile.name}</h4>
                {!!userProfile.profileRating ? (
                  <span className={`${styles.profile_sub_hd}`}>
                    {userProfile.profileRating}
                  </span>
                ) : (
                  <span className={`${styles.profile_sub_hd}`}>
                    {ProfileSettingsconstant[localLang].maturity_setting}
                  </span>
                )}
              </div>
              {!!(
                userProfile.isPinAvailable && !!userProfile.isProfileLockActive
              ) && (
                <img
                  className={`${styles.profile_lock}`}
                  src={`${ImageConfig?.profile?.lockIcon}`}
                  alt="lock"
                />
              )}
            </div>
          </AccordionSummary>
          {!!userProfile?.isChildren ? (
            <></>
          ) : (
            <AccordionDetails className={`${styles.profile_details}`}>
              {appConfig.profile.languages === true && (
                <div className={`${styles.profile_values} ${styles.first_one}`}>
                  <div className={`${styles.values_hd}`}>
                    {ProfileSettingsconstant[localLang].Language}
                  </div>
                  <div
                    className={` title ${styles.link} `}
                    onClick={() => setProfileLangs(userProfile)}
                  >
                    {ProfileSettingsconstant[localLang].Change}
                  </div>
                  {userProfile.languages ? (
                    <div className={`${styles.languages_main}`}>
                      <div className={`${styles.language_text}`}>
                        {displayLanguageFormate(userProfile.langs)}
                      </div>
                      <span
                        className={`${styles.more_language_text}`}
                        onClick={() => setProfileLangs(userProfile)}
                      >
                        &nbsp; {moreLangNum}
                      </span>
                    </div>
                  ) : (
                    <span className={`${styles.values_text}`}>
                      All Languages
                    </span>
                  )}
                </div>
              )}
              {!userProfile?.isChildren && (
                <>
                  <div className={`${styles.profile_values}`}>
                    <div className={`${styles.values_hd}`}>
                      {ProfileSettingsconstant[localLang].Viewing_Restrictions}
                    </div>
                    <div
                      className={` title ${styles.link} `}
                      onClick={() => verifyView(userProfile)}
                    >
                      {userDetails?.hasPassword
                        ? ProfileSettingsconstant[localLang].Change
                        : Settingsconstant[localLang].Create}
                    </div>
                    <div className={`${styles.values_text}`}>
                      {!!userProfile?.profileRating
                        ? userProfile?.profileRating
                        : ProfileSettingsconstant[localLang].controls_text}
                    </div>

                    {/* <div className={`${styles.values_text}`}>{userProfile.profileRating}</div> */}
                  </div>
                  {/* <div className={`${styles.profile_values} ${styles.last_one}`}>
                    <div className={`${styles.values_hd}`}>{ProfileSettingsconstant[localLang].Profile_Video_Lock}</div>
                    <div className={` title ${styles.link} `} onClick={() => verifyPin(userProfile)}>
                      {userDetails?.hasPassword ? ProfileSettingsconstant[localLang].Change : Settingsconstant[localLang].Create}
                    </div>
                    <div className={`${styles.values_text}`}>
                      {userProfile.isPinAvailable && !!userProfile.isProfileLockActive ? (
                        <>{ProfileSettingsconstant[localLang].ON}</>
                      ) : (
                        <>{ProfileSettingsconstant[localLang].OFF}</>
                      )}
                    </div>
                  </div> */}
                </>
              )}
            </AccordionDetails>
          )}
        </Accordion>
      </div>
      {popupData.isActive && popupData.type === "pinotp" && (
        <ProfileOtp popupData={popupData} />
      )}
      {popupData.isActive && popupData.type === "pinpassword" && (
        <ProfilePassword popupData={popupData} />
      )}
      {isLanguageModalOpen && (
        <LanguageModal
          open={isLanguageModalOpen}
          additionalData={{ from: "settings", sLangs: selectedProfile.langs }}
          callback={selectedLang}
          onClose={() => toggleLanguageModal()}
        />
      )}
    </>
  );
}
