import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "../profile-otp/profile-otp-popup.module.scss";
import { getAbsolutePath } from "@/services/user.service";
import { ProfileOtpconstant } from "@/.i18n/locale";
import { actions, useStore } from "@/store/store";
import { decryptData, encryptData } from "@/services/utility.service";
import usePostApiMutate from "@/hooks/usePostApidata";

let Getotpheadings = {
  "Viewing Restrictions": {
    default: {
      heading1: "Get_OTP_To_edit_Viewing_Restrictions",
      heading2:
        "Get_OTP_to_edit_profile_Maturity_Rating_and_Title_Restrictions_for_XXX_Profile",
    },
    inputenable: {
      heading1: "Viewing_Restrictions",
      heading2:
        "Enter_OTP_to_edit_profile_Maturity_Rating_and_Title_Restrictions_for_XXX_Profile",
    },
  },
  "Profile & Video Lock": {
    default: {
      heading1: "Get_OTP_To_edit_Profile_Lock",
      heading2: "Get_OTP_To_edit_Profile_Lock_XXX_Profile",
    },
    inputenable: {
      heading1: "Profile_Lock",
      heading2: "Enter_OTP_To_edit_Profile_Lock_XXX_Profile",
    },
  },
  "Forgot Profile & Video Lock": {
    default: {
      heading1: "Get_OTP_To_edit_Profile_Lock",
      heading2: "Get_OTP_To_edit_Profile_Lock_XXX_Profile",
    },
    inputenable: {
      heading1: "Forgot_Profile_Lock",
      heading2: "Enter_OTP_To_edit_Profile_Lock_XXX_Profile",
    },
  },
};

export default function ProfileOtp({ popupData, isPasswordOtp = false }) {
  const {
    state: { localLang, SystemFeature, userDetails },
    dispatch,
  } = useStore();
  // const [otpPop, otpPage] = useState({});
  const [toggleOtpInput, setToggleOtpInput] = useState(isPasswordOtp);
  const [otpsuccessmsg, setOtpSuccessPage] = useState({});
  const [otperrormsg, setOtpErrorPage] = useState("");
  const [passWordShow, setPassWordShow] = useState(false);
  const otpInputRef = useRef();
  const {
    mutate: mutateGetOtp,
    data: GetotpapiResponse,
    GeisLoading,
    GetOtpisError,
    GetOtperror,
    GetOtprefetch,
  } = usePostApiMutate();

  const {
    mutate: mutateVerifyOtp,
    data: verifyotpapiResponse,
    VerifyOtpisLoading,
    VerifyOtpisError,
    VerifyOtperror,
    VerifyOtprefetch,
  } = usePostApiMutate();

  useEffect(() => {
    if (GetotpapiResponse?.data) {
      let otpresponse;
      if (SystemFeature?.encryptApisList?.fields.getOtp === "true") {
        otpresponse = JSON.parse(decryptData(GetotpapiResponse?.data?.data));
      } else {
        otpresponse = GetotpapiResponse.data;
      }
      if (otpresponse.status === true) {
        setToggleOtpInput(true);
        setOtpSuccessPage({
          type: "OtpSuccess",
          msg: otpresponse?.response?.message,
        });
      } else {
        setOtpErrorPage(otpresponse?.error?.message);
        dispatch({
          type: actions.NotificationBar,
          payload: { message: otpresponse?.error?.message },
        });
      }
    }
  }, [GetotpapiResponse]);

  useEffect(() => {
    if (verifyotpapiResponse?.data) {
      let verifyotpresponse = verifyotpapiResponse.data;
      if (verifyotpresponse.status === true) {
        if (popupData.closeTarget) {
          const isprofilepinCondition =
            ["Profile & Video Lock", "Forgot Profile & Video Lock"].indexOf(
              popupData.type
            ) > -1;
          popupData.closeTarget({
            isCreatenewPassword: isprofilepinCondition,
            verifyOtpResponse: verifyotpresponse.response,
            profileData: popupData.userProfile,
          });
        }
      } else {
        setOtpSuccessPage({
          type: "invalid",
          msg: verifyotpresponse?.error?.message,
        });
        setTimeout(() => {
          setOtpSuccessPage("");
        }, 3000);
      }
    }
  }, [verifyotpapiResponse]);

  const handleClose = (e) => {
    e?.preventDefault();
    if (popupData.closeTarget) {
      popupData.closeTarget({ closeorcancel: true });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPasswordOtp) {
    } else {
      if (!toggleOtpInput) {
        handleGetOtp();
      } else {
        if (!otpInputRef.current.value) {
          setOtpErrorPage(ProfileOtpconstant[localLang].OTP_required);
        } else if (otpInputRef.current.value.trim().length < 4) {
          setOtpErrorPage(ProfileOtpconstant[localLang].OTP_length_less);
        } else if (otpInputRef.current.value.trim().length > 6) {
          setOtpErrorPage(ProfileOtpconstant[localLang].OTP_length_greater);
        } else {
          setOtpErrorPage("");
          handleVerifyOtp();
        }
      }
    }
  };

  const handleVerifyOtp = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/user/authentication";
    let apiData = new FormData();
    apiData.append("context", "user_profiles");
    apiData.append("otp", otpInputRef.current.value.trim());
    apiData.append("mobile", userDetails.phoneNumber);
    mutateVerifyOtp({ url, apiData });
  };

  const handleGetOtp = () => {
    let postData = {
      mobile: userDetails.phoneNumber,
      context: "user_profiles",
    };
    if (SystemFeature?.encryptApisList?.fields.getOtp === "true") {
      let encryptObj = {
        data: encryptData(JSON.stringify(postData)),
        metadata: encryptData(JSON.stringify({ request: "get/otp" })),
      };
      getOtp(`${process.env.initJson.api}/service/api/v1/send`, encryptObj);
    } else {
      getOtp(`${process.env.initJson.api}/service/api/auth/get/otp`, postData);
    }
  };

  const getOtp = (url, apiData) => {
    try {
      let res = mutateGetOtp({
        url,
        apiData,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getText = (key) => {
    let heading_type = toggleOtpInput ? "inputenable" : "default";
    return ProfileOtpconstant[localLang][
      Getotpheadings[popupData.type][heading_type][key]
    ];
  };

  const getHeading2 = () => {
    return getText("heading2")
      ?.replace("xxx", popupData.userProfile?.name || "xxx")
      .split((popupData.userProfile?.name || "xxx") + "’s")
      .map((item, key) => {
        return (
          <>
            {key === 1 ? (popupData.userProfile?.name || "xxx") + "’s " : ""}
            {item}
            {key === 0 ? <br /> : ""}
          </>
        );
      });
  };

  const shareDialog = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const togglePWShow = (e) => {
    e.preventDefault();
    setPassWordShow(!passWordShow);
  };

  const handleInputChange = (e) => {
    if (/^[0-9]+$/.test(e.target.value) === false) {
      otpInputRef.current.value = otpInputRef.current.value.slice(
        0,
        otpInputRef.current.value.length - 1
      );
    }
    if (!otpInputRef.current.value) {
      setOtpErrorPage(ProfileOtpconstant[localLang].PIN_required);
    } else if (otpInputRef.current.value.trim().length < 4) {
      setOtpErrorPage(ProfileOtpconstant[localLang].OTP_length_less);
    } else if (otpInputRef.current.value.trim().length > 6) {
      setOtpErrorPage(ProfileOtpconstant[localLang].OTP_length_greater);
    } else {
      setOtpErrorPage("");
    }
  };

  return (
    <Dialog
      open={popupData.isActive ? popupData.isActive : false}
      // onClose={handleClose}
      // onClick={(e) => shareDialog(e)}
    >
      <div className={styles.sharecontent_modal}>
        <div className={styles.main_modal}>
          <div className={styles.modal_wrapper}>
            <div className={styles.modal_content}>
              <CloseIcon
                className={`${styles.cross_icon}`}
                onClick={handleClose}
              ></CloseIcon>
              <div className={`${styles.modal_content_inner}`}>
                <div className={`${styles.profile_img}`}>
                  <img
                    src={
                      !!popupData?.userProfile?.imageUrl
                        ? getAbsolutePath(popupData.userProfile.imageUrl)
                        : "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg"
                    }
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src =
                        "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg";
                    }}
                    alt={popupData.userProfile.name}
                  />
                </div>

                <form className={styles.otp_block}>
                  <h5
                    className={`${styles.otp_Txt} ${styles.View_Txt} ${toggleOtpInput ? styles.inputfiled_text : ""}`}
                  >
                    {getText("heading1")}
                  </h5>
                  <p className={`${styles.otp_subTxt} ${styles.View_subTxt}`}>
                    {getHeading2()}
                  </p>

                  {toggleOtpInput && (
                    <div className={`${styles.otp_input}`}>
                      <div className={`${styles.input_wrapper}`}>
                        <input
                          placeholder={ProfileOtpconstant[localLang].OTP}
                          className={`${styles.form_control}`}
                          ref={otpInputRef}
                          type={passWordShow ? "text" : "password"}
                          maxLength={4}
                          onChange={handleInputChange}
                        ></input>
                        <button
                          className={`${styles.showPassord}`}
                          onClick={togglePWShow}
                        >
                          {passWordShow
                            ? ProfileOtpconstant[localLang].hide
                            : ProfileOtpconstant[localLang].show}
                        </button>
                        {otperrormsg && (
                          <span className={`${styles.err_txt}`}>
                            {otperrormsg}
                          </span>
                        )}
                      </div>
                      <div className={`${styles.text_danger}`}>
                        {otpsuccessmsg && (
                          <span
                            className={`${styles.otp_sent} ${otpsuccessmsg.type === "invalid" ? styles.otp_failed : ""}`}
                          >
                            {otpsuccessmsg.msg}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`${styles.footer_actions} ${toggleOtpInput ? styles.inputfiled_actions : ""}`}
                  >
                    <button
                      type="button"
                      className={`grey ${styles.Cancel}`}
                      onClick={handleClose}
                    >
                      {ProfileOtpconstant[localLang].Cancel}
                    </button>
                    <button
                      type="submit"
                      className={`primary ${styles.Continue}`}
                      onClick={handleSubmit}
                    >
                      {toggleOtpInput
                        ? ProfileOtpconstant[localLang].Continue
                        : ProfileOtpconstant[localLang].GET_OTP}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
