import styles from "@/components/profiles/profiles-list.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import ChooseProfile from "../popups/profile/choose-emoji/choose-emoji-popup.component";
import ParentProfile from "../popups/profile/profile-otp/profile-otp-popup.component";
import { appConfig } from "@/config/app.config";
import { actions, useStore } from "@/store/store";
import { getAbsolutePath } from "@/services/user.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import DeleteProfile from "../popups/profile/delete-profile/delete-profile.component";
import TextField from "@mui/material/TextField";
import ProfileOtp from "../popups/profile/profile-otp/profile-otp-popup.component";
import {
  fromStyle,
  getPlansDetails,
  validateN,
} from "@/services/utility.service";
import { UpdateuserProfileconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
const ProfilePassword = dynamic(
  () =>
    import(
      "../popups/profile/profile-password/profile-password-popup.component"
    )
);
const PinProfile = dynamic(
  () =>
    import("../popups/profile/pin-profile-popup/pin-profile-popup.component")
);
const LanguageModal = dynamic(
  () => import("../popups/languages-modal/languages.component")
);

function UpdateUserProfile() {
  const router = useRouter();
  const [popupData, setPopUpData] = useState({});
  const [profileData, setProfileData] = useState({});
  const [emojiList, SetEmojiList] = useState([]);
  const nameRef = useRef("");
  const [nameV, setNameV] = useState({ valid: true, error: "" });
  const [profilename, setProfileName] = useState("");
  const { mutate: mutateGetData, data: apiResponse } = useGetApiMutate();
  const {
    mutate: mutatePostData,
    data: apiPostResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();
  const [remainCount, setremainCount] = useState("");
  const [showLangs, SetshowLangs] = useState();
  const [ProfileLockActive, setProfileLockActive] = useState(false);
  useEffect(() => {
    if (router.query.slug) {
      let eProfile = userDetails?.profileParentalDetails?.filter(
        (ele) => ele.profileId == router.query.slug
      );
      if (!!eProfile && !!eProfile[0]) {
        setProfileData(eProfile[0]);
        // nameRef.current.value = eProfile[0].name
        // nameRef.current.focus()
        setProfileName(eProfile[0].name);
        setProfileLockActive(eProfile[0].isProfileLockActive || false);
      }
      let url =
        process.env.initJson["api"] + "/service/api/auth/get/user/emojis";
      mutateGetData(url);
    }
  }, [router.query, userDetails]);

  useEffect(() => {
    if (!!apiResponse) {
      if (apiResponse.data.status) {
        SetEmojiList(apiResponse.data.response.userEmojis);
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    if (!!apiPostResponse?.data) {
      if (!!apiPostResponse.data.status) {
        // sendEvent("profile_update", {
        //   ...getPlansDetails(true),
        //   user_name: nameRef.current.value,
        //   //TODO other params , etc
        // });
        router.back();
      } else if (
        apiPostResponse.data.status === false &&
        apiPostResponse.data.error?.code === -4
      ) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: apiPostResponse.data.error?.message || "" },
        });
      }
    }
  }, [apiPostResponse]);

  useEffect(() => {
    if (profileData.langs?.length > 3) {
      let Lang = profileData.langs.split(",").slice(0, 3);
      let count = profileData.langs.split(",").length - 3;
      SetshowLangs(Lang);
      setremainCount(count);
    } else {
      let Lang = profileData.langs;
      SetshowLangs(Lang);
      setremainCount("");
    }
  }, [profileData.langs]);

  const verifyPin = () => {
    if (appConfig.profile.type === "password") {
      setPopUpData({
        type: "pinpassword",
        subtype: "pin",
        isActive: true,
        hasSetPassword: userDetails.hasPassword,
        userProfile: profileData,
        closeTarget: handleClose,
      });
    } else {
      setPopUpData({
        type: "pinotp",
        subtype: "pin",
        isActive: true,
        userProfile: profileData,
        hasSetPassword: userDetails.hasPassword,
        closeTarget: handleClose,
      });
    }
  };

  const verifyView = (type) => {
    // if(appConfig.profile.type === 'password'){
    //   setPopUpData({
    //     type:'pinpassword',
    //     subtype: 'view',
    //     isActive:true,
    //     userProfile:profileData,
    //     hasSetPassword:userDetails.hasPassword,
    //     closeTarget: handleClose
    //   })
    // }else{
    //   setPopUpData({
    //     type:'pinotp',
    //     subtype: 'view',
    //     isActive:true,
    //     userProfile:profileData,
    //     hasSetPassword:userDetails.hasPassword,
    //     closeTarget: handleClose
    //   })
    // }

    setPopUpData({
      type,
      isActive: true,
      isPasswordOtp: appConfig.profile.type === "pin",
      userProfile: profileData,
      hasSetPassword: userDetails.hasPassword,
      closeTarget: handleClosePopup,
    });
  };

  const emojiupdate = () => {
    let pop = {
      type: "emoji",
      isActive: true,
      closeTarget: handleClose,
      emojiList: emojiList,
      emojiSelected: emojiSelected,
      currentSelected: profileData,
    };
    setPopUpData(pop);
  };

  const handleClose = () => {
    setPopUpData({});
  };

  const handleClosePopup = ({
    isCreatenewPassword = false,
    verifyOtpResponse = {},
    closeorcancel = false,
  } = {}) => {
    if (closeorcancel) {
      setPopUpData({});
      return;
    }
    if (isCreatenewPassword) {
      dispatch({ type: actions.profileUtil, payload: verifyOtpResponse });
      router.push("/profiles/profile-lock/" + profileData?.profileId);
    } else {
      dispatch({ type: actions.profileUtil, payload: verifyOtpResponse });
      router.push("/profiles/view-restrictions/" + profileData?.profileId);
    }
    setPopUpData({});
  };

  const emojiSelected = (item) => {
    profileData.imageUrl = item;
    setProfileData({ ...profileData });
    handleClose();
  };

  const deleteProfile = () => {
    let pop = {
      type: "deleteProfile",
      isActive: true,
      currentSelected: profileData,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const validateName = () => {
    // let result = validateN(
    //   nameRef.current.value,
    //   appConfig.namePattern,
    //   "Profile Name"
    // );
    // setNameV(result);

    if (nameRef.current?.value?.length === 0) {
      setNameV({
        valid: false,
        error: UpdateuserProfileconstant[localLang].name_is_required,
      });
    } else {
      setNameV({ valid: true, error: "" });
    }
  };

  const toggleLanguageModal = (e) => {
    setIsLanguageModalOpen(!isLanguageModalOpen);
  };

  const selectedLang = (data) => {
    profileData.langs = data;
    setProfileData({ ...profileData });
    toggleLanguageModal();
  };

  const updateUserProfile = () => {
    validateName();

    if (!!nameV.valid) {
      setTimeout(() => {
        let url =
          process.env.initJson["api"] + "/service/api/auth/update/user/profile";
        let postData = {
          profileId: profileData.profileId,
          profileName: nameRef.current.value,
          image: profileData.imageUrl,
          isProfileLockActive: ProfileLockActive,
          isChildren: profileData.isChildren,
          ...(!!profileData?.langs && { langs: profileData.langs }),
        };
        mutatePostData({ url, apiData: postData });
      }, 200);
    }
  };

  const handleClick = () => {
    router.push("/");
  };

  const handlenameOnchnage = (eve) => {
    if (eve.target.value.trim().length === 0) {
      setNameV({
        valid: true,
        error: UpdateuserProfileconstant[localLang].name_is_required,
      });
    } else {
      setNameV({
        valid: false,
        error: "",
      });
    }
    let profileName =
      eve.target.value.trim().length > 0
        ? eve.target.value
        : eve.target.value.trim();
    setProfileName(profileName);
  };

  const handleProfileLock = (eve) => {
    setProfileLockActive(!ProfileLockActive);
  };

  const handleFocus = () => {
    if (nameRef.current) {
      setNameV({
        valid: false,
        error:
          nameRef.current.value.length > 0
            ? ""
            : UpdateuserProfileconstant[localLang].name_is_required,
      });
    }
  };

  return (
    <>
      <div className={`${styles.mobBackHead}`}>
        <img
          onClick={() => router.push("/profiles/manage-user-profile")}
          src={`${appConfig.staticImagesPath}back-arrow.svg`}
          alt="back"
        ></img>
        <h2>{UpdateuserProfileconstant[localLang].Edit_Profile}</h2>
      </div>
      <img
        className={` ${styles.tablet_logo}`}
        src={appConfig?.appLogo}
        onClick={handleClick}
        alt=""
      />
      <div className={`${styles.update_profile}`}>
        <div className={`${styles.update_inner}`}>
          <h2>{UpdateuserProfileconstant[localLang].Edit_Profile}</h2>
          <div className={`${styles.edit_body}`}>
            <div className={`${styles.profile_icon_left}`}>
              <img
                className={`${styles.profile_icon}`}
                src={
                  !!profileData.imageUrl
                    ? getAbsolutePath(profileData.imageUrl)
                    : "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg"
                }
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src =
                    "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg";
                }}
                alt={profileData.name}
              ></img>
              <img
                className={`${styles.edit_icon}`}
                onClick={emojiupdate}
                src={`${ImageConfig?.profile?.editProfile}`}
                alt="edit profile"
              ></img>
              {!!profileData.isChildren && (
                <span className={`${styles.child}`}>
                  {UpdateuserProfileconstant[localLang].Children}
                </span>
              )}
            </div>

            <div className={`${styles.profile_edit}`}>
              <div className={` ${styles.forgot} `}>
                <TextField
                  fullWidth
                  id="email"
                  label={UpdateuserProfileconstant[localLang].profile_name}
                  name="email"
                  margin="normal"
                  autoFocus
                  variant="outlined"
                  sx={fromStyle}
                  inputRef={nameRef}
                  onBlur={validateName}
                  inputProps={{ maxLength: 30 }}
                  onFocus={handleFocus}
                  value={profilename}
                  onChange={handlenameOnchnage}
                  key="Name"
                  style={{ opacity: 1 }}
                />
                <div className={` ${styles.valid_error} `}>{nameV.error}</div>
              </div>
              {appConfig.profile.languages === true && (
                <label
                  className={`${styles.input_label}`}
                  onClick={toggleLanguageModal}
                >
                  <span className={`${styles.label_title}`}>
                    {UpdateuserProfileconstant[localLang].Language}
                  </span>
                  <span className={`${styles.more_channels_arrow}`}> </span>
                  <input
                    className={`${styles.input_box}`}
                    readOnly
                    value={showLangs}
                  ></input>
                  {!!remainCount && remainCount > 0 && (
                    <span className={`${styles.lang_more}`}>
                      +{remainCount}
                      {UpdateuserProfileconstant[localLang].more}
                    </span>
                  )}
                </label>
              )}

              <div
                className={
                  !!profileData.isChildren
                    ? `${styles.maturity_section} ${styles.kids}`
                    : `${styles.maturity_section}`
                }
              >
                <h2>
                  {UpdateuserProfileconstant[localLang].Maturity_Settings +
                    " :"}
                </h2>
                <div className={`${styles.maturity_actions}`}>
                  <button type="button" className={`grey ${styles.no_btn_beh}`}>
                    {!!profileData.profileRating
                      ? profileData.profileRating
                      : "All maturity Ratings"}
                  </button>
                  {!profileData?.isChildren && (
                    <button
                      type="button"
                      className={`grey ${styles.edit}`}
                      onClick={() => verifyView("Viewing Restrictions")}
                    >
                      {UpdateuserProfileconstant[localLang].Edit}
                    </button>
                  )}
                </div>
                <span>{`${UpdateuserProfileconstant[localLang].Show_titles_of}${profileData.profileRating ? profileData.profileRating : `${UpdateuserProfileconstant[localLang].adults}`} ${UpdateuserProfileconstant[localLang].for_this_profile}`}</span>
              </div>
              {!profileData?.isChildren && profileData?.isPinAvailable && (
                <div className={`${styles.profile_lock}`}>
                  <img
                    className={`${styles.lock}`}
                    src={`${appConfig.staticImagesPath}profile-lock.svg`}
                    alt="profile lock"
                  ></img>
                  <span className={`${styles.pr_label}`}>
                    {UpdateuserProfileconstant[localLang].ProfileLock}
                    <span onClick={handleProfileLock}>
                      &nbsp;{" "}
                      <span className={`${styles.on_off}`}>
                        {ProfileLockActive ? (
                          <>{UpdateuserProfileconstant[localLang].ON}</>
                        ) : (
                          <>{UpdateuserProfileconstant[localLang].OFF}</>
                        )}
                      </span>
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
          {!profileData.isMasterProfile && (
            <button
              className={`${styles.btns} ${styles.mob}`}
              onClick={deleteProfile}
            >
              {" "}
              <img
                src={`${appConfig.staticImagesPath}delete-icon-white-theme.svg`}
                alt="delete"
              ></img>
              {UpdateuserProfileconstant[localLang].Delete_Profile}
            </button>
          )}
          <div className={`${styles.footer_action}`}>
            <button
              className={`grey ${styles.btns}`}
              onClick={() => router.back()}
            >
              {UpdateuserProfileconstant[localLang].Cancel}
            </button>
            {!profileData.isMasterProfile && (
              <button
                className={`grey ${styles.btns} ${styles.del}`}
                onClick={deleteProfile}
              >
                {UpdateuserProfileconstant[localLang].Delete_Profile}
              </button>
            )}
            <button
              className={`primary ${styles.btns}`}
              onClick={updateUserProfile}
            >
              {UpdateuserProfileconstant[localLang].Save}
            </button>
          </div>
        </div>
      </div>

      {popupData.isActive && popupData.type == "emoji" && (
        <ChooseProfile
          userProfileInfo={profileData}
          popupData={popupData}
        ></ChooseProfile>
      )}
      {popupData.isActive && popupData.type === "deleteProfile" && (
        <DeleteProfile popupData={popupData}></DeleteProfile>
      )}
      {isLanguageModalOpen && (
        <LanguageModal
          open={isLanguageModalOpen}
          additionalData={{
            from: "updateprofile",
            sLangs: !!profileData.langs ? profileData.langs : undefined,
          }}
          callback={selectedLang}
          onClose={() => toggleLanguageModal()}
          hideContentDisplay={false}
        />
      )}

      {popupData.isActive && popupData.type == "profileEdit" && (
        <ParentProfile popupData={popupData}></ParentProfile>
      )}

      {popupData.isActive && popupData.type == "pinPopup" && (
        <PinProfile popupData={popupData}></PinProfile>
      )}

      {popupData.isActive &&
        ["Viewing Restrictions"].indexOf(popupData.type) > -1 && (
          <ProfileOtp popupData={popupData} />
        )}
      {/* {popupData.isActive && popupData.type === "pinpassword" && (
        <ProfilePassword popupData={popupData}/>
     )} */}
    </>
    // </div>
  );
}

export default UpdateUserProfile;
