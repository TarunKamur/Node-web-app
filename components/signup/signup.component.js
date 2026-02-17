/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import Link from "next/link";
import styles from "@/components/signup/signup.module.scss";
import { useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useRouter } from "next/router";
import { appConfig } from "@/config/app.config";

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
import {
  decryptData,
  encryptData,
  fromStyle,
  validateN,
  validateE,
  validateP,
  validateM,
  validateCP,
  validateDOB,
} from "@/services/utility.service";
// import AdditionalUserData from "@/components/additionalUserdata/additionalUserData.component";
import { Forgotpassword, signupconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import Loader from "@/components/loader/loader.component";
import { sendEvent, setUserSession } from "@/services/analytics.service";
import { useForm } from "react-hook-form";
import DynamicFieldsMapper from "../reactHookFormFields/DynamicFieldsMapper";
import { getNewConfigdata } from "@/services/user.service";
// import OtpVerify from "../otpVerify/otpVerify.component";
// import SocialLogin from "../social-login/socialLogin.component";

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

const SignUp = () => {
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
  const loopGender = [
    { label: "Male", checked: false, value: "M" },
    { label: "Female", checked: false, value: "F" },
    { label: "Other", checked: false, value: "O" },
  ];
  const [localAppConfig, setLocalAppConfig] = useState(appConfig?.signup);
  const [otpData, setOtpData] = useState();
  const [isApiResponse, setIsApiResponse] = useState(false);
  const [selectCountry, setSelectCountry] = useState("");
  const [socialUserDetails, setSocialUserDetails] = useState({});
  const [continueSocial, setContinueSocial] = useState(0);
  const [navtoVerifyOTP, setNavtoVerifyOTP] = useState(false);
  const [userRes, setUserRes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {
    mutate: mutateSignup,
    data: apiResponse,
    isLoading,
  } = usePostApiMutate();

  const { mutate: mutateSignupEnc, data: EncApiResponse } = usePostApiMutate();
  const router = useRouter();

  // react-hook-form states
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    trigger,
    watch,
    control,
  } = useForm({ mode: "onChange", shouldFocusError: false });
  const [visibility, setVisibility] = useState({
    password: false,
    confPassword: false,
  });
  const [signUpPayload, setSignUpData] = useState({});

  useEffect(() => {
    if (SystemFeature) {
      if (!!SystemFeature.userfields && !!SystemFeature.userfields.fields) {
        localAppConfig.dob = SystemFeature.userfields.fields.age
          ? SystemFeature.userfields.fields.age
          : localAppConfig.dob;
        localAppConfig.gender = SystemFeature.userfields.fields.gender
          ? SystemFeature.userfields.fields.gender
          : localAppConfig.gender;
      }
      if (
        !!SystemFeature.globalsettings &&
        !!SystemFeature.globalsettings.fields
      ) {
        localAppConfig.email = SystemFeature.globalsettings?.fields
          ?.isEmailSupported
          ? SystemFeature.globalsettings?.fields?.isEmailSupported == "true"
            ? 1
            : 0
          : localAppConfig.email;
        localAppConfig.mobile = SystemFeature.globalsettings?.fields
          ?.isMobileSupported
          ? SystemFeature.globalsettings?.fields?.isMobileSupported == "true"
            ? 1
            : 0
          : localAppConfig.mobile;
        localAppConfig.firstName = SystemFeature.globalsettings?.fields
          ?.showFirstName
          ? SystemFeature.globalsettings?.fields?.showFirstName == "true"
            ? 1
            : 0
          : localAppConfig.firstName;
        localAppConfig.lastName = SystemFeature.globalsettings?.fields
          ?.showLastName
          ? SystemFeature.globalsettings?.fields?.showLastName == "true"
            ? 1
            : 0
          : localAppConfig.lastName;
        localAppConfig.firstNameCharLimit = SystemFeature.globalsettings?.fields
          ?.firstNameCharLimit
          ? SystemFeature.globalsettings?.fields?.firstNameCharLimit
          : localAppConfig.firstNameCharLimit;
        localAppConfig.lastNameCharLimit = SystemFeature.globalsettings?.fields
          ?.lastNameCharLimit
          ? SystemFeature.globalsettings?.fields?.lastNameCharLimit
          : localAppConfig.lastNameCharLimit;
      }
      setLocalAppConfig({ ...localAppConfig });
    }
  }, [SystemFeature]);

  useEffect(() => {
    if (apiResponse?.data) {
      setResponseData(apiResponse?.data);
    }
  }, [apiResponse]);

  useEffect(() => {
    if (EncApiResponse?.data) {
      const decrypteData = JSON.parse(decryptData(EncApiResponse?.data?.data));
      setResponseData(decrypteData);
    }
  }, [EncApiResponse]);

  const setResponseData = (res) => {
    if (res?.status) {
      let fd = {};
      setUserRes(res?.response);
      if (res?.response.actionCode === 1) {
        // user not register until OTP verification for mobile
        fd = {
          from: "signup",
          verification: "mobile",
          context: "signup",
          data: {
            title1: `${Forgotpassword[localLang].Otp_sent_to_your_mobile} ******${signUpPayload.mobile.slice(signUpPayload.mobile.length - 4)}`,
            mobile: `${selectCountry.isdCode}-${signUpPayload.mobile}`,
            email: signUpPayload.email,
            referenceKey: res?.response?.details?.referenceKey,
          },
        };
        setOtpData(fd);
      } else if (res?.response.actionCode === 2) {
        // user is registered, OTP verification for mobile is skipable
        fd = {
          from: "verify_signup",
          verification: "mobile",
          context: "verify_mobile",
          data: {
            title1: `${Forgotpassword[localLang].Otp_sent_to_your_mobile} ******${signUpPayload.mobile.slice(signUpPayload.mobile.length - 4)}`,
            mobile: `${selectCountry.isdCode}-${signUpPayload.mobile}`,
            email: signUpPayload.email,
          },
        };
        setOtpData(fd);
      } else if (res?.response.actionCode === 3) {
        // user will register but OTP is not verified for email
        fd = {
          from: "signup",
          verification: "email",
          context: "signup",
          data: {
            title1: `${Forgotpassword[localLang].Otp_sent_to_your_email} ${signUpPayload.email.slice(0, 5)}******${signUpPayload.email.substring(8)}`,
            mobile: `${selectCountry.isdCode}-${signUpPayload.mobile}`,
            email: signUpPayload.email,
            referenceKey: res?.response?.details?.referenceKey,
          },
        };
        setOtpData(fd);
      } else if (res?.response.actionCode === 4) {
        // user is registered, OTP verification for email is skipable
        fd = {
          from: "verify_signup",
          verification: "email",
          context: "verify_email",
          data: {
            title1: `${Forgotpassword[localLang].Otp_sent_to_your_email} ${signUpPayload.email.slice(0, 5)}******${signUpPayload.email.substring(8)}`,
            mobile: `${selectCountry.isdCode}-${signUpPayload.mobile}`,
            email: signUpPayload.email,
          },
        };
        setOtpData(fd);
      } else if (res?.response.actionCode === 17) {
        // to handle token already registered to some other user
      } else {
        setUserLogin(res?.response);
      }
    } else if (res?.error && res?.error?.code === 401) {
      unAuthorisedHandler();
    } else if (res?.error && parseInt(res?.error?.code) == -17) {
      handleTokenError();
    } else if (parseInt(res?.error?.code) == -1000) {
      setContinueSocial(1);
    } else {
      setErrorMessage(res?.error?.message);
      clearingErrorMessage();
    }
  };

  useEffect(() => {
    if (!!userDetails && !isApiResponse) {
      dispatch({
        type: actions.NotificationBar,
        payload: { message: "User already LoggedIn" },
      });
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  }, [userDetails, isApiResponse]);

  const onSubmit = (data) => {
    setSignUpData(data);
    const apiPayload = {
      additional_params: {},
      app_version: "",
      cookie: "",
      manufacturer: "123",
      os_version: "",
      referral_id: "",
      referral_type: "",
      first_name: data.firstName || "",
      last_name: data.lastName || "",
      email: data.email || "",
      mobile: data.mobile ? `${selectCountry.isdCode}-${data.mobile}` : "",
      password: data.password,
    };
    if (data.dateOfBirth) {
      apiPayload.additional_params.dob = `${data.dateOfBirth}`;
    }
    if (data.gender) {
      apiPayload.additional_params.gender = `${data.gender}`;
    }
    apiPayload.additional_params =
      SystemFeature?.encryptApisList?.fields?.signup === "true"
        ? JSON.stringify(apiPayload.additional_params)
        : apiPayload.additional_params;
    if (SystemFeature?.encryptApisList?.fields?.signup === "true") {
      apiPayload.is_header_enrichment = "false";
      const encryptObj = {
        data: encryptData(JSON.stringify(apiPayload)),
        metadata: encryptData(JSON.stringify({ request: "signup/validate" })),
      };
      hitapiSigupEnc(encryptObj);
    } else {
      apiPayload.is_header_enrichment = false;
      const url = `${process.env.initJson.api}/service/api/auth/signup/validate`;
      mutateSignup({ url, apiData: apiPayload });
    }
  };

  const hitapiSigupEnc = (apiData) => {
    const url = `${process.env.initJson.api}/service/api/v1/send`;
    mutateSignupEnc({ url, apiData });
  };

  const setUserLogin = (userResponse) => {
    const userDetails = userResponse?.userDetails || userResponse;
    setIsApiResponse(true);
    setItemEnc("uDetails", userDetails);
    setItem("isloggedin", true);
    const cUserData = getNookie("user-info") || {};
    const newUserData = { ...cUserData, isLoggedIn: true };
    setNookie("user-info", newUserData);
    dispatch({ type: actions.userDetails, payload: userDetails });
    // clevertap session initiation
    setUserSession(userDetails);
    sendEvent("first_time_register", {
      mobile_number: userDetails?.phoneNumber,
      name: userDetails?.name,
    });
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

  const clearingErrorMessage = () => {
    const init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 5000);
  };

  const validateFirstName = (value) => {
    const result = validateN(value, appConfig.namePattern, "First Name",localLang);
    return result.valid || result.error;
  };

  const validateLastName = (value) => {
    const result = validateN(value, appConfig.namePattern, "last Name",localLang);
    return result.valid || result.error;
  };

  const validateEmail = (value) => {
    const result = validateE(value, appConfig?.authEmailPattern,"",localLang);
    return result.valid || result.error;
  };

  const validateMobile = (value) => {
    const result = validateM(
      value,
      SystemConfig.configs.validMobileRegex || appConfig?.authMobilePattern , localLang
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

  const validateConfirmPassword = (value) => {
    const passoword = watch("password");
    const result = validateCP(value, passoword, localLang);
    return result.valid || result.error;
  };

  const callbacksuccess = (data) => {
    setUserLogin(data?.userDetails);
  };

  const socialLoginCallBck = (apiData) => {
    setSocialUserDetails(apiData);
    if (SystemFeature?.encryptApisList?.fields?.signin === "true") {
      const encryptObj = {
        data: encryptData(JSON.stringify(apiData)),
        metadata: encryptData(JSON.stringify({ request: "signin" })),
      };
      hitapiSigupEnc(encryptObj);
    } else {
      const url = `${process.env.initJson.api}/service/api/auth/v1/signin`;
      mutateSignup({ url, apiData });
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
      setUserLogin(userRes?.userDetails);
    }
    setOtpData();
  };

  const handleGuestLogin = () => {
    if (navigateFrom) {
      dispatch({ type: actions.navigateFrom, payload: null });
      router.push(navigateFrom);
    } else {
      router.push("/");
    }
  };

  const toggleVisibility = (key) => {
    setVisibility((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };
  const validateDateOfBirth = (date) => {
    const result = validateDOB(date);
    return result.valid || result.error;
  };

  /* Defines a `fieldsConfig` array for form fields including properties like key, label, name, 
   validation function, props, isDisplay, and component. It configures the behavior and appearance 
   of fields like first name, last name, email, mobile number, password, confirm password, 
   date of birth, and gender dynamically based on application settings. */
  const fieldsConfig = [
    {
      key: "firstName",
      label: signupconstant?.[localLang]?.First_Name,
      name: "firstName",
      validateFunction: validateFirstName,
      props: { inputProps: { maxLength: localAppConfig.firstNameCharLimit } },
      isDisplay: !!localAppConfig.firstName,
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "lastName",
      label: signupconstant?.[localLang]?.Last_Name,
      name: "lastName",
      validateFunction: validateLastName,
      props: { inputProps: { maxLength: localAppConfig.lastNameCharLimit } },
      isDisplay: !!localAppConfig.lastName,
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "email",
      label: signupconstant?.[localLang]?.Email_Id,
      name: "email",
      validateFunction: validateEmail,
      isDisplay: !!localAppConfig.email,
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "mobile",
      label: signupconstant?.[localLang]?.Mobile_Number,
      name: "mobile",
      validateFunction: validateMobile,
      type: "number",
      customStyle: `inputfield ${styles.mobileNumber} ${styles.has_country_code}`,
      onKeyDown: (e) => {
        if ([38, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
      },
      onWheel: (e) => e.target.blur(),
      isDisplay: !!localAppConfig.mobile,
      component: "mobile_Number_field",
      props: {
        setSelectCountry,
      },
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "password",
      label: signupconstant?.[localLang]?.Password,
      name: "password",
      validateFunction: validatePassword,
      props: {
        inputProps: { maxLength: appConfig.authMaxLength },
        toggleVisibility,
        visibility: visibility.password,
      },
      component: "password_field",
      isDisplay: true,
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "confirmPassword",
      label: signupconstant?.[localLang]?.Confirm_Password,
      name: "confPassword",
      validateFunction: validateConfirmPassword,
      props: {
        inputProps: { maxLength: appConfig.authMaxLength },
        toggleVisibility,
        visibility: visibility.confPassword,
      },
      component: "password_field",
      isDisplay: !!localAppConfig.confirm,
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      name: "dateOfBirth",
      validateFunction: validateDateOfBirth,
      component: "date_picker",
      props: {
        control,
        styles,
        fromStyle,
      },
      isDisplay: localAppConfig.dob !== "0",
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "gender",
      label: signupconstant[localLang].Gender,
      name: "gender",
      validateFunction: () => ({}),
      component: "radio_field",
      props: {
        control,
        options: loopGender,
        errors,
      },
      isDisplay: localAppConfig.gender !== "0",
      register,
      trigger,
      clearErrors,
      errors,
    },
  ];

  return (
    <div className={` ${styles.signin_cont_page}`}>
      <Link href="/" aria-label="app logo" prefetch={false}>
        <img
          className={` ${styles.tablet_logo}`}
          src={appConfig?.appLogo}
          alt="app-logo"
        />
      </Link>
      {appConfig?.signup?.helpInMobile && (
        <Link className="helpText" href="/support/contact-us" prefetch={false}>
          {signupconstant?.[localLang]?.Help}
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
              <h1>{signupconstant[localLang].Create_Your_Account}</h1>
              <form onSubmit={handleSubmit(onSubmit)}>
                {fieldsConfig.map((field) => (
                  <DynamicFieldsMapper field={field} />
                ))}
                <div className={`${styles.text_danger1}`}>
                  <span>{errorMessage}</span>
                </div>
                <button
                  className={` ${styles.button} primary`}
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <Loader type="button" />
                  ) : (
                    signupconstant[localLang].Sign_Up
                  )}
                </button>
                {appConfig.signup?.guestLogin && (
                  <button
                    type="button"
                    className={`${styles.button} ${styles.guest}`}
                    onClick={handleGuestLogin}
                  >
                    {signupconstant[localLang]?.Continue_as_Guest}
                  </button>
                )}
                <SocialLogin socialLoginCallBck={socialLoginCallBck} />
              </form>
              <div className={` ${styles.signin_footer}`}>
                <p className={` ${styles.sm_label}`}>
                  {
                    signupconstant[localLang]
                      .By_Signing_up_you_agree_to_brand_name
                  }
                  <Link href="/support/terms" target="_blank" prefetch={false}>
                    {signupconstant[localLang].Terms_and_Conditions}
                  </Link>
                </p>

                <p className={` ${styles.md_label}`}>
                  {signupconstant[localLang].Have_an_account}
                  <Link href="signin" prefetch={false}>{signupconstant[localLang].Sign_In}</Link>
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

export default SignUp;
