import styles from "@/components/profiles/profiles-list.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import ChooseProfile from "../popups/profile/choose-emoji/choose-emoji-popup.component";
import { appConfig } from "@/config/app.config";
import { actions, useStore } from "@/store/store";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { getAbsolutePath } from "@/services/user.service";
import TextField from "@mui/material/TextField";
import Loader from "../loader/loader.component";
import { fromStyle, validateN } from "@/services/utility.service";
import { getItem } from "@/services/local-storage.service";
import { CreateuserProfileconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { sendEvent } from "@/services/analytics.service";
import { ImageConfig } from "@/config/ImageConfig";
import { unAuthorisedHandler } from "@/services/data-manager.service";
const PinProfile = dynamic(
  () =>
    import("../popups/profile/pin-profile-popup/pin-profile-popup.component")
);
const LanguageModal = dynamic(
  () => import("../popups/languages-modal/languages.component")
);

function CreateUserProfile() {
  const router = useRouter();
  const [popupData, setPopUpData] = useState({});
  const [emojiList, SetEmojiList] = useState([]);
  const nameRef = useRef("");
  const [nameV, setNameV] = useState({ valid: false, error: "" });
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    image: "",
    isChildren: false,
    isMasterProfile: false,
    langs: "",
    name: "",
  });
  const [isChekked, setisChekked] = useState(false);
  const [masterProfileData, setMasterProfileData] = useState([]);
  const [pinProfileResponse, setPinProfileResponse] = useState(false);
  const { mutate: mutateGetData, data: apiResponse } = useGetApiMutate();
  const {
    mutate: mutatePostData,
    data: apiPostResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();
  const {
    state: { userDetails, SystemConfig, localLang },
    dispatch,
  } = useStore();

  const isUtUser = getItem("isUtuser");
  useEffect(() => {
    if (!!userDetails) {
      let url =
        process.env.initJson["api"] + "/service/api/auth/get/user/emojis";
      mutateGetData(url);
    }
    let masterProfileData = userDetails?.profileParentalDetails?.filter(
      (profile) => !!profile.isMasterProfile
    );
    setMasterProfileData(masterProfileData);
  }, [userDetails]);

  useEffect(() => {
    if (!!apiResponse) {
      if (
        apiResponse.data.status &&
        apiResponse.data.response.userEmojis.length
      ) {
        SetEmojiList(apiResponse.data.response.userEmojis);
        profileData.image = apiResponse.data.response.userEmojis[0].imageUrl;
        setProfileData({ ...profileData });
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    if (!!apiPostResponse?.data) {
      setPinProfileResponse(apiPostResponse?.data);
      if (!!apiPostResponse.data.status) {
        sendEvent("add_profile_name", {
          isChildren: profileData.isChildren,
          profileName: nameRef.current.value,
        });
        !!isUtUser
          ? (window.location.href = SystemConfig?.configs?.siteURL)
          : router.push("/profiles/manage-user-profile");
      } else {
        if (
          apiPostResponse?.data?.error &&
          apiPostResponse?.data?.error?.code === 401
        ) {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: "Session expired!" },
          });
          unAuthorisedHandler();
        }
        masterProfileData[0]?.addProfilePinEnable === false &&
          setNameV({
            valid: false,
            error: apiPostResponse?.data?.error?.message,
          });
      }
    }
  }, [apiPostResponse]);

  const handleClose = () => {
    setPopUpData({});
  };

  const shareDataSet = () => {
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

  const emojiSelected = (item) => {
    profileData.image = item;
    setProfileData({ ...profileData });
    handleClose();
  };

  const validateName = () => {
    let result = validateN(
      nameRef.current.value,
      appConfig.namePattern,
      CreateuserProfileconstant[localLang].profile_name,
      localLang
    );
    setNameV(result);
  };

  const toggleLanguageModal = (e) => {
    setIsLanguageModalOpen(!isLanguageModalOpen);
  };

  const vlidateFrom = () => {
    validateName();
    setTimeout(() => {
      if (nameV.valid && appConfig.profile.languages === true) {
        toggleLanguageModal();
      } else {
        if (nameV.valid && !!masterProfileData[0]?.addProfilePinEnable) {
          validateAddProfile();
        } else if (nameV.valid) {
          saveProfile();
        }
      }
    }, 300);
  };

  const selectedLang = (data) => {
    profileData.langs = data;
    profileData.name = nameRef.current.value;
    profileData.isChildren = isChekked;
    setProfileData({ ...profileData });
    toggleLanguageModal();
    if (masterProfileData[0]?.addProfilePinEnable) {
      validateAddProfile();
    } else {
      saveProfile();
    }
  };

  const saveProfile = (pin = 0) => {
    let obj = { ...profileData };
    obj.name = nameRef.current.value;
    obj.isChildren = isChekked;
    setProfileData(obj);
    let url =
      process.env.initJson["api"] + "/service/api/auth/create/user/profile";
    let apiData = { profiles: [obj] };
    if (!!pin) apiData["passCode"] = pin;
    mutatePostData({ url, apiData });
  };

  const Childrencheck = () => {
    setisChekked(!isChekked);
  };

  const backHandler = () => {
    !!isUtUser
      ? (window.location.href = SystemConfig?.configs?.siteURL)
      : router.push("/profiles/manage-user-profile");
  };

  const validateAddProfile = () => {
    setPopUpData({
      type: "pinprofile",
      subtype: "add",
      isActive: true,
      userProfiles: masterProfileData[0],
      closeTarget: closeTarget,
      validated: addPinvalidate,
    });
  };

  const addPinvalidate = (data) => {
    if (data.subtype == "add") {
      closeTarget();
    }
  };

  const closeTarget = () => {
    setPopUpData({});
    setPinProfileResponse({});
  };

  const validatePincodeCallBack = (e) => {
    saveProfile(`${e}`);
  };

  return (
    <>
      <div className={`${styles.mobBackHead}`}>
        <img
          onClick={backHandler}
          src={`${appConfig.staticImagesPath}back-arrow.svg`}
          alt="back"
        ></img>
        <h2>{CreateuserProfileconstant[localLang].Add_Profile}</h2>
      </div>
      <img
        className={` ${styles.tablet_logo}`}
        src={appConfig?.appLogo}
        alt="Logo"
      />
      <div className={`${styles.create_profile}`}>
        <div className={`${styles.update_inner}`}>
          <h2>{CreateuserProfileconstant[localLang].Add_Profile}</h2>
          <div className={`${styles.edit_body}`}>
            <div className={`${styles.profile_icon_left}`}>
              <img
                className={`${styles.profile_icon}`}
                src={getAbsolutePath(profileData.image)}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src =
                    "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg";
                }}
                alt={profileData.name}
              ></img>
              <img
                className={`${styles.edit_icon}`}
                onClick={shareDataSet}
                src={`${ImageConfig?.profile?.editProfile}`}
                alt="edit profile"
              ></img>
              {!!isChekked && (
                <span className={`${styles.child}`}>
                  {CreateuserProfileconstant[localLang].Children}
                </span>
              )}
            </div>

            <div className={`${styles.profile_edit}`}>
              <div className={` ${styles.forgot} `}>
                <TextField
                  fullWidth
                  id="email"
                  label={CreateuserProfileconstant[localLang].profile_name}
                  name="email"
                  margin="normal"
                  autoFocus
                  variant="outlined"
                  sx={fromStyle}
                  inputRef={nameRef}
                  onBlur={validateName}
                  inputProps={{ maxLength: 12 }}
                  onFocus={() => setNameV({ valid: true, error: "" })}
                  key="Name"
                />
                <div className={`${styles.child_control}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isChekked}
                      onChange={Childrencheck}
                      name="ischild"
                    ></input>
                    <span className={`${styles.sm_label}`}>
                      {CreateuserProfileconstant[localLang].Children}
                    </span>
                    <span className={`${styles.checkbox_indicator}`}></span>
                  </label>
                </div>
                <div className={` ${styles.valid_error} `}>{nameV.error}</div>
              </div>
            </div>
          </div>

          <div className={`${styles.footer_action}`}>
            <button className={`grey ${styles.btns}`} onClick={backHandler}>
              {CreateuserProfileconstant[localLang].Cancel}
            </button>
            <button className={`primary ${styles.btns}`} onClick={vlidateFrom}>
              {isLanguageModalOpen ? (
                <span className={` ${styles.loader}`}>
                  <Loader type={"button"}></Loader>
                </span>
              ) : (
                <span> {CreateuserProfileconstant[localLang].Save}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {popupData.isActive && popupData.type === "emoji" && (
        <ChooseProfile
          userProfileInfo={profileData}
          popupData={popupData}
        ></ChooseProfile>
      )}
      {isLanguageModalOpen && appConfig.profile.languages === true && (
        <LanguageModal
          open={isLanguageModalOpen}
          additionalData={{ from: "createprofile" }}
          callback={selectedLang}
          onClose={toggleLanguageModal}
          hideContentDisplay={true}
        />
      )}
      {popupData?.isActive && popupData?.type === "pinprofile" && (
        <>
          <PinProfile
            pinProfileResponse={pinProfileResponse}
            popupdata={popupData}
            validatePincodeCallBack={validatePincodeCallBack}
          ></PinProfile>
        </>
      )}
    </>
  );
}

export default CreateUserProfile;
