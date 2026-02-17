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
import styles from "./dish-signin-in.module.scss";
import { appConfig } from "@/config/app.config";
import { getNewConfigdata } from "@/services/user.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import PinInput from "react-pin-input";
import { ImageConfig } from "@/config/ImageConfig";
import DishSignIn1 from "./dish1-signin.component";

function DishSignIn() {
  const [isMobileResolution, setIsMobileResolution] = useState(false);
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

  const [signinLoading, setsigninLoading] = useState(false);

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
  const [currentActiveScreen, setCurrentActiveScreen] = useState(null);
  const [isMobFirstLanding, setIsMobFirstLanding] = useState(true);
  const [isMobTypingScreen, setIsMobTypingScreen] = useState(false);
  const [isMobOtpScreen, setMobIsOtpScreen] = useState(false);
  const [referenceKey, setReferenceKey] = useState(null);

  const router = useRouter();
  const profileExpiryTime = getItem("profile-expiry-time");

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

    const facebookAnalyticsData = {
      eventType: "trackCustom",
      fbPixelId: process.env.fbPixelId,
      analyticsService: "facebook",
    };
    sendEvent("signin_initiated", {
      mobile_number: `${selectCountry?.isdCode}-${currentActiveScreen == "number-screen" ? mobileRef.current.value : enteredMobile}`,
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
    const isSigninPage = router.asPath === "/signin";

    if (isSigninPage) {
      document.body.style.paddingBottom = "0px";
    } else {
      document.body.style.paddingBottom = "60px";
    }
    return () => {
      document.body.style.paddingBottom = "60px";
    };
  }, []);
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
      setIsOtpScreen(true);
      let decrypteData = JSON.parse(decryptData(EncApiResponse?.data?.data));
      apiDataUtil(decrypteData);
    } else if (EncApiResponse?.data?.status) {
      if (EncApiResponse?.data?.response?.userDetails) {
        setIsOtpScreen(true);
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
      navigateFrom;
      let decodedpdParam = atob(decodeURIComponent(pdParam))?.split("&&&");
      if (decodedpdParam) {
        let piInfo = decodedpdParam[1]?.split("===");
        let subheading = decodedpdParam[0]?.split("===")[1];
        if (piInfo) {
          let encodedpi = piInfo[1];
          if (encodedpi) {
            // setRedirection(true);
            if (!!isMobOtpScreen) {
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
  }, [router.query.pd, isMobOtpScreen]);

  const redirectToPlansList = (plansInfo) => {
    const url = `/plans/list?pi=${encodeURIComponent(btoa(plansInfo))}`;
    router.push(url);
  };

  const apiDataUtil = async (apiResponse) => {
    if (apiResponse?.status) {
      setMobIsOtpScreen(true);
      setCurrentActiveScreen("otp-screen");
      setIsMobTypingScreen(false);
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
        if (!!_SC) dispatch({ type: actions.SystemConfig, payload: _SC });
      }
      setIsOtpFieldDisabled(false);
      setTimeout(() => {
        otpRef.current?.focus();
      }, 1000); // Focus otp field on sending otp
      setTimeLeft(30);
      setApiDataResponse(apiResponse);
      setIsVerifyButtonDisabled(true);
      setLoader(false);
      setOtpErrorMessage({ status: false, ErrorMessage: "" });
      if (redirection) {
        //`/plans/list}?pi=${encodeURIComponent(btoa(paymentInfo))}`
        const url = paymentInfo
          ? `/plans/list?pi=${encodeURIComponent(btoa(paymentInfo))}`
          : otpData.context === "login"
            ? "/profiles/select-user-profile"
            : "/languages";
        if (otpData.context === "login") {
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
      if (!!apiResponse?.response?.details?.referenceKey) {
        setReferenceKey(apiResponse?.response?.details?.referenceKey);
      }
      setsigninLoading(false);
    } else if (apiResponse?.error?.code === -4) {
      setOtpData({ context: "signup" });
      setTimeLeft(30);
      setLoader(true);
      setRedirection(false);
      setApiDataResponse(apiResponse);
      signUp();
      setsigninLoading(false);
    } else if (apiResponse?.error?.code === -41) {
      setOtpData({ context: "signup" });
      setOtpErrorMessage({
        status: true,
        ErrorMessage: apiResponse?.error?.message,
      });
      setRedirection(false);
      setsigninLoading(false);
    } else {
      setOtpData(null);
      setIsVerifyButtonDisabled(false);
      currentActiveScreen == "otp-screen" && setTimeLeft(0);
      setRedirection(false);
      // dispatch({
      //   type: actions.NotificationBar,
      //   payload: { message: apiResponse?.error?.message },
      // });
      if (isMobOtpScreen) {
        setOtpErrorMessage({
          status: true,
          ErrorMessage: apiResponse?.error?.message,
        });
      } else if (isMobTypingScreen) {
        setMobileErrorMessage({
          status: true,
          ErrorMessage: apiResponse?.error?.message,
        });
      }
      setLoader(false);
      if (currentActiveScreen == "otp-screen") {
        setOtpErrorMessage({
          status: true,
          ErrorMessage: apiResponse?.error?.message,
        });
      }
      setsigninLoading(false);
    }
  };

  const getTodaysDate = () => {
    let date = new Date();
    let currentDate = date.getDate().toString().padStart(2, "0");
    let year = date.getFullYear();
    let month;
    switch (date.getMonth()) {
      case 0:
        month = "Jan";
        break;
      case 1:
        month = "Feb";
        break;
      case 2:
        month = "Mar";
        break;
      case 3:
        month = "Apr";
        break;
      case 4:
        month = "May";
        break;
      case 5:
        month = "Jun";
        break;
      case 6:
        month = "Jul";
        break;
      case 7:
        month = "Aug";
        break;
      case 8:
        month = "Sep";
        break;
      case 9:
        month = "Oct";
        break;
      case 10:
        month = "Nov";
        break;
      case 11:
        month = "Dec";
        break;
    }

    return `${currentDate} ${month} ${year}`;
  };
  const setUserLogin = (userResponse, url, signupcase = "") => {
    let previousLoginData = JSON.parse(getItem("previousLoginJson")) || [];
    let detailsObj = {
      num: enteredMobile,
      date: getTodaysDate(),
      selectCountry: selectCountry,
    };
    previousLoginData = previousLoginData.filter(
      (each) => each.num != enteredMobile
    );
    previousLoginData.push(detailsObj);
    if (previousLoginData.length > 5) {
      previousLoginData.shift();
    }
    setItem("previousLoginJson", JSON.stringify(previousLoginData));
    setItemEnc("uDetails", userResponse);
    setItem("isloggedin", true);
    deleteItem("player-audio-lang");
    //clevertap session initiation
    getActivePackages();
    setUserSession(userResponse);
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
          mobile_number: `${selectCountry.isdCode}-${currentActiveScreen == "number-screen" ? mobileRef.current.value : enteredMobile}`,
        });
      setfirstregistrationevent(false);
    } else {
      sendEvent("signin_completed", {
        ar_status,
        subscription_status,
        mobile_number: `${selectCountry.isdCode}-${currentActiveScreen == "number-screen" ? mobileRef.current.value : enteredMobile}`,
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
      router.push(url);
    } else if (!!navigateFrom) {
      dispatch({ type: actions.navigateFrom, payload: null });
      router.push(navigateFrom);
    } else {
      router.push("/");
    }
  };
  const signUp = () => {
    console.log("signup invoked...");
    let isOptedForPromotions = {
      isOptedForPromotions: JSON.stringify(isChecked),
    };
    let apiData = {
      mobile:
        currentActiveScreen == "number-screen"
          ? selectCountry.isdCode + mobileRef.current.value
          : selectCountry.isdCode + enteredMobile,
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
    // If fields are empty, showing error message
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
    // console.log(selectCountry);
    let apiData = {
      login_id:
        currentActiveScreen == "number-screen"
          ? selectCountry.isdCode + mobileRef.current.value
          : selectCountry.isdCode + enteredMobile,
      manufacturer: "123",
      additional_params:
        SystemFeature?.encryptApisList?.fields?.signin === "true"
          ? JSON.stringify(isOptedForPromotions)
          : isOptedForPromotions,
    };
    if (otpData?.context != "signup") {
      setOtpData({ context: "login" });
      apiData.login_key = otpRef.current.values.join("");
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
        // console.log(apiData);
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
      // if (!apiResponse?.status || !EncApiResponse?.status) {
      //   setOtpErrorMessage(true);
      // }
    } else {
      signUpComplete();
    }
  };

  const signUpComplete = () => {
    console.log("signUpComplete invoked...");
    if (apiDataResponse) {
      let apiData = {
        reference_key:
          referenceKey || apiDataResponse?.response?.details?.referenceKey,
        otp: Number(otpRef.current.values.join("")),
      };
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
    // if (!apiResponse?.status || !EncApiResponse?.status) {
    //   setOtpErrorMessage(true);
    // }
  };

  const resendOtp = () => {
    sendEvent("signin_resent_otp", {
      mobile_number: `${selectCountry.isdCode}-${currentActiveScreen == "number-screen" ? mobileRef.current.value : enteredMobile}`,
    });
    if (SystemFeature?.encryptApisList?.fields?.resendOtp === "true") {
      let apiData = {
        reference_id: JSON.stringify(apiDataResponse.response.referenceId),
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
          apiDataResponse?.response?.referenceId ||
            apiDataResponse?.response?.details?.otpReferenceId
        ),
      };
      let url = process.env.initJson.api + "/service/api/auth/resend/otp";
      mutateSignin({ url, apiData });
    }
    // Disable the Verify button during the resend time
    setIsVerifyButtonDisabled(true);
  };

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      setIsTimerStarted(true);
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (
      timeLeft === 0 &&
      isTimerStarted &&
      apiResponse?.data.error?.code != -3 &&
      apiResponse?.data.error?.code != -41 &&
      apiResponse?.error?.code != -3 &&
      apiResponse?.error?.code != -41
    ) {
      // setOtpErrorMessage({
      //   status: true,
      //   ErrorMessage:
      //     signinconstant?.[localLang]?.OTP_is_required || "OTP is required",
      // });
    } else {
      // Reset button state when the timer reaches 0
      setIsVerifyButtonDisabled(false);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isTimerStarted]);

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

  const onOtpChange = (event) => {
    var numberRegex = /^\d+$/;
    // const ignoreCondition =
    //   event.nativeEvent.inputType !== "deleteContentBackward";
    // console.log(event.target.key)
    if (!numberRegex.test(event)) {
      return;
    }
    const otpValue = event;
    setEnteredOtp(otpValue);
    setOtpErrorMessage({ status: false, ErrorMessage: "" });
    if (otpValue.trim() === "") {
      // setOtpErrorMessage({
      //   status: true,
      //   ErrorMessage:
      //     signinconstant?.[localLang]?.OTP_is_required || "OTP is required",
      // });
    } else if (otpValue.length < 4) {
      // setOtpErrorMessage({
      //   status: true,
      //   ErrorMessage:
      //     signinconstant?.[localLang]?.Minimum_digits_required ||
      //     "Minimum 4 digits required",
      // });
    } else if (otpValue.length > 4) {
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

  if (isMobileResolution) {
    return (
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
        resendOtp={resendOtp}
        setEnteredMobile={setEnteredMobile}
        router={router}
        currentActiveScreen={currentActiveScreen}
        isMobFirstLanding={isMobFirstLanding}
        setIsMobFirstLanding={setIsMobFirstLanding}
        setIsMobTypingScreen={setIsMobTypingScreen}
        isMobTypingScreen={isMobTypingScreen}
        isMobOtpScreen={isMobOtpScreen}
        setMobIsOtpScreen={setMobIsOtpScreen}
        signinLoading={signinLoading}
        setMobileErrorMessage={setMobileErrorMessage}
      />
    );
  }
  return <DishSignIn1 />;
}

export default DishSignIn;

const MobileScreen = (props) => {
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
  const imgRef = useRef();
  const bottomRef = useRef();

  const backHandler = () => {
    // console.log("back",props?.currentActiveScreen)
    if (props?.currentActiveScreen == "number-screen") {
      if (props?.loader) {
        return;
      }
      props?.setIsMobFirstLanding(true);
      props?.setMobIsOtpScreen(false);
      props?.setIsMobTypingScreen(false);
      props?.setCurrentActiveScreen("first-land");
      setIsShowBackImg(false);
      setIsShowSkip(true);
      props?.setMobileErrorMessage({ status: false, ErrorMessage: "" });
      if (!selectedNumber && previousLoginData.length > 0) {
        setSelectedNumber(previousLoginData[previousLoginData.length - 1].num);
      }
    } else if (props?.currentActiveScreen == "otp-screen") {
      if (props?.signinLoading) {
        return;
      }
      props?.setMobIsOtpScreen(false);
      props?.setIsMobTypingScreen(true);
      props?.setIsMobFirstLanding(false);
      props?.setCurrentActiveScreen("number-screen");
      props?.setMobileErrorMessage({ status: false, ErrorMessage: "" });
      setIsValidOtp(false);
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

  const handleOtp = (e) => {
    props?.setEnteredOtp(e);
    if (e.length === 4) {
      setIsValidOtp(true);
    }
  };

  const handleClick = (each) => {
    // console.log(each);
    if (previousLoginData.length == 1) {
      return;
    }
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (props?.isMobOtpScreen) {
      startOtpCountdown();
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [props?.isMobOtpScreen]);
  const resendOtpBtn = () => {
    if (props?.otpRef?.current) {
      props.otpRef.current.clear();
    }
    setIsValidOtp(false);
    if (props?.isMobOtpScreen && otpTimer == 0) {
      startOtpCountdown();
      props?.resendOtp();
    }
  };

  const bottomContainerHandler = (con) => {
    if (previousLoginData.length == 0 || con == "another") {
      props?.setIsMobFirstLanding(false);
      props?.setIsMobTypingScreen(true);
      props?.setCurrentActiveScreen("number-screen");
      setIsShowBackImg(true);
      setIsShowSkip(false);
      setSelectedNumber(null);
      props?.setEnteredMobile(null);
      setIsValidNumber(false);
    } else if (con == "continue") {
      props?.setIsMobFirstLanding(false);
      props?.setIsMobTypingScreen(true);
      props?.setCurrentActiveScreen("number-screen");
      setIsShowBackImg(true);
      setIsShowSkip(false);
      setIsValidNumber(true);
      props?.setSelectCountry(selectedCountryDup);
      if (previousLoginData?.length == 1) {
        props?.setEnteredMobile(previousLoginData[0]?.num);
      } else {
        props?.setEnteredMobile(selectedNumber);
      }
    }
  };
  const mobileNumberValidation = (e) => {
    // console.log(e.target.value);
    // validateM()
    let regex = /^[0-9]+$/;
    if (e.target.value.length > 1) {
      setIsValidNumber(true);
    } else if (e.target.value.length == 1 && regex.test(e.target.value)) {
      setIsValidNumber(true);
    } else {
      setIsValidNumber(false);
    }
  };

  useEffect(() => {
    const setImgHeight = () => {
      if (
        !!props?.isMobFirstLanding &&
        !props?.isMobOtpScreen &&
        !props?.isMobTypingScreen &&
        imgRef.current &&
        bottomRef.current
      ) {
        const cHeight = window.visualViewport.height;
        const targetImgHeight = (cHeight * 65) / 100;
        const targetBtmHeight = (cHeight * 35) / 100;
        // console.log('ag',targetBtmHeight);
        imgRef.current.style.height = `${targetImgHeight}px`;
        bottomRef.current.style.height = `${targetBtmHeight}px`;
      }
    };

    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", setImgHeight);
      setImgHeight(); // initial call
    }

    return () => {
      if (typeof window !== "undefined" && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setImgHeight);
      }
    };
  }, [
    props?.isMobFirstLanding,
    props?.isMobOtpScreen,
    props?.isMobTypingScreen,
  ]);

  return (
    <div className={styles.mobileContainer}>
      <div
        className={`${styles.topNav} ${isShowSkip ? styles.showSkipStyles : styles.nonShowSkipStyles}`}
      >
        <div className={styles.backButton} onClick={() => backHandler()}>
          {isShowBackImg && (
            <img
              src={ImageConfig.changePassword.arrowBack}
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

      {props?.isMobFirstLanding && (
        <div className={styles.firstLanding}>
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
                      <img src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/watcho-number-suggestions.svg" />
                      <span>
                        <h5 className={styles.number}>{each.num}</h5>
                        <p className={styles.lastLoginText}>
                          Last Login : {each.date}
                        </p>
                      </span>
                      <label
                        class={`${styles.radioContainer} ${previousLoginData.length == 1 && styles.hiddenRadio}`}
                      >
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
                Continue with{" "}
                {previousLoginData?.length == 1
                  ? previousLoginData[0]?.num
                  : selectedNumber}
              </button>
              <button
                className={styles.useAnotherNum}
                onClick={() => bottomContainerHandler("another")}
              >
                Use Another Number
              </button>
              <p className={styles.proceedingText}>
                By proceeding you confirm that you are of 18 years or above and
                accept the <a href="/support/terms">Terms of Use</a> &{" "}
                <a href="/support/privacy-policy">Privacy Policy</a>
              </p>
            </div>
          )}
          <div className={styles.imageContainer} ref={imgRef}>
            <img
              src={props?.signinPageInfo?.mobileBackgroundImage}
              className={styles.bgImage}
            />
            <div className={styles.topImageText}>
              <h4>Unlimited Movies, TV</h4>
              <h4>Show & more</h4>
            </div>
            <div
              className={`${styles.gradientContainer} ${previousLoginData.length > 0 ? styles.active : ""}`}
            ></div>
          </div>
          <div
            className={styles.bottomContainer}
            ref={bottomRef}
            // onClick={bottomContainerHandler}
          >
            <h1 className={styles.signIn_Register_text}>Sign In or Register</h1>
            <p className={styles.dont_be_shy}>
              Don't be shy. Endless entertainment awaits.
            </p>
            <div
              className={styles.mobileNumberContainer}
              onClick={bottomContainerHandler}
            >
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

      {props?.isMobTypingScreen && (
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
              <div className={styles.CountryDropdown}>
                <CountryDropdown
                  getcountry={props?.selectCountry}
                  changeCountry={(value) => props?.setSelectCountry(value)}
                  className={styles.country}
                />
              </div>
              <div className={styles.mobileNumberDiv}>
                <input
                  type="tel"
                  name="mobile"
                  autoFocus={true}
                  disabled={props?.loader}
                  autoComplete="off"
                  ref={props?.mobileRef}
                  onChange={(ev) => {
                    // console.log(props?.enteredMobile);
                    props?.onMobileChange(ev);
                    mobileNumberValidation(ev);
                    setSelectedNumber(null);
                    // console.log(ev);
                  }}
                  onKeyDown={(event) => {
                    props?.handleMobileKeyDown(event);
                    if (event.key === "Enter" && isValidNumber) {
                      // props?.setIsMobTypingScreen(false);
                      // props?.setMobIsOtpScreen(true);
                      // props?.setCurrentActiveScreen("otp-screen");
                    }
                  }}
                  maxLength="10"
                  value={
                    selectedNumber
                      ? selectedNumber
                      : props?.enteredMobile
                        ? props?.enteredMobile
                        : ""
                  }
                  className={styles.mobileNumberField}
                  placeholder="Please enter your mobile number"
                />
              </div>
            </div>

            <div className={`${styles.mobileNumberErrors} `}>
              {props?.mobileErrorMessage.status && (
                <span>
                  <img
                    src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/error_msg_icon.svg"
                    style={{ marginRight: "5px" }}
                  />{" "}
                  {props?.mobileErrorMessage.ErrorMessage}{" "}
                </span>
              )}
            </div>
          </div>
          <div className={styles.bottomContainer}>
            <button
              className={`${styles.continueBtn} ${isValidNumber ? styles.continueActive : styles.continueDisabled}`}
              disabled={!isValidNumber}
              onClick={() => {
                props?.getOtp();
                // props?.setIsMobTypingScreen(false);
                // props?.setMobIsOtpScreen(true);
                // props?.setCurrentActiveScreen("otp-screen");
              }}
            >
              {props?.loader ? (
                <div
                  className={` ${styles.btn_loader} ${styles.signIn_loader} signIn_loader`}
                >
                  {" "}
                  <Loader type="button" />
                </div>
              ) : (
                "Continue"
              )}
            </button>
            <p>
              By proceeding you confirm that you are of 18 years or above and
              accept the <a href="/support/terms">Terms of Use</a> &{" "}
              <a href="/support/privacy-policy">Privacy Policy</a>
            </p>
          </div>
        </div>
      )}

      {props?.isMobOtpScreen && (
        <div
          className={styles.otpContainer}
          style={{
            overflow: "auto",
            // transition: "height 0.2s ease",
          }}
          ref={otpRefDup}
        >
          <form
            className={styles.typingScreenContainer1}
            onSubmit={(e) => props?.verifyOtp(e)}
            onKeyDown={(e) => {
              if (e.key == "Enter" && isValidOtp) {
                props?.verifyOtp(e);
              }
            }}
          >
            <div className={styles.topContainer}>
              <h1 className={styles.signIn_Register_text}>OTP Verification</h1>
              <p className={styles.dont_be_shy}>
                Enter the 4-digit code sent <br />
                to:{" "}
                <span
                  style={{ color: "#ffffffff", fontWeight: "600" }}
                >{`+${props?.selectCountry.isdCode} ${props?.enteredMobile}`}</span>
                <img
                  src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/Vector_edit.png"
                  alt="edit-number"
                  onClick={backHandler}
                  style={{ marginLeft: "10px" }}
                />
              </p>
              <div className={styles.PinInput}>
                <PinInput
                  length={4}
                  initialValue=""
                  onChange={(value, index) => {
                    if (value.length === 4) {
                      setIsValidOtp(true);
                    } else {
                      setIsValidOtp(false);
                    }
                    props?.onOtpChange(value);
                  }}
                  type="numeric"
                  inputMode="number"
                  style={{
                    padding: "10px 0px",
                    height: "48px",
                    // width: "310px",
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
                    width: "60px",
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
              <button
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
              </button>
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
                    {" "}
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
