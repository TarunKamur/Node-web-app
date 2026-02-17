import styles from "@/components/otpVerify/otpVerify.module.scss";
import TextField from "@mui/material/TextField";
import { appConfig } from "@/config/app.config";
import { useEffect, useState, useRef } from "react";
import usePostApiMutate from "@/hooks/usePostApidata";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import {
  decryptData,
  encryptData,
  fromStyle,
} from "@/services/utility.service";
import { validateO } from "@/services/utility.service";
import { useStore } from "@/store/store";
import { getItem } from "@/services/local-storage.service";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import { OtpVerification } from "@/.i18n/locale";
import Loader from "@/components/loader/loader.component";
const OtpVerify = ({
  otpData,
  callbacksuccess,
  callbackfailure,
  returnBack,
}) => {
  const otpRef = useRef("");
  const [otpV, setOtpV] = useState({ valid: false, error: "" });
  const [timersend, setTimersend] = useState({
    timer: "00:30",
    endtimer: false,
  });
  const [startTimer, setStartTimer] = useState(false);
  let timer = 30;
  const [otpReponse, setOtpResponse] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { mutate: mutateDeleteAccount, data: deleteAcountData } =
    usePostApiMutate();
  const { mutate: mutateResend, data: apiResponseResend } = usePostApiMutate();
  const isUtUser = getItem("isUtuser");
  const {
    mutate: mutateVerifyOTP,
    data: verifyOTPApiResponse,
    isLoading,
  } = usePostApiMutate();
  const { mutate: mutateGetOTP, data: otpGetResponse } = usePostApiMutate();
  const {
    state: { SystemFeature, SystemConfig, localLang },
  } = useStore();

  const router = useRouter();

  useEffect(() => {
    if (!!otpData) {
      if (otpData.from == "signup") {
        if (otpData.verification == "mobile") {
          const apiPayload = {
            context: "signup",
            mobile: otpData.data.mobile,
          };
          getOtp(apiPayload);
        } else if (otpData.verification == "email") {
          const apiPayload = {
            context: "signup",
            email: otpData.data.email,
          };
          getOtp(apiPayload);
        }
      } else if (otpData.from == "signin") {
        if (otpData.verification == "mobile") {
          const apiPayload = {
            context: "signin",
            mobile: otpData.data.mobile,
          };
          getOtp(apiPayload);
        } else if (otpData.verification == "email") {
          const apiPayload = {
            context: "signin",
            email: otpData.data.email,
          };
          getOtp(apiPayload);
        }
      } else if (otpData.from == "delete_account") {
        const apiPayload = {
          context: "delete_account",
          mobile: otpData.data.mobile,
        };
        getOtp(apiPayload);
      } else if (otpData.from == "player") {
        let apiPayload = {
          context: otpData.context,
        };
        if (otpData.verification == "email") {
          apiPayload.email = otpData.data.email;
        } else if (otpData.verification == "mobile") {
          apiPayload.mobile = otpData.data.mobile;
        }
        getOtp(apiPayload);
      } else if (
        otpData.from == "forgot" ||
        otpData.from == "update_email" ||
        otpData.from == "update_mobile"
      ) {
        if (otpData.apiResponse) {
          validateResponse(otpData.apiResponse);
        }
      }
    }
  }, [otpData]);

  useEffect(() => {
    if (!!otpGetResponse?.data) {
      validateResponse(otpGetResponse);
    }
  }, [otpGetResponse]);

  const validateResponse = (apiRes) => {
    if (!!apiRes?.data?.status) {
      setTimersend({ timer: "00:30", endtimer: false });
      timer = apiRes?.data?.response.resendTime
        ? apiRes.data.response.resendTime
        : 30;
      setOtpResponse(apiRes.data.response);
      setErrorMessage("");
      setSuccessMessage(apiRes.data.response.message);
      clearingSuccessMessage();
      setStartTimer(true);
    } else {
      setSuccessMessage("");
      setErrorMessage(apiRes?.data?.error.message);
      clearingErrorMessage();
    }
  };

  useEffect(() => {
    if (!!apiResponseResend?.data) {
      validateResponse(apiResponseResend);
      // if (!!apiResponseResend?.data?.status) {
      //   setTimersend({timer: "00:30",endtimer: false})
      //   timer =  apiResponseResend?.data?.response.resendTime ?  apiResponseResend.data.response.resendTime : 30
      //   setOtpResponse(apiResponseResend.data.response);
      //   setErrorMessage("");
      //   setSuccessMessage(apiResponseResend.data.response.message)
      //   clearingSuccessMessage()
      //   setStartTimer(true)
      // }else{
      //   setSuccessMessage('');
      //   setErrorMessage(apiResponseResend?.data?.error.message)
      //   clearingErrorMessage()
      // }
    }
  }, [apiResponseResend]);

  const getOtp = (apiData) => {
    const url = `${process.env.initJson.api}/service/api/auth/get/otp`;
    mutateGetOTP({ url, apiData });
  };

  const verifyOTP = (event) => {
    event.preventDefault();
    validateOtp();
    if (validateOtp()) {
      if (otpData.from === "signup") {
        let postData = {
          context: otpData.context,
          reference_key: otpData?.data?.referenceKey,
        };
        if (SystemFeature?.encryptApisList?.fields?.signup === "true") {
          postData["otp"] = otpRef.current.value;
          let encryptObj = {
            data: encryptData(JSON.stringify(postData)),
            metadata: encryptData(
              JSON.stringify({ request: "signup/complete" })
            ),
          };
          hitVerifyOTPApi("v1/send", encryptObj);
        } else {
          (postData["otp"] = +otpRef.current.value),
            hitVerifyOTPApi("auth/signup/complete", postData);
        }
      } else if (otpData.from === "signin") {
        if (otpData.verification == "mobile") {
          const postData = {
            context: otpData.context,
            mobile: otpData?.data?.mobile,
            otp: +otpRef.current.value,
          };
          hitVerifyOTPApi("auth/verify/otp", postData);
        } else {
          const postData = {
            context: otpData.context,
            email: otpData?.data?.email,
            otp: +otpRef.current.value,
          };
          hitVerifyOTPApi("auth/verify/otp", postData);
        }
      } else if (otpData.from === "forgot" || otpData.from === "player") {
        if (otpData.verification == "mobile") {
          const postData = {
            context: otpData.context,
            mobile: otpData?.data?.mobile,
            otp: +otpRef.current.value,
          };
          hitVerifyOTPApi("auth/verify/otp", postData);
        } else {
          const postData = {
            context: otpData.context,
            email: otpData?.data?.email,
            otp: +otpRef.current.value,
          };
          hitVerifyOTPApi("auth/verify/otp", postData);
        }
      } else if (otpData.from === "update_email") {
        const postData = {
          context: otpData.context,
          otp: +otpRef.current.value,
          new_identifier: otpData?.data?.email,
        };
        if (otpData?.data?.mobile) {
          postData.mobile = otpData?.data?.mobile;
        } else postData.email = otpData?.data?.email;
        hitVerifyOTPApi("auth/verify/otp", postData);
      } else if (otpData.from === "update_mobile") {
        const postData = {
          context: otpData.context,
          otp: +otpRef.current.value,
          new_identifier: otpData?.data?.mobile,
        };
        if (otpData?.data?.email) {
          postData.email = otpData?.data?.email;
        } else postData.mobile = otpData?.data?.mobile;
        hitVerifyOTPApi("auth/verify/otp", postData);
      } else if (otpData.from === "delete_account") {
        // let postData = {
        //   context: otpData.context,
        //   mobile: otpData?.data?.mobile,
        //   otp: +otpRef.current.value,
        //   new_identifier: otpData?.data?.mobile,
        // };
        deleteAccountApi();
        // hitVerifyOTPApi("auth/verify/otp", postData);
      }
    }
  };

  const hitVerifyOTPApi = (urlPostfix, apiData) => {
    let url = `${process.env.initJson["api"]}/service/api/${urlPostfix}`;
    mutateVerifyOTP({ url, apiData });
  };

  const deleteAccountApi = () => {
    let apiData = {
      otp: otpRef.current.value,
      mobile: otpData.data.mobile,
      context: "delete_account",
    };
    let url = process.env.initJson["api"] + "/service/api/auth/delete/account";
    mutateDeleteAccount({ url, apiData });
  };

  const clearingErrorMessage = () => {
    const init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 5000);
  };

  const clearingSuccessMessage = () => {
    const init1 = setTimeout(() => {
      setSuccessMessage("");
      clearTimeout(init1);
    }, 5000);
  };

  useEffect(() => {
    if (!!verifyOTPApiResponse?.data) {
      setResponseData(verifyOTPApiResponse);
      // if (!!isUtUser) {
      deleteAccountApi();
      // }
    }
  }, [verifyOTPApiResponse]);
  useEffect(() => {
    if (!!deleteAcountData?.data) {
      if (deleteAcountData?.data?.status) {
        if (
          !!isUtUser ||
          otpData.from === "update_email" ||
          otpData.from === "delete_account"
        ) {
          window.location.href = SystemConfig?.configs?.siteURL;
        } else {
          router.push("/");
        }
      } else {
        setErrorMessage(deleteAcountData?.data?.error?.message);
      }
    }
  }, [deleteAcountData]);

  const setResponseData = (res) => {
    if (SystemFeature?.encryptApisList?.fields?.signup === "true") {
      if (otpData.from === "signup") {
        res = {
          data: JSON.parse(decryptData(res?.data?.data)),
        };
      }
    }
    if (!!res?.data?.status) {
      if (otpData.from == "forgot") {
        callbacksuccess({ otp: otpRef.current.value });
      } else if (otpData.from == "delete_account") {
        callbacksuccess({ otp: otpRef.current.value });
      } else {
        if (SystemFeature?.encryptApisList?.fields?.signup === "true") {
          callbacksuccess(res?.data?.response);
        } else {
          callbacksuccess(res?.data?.response);
        }
      }
    } else {
      if (res?.data?.error && res?.data?.error?.code === 401) {
        unAuthorisedHandler();
      } else {
        setSuccessMessage("");
        setErrorMessage(res?.data?.error?.message);
        clearingErrorMessage();
      }
    }
  };

  useEffect(() => {
    if (!!startTimer) {
      const interval = setInterval(() => {
        timer = --timer;
        const minutes = Math.floor(timer / 60);
        const remainingSeconds = timer % 60;
        const formattedMinutes = String(minutes).padStart(2, "0");
        const formattedSeconds = String(remainingSeconds).padStart(2, "0");
        const formattedTime = `${formattedMinutes}:${formattedSeconds}`;
        setTimersend({ timer: formattedTime, endtimer: false });
        if (timer == 0) {
          clearInterval(interval);
          setTimersend({ timer: "00:30", endtimer: true });
          setStartTimer(false);
        }
      }, 1000);
      return () => {
        !!interval && clearInterval(interval);
      };
    }
  }, [startTimer]);

  const validateOtp = () => {
    const result = validateO(
      otpRef.current.value,
      appConfig.otpMinLength,
      appConfig.otpMaxLength,
      localLang
    );
    setOtpV(result);
    return result.valid;
  };

  const resendOtp = () => {
    const apiData = { reference_id: otpReponse.referenceId };
    const url = `${process.env.initJson.api}/service/api/auth/resend/otp`;
    mutateResend({ url, apiData });
  };

  const goback = () => {
    returnBack();
  };

  return (
    <div className={`${styles.otp_main}`}>
      <div className={` ${styles.otp_cont}`}>
        <div className={`${styles.otp_inner}`}>
          <h1 className={`${styles.p_title}`}>
            {OtpVerification[localLang].Enter_One_Time_Passcode}
          </h1>
          {/* {otpData.from == 'delete_account' && */}
          <CloseIcon className={`${styles.cross_icon}`} onClick={goback} />
          {/* } */}
          <p className={`${styles.sub_heading}`}>{otpData?.data?.title1}</p>
          <form onSubmit={verifyOTP}>
            <div className={` ${styles.forgot} `}>
              <TextField
                fullWidth
                id="otp"
                key="otp"
                label={OtpVerification[localLang].enter_otp}
                name="otp"
                margin="normal"
                variant="outlined"
                type="number"
                sx={fromStyle}
                inputRef={otpRef}
                onChange={validateOtp}
                onKeyDown={(e) => {
                  if ([38, 40].indexOf(e.keyCode) > -1) {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => e.target.blur()}
                inputProps={{ maxLength: appConfig.otpMaxLength }}
                onFocus={() => setOtpV({ valid: true, error: "" })}
              />
              <div className={` ${styles.valid_error} `}>{otpV.error}</div>
              {otpData.from !== "delete_account" && (
                <>
                  {!timersend.endtimer ? (
                    <span
                      className={`${styles.resendCode} ${styles.resendCount} `}
                    >
                      {OtpVerification[localLang].Resend_otp_in}{" "}
                      {timersend.timer} {OtpVerification[localLang].secs}
                    </span>
                  ) : (
                    <span
                      onClick={resendOtp}
                      className={` ${styles.valid_error}  ${styles.resendCode} `}
                    >
                      {OtpVerification[localLang].RESEND_OTP}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className={`${styles.text_danger1}`}>
              <span>{errorMessage}</span>
            </div>
            {otpData.from !== "delete_account" && (
              <div className={`${styles.text_success1}`}>
                <span>{successMessage}</span>
              </div>
            )}
            <button
              className={` ${styles.button} primary`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader type="button" />
              ) : (
                OtpVerification[localLang].Verify
              )}
            </button>

            {otpData?.from === "delete_account" && (
              <button
                className={` ${styles.button} secondary`}
                disabled={!timersend.endtimer}
                onClick={resendOtp}
              >
                {!timersend.endtimer ? (
                  // <span className={`${styles.deleteAcc} ${styles.resendCode} ${styles.resendCount} `}>
                  <>
                    {OtpVerification[localLang].Resend_otp_in} {timersend.timer}{" "}
                    {OtpVerification[localLang].secs}
                  </>
                ) : (
                  // </span>
                  // <span
                  //   onClick={resendOtp}
                  //   className={` ${styles.valid_error} ${styles.deleteAcc} ${styles.resendCode} `}
                  // >
                  <>{OtpVerification[localLang].RESEND_OTP}</>
                  // </span>
                )}
              </button>
            )}
          </form>
          <div className={` ${styles.signin_footer}`}>
            <p className={` ${styles.md_label}`}>
              {(otpData?.from === "signup" || otpData?.from === "forgot") &&
                otpData?.verification == "mobile" && (
                  <span onClick={goback}>
                    {OtpVerification[localLang].Change_Mobile_Number}
                  </span>
                )}
              {(otpData?.from === "signup" || otpData?.from === "forgot") &&
                otpData?.verification == "email" && (
                  <span onClick={goback}>
                    {OtpVerification[localLang].Change_Email_Id}
                  </span>
                )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;
