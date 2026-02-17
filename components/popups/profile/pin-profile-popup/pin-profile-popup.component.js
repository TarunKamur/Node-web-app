import { useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "../pin-profile-popup/pin-profile-popup.module.scss";
import usePostApiMutate from "@/hooks/usePostApidata";
import OtpInput from "react-otp-input";
import { PinProfileconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { getAbsolutePath } from "@/services/user.service";
import { ImageConfig } from "@/config/ImageConfig";
import { actions, useStore } from "@/store/store";
import ProfileOtp from "../profile-otp/profile-otp-popup.component";
import { userDetails } from "@/store/actions";
import { useRouter } from "next/router";
import Loader from "@/components/loader/loader.component";

export default function PinProfile({
  popupdata,
  isParentalPopup = false,
  validatePincodeCallBack,
  pinProfileResponse,
  FromPlayer = false,
}) {
  const {
    state: { SystemConfig, SystemFeature, userDetails, localLang },
    dispatch,
  } = useStore();
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [popupData, setPopUpData] = useState(popupdata);
  const [getOtppopupData, setGetOtppopupData] = useState({});
  const [showDialog, setShowDialog] = useState(true);
  const router = useRouter();
  const [isloader, setisloader] = useState(false);
  const {
    mutate: mutateOtp,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();

  useEffect(() => {
    if (pinProfileResponse?.status === false) {
      setisloader(false);
      setErrorMessage(pinProfileResponse?.error?.message);
    }
  }, [pinProfileResponse]);

  useEffect(() => {
    setPopUpData(popupdata);
    if (popupdata?.code == -823) {
      setErrorMessage(popupdata?.errorMessage);
      const timeout = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [popupdata]);

  useEffect(() => {
    if (!!apiResponse) {
      if (!!apiResponse.data.status) {
        popupData.validated(popupData);
      } else {
        setErrorMessage(apiResponse.data.error.message);
        clearingErrorMessage();
      }
    }
    return () => setErrorMessage("");
  }, [apiResponse]);

  const handleClose = (e) => {
    if (popupData?.closeTarget) {
      popupData.closeTarget();
    }
  };

  const clearingErrorMessage = () => {
    let init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 3000);
  };

  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  const matchIsNumeric = (text) => {
    const isNumber = typeof text === "number";
    const isString = typeof text === "string";
    return (isNumber || (isString && text !== "")) && !isNaN(Number(text));
  };

  const validateChar = (value, index) => {
    return matchIsNumeric(value);
  };

  const sumbitFrom = (e) => {
    e.preventDefault();
    let valid = validatePassword();
    if (isParentalPopup) {
      validatePincodeCallBack(otp);
      return;
    }
    popupData.subtype == "add" && setisloader(true);

    setTimeout(() => {
      if (!!valid) {
        if (popupData.subtype == "add") {
          setisloader(true);
          !!validatePincodeCallBack && validatePincodeCallBack(otp);
        }

        if (popupData.subtype == "select") {
          let url =
            process.env.initJson["api"] +
            "/service/api/auth/activate/user/profile";
          let apiData = {
            passCode: "" + otp,
            profileId: popupData.userProfiles.profileId,
          };
          mutateOtp({ url, apiData });
        }
      }
    }, 500);
  };

  const validatePassword = () => {
    if (otp == undefined || otp == "") {
      setErrorMessage(PinProfileconstant[localLang]?.PIN_Required);
      clearingErrorMessage();
      return false;
    } else if (otp.length < 4) {
      setErrorMessage(PinProfileconstant[localLang].Plese_Enter_Valid_PIN);
      clearingErrorMessage();
      return false;
    } else {
      setErrorMessage("");
      clearingErrorMessage();
      return true;
    }
  };

  const handleClosePopup = ({
    isCreatenewPassword = false,
    verifyOtpResponse = {},
  }) => {
    setGetOtppopupData({});
    setShowDialog(true);
    let profileData;
    if (popupData.userProfiles) {
      profileData = popupData.userProfiles;
    } else {
      profileData = userDetails?.profileParentalDetails?.filter(
        (profile) => profile.profileId === userDetails?.profileId
      )[0];
    }
    if (isCreatenewPassword) {
      dispatch({ type: actions.profileUtil, payload: verifyOtpResponse });
      router.push("/profiles/profile-lock/" + profileData?.profileId);
    }
  };

  const handleForgotClick = () => {
    let profileData;
    if (popupData.userProfiles) {
      profileData = popupData.userProfiles;
    } else {
      profileData = userDetails?.profileParentalDetails?.filter(
        (profile) => profile.profileId === userDetails?.profileId
      )[0];
    }
    setGetOtppopupData({
      type: "Forgot Profile & Video Lock",
      isActive: true,
      isPasswordOtp: appConfig.profile.type === "pin",
      userProfile: profileData,
      hasSetPassword: userDetails.hasPassword,
      closeTarget: handleClosePopup,
    });
    setShowDialog(false);
  };

  return (
    <>
      <Dialog
        open={popupData?.isActive && showDialog ? popupData.isActive : false}
      >
        <div className={styles.sharecontent_modal}>
          <div className={styles.main_modal}>
            <div className={styles.modal_wrapper}>
              <div className={styles.modal_content}>
                {/* <CloseIcon
                className={`${styles.cross_icon}`}
                onClick={handleClose}
              >
              </CloseIcon> */}
                <div className={`${styles.modal_content_inner}`}>
                  {!popupData?.hideImgName && (
                    <>
                      {" "}
                      {SystemFeature?.userprofiles?.fields
                        ?.is_userprofiles_supported == "true" &&
                        FromPlayer !== true && (
                          <div className={`${styles.profile_img}`}>
                            <img
                              src={
                                !!popupData?.userProfiles?.imageUrl
                                  ? getAbsolutePath(
                                      popupData?.userProfiles?.imageUrl
                                    )
                                  : `${appConfig.staticImagesPath}profile-pic1.svg`
                              }
                              alt={popupData?.userProfiles?.name}
                            ></img>
                          </div>
                        )}
                      <h5 className={`${styles.otp_Txt} ${styles.View_Txt}`}>
                        {PinProfileconstant[localLang].Hi}{" "}
                        {popupData?.userProfiles?.name}
                      </h5>
                    </>
                  )}
                  <p className={`${styles.otp_subTxt} ${styles.View_subTxt}`}>
                    {!isParentalPopup &&
                      (popupData?.subtype == "add" ? (
                        <span>
                          {" "}
                          {PinProfileconstant[
                            localLang
                          ].Enter_Master_profile_pin_to_add_new_profile.replace(
                            "Master",
                            popupData.userProfiles?.name || "Master"
                          )}{" "}
                        </span>
                      ) : (
                        <span>
                          {
                            PinProfileconstant[localLang]
                              .Enter_your_4_Digit_PIN_to_access_your_profile
                          }
                        </span>
                      ))}
                    {isParentalPopup &&
                      SystemConfig.configs.parentalControlPopupMessage}
                  </p>

                  <form className={styles.otp_block} onSubmit={sumbitFrom}>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={4}
                      inputType="number"
                      renderInput={(props) => <input {...props} />}
                    />
                    {/* {appConfig.profile.forgotParentalPin && (
                      <div
                        className={`${styles.fogot_pin}`}
                        onClick={handleForgotClick}
                      >
                        <span>{PinProfileconstant[localLang].Forgot_pin}</span>
                      </div>
                    )} */}
                    <div className={`${styles.text_danger1}`}>
                      <span>{errorMessage}</span>
                    </div>
                    <div className={styles.footer_actions}>
                      <button type="button" onClick={handleClose}>
                        {PinProfileconstant[localLang].Cancel}
                      </button>
                      <button
                        disabled={otp.length !== 4}
                        className={`${styles.as} primary  ${otp.length !== 4 ? styles.disabled : ""}`}
                        type="submit"
                      >
                        {isloader ? (
                          <Loader type="button" />
                        ) : (
                          PinProfileconstant[localLang].Continue
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
      {getOtppopupData?.isActive && <ProfileOtp popupData={getOtppopupData} />}
    </>
  );
}
