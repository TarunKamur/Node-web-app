/* eslint-disable react-hooks/exhaustive-deps */
import Link from "next/link";
import styles from "@/components/signin/signin.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { actions, useStore } from "@/store/store";
import usePostApiMutate from "@/hooks/usePostApidata";
import {
  setItemEnc,
  setItem,
  setNookie,
  getNookie,
} from "@/services/local-storage.service";
import {
  handleTokenError,
  unAuthorisedHandler,
} from "@/services/data-manager.service";
import { appConfig } from "@/config/app.config";
import {
  decryptData,
  encryptData,
  fromStyle,
  validateE,
  validateM,
  validateP,
} from "@/services/utility.service";
import { Forgotpassword, signinconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { sendEvent, setUserSession } from "@/services/analytics.service";
import { useForm } from "react-hook-form";
import Loader from "../loader/loader.component";
import CustomTextField from "../reactHookFormFields/CustomTextField";
import MobileNumberField from "../reactHookFormFields/MobileNumberField";
import PasswordField from "../reactHookFormFields/PasswordField";
import { getNewConfigdata } from "@/services/user.service";
// import SocialLogin from "../social-login/socialLogin.component";
// import OtpVerify from "../otpVerify/otpVerify.component";
// import AdditionalUserData from "../additionalUserdata/additionalUserData.component";

const OtpVerify = dynamic(
  () => import("@/components/otpVerify/otpVerify.component")
);

const SocialLogin = dynamic(
  () => import("@/components/social-login/socialLogin.component")
);

const AdditionalUserData = dynamic(
  () => import("@/components/additionalUserdata/additionalUserData.component")
);

const SignInVestaImage = dynamic(
  () => import("@/components/signinVestaImage/signin-vesta-image.component")
);

const SignIn = () => {
  const {
    state: {
      SystemFeature,
      SystemConfig,
      userDetails,
      navigateFrom,
      localLang,
    },
    dispatch,
  } = useStore();
  const mounted = useRef(false);
  const [signInWithEmail, setSignInWithEmail] = useState(
    appConfig?.signin?.primary === "email"
  );
  const [selectCountry, setSelectCountry] = useState("");
  const [otpData, setOtpData] = useState();
  const [socialUserDetails, setSocialUserDetails] = useState();
  const [continueSocial, setContinueSocial] = useState(0);
  const [navtoVerifyOTP, setNavtoVerifyOTP] = useState(false);
  const {
    mutate: mutateSignin,
    data: apiResponse,
    isLoading,
  } = usePostApiMutate();

  const { mutate: mutateSigninEnc, data: EncApiResponse } = usePostApiMutate();
  const [userRes, setUserRes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    trigger,
  } = useForm({ mode: "onChange", shouldFocusError: false });
  const [visibility, setVisibility] = useState({
    password: false,
  });

  const toggleVisibility = (key) => {
    setVisibility((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  useEffect(() => {
    if (
      SystemFeature?.globalsettings?.fields?.isEmailSupported == "true" &&
      appConfig.signin.primary == "email"
    ) {
      setSignInWithEmail(true);
    } else if (
      SystemFeature?.globalsettings?.fields?.isMobileSupported == "true" &&
      appConfig.signin.primary == "mobile"
    ) {
      setSignInWithEmail(false);
    } else {
      setSignInWithEmail(
        SystemFeature?.globalsettings?.fields?.isEmailSupported == "true"
      );
    }
  }, [SystemFeature]);

  const onSubmit = (data) => {
    sendEvent("signin_initiated", {});
    if (isLoading) return;
    const apiData = {
      login_id: signInWithEmail
        ? data.email
        : `${selectCountry.isdCode}-${data.mobile}`,
      login_key: data.password,
      manufacturer: "123",
    };
    if (SystemFeature?.encryptApisList?.fields?.signin === "true") {
      apiData.login_mode = "1";
      const encryptObj = {
        data: encryptData(JSON.stringify(apiData)),
        metadata: encryptData(JSON.stringify({ request: "signin" })),
      };
      hitapiSiginEnc(encryptObj);
    } else {
      apiData.login_mode = 1;
      hitapiSigin(apiData);
    }
  };

  const hitapiSigin = (apiData) => {
    const url = `${process.env.initJson.api}/service/api/auth/v1/signin`;
    mutateSignin({ url, apiData });
  };

  const hitapiSiginEnc = (apiData) => {
    const url = `${process.env.initJson.api}/service/api/v1/send`;
    mutateSigninEnc({ url, apiData });
  };

  useEffect(() => {
    if (EncApiResponse?.data) {
      const decrypteData = JSON.parse(decryptData(EncApiResponse?.data?.data));
      setResponseData(decrypteData);
    }
  }, [EncApiResponse]);

  useEffect(() => {
    if (apiResponse?.data) {
      setResponseData(apiResponse?.data);
    }
  }, [apiResponse]);

  useEffect(() => {
    if (userDetails) {
      if (mounted.current == false) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: "User already LoggedIn" },
        });
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    }
  }, [userDetails]);

  const setResponseData = (res) => {
    if (res?.status) {
      if (res?.response?.actionCode == 2 || res?.response?.actionCode == 4) {
        signinErrorCase(res?.response);
      } else setUserLogin(res?.response);
    } else if (res?.error && res?.error?.code === 401) {
      unAuthorisedHandler();
    } else {
      signinErrorCase(res?.error);
    }
  };

  const setUserLogin = (userResponse) => {
    mounted.current = true; // set to aviod unwanted unserdetails check after success login
    setItemEnc("uDetails", userResponse);
    setItem("isloggedin", true);
    const cUserData = getNookie("user-info") || {};
    const newUserData = { ...cUserData, isLoggedIn: true };
    setNookie("user-info", newUserData);
    dispatch({ type: actions.userDetails, payload: userResponse });
    // clevertap session initiation
    setUserSession(userResponse);
    const ar_status =
      userResponse?.packages &&
      userResponse?.packages?.[0]?.recurrenceStatus == "A"
        ? "true"
        : "false";
    const subscription_status = userResponse?.packages?.length
      ? "true"
      : "false";
    sendEvent("signin_completed", { ar_status, subscription_status });
    getNewConfigdata();
    if (
      !!SystemFeature &&
      !!SystemFeature.userprofiles &&
      SystemFeature.userprofiles.fields.is_userprofiles_supported == "true" &&
      !navigateFrom?.includes("activate/device")
    ) {
      router.push("/profiles/select-user-profile");
    } else if (navigateFrom) {
      dispatch({ type: actions.navigateFrom, payload: null });

      router.push(navigateFrom);
    } else {
      router.push("/");
    }
  };

  const signinErrorCase = (errorObj) => {
    let fd = {};
    const actionCode = parseInt(errorObj?.actionCode);
    setUserRes(errorObj);
    if (actionCode == 1 || actionCode == 2) {
      // mobile verify
      const mobile = errorObj?.details?.identifier || errorObj?.phoneNumber;
      fd = {
        from: "signin",
        verification: "mobile",
        context: "signin",
        data: {
          title1: `${Forgotpassword[localLang].Otp_sent_to_your_mobile} ******${mobile.slice(mobile.length - 4)}`,
          mobile,
          email: mobile,
        },
      };
      setOtpData(fd);
    } else if (actionCode == 3 || actionCode == 4) {
      // email verify
      const email = errorObj?.details?.identifier || errorObj?.email;
      fd = {
        from: "signin",
        verification: "email",
        context: "signin",
        data: {
          title1: `${Forgotpassword[localLang].Otp_sent_to_your_email} ${email.slice(0, 5)}******${email.substring(8)}`,
          mobile: email,
          email,
        },
      };
      setOtpData(fd);
    } else if (parseInt(errorObj?.code) == -1000) {
      setContinueSocial(1);
    } else if (parseInt(errorObj?.code) == -17) {
      handleTokenError();
    } else {
      setErrorMessage(errorObj?.message);
      clearingErrorMessage();
    }
  };

  const clearingErrorMessage = () => {
    const init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 5000);
  };

  const validateEmail = (value) => {
    const result = validateE(value, appConfig?.authEmailPattern, "", localLang);
    return result.valid || result.error;
  };

  const validateMobile = (value) => {
    const result = validateM(
      value,
      SystemConfig?.configs?.validMobileRegex
        ? SystemConfig.configs.validMobileRegex
        : appConfig?.authMobilePattern ,localLang 
    );
    return result.valid || result.error;
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

  const callbacksuccess = () => {
    setItem("isloggedin", true);
    const cUserData = getNookie("user-info") || {};
    const newUserData = { ...cUserData, isLoggedIn: true };
    setNookie("user-info", newUserData);
    if (
      !!SystemFeature &&
      !!SystemFeature.userprofiles &&
      SystemFeature.userprofiles.fields.is_userprofiles_supported == "true" &&
      !navigateFrom?.includes("activate/device")
    ) {
      router.push("/profiles/select-user-profile");
    } else if (navigateFrom) {
      dispatch({ type: actions.navigateFrom, payload: null });
      router.push(navigateFrom);
    } else {
      router.push("/");
    }
  };

  const socialLoginCallBck = (apiData) => {
    // const url = `${process.env.initJson.api}/service/api/auth/v1/signin`;
    // mutateSignin({ url, apiData });
    setSocialUserDetails(apiData);
    if (SystemFeature?.encryptApisList?.fields?.signin === "true") {
      const encryptObj = {
        data: encryptData(JSON.stringify(apiData)),
        metadata: encryptData(JSON.stringify({ request: "signin" })),
      };
      hitapiSiginEnc(encryptObj);
    } else {
      const url = `${process.env.initJson.api}/service/api/auth/v1/signin`;
      mutateSignin({ url, apiData });
    }
  };

  const continueSocialUser = (apiData) => {
    let fd = {};
    if (apiData.actionCode === 1) {
      // user not register until OTP verification for mobile
      fd = {
        from: "signup",
        verification: "mobile",
        context: "signup",
        data: {
          title1: `${Forgotpassword[localLang].Otp_sent_to_your_mobile} ******${apiData.details.mobile.slice(apiData.details.mobile.length - 4)}`,
          mobile: apiData.details.mobile,
          email: apiData.details.email,
          referenceKey: apiData?.details?.referenceKey,
        },
      };
      const dupDetails = socialUserDetails;
      dupDetails.mobile = apiData.details.mobile;
      setSocialUserDetails(dupDetails);
      setContinueSocial(0);
      setNavtoVerifyOTP(true);
      setOtpData(fd);
    } else {
      setUserLogin(apiData.userDetails);
    }
  };

  const backfromOpt = () => {
    if (navtoVerifyOTP) {
      setContinueSocial(1);
      setNavtoVerifyOTP(false);
    }
    if (userRes?.actionCode == 2 || userRes?.actionCode == 4) {
      setUserLogin(userRes);
    }
    setOtpData();
  };

  const handleGuestLogin = () => {
    if (navigateFrom) {
      sendEvent("signin_guest", {});
      dispatch({ type: actions.navigateFrom, payload: null });
      router.push(navigateFrom);
    } else {
      router.push("/");
    }
  };

  return (
    <div className={` ${styles.signin_cont_page}`}>
      <Link href="/" aria-label="app logo" prefetch={false}>
        <img
          className={` ${styles.tablet_logo}`}
          src={appConfig?.appLogo}
          alt="app-logo"
        />
      </Link>
      {appConfig?.signin?.helpInMobile && (
        <Link className="helpText" href="/support/contact-us" prefetch={false}>
          {signinconstant?.[localLang]?.Help}
        </Link>
      )}
      {process.env.initJson?.tenantCode === "vesta" && <SignInVestaImage />}
      {continueSocial == 0 ? (
        <div className={` ${styles.signin_cont}`}>
          {otpData ? (
            <OtpVerify
              otpData={otpData}
              callbacksuccess={callbacksuccess}
              returnBack={() => backfromOpt()}
            />
          ) : (
            <>
              <h1>{signinconstant[localLang].Sign_in_to_your_Account}</h1>
              <form onSubmit={handleSubmit(onSubmit)}>
                {signInWithEmail ? (
                  <CustomTextField
                    label={signinconstant[localLang]?.Email_ID}
                    name="email"
                    register={register}
                    errors={errors}
                    trigger={trigger}
                    clearErrors={clearErrors}
                    validateFunction={validateEmail}
                    fromStyle={fromStyle}
                  />
                ) : (
                  <MobileNumberField
                    label={signinconstant[localLang]?.Mobile_Number}
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
                <PasswordField
                  name="password"
                  label={signinconstant[localLang]?.Password}
                  register={register}
                  errors={errors}
                  trigger={trigger}
                  clearErrors={clearErrors}
                  validateFunction={validatePassword}
                  toggleVisibility={toggleVisibility}
                  visibility={visibility.password}
                  displayForgotPassword
                  forgotPasswordText={
                    signinconstant?.[localLang]?.Forgot_Password
                  }
                />
                <div className={`${styles.text_danger1}`}>
                  <span>{errorMessage}</span>
                </div>
                <button className={` ${styles.button} primary`} type="submit">
                  {isLoading ? (
                    <span className={` ${styles.loader}`}>
                      <Loader type="button" />
                    </span>
                  ) : (
                    <span>{signinconstant[localLang].Sign_In} </span>
                  )}
                </button>
                {appConfig.signin?.guestLogin && (
                  <button
                    type="button"
                    className={`${styles.button} ${styles.guest}`}
                    onClick={handleGuestLogin}
                  >
                    {signinconstant[localLang]?.Continue_as_Guest}
                  </button>
                )}
              </form>
              {((!!SystemFeature?.sociallogin &&
                (SystemFeature?.sociallogin?.fields?.apple == "true" ||
                  SystemFeature?.sociallogin?.fields?.facebook == "true" ||
                  SystemFeature?.sociallogin?.fields?.google == "true")) ||
                (SystemFeature?.globalsettings?.fields?.isMobileSupported ===
                  "true" &&
                  SystemFeature?.globalsettings?.fields?.isEmailSupported ===
                    "true")) && (
                <div className={` ${styles.links_or} `}>
                  <span />
                </div>
              )}
              {SystemFeature?.globalsettings?.fields?.isMobileSupported ===
                "true" &&
                SystemFeature?.globalsettings?.fields?.isEmailSupported ===
                  "true" &&
                !!appConfig?.signin?.emailPhoneToggle && (
                  <button
                    type="button"
                    className={` ${styles.button} ${styles.signInWithEmail} default`}
                    onClick={() => {
                      setSignInWithEmail(!signInWithEmail);
                    }}
                  >
                    {signinconstant[localLang].Sign_In_with}{" "}
                    {signInWithEmail
                      ? signinconstant[localLang]?.Mobile_Number
                      : signinconstant[localLang]?.Email_ID}
                  </button>
                )}
              {!!SystemFeature?.sociallogin &&
                (SystemFeature?.sociallogin?.fields?.apple == "true" ||
                  SystemFeature?.sociallogin?.fields?.facebook == "true" ||
                  SystemFeature?.sociallogin?.fields?.google == "true") && (
                  <SocialLogin socialLoginCallBck={socialLoginCallBck} />
                )}

              <div className={` ${styles.signin_footer}`}>
                <p className={` ${styles.sm_label}`}>
                  {
                    signinconstant[localLang]
                      .By_Signing_in_you_agree_to_brand_name
                  }
                  <Link href="/support/terms" target="_blank" prefetch={false}>
                    {signinconstant[localLang].Terms_and_Conditions}
                  </Link>
                  {signinconstant[localLang].And}
                  <Link href="/support/privacy-policy" target="_blank" prefetch={false}>
                    {signinconstant[localLang].Privacy_Policy}
                  </Link>
                </p>

                <p className={` ${styles.md_label}`}>
                  {signinconstant[localLang].Dont_have_an_account}
                  <Link href="signup" prefetch={false}>{signinconstant[localLang].Sign_up}</Link>
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <AdditionalUserData
          socialDetails={socialUserDetails}
          continueSocialUser={continueSocialUser}
        />
      )}
    </div>
  );
};

export default SignIn;
