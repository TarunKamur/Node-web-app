/* eslint-disable react-hooks/exhaustive-deps */
import Link from "next/link";
import styles from "@/components/forgot/forgot.module.scss";
import { appConfig } from "@/config/app.config";
import { useEffect, useState } from "react";
import usePostApiMutate from "@/hooks/usePostApidata";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import OtpVerify from "@/components/otpVerify/otpVerify.component";
import {
  fromStyle,
  validateE,
  validateM,
  validateP,
  validateCP,
  decryptData,
  getQueryParams,
} from "@/services/utility.service";
import { Forgotpassword } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import MobileNumberField from "../reactHookFormFields/MobileNumberField";
import CustomTextField from "../reactHookFormFields/CustomTextField";
import PasswordField from "../reactHookFormFields/PasswordField";

const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const SignInVestaImage = dynamic(
  () => import("@/components/signinVestaImage/signin-vesta-image.component")
);

const Forgot = () => {
  const {
    state: { SystemConfig, SystemFeature, localLang },
    dispatch,
  } = useStore();
  const [forgotWithEmail, setforgotWithEmail] = useState(
    appConfig.forgot.verification
  );
  const [otpNum, setotpNum] = useState();
  const [errorMsg, seterrorMsg] = useState("");
  const [otpData, setOtpData] = useState();
  const [otpDataLocal, setOtpDataLocal] = useState();
  const [selectCountry, setSelectCountry] = useState("");
  const [popupData, setPopUpData] = useState({});
  const { mutate: mutateSignin, data: apiResponse } = usePostApiMutate();
  const { mutate: mutateGetOTP, data: otpGetResponse } = usePostApiMutate();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    trigger,
    watch,
  } = useForm({ mode: "onChange", shouldFocusError: false });
  const [visibility, setVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const toggleVisibility = (key) => {
    setVisibility((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };
  useEffect(() => {
    if (apiResponse?.data) {
      if (apiResponse?.data?.status) {
        if (forgotWithEmail == "setPassword") {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: apiResponse?.data?.response?.message },
          });
          router.push("/signin");
        }
      } else if (
        apiResponse?.data?.error &&
        apiResponse?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      } else {
        signinErrorCase(apiResponse?.data?.error);
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    if (SystemFeature) {
      if (
        SystemFeature &&
        SystemFeature.otpauthentication?.fields?.forgot_password_identifier_type
      ) {
        setforgotWithEmail(
          SystemFeature.otpauthentication.fields.forgot_password_identifier_type
        );
      }
      if (router.asPath.includes("udp")) {
        passwordResetLink();
      }
    }
  }, [SystemFeature]);

  useEffect(() => {
    if (otpGetResponse?.data) {
      if (otpGetResponse?.data?.status) {
        if (process.env.initJson.tenantCode === "lynktelecom") {
          if (
            SystemFeature.otpauthentication.fields
              .update_password_show_otp_screen === "true"
          ) {
            setOtpData({ ...otpDataLocal, apiResponse: otpGetResponse });
          }
        } else if (otpGetResponse?.data.response.showOTPScreen == true) {
          setOtpData({ ...otpDataLocal, apiResponse: otpGetResponse });
        } else {
          popupDataSet(otpGetResponse);
        }
        setforgotWithEmail("otp");
      } else if (
        otpGetResponse?.data?.error &&
        otpGetResponse?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      } else {
        signinErrorCase(otpGetResponse?.data?.error);
      }
    }
  }, [otpGetResponse]);

  const onSubmit = (data) => {
    let fd = {};
    if (forgotWithEmail == "email") {
      fd = {
        from: "forgot",
        verification: "email",
        context: "update_password",
        data: {
          title1: `${Forgotpassword[localLang].Otp_sent_to_your_email} ${data.email.slice(0, 5)}******${data.email.substring(8)}`,
          email: data.email,
        },
      };
      setOtpDataLocal(fd);
      getOtp(fd);
    }
    if (forgotWithEmail == "mobile") {
      fd = {
        from: "forgot",
        verification: "mobile",
        context: "update_password",
        data: {
          title1: `${Forgotpassword[localLang].Otp_sent_to_your_mobile} ******${data.mobile.slice(data.mobile.length - 4)}`,
          mobile: `${selectCountry.isdCode}${data.mobile}`,
        },
      };
      setOtpDataLocal(fd);
      getOtp(fd);
    }
    if (forgotWithEmail == "setPassword") {
      const apiData = {
        otp: +otpNum.otp,
        password: data.password,
      };
      if (otpNum.mobile) {
        apiData.mobile = otpNum.mobile;
      } else {
        apiData.email = otpNum.email;
      }
      const url = `${process.env.initJson.api}/service/api/auth/update/password`;
      mutateSignin({ url, apiData });
    }
  };

  const getOtp = (fd) => {
    const apiPayload =
      fd.verification == "mobile"
        ? {
            Platform: "web",
            Source: "home",
            context: "update_password",
            mobile: fd.data.mobile,
          }
        : {
            Platform: "web",
            Source: "home",
            context: "update_password",
            email: fd.data.email,
          };

    const url = `${process.env.initJson.api}/service/api/auth/get/otp`;
    mutateGetOTP({ url, apiData: apiPayload });
  };

  const signinErrorCase = (errorData) => {
    if (errorData) {
      seterrorMsg(errorData.message);
      setTimeout(() => {
        seterrorMsg("");
      }, 5000);
    } else {
      seterrorMsg("Something Went Wrong");
      setTimeout(() => {
        seterrorMsg("");
      }, 5000);
    }
  };

  const validatePassword = (value) => {
    const result = validateP(
      value,
      appConfig.authMinLength,
      appConfig.authMaxLength,
      localLang
    );
    return result.valid || result.error;
  };

  const validateConfPassword = (value) => {
    const password = watch("password");
    const result = validateCP(value, password, localLang);
    return result.valid || result.error;
  };

  const validateEmail = (value) => {
    const result = validateE(value, appConfig?.authEmailPattern, "", localLang);
    return result.valid || result.error;
  };

  const validateMobile = (value) => {
    const result = validateM(
      value,
      SystemConfig?.configs?.validMobileRegex || appConfig?.authMobilePattern
    );
    return result.valid || result.error;
  };

  const callbacksuccess = (data) => {
    setOtpData();
    setforgotWithEmail("setPassword");
    if (otpData.verification == "mobile") {
      setotpNum({ ...data, mobile: otpData?.data?.mobile });
    } else {
      setotpNum({ ...data, email: otpData?.data?.email });
    }
  };

  const reset = () => {
    setOtpData();
    if (SystemFeature) {
      if (
        SystemFeature &&
        SystemFeature.otpauthentication?.fields?.forgot_password_identifier_type
      ) {
        setforgotWithEmail(
          SystemFeature.otpauthentication.fields.forgot_password_identifier_type
        );
      }
    } else {
      setforgotWithEmail(appConfig.forgot.verification);
    }
  };

  const passwordResetLink = () => {
    const params = getQueryParams(router.asPath);
    let encryptdata = params.udp;
    if (encryptdata) {
      encryptdata = decodeURIComponent(encryptdata);
      encryptdata = decodeURIComponent(encryptdata);
      encryptdata = decryptData(encryptdata);
      if (encryptdata) {
        encryptdata = `?${encryptdata}`;
        const jsonstring = getQueryParams(encryptdata);
        setotpNum(jsonstring);
        setforgotWithEmail("setPassword");
      }
    }
  };

  const handleClose = () => {
    setPopUpData({});
    router.push("/signin");
  };

  const navigateToSignIn = () => {
    handleClose();
    router.push("/signin");
  };

  const popupDataSet = (otpGetResponseDuplicate) => {
    const pop = {
      type: "fogotPassword",
      isActive: true,
      title1: otpGetResponseDuplicate.data.response.message, // `If the email address you entered is associated with your ${process.env.title} account, we have sent you an email containing: Instructions for how to easily reset your password.`,
      yesButton1: "Okay",
      yesButtonType: "primary",
      yesButtonTarget1: navigateToSignIn,
      closeTarget: handleClose,
      close: false,
    };
    setPopUpData(pop);
  };

  return (
    <div className={` ${styles.signin_cont_page}`}>
      <Link href="/" prefetch={false} aria-label="app logo">
        <img
          className={` ${styles.tablet_logo}`}
          src={appConfig?.appLogo}
          alt="app-logo"
        />
      </Link>
      {appConfig?.forgot?.helpInMobile && (
        <Link className="helpText" href="/support/contact-us" prefetch={false}>
          {Forgotpassword?.[localLang]?.Help}
        </Link>
      )}
      {process.env.initJson?.tenantCode === "vesta" && <SignInVestaImage />}
      <div className={` ${styles.signin_cont}`}>
        {((forgotWithEmail == "otp" &&
          otpGetResponse.data.response.showOTPScreen == true) ||
          (forgotWithEmail == "otp" &&
            process.env.initJson.tenantCode === "lynktelecom")) && (
          <OtpVerify
            otpData={otpData}
            callbacksuccess={callbacksuccess}
            returnBack={() => reset()}
          />
        )}
        {forgotWithEmail == "otp" &&
          (otpGetResponse.data.response.statusCode == 2 ||
            otpGetResponse.data.response.statusCode == 4) && (
            <PopupModal popupData={popupData} />
          )}
        {(forgotWithEmail == "email" || forgotWithEmail == "mobile") && (
          <>
            <h1>{Forgotpassword[localLang].Forgot_Password}</h1>
            <p className={` ${styles.ptagStyle}`}>
              {Forgotpassword[localLang].Please_enter_your} {forgotWithEmail}{" "}
              {
                Forgotpassword[localLang]
                  .And_will_send_you_an_OTP_to_reset_password
              }
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              {forgotWithEmail == "email" && (
                <CustomTextField
                  label={Forgotpassword[localLang].Email_Address}
                  name="email"
                  register={register}
                  errors={errors}
                  trigger={trigger}
                  clearErrors={clearErrors}
                  validateFunction={validateEmail}
                  fromStyle={fromStyle}
                />
              )}
              {forgotWithEmail == "mobile" && (
                <MobileNumberField
                  label="Mobile Number"
                  name="mobile"
                  onWheel={(e) => e.target.blur()}
                  register={register}
                  errors={errors}
                  trigger={trigger}
                  clearErrors={clearErrors}
                  validateFunction={validateMobile}
                  setSelectCountry={setSelectCountry}
                  fromStyle={fromStyle}
                  onKeyDown={(e) => {
                    if ([38, 40].indexOf(e.keyCode) > -1) {
                      e.preventDefault();
                    }
                  }}
                />
              )}
              <div className={`${styles.text_danger1}`}>
                <span>{errorMsg}</span>
              </div>
              <button className={` ${styles.button} primary`} type="submit">
                {Forgotpassword[localLang].Get_OTP}
              </button>
            </form>

            <div className={` ${styles.signin_footer}`}>
              <p className={` ${styles.md_label}`}>
                <Link href="signin" prefetch={false}>
                  {Forgotpassword[localLang].Back_to_Sign_In}
                </Link>
              </p>
            </div>
          </>
        )}
        {forgotWithEmail == "setPassword" && (
          <>
            <h1>{Forgotpassword[localLang].Reset_password}</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
              <PasswordField
                name="password"
                label="Password"
                register={register}
                errors={errors}
                trigger={trigger}
                clearErrors={clearErrors}
                validateFunction={validatePassword}
                toggleVisibility={toggleVisibility}
                visibility={visibility.password}
              />
              <PasswordField
                name="confirmPassword"
                label="Confirm Password"
                register={register}
                errors={errors}
                trigger={trigger}
                clearErrors={clearErrors}
                validateFunction={validateConfPassword}
                toggleVisibility={toggleVisibility}
                visibility={visibility.confirmPassword}
              />
              <div className={`${styles.text_danger1}`}>
                <span>{errorMsg}</span>
              </div>
              <button className={` ${styles.button} primary`} type="submit">
                {Forgotpassword[localLang].Reset}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Forgot;
