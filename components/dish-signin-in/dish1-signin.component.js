import usePostApiMutate from "@/hooks/usePostApidata";
import { useEffect, useRef, useState } from "react";
import { actions, useStore } from "@/store/store";
import { decryptData, encryptData } from "@/services/utility.service";
import {
  deleteItem,
  getItem,
  getNookie,
  setItem,
  setItemEnc,
  setNookie,
} from "@/services/local-storage.service";
// import { navigateFrom } from "@/store/actions";
import { useRouter } from "next/router";
import Link from "next/link";
import { signinconstant } from "@/.i18n/locale";
import {
  AnalyticsnotificationSetup,
  sendEvent,
  setUserSession,
} from "@/services/analytics.service";
import Loader from "../loader/loader.component";
import { CountryDropdown } from "../country-dropdown/country-dropdown.component";
import styles from "./dish1_signin.module.scss";
import { appConfig } from "@/config/app.config";
import { getNewConfigdata } from "@/services/user.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import PinInput from "react-pin-input";
import { ImageConfig } from "@/config/ImageConfig";

function DishSignIn1() {
  const { mutate: mutateSignin, data: apiResponse } = usePostApiMutate();
  const { mutate: mutateSigninEnc, data: EncApiResponse } = usePostApiMutate();
  const {
    mutate: mutateGetactivePackages,
    data: dataGetactivePackagesListResponse,
  } = useGetApiMutate();
  const [selectCountry, setSelectCountry] = useState("");
  const [isChecked, setIsChecked] = useState(true); // Promotions checkbox
  const [otpData, setOtpData] = useState(null);
  const [apiDataResponse, setApiDataResponse] = useState();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [redirection, setRedirection] = useState(false);
  const [isVerifyButtonDisabled, setIsVerifyButtonDisabled] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isOtpscreen, setisOtpscreen] = useState(false);
  const [signinLoading, setsigninLoading] = useState(false);
  const [Mobilenumber, setMobilenumber] = useState("");
  const [shouldFocus, setShouldFocus] = useState(false);
  const [storedReferenceId, setStoredReferenceId] = useState(null);
  const [otpTimer, setOtpTimer] = useState(30);
  const intervalRef = useRef(null);

  const [mobileErrorMessage, setMobileErrorMessage] = useState({
    status: false,
    ErrorMessage: "",
  });
  const [otpErrorMessage, setOtpErrorMessage] = useState({
    status: false,
    ErrorMessage: "",
  });

  const [paymentInfo, setPaymentInfo] = useState();
  const [isOtpFieldDisabled, setIsOtpFieldDisabled] = useState(true);
  const [isTermsChecked, setIsTermsChecked] = useState(true);
  const [enteredMobile, setEnteredMobile] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [firstregistration, setfirstregistrationevent] = useState(false);

  const router = useRouter();
  const profileExpiryTime = getItem("profile-expiry-time");
  const [isMobileScreen, setIsMobileScreen] = useState(null);
  const [isValidOtp, setIsValidOtp] = useState(false);
  const [currentActiveScreen, setCurrentActiveScreen] = useState(null);
  const [isMobileResolution, setIsMobileResolution] = useState(false);
  const [referenceKey, setReferenceKey] = useState(null);

  const {
    state: {
      SystemFeature,
      SystemConfig,
      SystemLanguages,
      localLang,
      Location,
      navigateFrom,
    },
    dispatch,
  } = useStore();
  const mobileRef = useRef();
  const otpRef = useRef();
  const signinPageInfo = SystemLanguages?.[localLang]?.signinPageInfo
    ? JSON.parse(SystemLanguages?.[localLang]?.signinPageInfo)
    : JSON.parse(SystemConfig?.configs?.signinPageInfo || "{}");
  const [subheading, setsubHeading] = useState(signinPageInfo.subtitile || "");
  const getOtp = () => {
    // event.preventDefault();
    const isMobileValid = validateMobile();
    if (!isMobileValid) {
      setMobileErrorMessage({
        status: true,
        ErrorMessage: signinconstant[localLang]?.Mobile_Number_is_required,
      });
      return;
    }
    handleContinue();
    // setisOtpscreen(true);
    // setTimeLeft(30);
    console.log(navigateFrom);
    setIsTimerStarted(true);
    const facebookAnalyticsData = {
      eventType: "trackCustom",
      fbPixelId: process.env.fbPixelId,
      analyticsService: "facebook",
    };
    sendEvent("signin_initiated", {
      mobile_number: `${selectCountry.isdCode}-${mobileRef.current.value}`,
    });
    setLoader(true);
    let apiData = {
      mobile: selectCountry.isdCode + enteredMobile,
      context: "login",
    };
    if (SystemFeature?.encryptApisList?.fields?.getOtp === "true") {
      let encryptObj = {
        data: encryptData(JSON.stringify(apiData)),
        metadata: encryptData(JSON.stringify({ request: "get/otp" })),
      };
      mutateSigninEnc({
        url: process.env.initJson.api + "/service/api/v1/send",
        apiData: encryptObj,
      });
    } else {
      let url = process.env.initJson.api + "/service/api/auth/get/otp";
      mutateSignin(
        { url, apiData },
        {
          onError: (err) => {
            console.log(err?.message);
            dispatch({
              type: actions.NotificationBar,
              payload: {
                message:
                  err?.response?.data?.message ||
                  err?.message ||
                  "Something went wrong, Please try later",
              },
            });
            setLoader(false);
          },
        }
      );
    }
  };

  useEffect(() => {
    if (router.query.pd) return;
    const signinPageInfo = SystemLanguages?.[localLang]?.signinPageInfo
      ? JSON.parse(SystemLanguages?.[localLang]?.signinPageInfo)
      : JSON.parse(SystemConfig?.configs?.signinPageInfo || "{}");
    setsubHeading(signinPageInfo.subtitile || "");
  }, [localLang, SystemLanguages]);

  useEffect(() => {
    if (apiResponse?.data) {
      apiDataUtil(apiResponse?.data);
    }
    // setsigninLoading(false);
  }, [apiResponse]);

  useEffect(() => {
    if (EncApiResponse?.data?.data) {
      handleContinue();
      setisOtpscreen(true);
      let decrypteData = JSON.parse(decryptData(EncApiResponse?.data?.data));
      apiDataUtil(decrypteData);
    } else if (EncApiResponse?.data?.status) {
      if (EncApiResponse?.data?.response?.userDetails) {
        handleContinue();
        setisOtpscreen(true);
        apiDataUtil(EncApiResponse?.data?.response?.userDetails);
      }
    } else {
      setLoader(false);
    }
    setsigninLoading(false);
  }, [EncApiResponse]);

  useEffect(() => {
    let pdParam = router.query.pd;
    if (pdParam) {
      let decodedpdParam = atob(decodeURIComponent(pdParam))?.split("&&&");
      if (decodedpdParam) {
        let piInfo = decodedpdParam[1]?.split("===");
        let subheading = decodedpdParam[0]?.split("===")[1];
        if (piInfo) {
          let encodedpi = piInfo[1];
          if (encodedpi) {
            // setRedirection(true);
            if (isOtpscreen) {
              setRedirection(true);
            }

            // let decodedpi = atob(decodeURIComponent(encodedpi))
            setPaymentInfo(encodedpi);

            // If logged in, redirect user to plans page
            const isUserLoggedIn = getNookie("user-info")?.isLoggedIn;
            isUserLoggedIn && redirectToPlansList(encodedpi);
          }
          if (subheading) {
            setsubHeading(subheading);
          }
        }
      }
    }
  }, [router.query.pd, isOtpscreen]);

  const redirectToPlansList = (plansInfo) => {
    const url = `/plans/list?pi=${encodeURIComponent(btoa(plansInfo))}`;
    router.push(url);
  };
  useEffect(() => {
    console.log(otpErrorMessage);
  }, [otpErrorMessage]);

  const apiDataUtil = async (apiResponse) => {
    if (apiResponse?.status) {
      handleContinue();
      setisOtpscreen(true);
      if (apiResponse?.response?.attributes?.display_lang_code) {
        setNookie(
          "userLanguage",
          apiResponse?.response?.attributes?.display_lang_code.toLowerCase()
        );
        setItem(
          "userLanguage",
          apiResponse?.response?.attributes?.display_lang_code.toLowerCase()
        );
        dispatch({
          type: actions.LocalLang,
          payload:
            apiResponse?.response?.attributes?.display_lang_code.toLowerCase(),
        });
        let _SC = await getNewConfigdata();
        if (_SC) dispatch({ type: actions.SystemConfig, payload: _SC });
      }
      setIsOtpFieldDisabled(false);
      setTimeout(() => {
        otpRef.current?.focus();
      }, 1000);
      setApiDataResponse(apiResponse);
      const newReferenceId =
        apiResponse?.response?.referenceId ||
        apiResponse?.response?.details?.otpReferenceId ||
        null;
      setStoredReferenceId(newReferenceId);
      setTimeLeft(30);
      setIsTimerStarted(true);
      setIsVerifyButtonDisabled(true);
      setLoader(false);
      setOtpErrorMessage({ status: false, ErrorMessage: "" });
      if (!!apiResponse?.response?.details?.referenceKey) {
        setReferenceKey(apiResponse?.response?.details?.referenceKey);
      }
      if (redirection) {
        const url = paymentInfo
          ? `/plans/list?pi=${encodeURIComponent(btoa(paymentInfo))}`
          : otpData?.context === "login"
            ? "/profiles/select-user-profile"
            : "/languages";
        if (otpData?.context === "login") {
          setUserLogin(
            apiResponse?.response?.actionCode === 1
              ? apiResponse?.response.userDetails
              : apiResponse?.response,
            url
          );
        } else {
          setUserLogin(
            apiResponse?.response?.actionCode === 1
              ? apiResponse?.response.userDetails
              : apiResponse?.response,
            url,
            "signupcase"
          );
        }
      }
      setsigninLoading(false);
    } else if (apiResponse?.error?.code === -4) {
      setOtpData({ context: "signup" });
      setTimeLeft(30);
      setIsTimerStarted(true);
      setLoader(true);
      setRedirection(false);
      setApiDataResponse(apiResponse);
      signUp();
      setsigninLoading(false);
    } else if (apiResponse?.error?.code === -41) {
      setOtpData({ context: "signup" });
      setRedirection(false);
      setOtpErrorMessage({
        status: true,
        ErrorMessage: apiResponse?.error?.message,
      });
      setsigninLoading(false);
    } else {
      setOtpData(null);
      setIsVerifyButtonDisabled(false);
      setTimeLeft(0);
      setIsTimerStarted(false);
      setRedirection(false);
      setLoader(false);
      if (!isOtpscreen) {
        setMobileErrorMessage({
          status: true,
          ErrorMessage: apiResponse?.error?.message,
        });
      } else {
        setOtpErrorMessage({
          status: true,
          ErrorMessage: apiResponse?.error?.message,
        });
      }
      setsigninLoading(false);
    }
  };
  const setUserLogin = (userResponse, url, signupcase = "") => {
    setItemEnc("uDetails", userResponse);
    setItem("isloggedin", true);
    deleteItem("player-audio-lang");
    //clevertap session initiation
    getActivePackages();
    setUserSession(userResponse);
    // setTimeLeft(0);
    setIsTimerStarted(false);
    setIsValidOtp(false);
    setEnteredOtp("");
    let ar_status =
      userResponse?.packages &&
        userResponse?.packages?.[0]?.recurrenceStatus == "A"
        ? "true"
        : "false";
    let subscription_status = userResponse?.packages?.length ? "true" : "false";
    const facebookAnalyticsData = {
      eventType: "trackCustom",
      fbPixelId: process.env.fbPixelId,
      analyticsService: "facebook",
    };
    if (firstregistration) {
      otpData?.context === "signup" &&
        sendEvent("first_time_register", {
          mobile_number: `${selectCountry.isdCode}-${enteredMobile}`,
        });
      setfirstregistrationevent(false);
    } else {
      sendEvent("signin_completed", {
        ar_status,
        subscription_status,
        mobile_number: `${selectCountry.isdCode}-${enteredMobile}`,
      });
    }

    getNewConfigdata();
    AnalyticsnotificationSetup();
    const cUserData = getNookie("user-info") || {};
    let newUserData = { ...cUserData, isLoggedIn: true };
    if (!!signupcase) {
      // window.sessionStorage.setItem("isSignup", true);
      newUserData = { ...newUserData, isSignup: true };
    }
    setNookie("user-info", newUserData);
    dispatch({ type: actions.userDetails, payload: userResponse });
    dispatch({
      type: actions.NotificationBar,
      payload: {
        message: "Logged in successfully",
        icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/login_success_icon.svg",
      },
    });
    if (paymentInfo) {
      router.push(url);
    } else if (
      !!SystemFeature &&
      !!SystemFeature?.userprofiles &&
      SystemFeature?.userprofiles?.fields?.is_userprofiles_supported ==
      "true" &&
      !navigateFrom?.includes("activate/device") &&
      !profileExpiryTime
    ) {
      router.push(url);
    } else if (url.includes("/languages")) {
      console.log(navigateFrom);
      router.push(url);
    } else if (!!navigateFrom && navigateFrom !== "navigateFrom") {
      dispatch({ type: actions.navigateFrom, payload: null });
      router.push(navigateFrom);
    } else {
      router.push("/");
    }
  };
  const signUp = () => {
    let isOptedForPromotions = {
      isOptedForPromotions: JSON.stringify(isChecked),
    };
    let apiData = {
      mobile: selectCountry.isdCode + enteredMobile,
      password: "123456",
      additional_params:
        SystemFeature?.encryptApisList?.fields?.signup === "true"
          ? JSON.stringify(isOptedForPromotions)
          : isOptedForPromotions,
    };

    if (SystemFeature?.encryptApisList?.fields?.signup === "true") {
      let encryptObj = {
        data: encryptData(JSON.stringify(apiData)),
        metadata: encryptData(JSON.stringify({ request: "signup/validate" })),
      };
      mutateSigninEnc({
        url: process.env.initJson.api + "/service/api/v1/send",
        apiData: encryptObj,
      });
    } else {
      let url = process.env.initJson.api + "/service/api/auth/signup/validate";
      mutateSignin({ url, apiData });
    }
  };

  const validateMobile = () => {
    let isMobileValid = true;
    if (enteredMobile?.trim() === "") {
      isMobileValid = false;
    }

    return isMobileValid;
  };

  const validateOtp = () => {
    let isOtpValid = true;
    if (enteredOtp?.trim() === "") {
      isOtpValid = false;
    }
    return isOtpValid;
  };

  // Form submit handler
  const verifyOtp = (event) => {
    event.preventDefault();
    if (signinLoading) {
      return;
    }
    const isMobileValid = validateMobile();
    const isOtpValid = validateOtp();
    if (
      isMobileValid === false ||
      isOtpValid === false ||
      enteredOtp.length < 4 ||
      enteredOtp.length > 4 ||
      !isTermsChecked
    ) {
      if (isMobileValid === false) {
        setMobileErrorMessage({
          status: true,
          ErrorMessage:
            signinconstant?.[localLang]?.Mobile_Number_is_required ||
            "Mobile Number is required",
        });
      }
      if (isOtpValid === false) {
        // setOtpErrorMessage({
        //   status: true,
        //   ErrorMessage:
        //     signinconstant?.[localLang]?.OTP_is_required || "OTP is required",
        // });
      }
      return;
    }

    let isOptedForPromotions = {
      isOptedForPromotions: JSON.stringify(isChecked),
    };
    setRedirection(true);
    let apiData = {
      login_id: selectCountry.isdCode + enteredMobile,
      manufacturer: "123",
      additional_params:
        SystemFeature?.encryptApisList?.fields?.signin === "true"
          ? JSON.stringify(isOptedForPromotions)
          : isOptedForPromotions,
    };
    if (otpData?.context != "signup") {
      setOtpData({ context: "login" });
      apiData.login_key = enteredOtp;
      if (SystemFeature?.encryptApisList?.fields?.signin === "true") {
        apiData.login_mode = `2`;
        let encryptObj = {
          data: encryptData(JSON.stringify(apiData)),
          metadata: encryptData(JSON.stringify({ request: "signin" })),
        };
        mutateSigninEnc({
          url: process.env.initJson.api + "/service/api/v1/send",
          apiData: encryptObj,
        });
        setsigninLoading(true);
      } else {
        apiData.login_mode = 2;
        let url = process.env.initJson.api + "/service/api/auth/v1/signin";
        mutateSignin(
          { url, apiData },
          {
            onError: (err) => {
              setsigninLoading(false);
              dispatch({
                type: actions.NotificationBar,
                payload: {
                  message:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Something went wrong, Please try later",
                },
              });
            },
          }
        );
        setsigninLoading(true);
      }
    } else {
      signUpComplete();
    }
  };

  const signUpComplete = () => {
    if (apiDataResponse) {
      let apiData = {
        reference_key:
          referenceKey || apiDataResponse?.response?.details?.referenceKey,
        otp: Number(otpRef.current.values.join("")),
      };
      setsigninLoading(true);
      if (SystemFeature?.encryptApisList?.fields?.signup === "true") {
        let encryptObj = {
          data: encryptData(JSON.stringify(apiData)),
          metadata: encryptData(JSON.stringify({ request: "signup/complete" })),
        };
        mutateSigninEnc({
          url: process.env.initJson.api + "/service/api/v1/send",
          apiData: encryptObj,
        });
        setfirstregistrationevent(true);
      } else {
        let url =
          process.env.initJson.api + "/service/api/auth/signup/complete";
        mutateSignin({ url, apiData });
        setfirstregistrationevent(true);
      }
    }
  };

  const handleContinue = () => {
    const enteredNumber = mobileRef.current?.value;
    setMobilenumber(enteredNumber);
  };

  const resendOtp = () => {
    // if (otpRef?.current) {
    //   otpRef?.current?.clear();
    // }
    // if (signinLoading) return;
    sendEvent("signin_resent_otp", {
      mobile_number: `${selectCountry.isdCode}-${enteredMobile}`,
    });
    // setLoader(true);
    // setOtpErrorMessage({ status: false, ErrorMessage: "" });
    // // setTimeLeft(30);
    // setIsTimerStarted(true);
    // setIsVerifyButtonDisabled(true);
    if (SystemFeature?.encryptApisList?.fields?.resendOtp === "true") {
      let apiData = {
        reference_id: JSON.stringify(
          storedReferenceId ||
          apiDataResponse?.response?.referenceId ||
          apiDataResponse?.response?.details?.otpReferenceId ||
          ""
        ),
      };
      let encryptObj = {
        data: encryptData(JSON.stringify(apiData)),
        metadata: encryptData(JSON.stringify({ request: "resend/otp" })),
      };
      mutateSigninEnc({
        url: process.env.initJson.api + "/service/api/v1/send",
        apiData: encryptObj,
      });
    } else {
      let apiData = {
        reference_id: Number(
          storedReferenceId ||
          apiDataResponse?.response?.referenceId ||
          apiDataResponse?.response?.details?.otpReferenceId ||
          0
        ),
      };
      let url = process.env.initJson.api + "/service/api/auth/resend/otp";
      mutateSignin({ url, apiData });
    }
    setIsVerifyButtonDisabled(true);
  };

  // useEffect(() => {
  //   let timer;
  //   if (timeLeft > 0) {
  //     timer = setInterval(() => {
  //       setTimeLeft((prevTime) => prevTime - 1);
  //     }, 1000);
  //   } else if (
  //     timeLeft === 0 &&
  //     isTimerStarted &&
  //     !isValidOtp &&
  //     apiResponse?.data?.error?.code !== -3 &&
  //     apiResponse?.error?.code !== -3 &&
  //     apiResponse?.error?.code !== -41 &&
  //     apiResponse?.data?.error?.code !== -41
  //   ) {
  //     setOtpErrorMessage({
  //       status: true,
  //       ErrorMessage:
  //         signinconstant?.[localLang]?.OTP_is_required || "OTP is required",
  //     });
  //     setIsVerifyButtonDisabled(false);
  //   }
  //   return () => clearInterval(timer);
  // }, [timeLeft, isTimerStarted, isValidOtp, localLang, signinconstant]);

  useEffect(() => {
    let timer;
    if (isOtpscreen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            if (
              !isValidOtp &&
              apiResponse?.data?.error?.code !== -3 &&
              apiResponse?.error?.code !== -3 &&
              apiResponse?.error?.code !== -41 &&
              apiResponse?.data?.error?.code !== -41
            ) {
              // setOtpErrorMessage({
              //   status: true,
              //   ErrorMessage:
              //     signinconstant?.[localLang]?.OTP_is_required ||
              //     "OTP is required",
              // });
            }
            setIsVerifyButtonDisabled(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpscreen, timeLeft, isValidOtp, localLang, signinconstant]);

  const onMobileChange = (event) => {
    if (
      !/^\d+$/.test(event.target.value) &&
      event.nativeEvent.inputType !== "deleteContentBackward"
    )
      return;
    setEnteredMobile(event.target.value);
    setIsVerifyButtonDisabled(false);
    setTimeLeft(-1);
    setMobileErrorMessage({ status: false, ErrorMessage: "" });
  };

  const onOtpChange = (value) => {
    setEnteredOtp(value);
    setIsValidOtp(value.length === 4 && /^\d+$/.test(value));
    if (value.trim() === "") {
      // setOtpErrorMessage({
      //   status: true,
      //   ErrorMessage:
      //     signinconstant?.[localLang]?.OTP_is_required || "OTP is required",
      // });
    } else if (value.length < 4) {
      // setOtpErrorMessage({
      //   status: true,
      //   ErrorMessage:
      //     signinconstant?.[localLang]?.Minimum_digits_required ||
      //     "Minimum 4 digits required",
      // });
    } else if (value.length > 4) {
      setOtpErrorMessage({
        status: true,
        ErrorMessage:
          signinconstant?.[localLang]?.Maximum_digits_required ||
          "Maximum 4 digits required",
      });
    } else {
      setOtpErrorMessage({ status: false, ErrorMessage: "" });
    }
  };
  const handleMobileKeyDown = (event) => {
    if (event.key === "Enter") {
      // Prevent default behavior of Enter key
      event.preventDefault();

      // Trigger Verify button click
      getOtp();
    }
  };
  const getActivePackages = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/user/activepackages";
    try {
      mutateGetactivePackages(url);
    } catch (e) {}
  };
  useEffect(() => {
    if (
      dataGetactivePackagesListResponse &&
      dataGetactivePackagesListResponse.data
    ) {
      if (
        dataGetactivePackagesListResponse?.data?.status &&
        !!dataGetactivePackagesListResponse?.data?.response?.length
      ) {
        setItem("activePackagesList", {
          expiry: new Date().getTime() + 2 * 60 * 60 * 1000,
          data: dataGetactivePackagesListResponse?.data?.response,
        });
        dispatch({
          type: actions.ActivePackages,
          payload: dataGetactivePackagesListResponse.data.response,
        });
      }
    }
  }, [dataGetactivePackagesListResponse]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const setMobileResolution = () => {
        if (window.innerWidth >= 768) {
          setIsMobileResolution(false);
        } else {
          setIsMobileResolution(true);
        }
      };
      setMobileResolution();

      window.addEventListener("resize", setMobileResolution);
      return () => window.removeEventListener("resize", setMobileResolution);
    }
  }, []);
  useEffect(() => {
    if (shouldFocus && !isOtpscreen && mobileRef.current) {
      mobileRef.current.focus();
      setShouldFocus(false);
    }
  }, [isOtpscreen, shouldFocus]);

  const startOtpCountdown = () => {
    clearInterval(intervalRef.current);
    setOtpTimer(30);

    intervalRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isOtpscreen) {
      startOtpCountdown();
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isOtpscreen]);

  const resendOtpBtn = () => {
    if (otpRef?.current) {
      otpRef?.current.clear();
    }
    if (isOtpscreen && otpTimer == 0) {
      startOtpCountdown();
      setIsValidOtp(false);
      resendOtp();
    }
  };

  const numberEdit = () => {
    setTimeLeft(0);
    setisOtpscreen(false);
    setShouldFocus(true);
    setIsValidOtp(false);
    setEnteredOtp("");
    setOtpErrorMessage({ status: false, ErrorMessage: "" });
    setMobileErrorMessage({ status: false, ErrorMessage: "" });
  };
  return (
    <>
      {isMobileResolution ? (
        <MobileScreen
          setSelectCountry={setSelectCountry}
          selectCountry={selectCountry}
          signinconstant={signinconstant}
          localLang={localLang}
          mobileRef={mobileRef}
          handleMobileKeyDown={handleMobileKeyDown}
          enteredMobile={enteredMobile}
          loader={loader}
          signinPageInfo={signinPageInfo}
          onMobileChange={onMobileChange}
          mobileErrorMessage={mobileErrorMessage}
          getOtp={getOtp}
          onOtpChange={onOtpChange}
          verifyOtp={verifyOtp}
          otpRef={otpRef}
          setCurrentActiveScreen={setCurrentActiveScreen}
          setEnteredOtp={setEnteredOtp}
          otpErrorMessage={otpErrorMessage}
          setOtpErrorMessage={setOtpErrorMessage}
          resendOtp={resendOtp}
          setEnteredMobile={setEnteredMobile}
          router={router}
          currentActiveScreen={currentActiveScreen}
          signinLoading={signinLoading}
          isValidOtp={isValidOtp}
        />
      ) : (
        <div className={` ${styles.signin_cont_page} `}>
          <div className={` ${styles.header} `}>
            <Link href="/" aria-label="app logo">
              <img
                className={` ${styles.logo_with_tag} `}
                src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg"
                alt="Watcho"
              />
            </Link>
          </div>
          <div className={` ${styles.form_container} `}>
            <div className={` ${styles.inner_container} `}>
              <div className={` ${styles.left_section} `}>
                {signinPageInfo?.backgroundImage && (
                  <img
                    alt="img"
                    title="dishtv"
                    src={signinPageInfo.backgroundImage}
                  />
                )}
                <div className={` ${styles.overlay} `}>
                  <p className={styles.overlayText}>
                    Unlimited Movies, TV Show & more
                  </p>
                </div>
              </div>
              <div className={` ${styles.right_section} `}>
                <form
                  onSubmit={verifyOtp}
                  className={isOtpscreen ? ` ${styles.otp_screen} ` : ""}
                >
                  <div className={` ${styles.right_body} `}>
                    {/* <img
                     className={` ${styles.logo_tablet} `}
                     tabIndex="0"
                     src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg"
                     alt="Watcho"
                   /> */}
                    {/* <h1>{signinconstant?.[localLang]?.Welcome_to_Watcho}</h1> */}
                    <h1>
                      {!isOtpscreen
                        ? "Sign In or Register"
                        : "OTP Verification"}
                    </h1>
                    {/*   
                   <img
                     className={` ${styles.logo_mobile} `}
                     src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg"
                     alt="Watcho"
                   /> */}
                    {!isOtpscreen && (
                      <>
                        <h6 className={` ${styles.signinPageInfo} `}>
                          {/* {signinPageInfo?.title} */}
                          Don't be shy. Endless entertainment awaits.
                        </h6>
                        {/* {(Location?.ipInfo?.countryCode === "IN" ||
                     Location?.ipInfo?.countryCode === "US") && (
                    //  <p className={` ${styles.info} `}>{subheading}</p>
                   )} */}
                        <div className={`${styles.number_input}`}>
                          <div
                            className={` ${styles.mobileNumberContainer_web} `}
                          >
                            <div className={` ${styles.CountryDropdown} `}>
                              <CountryDropdown
                                getcountry={selectCountry}
                                changeCountry={(value) =>
                                  setSelectCountry(value)
                                }
                              />
                            </div>
                            <div className={`mbl_nbr ${styles.mbl_nbr} `}>
                              <div
                                className={`mobileNumberField ${styles.mobileNumberField} `}
                              >
                                <input
                                  type="text"
                                  name="mobile"
                                  disabled={loader}
                                  autoFocus=""
                                  //  {signinconstant?.[localLang]?.Enter_Number}
                                  placeholder="Please enter your mobile number"
                                  ref={mobileRef}
                                  onChange={(ev) => {
                                    onMobileChange(ev);
                                  }}
                                  onKeyDown={handleMobileKeyDown}
                                  // minLength="10"
                                  maxLength="10"
                                  value={enteredMobile}
                                />

                                {/* Separate error message for mobile number */}
                              </div>
                            </div>
                          </div>
                          {mobileErrorMessage.status && (
                            <div
                              className={`${styles.errorText} ${styles.errorText_numb}`}
                            >
                              <span className={`${styles.errMsg} `}>
                                <img
                                  src={
                                    appConfig?.staticImagesPath +
                                    "error_msg_icon.svg"
                                  }
                                ></img>{" "}
                                {mobileErrorMessage.ErrorMessage}{" "}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          className={` ${styles.btn_continue} ${styles.enabled} ${validateMobile() ? "" : styles.disable_btn}`}
                          type="button"
                          onClick={() => getOtp()}
                          disabled={validateMobile() ? false : true}
                        >
                          {" "}
                          {loader ? (
                            <div
                              className={` ${styles.btn_loader} ${styles.signIn_loader} signIn_loader`}
                            >
                              {" "}
                              <Loader type="button" />
                            </div>
                          ) : (
                            signinPageInfo?.signinButtonTitle
                          )}
                        </button>
                        <p>
                          {signinconstant?.[localLang]?.years_of_age}{" "}
                          <Link href="/support/terms">
                            {signinconstant?.[localLang]?.Terms_of_Use}
                          </Link>{" "}
                          &{" "}
                          <Link href="/support/privacy-policy">
                            {signinconstant?.[localLang]?.privacy_Policy}
                          </Link>
                        </p>
                      </>
                    )}
                    {isOtpscreen && (
                      <div className={styles.web_otpscreen}>
                        <p className={styles.enter_num}>
                          Enter the 4-digit code sent to:
                          <span className={styles.phone_Number}>
                            {" "}
                            +{selectCountry.isdCode}-{enteredMobile}
                          </span>
                          <span className={styles.editIcon}>
                            <img
                              src={
                                appConfig?.staticImagesPath + "Vector_edit.png"
                              }
                              onClick={(e) => numberEdit(e)}
                            ></img>{" "}
                          </span>
                        </p>

                        <div className={styles.otpInputs}>
                          <PinInput
                            length={4}
                            initialValue=""
                            onChange={(value, index) => {
                              onOtpChange(value);
                            }}
                            onComplete={(value) => {
                              if (value.length == 4) {
                                onOtpChange(value);
                              }
                            }}
                            type="numeric"
                            inputMode="number"
                            style={{
                              padding: "10px",
                              height: "48px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: "7px",
                              marginBottom: "19px",
                            }}
                            inputStyle={{
                              border: "1px solid transparent",
                              background: "#8B8B8B1A",
                              borderRadius: "8px",
                              color: "#FFFFFF",
                              fontSize: "16px",
                              fontWeight: "600",
                              fontStyle: "semi",
                              lineHeight: "120%",
                              letterSpacing: "0%",
                              height: "48px",
                              width: "60px",
                            }}
                            inputFocusStyle={{
                              border: "1px solid #D13066",
                            }}
                            autoSelect={true}
                            regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
                            ref={otpRef}
                          />
                        </div>
                        {/* <div
                          className={`${styles.resend_otp_timer} ${
                            isOtpscreen && !signinLoading
                              ? styles.visible
                              : styles.hidden
                          }`}
                        >
                          <span
                            className={`${styles.resend} ${
                              timeLeft === 0 && !signinLoading
                                ? styles.resendOTPActive
                                : ""
                            }`}
                            onClick={
                              timeLeft === 0 && !signinLoading
                                ? resendOtp
                                : null
                            }
                          >
                            {timeLeft > 0 ? (
                              <span>
                                {signinconstant[localLang].RESEND_OTP} in{" "}
                                <strong>
                                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                </strong>
                              </span>
                            ) : (
                              <span className={styles.resenddefault}>
                                {signinconstant[localLang].RESEND_OTP}
                              </span>
                            )}
                          </span>
                        </div> */}
                        <span
                          className={`${styles.resendOtpBtn} ${otpTimer == 0 && styles.resendOtpBtnBold}`}
                          onClick={resendOtpBtn}
                          disabled={otpTimer != 0}
                        >
                          Resend OTP{" "}
                          {otpTimer > 0 && (
                            <span>
                              in{" "}
                              <span className={styles.otpTimer}>
                                0:{otpTimer.toString().padStart(2, "0")}
                              </span>
                            </span>
                          )}
                        </span>
                        {otpErrorMessage.status && (
                          <div
                            className={`${styles.errorText} ${styles.otpError}`}
                          >
                            <span className={`${styles.errMsg}`}>
                              {otpErrorMessage.ErrorMessage && (
                                <>
                                  <img
                                    src={
                                      appConfig?.staticImagesPath +
                                      "error_msg_icon.svg"
                                    }
                                  ></img>{" "}
                                  {otpErrorMessage.ErrorMessage}
                                </>
                              )}
                            </span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className={`${styles.verifyBtn} ${!isValidOtp ? styles.disable_btn : ""}`}
                          disabled={!isValidOtp}
                        >
                          {signinLoading ? (
                            <div
                              className={` ${styles.btn_loader} ${styles.signIn_loader} signIn_loader`}
                            >
                              <Loader type="button" />
                            </div>
                          ) : (
                            "Verify OTP"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DishSignIn1;

const MobileScreen = (props) => {
  const [isFirstLanding, setIsFirstLanding] = useState(true);
  const [isTypingScreen, setIsTypingScreen] = useState(false);
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [isValidOtp, setIsValidOtp] = useState(false);
  const [isShowSkip, setIsShowSkip] = useState(true);
  const [isShowBackImg, setIsShowBackImg] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const intervalRef = useRef(null);
  const [previousLoginData, setPreviousLoginData] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedCountryDup, setSelectedCountryDup] = useState(null);
  const typingScreen = useRef(null);
  const otpRefDup = useRef(null);
  const debounceTimer = useRef(null);

  const backHandler = () => {
    // console.log("back",props?.currentActiveScreen)
    if (props?.currentActiveScreen == "number-screen") {
      setIsFirstLanding(true);
      setIsOtpScreen(false);
      setIsTypingScreen(false);
      props?.setCurrentActiveScreen("first-land");
      setIsShowBackImg(false);
      setIsShowSkip(true);
    } else if (props?.currentActiveScreen == "otp-screen") {
      setIsOtpScreen(false);
      setIsTypingScreen(true);
      setIsFirstLanding(false);
      props?.setCurrentActiveScreen("number-screen");
      setIsValidOtp(false);
      props?.setEnteredOtp("");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const height = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        if (otpRefDup.current) {
          otpRefDup.current.style.height = `${height}px`;
        }
      }, 500);
    };

    handleResize();

    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      const height = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      if (typingScreen.current) {
        typingScreen.current.style.height = `${height}px`;
      }
    };

    window.document.body.style.paddingBottom = "0px";

    updateHeight(); // Initial set

    window.visualViewport?.addEventListener("resize", updateHeight);
    window.addEventListener("resize", updateHeight);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const handleOtp = (value) => {
    props?.setEnteredOtp(value);
    const isValid = value.length === 4 && /^\d+$/.test(value);
    setIsValidOtp(isValid);
    props?.onOtpChange(value);
  };

  const handleClick = (each) => {
    // console.log(each);
    setSelectedNumber(each.num);
    setSelectedCountryDup(each.selectCountry);
  };

  useEffect(() => {
    let previousLoginData = JSON.parse(getItem("previousLoginJson")) || [];
    if (previousLoginData.length > 0) {
      setPreviousLoginData(previousLoginData);
      setSelectedNumber(previousLoginData[previousLoginData.length - 1].num);
    } else {
      setPreviousLoginData([]);
    }
  }, []);

  const startOtpCountdown = () => {
    clearInterval(intervalRef.current);
    setOtpTimer(30);
    intervalRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (!props?.isValidOtp) {
            // Add check for !props?.isValidOtp
            // props?.setOtpErrorMessage({
            //   status: true,
            //   ErrorMessage:
            //     props?.signinconstant?.[props?.localLang]?.OTP_is_required ||
            //     "OTP is required",
            // });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isOtpScreen && !props?.signinLoading) {
      startOtpCountdown();
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isOtpScreen, props?.signinLoading]);
  const resendOtpBtn = () => {
    if (isOtpScreen && otpTimer === 0 && !props?.signinLoading) {
      startOtpCountdown();
      props?.resendOtp();
    }
  };

  const bottomContainerHandler = (con) => {
    if (previousLoginData.length == 0 || con == "another") {
      setIsFirstLanding(false);
      setIsTypingScreen(true);
      props?.setCurrentActiveScreen("number-screen");
      setIsShowBackImg(true);
      setIsShowSkip(false);
      setSelectedNumber(null);
    } else if (con == "continue") {
      setIsFirstLanding(false);
      setIsTypingScreen(true);
      props?.setCurrentActiveScreen("number-screen");
      setIsShowBackImg(true);
      setIsShowSkip(false);
      setIsValidNumber(true);
      props?.setSelectCountry(selectedCountryDup);
      props?.setEnteredMobile(selectedNumber);
    }
  };
  const mobileNumberValidation = (e) => {
    // console.log(e.target.value);
    // validateM()
    if (e.target.value.length == 10) {
      setIsValidNumber(true);
    } else {
      setIsValidNumber(false);
    }
  };

  return (
    <div className={styles.mobileContainer}>
      <div
        className={`${styles.topNav} ${isShowSkip ? styles.showSkipStyles : styles.nonShowSkipStyles}`}
      >
        <div className={styles.backButton} onClick={() => backHandler()}>
          {isShowBackImg && (
            <img
              src={ImageConfig?.changePassword?.arrowBack}
              alt="back"
              className={styles.backImg}
            />
          )}
        </div>
        {isShowSkip && (
          <div
            className={styles.skipBtnDiv}
            onClick={() => props?.router.push("/")}
          >
            <p className={styles.skipBtn}>Skip</p>
          </div>
        )}
      </div>

      {isFirstLanding && (
        <div className={styles.firstLanding} onClick={bottomContainerHandler}>
          {previousLoginData.length > 0 && (
            <div className={styles.mobileNumberSuggestionPopup}>
              <div className={styles.stroke}></div>
              <h4>Login To Watch</h4>
              <div className={styles.numbersContainer}>
                {previousLoginData.map((each, ind) => {
                  return (
                    <div
                      className={styles.eachNum}
                      key={ind}
                      onClick={() => handleClick(each)}
                    >
                      <img src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/watcho-number-suggestions.png" />
                      <span>
                        <h5 className={styles.number}>{each.num}</h5>
                        <p className={styles.lastLoginText}>
                          Last Login : {each.date}
                        </p>
                      </span>
                      <label class={styles.radioContainer}>
                        <input
                          type="radio"
                          name="option"
                          checked={each.num == selectedNumber}
                        />
                        <span class={styles.checkmark}></span>
                      </label>
                    </div>
                  );
                })}
              </div>
              <button
                className={styles.continueBtn}
                onClick={() => bottomContainerHandler("continue")}
              >
                Continue with {selectedNumber}
              </button>
              <button
                className={styles.useAnotherNum}
                onClick={() => bottomContainerHandler("another")}
              >
                Use Another Number
              </button>
              <p className={styles.proceedingText}>
                By proceeding you confirm that you are of 18 years or above and
                accept the Terms of Use & Privacy Policy
              </p>
            </div>
          )}
          <div className={styles.imageContainer}>
            <img
              src={props?.signinPageInfo?.backgroundImage}
              className={styles.bgImage}
            />
            <div className={styles.topImageText}>
              <h4>Unlimited Movies, TV</h4>
              <h4>Show & more</h4>
            </div>
            <div className={styles.gradientContainer}></div>
          </div>
          <div className={styles.bottomContainer}>
            <h1 className={styles.signIn_Register_text}>Sign In or Register</h1>
            <p className={styles.dont_be_shy}>
              Don't be shy. Endless entertainment awaits.
            </p>
            <div className={styles.mobileNumberContainer}>
              <div className={styles.mobileNumberDiv}>
                <input
                  type="text"
                  className={styles.mobileNumberField}
                  placeholder="Please enter your mobile number"
                  onFocus={bottomContainerHandler}
                />
                <div className={styles.CountryDropdown}>
                  <CountryDropdown
                    getcountry={props?.selectCountry}
                    changeCountry={(value) => props?.setSelectCountry(value)}
                    className={styles.country}
                  />
                </div>
                <div className={styles.pipe}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTypingScreen && (
        <div
          className={styles.typingScreenContainer}
          style={{
            overflow: "auto",
            transition: "height 0.2s ease", // optional
          }}
          ref={typingScreen}
        >
          <div className={styles.topContainer}>
            <h1 className={styles.signIn_Register_text}>Sign In or Register</h1>
            <p className={styles.dont_be_shy}>
              Don't be shy. Endless entertainment awaits.
            </p>

            <div className={styles.mobileNumberContainer}>
              <input
                type="text"
                name="mobile"
                autoFocus={true}
                autoComplete="off"
                ref={props?.mobileRef}
                onChange={(ev) => {
                  props?.onMobileChange(ev);
                  mobileNumberValidation(ev);
                  setSelectedNumber(null);
                  // console.log(ev);
                }}
                onKeyDown={(event) => {
                  props?.handleMobileKeyDown(event);
                  if (event.key === "Enter" && isValidNumber) {
                    setIsTypingScreen(false);
                    setIsOtpScreen(true);
                    props?.setCurrentActiveScreen("otp-screen");
                  }
                }}
                maxLength="10"
                value={selectedNumber ? selectedNumber : props?.enteredMobile}
                className={styles.mobileNumberField}
                placeholder="Please enter your mobile number"
              />
              <div className={styles.CountryDropdown}>
                <CountryDropdown
                  getcountry={props?.selectCountry}
                  changeCountry={(value) => props?.setSelectCountry(value)}
                  className={styles.country}
                />
              </div>
              <div className={styles.pipe}></div>

              <div className={`${styles.mobileNumberErrors} `}>
                {props?.mobileErrorMessage.status && (
                  <span>
                    <img src="" />
                    {props?.mobileErrorMessage.ErrorMessage}{" "}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.bottomContainer}>
            <button
              className={`${styles.continueBtn} ${isValidNumber ? styles.continueActive : styles.continueDisabled}`}
              disabled={!isValidNumber}
              onClick={() => {
                props?.getOtp();
                setIsTypingScreen(false);
                setIsOtpScreen(true);
                props?.setCurrentActiveScreen("otp-screen");
              }}
            >
              Continue
            </button>
            <p>
              By proceeding you confirm that you are of 18 years or above and
              accept the<span>Terms of Use</span> &{" "}
              <span> Privacy Policy </span>
            </p>
          </div>
        </div>
      )}

      {isOtpScreen && (
        <div
          className={styles.otpContainer}
          style={{
            overflow: "auto",
          }}
          ref={otpRefDup}
        >
          <form
            className={styles.typingScreenContainer1}
            onSubmit={(e) => props?.verifyOtp(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValidOtp) {
                props?.verifyOtp(e);
              }
            }}
          >
            <div className={styles.topContainer}>
              <h1 className={styles.signIn_Register_text}>OTP Verification</h1>
              <p className={styles.dont_be_shy}>
                Enter the 4-digit code sent <br />
                to:{" "}
                <span>{`+${props?.selectCountry.isdCode} ${props?.enteredMobile}`}</span>
                <img
                  src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/Vector_edit.png"
                  alt="edit-number"
                  onClick={backHandler}
                />
              </p>
              <div className={styles.PinInput}>
                <PinInput
                  length={4}
                  initialValue=""
                  onChange={(value, index) => {
                    props?.onOtpChange(value);
                  }}
                  type="numeric"
                  inputMode="number"
                  style={{
                    padding: "10px",
                    height: "48px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  inputStyle={{
                    border: "1px solid transparent",
                    background: "#8B8B8B1A",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: "600",
                    fontStyle: "semi",
                    lineHeight: "120%",
                    letterSpacing: "0%",
                    height: "48px",
                  }}
                  inputFocusStyle={{ border: "1px solid #D13066" }}
                  autoSelect={true}
                  regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
                  ref={props?.otpRef}
                  onComplete={(value) => handleOtp(value)}
                />
                {props?.otpErrorMessage.status && (
                  <p className={styles.otpErrorMsg}>
                    <img src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/error_msg_icon.svg" />
                    {props?.otpErrorMessage.ErrorMessage}
                  </p>
                )}
              </div>
              {!props?.signinLoading && (
                <button
                  className={`${styles.resendOtpBtn} ${otpTimer === 0 ? styles.resendOtpBtnBold : ""}`}
                  onClick={resendOtpBtn}
                  disabled={otpTimer !== 0}
                >
                  Resend OTP{" "}
                  {otpTimer > 0 && (
                    <span>
                      in{" "}
                      <span className={styles.otpTimer}>
                        0:{otpTimer.toString().padStart(2, "0")}
                      </span>
                    </span>
                  )}
                </button>
              )}
            </div>
            <div className={styles.bottomContainer}>
              <button
                className={`${styles.continueBtn} ${isValidOtp ? styles.continueActive : styles.continueDisabled}`}
                disabled={!isValidOtp}
                type="submit"
              >
                {props?.signinLoading ? (
                  <div
                    className={` ${styles.btn_loader} ${styles.signIn_loader} signIn_loader`}
                  >
                    <Loader type="button" />
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
