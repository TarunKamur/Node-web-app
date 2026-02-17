import React, { useState, useRef, useEffect } from "react";
import useGetApiMutate from "@/hooks/useGetApidata";
import { useStore, actions } from "@/store/store";
import usePostApiMutate from "@/hooks/usePostApidata";
import useFromApiMutate from "@/hooks/useFromApidata";
import styles from "./OrderSummary.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { useRouter } from "next/router";
import { Ordersummaryconstant } from "@/.i18n/locale";
import {
  getPagePath,
  getQueryParams,
  jsonToQueryParams,
} from "@/services/utility.service";
import {
  decryptData,
  encryptData,
  fromStyle,
  validateE,
  validateM,
} from "@/services/utility.service";
import {
  deleteItem,
  getItem,
  getItemDirect,
  setItem,
} from "@/services/local-storage.service";
import dynamic from "next/dynamic";
import Loader from "@/components/loader/loader.component";
import { sendEvent } from "@/services/analytics.service";
const PopupModal = dynamic(() => import("../../popups/generic/popup-modal"));
const OverlayPopupModal = dynamic(
  () => import("@/components/popups/overlay-popup/overlay-popup-modal")
);

export default function OrderSummary() {
  const {
    mutate: mutateVoucherApply,
    data: apiVocherResponse,
    isLoading,
  } = usePostApiMutate();
  const {
    state: {
      localLang,
      SystemFeature,
      SystemConfig,
      navigateFrom,
      userDetails,
      ThemeColor,
    },
    dispatch,
  } = useStore();
  const [showinput, setShowInput] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [oderPaiDetails, setoderPaiDetails] = useState("");
  const [pagePath, setPagePath] = useState({});
  const [pageTargetPath, setPageTargetPath] = useState("");
  const { mutate: mutateGetPackagesData, data: packageapiResponse } =
    useGetApiMutate();
  const { mutate: mutateOrderSummaryApi, data: orderSummaryApiResponse } =
    usePostApiMutate();
  const { mutate: mutateRazorCheckPayment, data: razorPaymentCheckResponse } =
    useGetApiMutate();
  const [popupData, setPopUpData] = useState({});
  const [iframeUrl, setIframeUrl] = useState(null);
  const couponInputRef = useRef(null);
  const router = useRouter();
  const isUtUser = getItem("isUtuser");
  const [isLoggedin, setIsLoggedIn] = useState(null);
  const [userEnteredCouponValue, setUserEnteredCouponValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [applyLoader, setApplyLoader] = useState(false);
  const [packduration, setpackduration] = useState({});
  const [iscupon, setiscupon] = useState(false);
  const [applycoupeErrMsg, setApplycoupeErrMsg] = useState("");
  const [proceedToPayLoader, setProceedToPayLoader] = useState(false);
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [getTypePayment, setgetTypePayment] = useState(null);
  const [freedomOdSryStaticPoints, setfreedomOdSryStaticPoints] = useState([]);
  const [isapplycoupeapply, setisapplycoupeapply] = useState(false);
  const [prevData, setPrevData] = useState(null);
  const [timerCount, setTimerCount] = useState(0);
  const checkOrderTimer = useRef();
  const [showLoader, setShowLoader] = useState(true);

  const couponInput = useRef();

  const couponInputChange = () => {
    setUserEnteredCouponValue(couponInput.current.value);
    // if (couponInput.current.value.length != 0) {
    setApplycoupeErrMsg("");
    // }
  };
  useEffect(() => {
    setUserEnteredCouponValue("");
    if (!!userDetails) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    // console.log(">>>>SystemConfig.configs",JSON.parse(SystemConfig?.configs?.freedomOrderSummaryStaticPoints));
    if (SystemConfig?.configs?.freedomOrderSummaryStaticPoints)
      setfreedomOdSryStaticPoints(
        JSON.parse(SystemConfig?.configs?.freedomOrderSummaryStaticPoints)
      );
    // let windowWidth = window.innerWidth;
    // if (windowWidth <= 991) {
    //   document.body.style.overflow = "hidden";
    // }
    // return () => {
    //   document.body.style.overflow = "auto";
    // };
    const handlePopState = () => {
      window.location.reload();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [userDetails]);

  useEffect(() => {
    let pPath = router.asPath;
    // console.log("...router.asPath", router.asPath);
    let path = {
      path: getPagePath(pPath),
      query: getQueryParams(pPath),
    };
    setPagePath(path);
    setCouponCodeData(null);
  }, [router.asPath]);

  useEffect(() => {
    // console.log(">>>>pagePath", pagePath);
    getPackages();
    setLoader(true);
  }, [pagePath]);

  useEffect(() => {
    if (razorPaymentCheckResponse && razorPaymentCheckResponse.status) {
      let dataResponse = razorPaymentCheckResponse.data.response;
      console.log("razorPaymentCheckResponse", razorPaymentCheckResponse);
      if (razorPaymentCheckResponse?.data?.status) {
        sessionStorage.setItem(`tvodData-orderId:${razorPaymentCheckResponse?.data?.response?.orderId}`,JSON.stringify(razorPaymentCheckResponse?.data?.response));
        // setItem(`tvodData-orderId:${razorPaymentCheckResponse?.data?.response?.orderId}`,JSON.stringify(razorPaymentCheckResponse?.data?.response));
        dispatch({
          type: actions.paymentResponse,
          payload: razorPaymentCheckResponse.data,
        });
      }

      if (dataResponse?.status?.toLowerCase() == "p") {
        setShowLoader(false);
        checkOrderTimer.current = setTimeout(() => {
          setTimerCount((prevCount) => prevCount + 5000);
          reCheckOrder(dataResponse?.orderId);
        }, 5000);
      } else if (
        dataResponse?.status.toLowerCase() == "s" ||
        dataResponse?.status.toLowerCase() == "e"
      ) {
        setShowLoader(false);
        // console.log("success");
        router.push(`/buy/payment-status?order_id=${dataResponse.orderId}`);
        //success..
      } else {
        // failure..
        // console.log("failed......");
        router.push(`/buy/payment-status?order_id=${dataResponse.orderId}`);
      }
    }
  }, [razorPaymentCheckResponse]);

  const reCheckOrder = (orderID) => {
    setTimerCount((prevCount) => prevCount + 5000);
    if (timerCount < 6000) {
      // check for 1 minute.
      checkOrder(orderID);
    } else {
      setShowLoader(false);
      // isPaymentPending(false);
      clearTimeout(checkOrderTimer.current);
      // redirecting to payment failure
      // const paymentFailureResponse = {
      //   response: {
      //     targetParams: {
      //       msg1: activePackage.supportedGateway[0].name,
      //       msg2: Paymentconstant[localLang].Transaction_Failed,
      //       buttonText: Paymentconstant[localLang].Retry,
      //     },
      //   },
      // };

      //  failll...
      // dispatch({
      //   type: actions.paymentResponse,
      //   payload: paymentFailureResponse,
      // });
      // router.push("/buy/payment-failure");
      // console.log("fail123");
      router.push(`/buy/payment-status?order_id=${orderID}`);
    }
  };

  const ctEventsInvoking = (type, response) => {
    // console.log(response);
    const channelId = getItem("channel-id-order-summary");
    const contentId = getItem("content-id-order-summary");
    const railName = getItem("rail-name");
    // console.log(railName);
    let temp = {
      channelId,
      contentId,
      railName,
    };
    setPrevData(temp);
    let tempObj = {
      rail_name: railName || "-1",
      plan_name: response?.data?.response[0]?.packageInfo?.packages[0]?.name,
      plan_id: response?.data?.response[0]?.packageInfo?.master?.id,
      plan_duration:
        response?.data?.response[0]?.packageInfo?.packages[0]?.durationCode,
      plan_type: response?.data?.response[0]?.packageInfo?.master?.packageType,
      plan_amount:
        response?.data?.response[0]?.packageInfo?.packages[0]?.listPrice,
      channel_id: channelId,
      content_id: contentId,
      device: "web",
      cpCode: "freedom",
    };
    const viewItemObj = {
      rail_name: railName,
      plan_name:
        response?.data?.response[0]?.packageInfo?.packages[0]?.name || "-1",
      plan_id: response?.data?.response[0]?.packageInfo?.master?.id || "-1",
      // start_date: "-1",
      // end_date: "-1",
      asset_title:
        response?.data?.response[0]?.packageInfo?.packages[0]?.name || "-1",
      plan_duration:
        response?.data?.response[0]?.packageInfo?.packages[0]?.durationCode,
      plan_type: response?.data?.response[0]?.packageInfo?.master?.packageType,
      price:
        response?.data?.response[0]?.packageInfo?.packages[0]?.listPrice ||
        "-1",
      // media_type: "-1",
      // genre: "-1",
      cpCode: "freedom",
      channel_id: channelId,
      content_id: contentId,
      // episode_number: "-1",
      // season_number: "-1",
      // series_name: "-1",
    };
    // deleteItem("channel-id-order-summary");
    // deleteItem("content-id-order-summary");
    // deleteItem("rail-name");
    if (!!channelId && !!contentId) {
      if (type == "rent") {
        sendEvent("rent", tempObj);
      } else if (type == "subscribe") {
        sendEvent("subscribe", tempObj);
      }
      sendEvent("view_item", viewItemObj);
    }
  };

  const getPackages = () => {
    if (!!pagePath) {
      let params = pagePath;
      let url;
      if (params?.query?._rent) {
        setgetTypePayment("rent");
        setPageTargetPath(params?.query?._rent);
        params = {
          path: params?.query?._rent,
          package_type: "2",
          skip_package_content: "true",
        };
        url =
          process.env.initJson.api +
          "/package/api/v1/packages/info/for/content?" +
          jsonToQueryParams(params);
        mutateGetPackagesData(url, {
          onSuccess: (response) => {
            // console.log("?>>>>>response?.data", response?.data?.response[0]);
            // callOderSummary(response?.data);
            setoderPaiDetails(response?.data);
            setLoader(false);
            ctEventsInvoking("rent", response);
          },
        });
      } else if (params?.query?._subscribe) {
        setPageTargetPath(params?.query?._subscribe);
        setgetTypePayment("subscribe");
        params = {
          path: params?.query?._subscribe,
          // path: "video/vtcnwkx",
          // package_type: "2",
          skip_package_content: "true",
        };
        url =
          process.env.initJson.api +
          "/package/api/v1/packages/info/for/content?" +
          jsonToQueryParams(params);
        mutateGetPackagesData(url, {
          onSuccess: (response) => {
            // console.log("?>>>>>response?.data", response?.data);
            setoderPaiDetails(response?.data);
            setLoader(false);
            try {
              couponInput.current.value = "";
            } catch (error) {}
            setisapplycoupeapply(false);
            setCouponCodeData(null);
            setUserEnteredCouponValue("");
            ctEventsInvoking("subscribe", response);
          },
        });
      }
    }
  };
  const callOderSummary = (apiResponse = oderPaiDetails) => {
    setProceedToPayLoader(true);
    if (apiResponse?.status) {
      let packagesInfo =
        apiResponse?.response[0]?.packageInfo?.packages[0]?.id.toString();
      const data = {
        gateway: "juspay",
        packages: packagesInfo,
      };
      if (userEnteredCouponValue != "" && iscupon) {
        data.couponCode = userEnteredCouponValue;
      }
      // console.log(userEnteredCouponValue);
      if (SystemFeature?.encryptApisList?.fields?.payment == "true") {
        const encryptObj = {
          data: encryptData(JSON.stringify(data)),
          metadata: encryptData(JSON.stringify({ request: "order/checkout" })),
        };
        postPaymentData(
          `${process.env.initJson.api}/service/api/v1/send`,
          encryptObj,
          oderPaiDetails
        );
      } else {
        postPaymentData(
          `${process.env.initJson.api}/payment/api/v1/order/checkout`,
          data,
          oderPaiDetails
        );
      }
    }
  };

  const postPaymentData = (url, apiData, dupData) => {
    // console.log("5678", dupData);
    mutateOrderSummaryApi(
      { url, apiData },
      {
        onSuccess: (response, e) => {
          // console.log(
          //   response?.data,
          //   "?>>>>>mutateOrderSummaryApi",
          //   response?.data?.response
          // );
          setProceedToPayLoader(false);
          if (response?.data?.status) {
            if (response?.data?.response?.isCaptureCall) {
              let jsutpayDetails = {
                orderId: response?.data?.response?.orderId,
                packageId:
                  oderPaiDetails?.response[0]?.packageInfo?.packages[0]?.id.toString(),
                tragetPath: pageTargetPath,
                tragetPathFull: router.asPath,
              };

              sendEvent(
                "begin_checkout",
                analyticsData(dupData?.response[0], jsutpayDetails)
              );

              setItem("juspay_oi", JSON.stringify(jsutpayDetails));
              if (response?.data?.response?.targetParams?.web_payment_link) {
                // setIframeUrl(
                //   response?.data?.response?.targetParams?.web_payment_link
                // );
                window.open(
                  `${response?.data?.response?.targetParams?.web_payment_link}`,
                  "_self"
                );
                setisapplycoupeapply(false);
                // setCouponCodeData(null);
                couponInput.current.value = "";
                setUserEnteredCouponValue("");
                return;
              }
            } else {
              // console.log("6");
              let jsutpayDetails = {
                orderId: response?.data?.response?.orderId,
                packageId:
                  oderPaiDetails?.response[0]?.packageInfo?.packages[0]?.id.toString(),
                tragetPath: pageTargetPath,
                tragetPathFull: router.asPath,
              };

              sendEvent(
                "begin_checkout",
                analyticsData(dupData?.response[0], jsutpayDetails)
              );
              checkOrder(response?.data?.response?.orderId);
            }
          }
        },
      }
    );
  };

  const checkOrder = (orderId) => {
    let url = `${process.env.initJson.api}/payment/api/v1/order/status?order_id=${orderId}`;
    mutateRazorCheckPayment(url);
  };

  const analyticsData = (data1, data2) => {
    // console.log(data1, data2);
    let tempObj = {
      transaction_id: data2?.orderId || "-1",
      plan_name: data1?.packageInfo?.packages[0]?.name || "-1",
      plan_id: data1?.packageInfo?.master?.id || "-1",
      // start_date: "-1",
      // end_date: "-1",
      asset_title: data1?.packageInfo?.packages[0]?.name || "-1",
      plan_duration: data1?.packageInfo?.packages[0]?.durationCode || "-1",
      plan_type: data1?.packageInfo?.master?.packageType || "-1",
      price: data1?.packageInfo?.packages[0]?.listPrice || "-1",
      // payment_type: "-1",
      currency: data1?.packageInfo?.packages[0]?.currency || "-1",
      cpCode: "freedom",
    };
    if (!!prevData) {
      tempObj.channel_id = prevData?.channelId || "-1";
      tempObj.content_id = prevData?.contentId || "-1";
      tempObj.rail_name = prevData?.railName || "-1";
    }

    if (userEnteredCouponValue != "" && iscupon) {
      tempObj.coupon = userEnteredCouponValue;
    }
    setItem("payment-status", tempObj);
    return tempObj;
  };

  const handleCouponClick = () => {
    setShowInput(!showinput);
  };

  const handleApplyCoupon = () => {
    const couponCode = couponInputRef.current.value;
    if (couponCode) {
      setCouponMessage("Coupon Applied");
    }
  };

  const handleBack = () => {
    if (isUtUser) {
      window.location.href = SystemConfig.configs.siteURL;
    } else if (navigateFrom) {
      router.replace(navigateFrom);
    } else {
      router.replace("/");
    }
  };

  const navigateToSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signin");
  };

  const handleClose = () => {
    setPopUpData({});
  };

  const popupLoginSet = () => {
    let pop = {
      type: "signin",
      isActive: true,
      title1: "To access this feature please sign in",
      yesButton1: "Sign In",
      yesButtonType: "primary",
      yesButtonTarget1: navigateToSignIn,
      noButton1: "Cancel",
      noButtonType: "secondary",
      noButtontarget1: handleClose,
      Close: true,
      closeTarget: handleClose,
      parentclassName: "orderSummary",
    };
    setPopUpData(pop);
  };

  const formHandler = (e) => {
    // console.log("called cupon");
    e.preventDefault();
    // console.log(oderPaiDetails);
    applyCouponAnalyticsHandler(oderPaiDetails);
    if (!!isLoggedin) {
      if (!isapplycoupeapply) {
        if (userEnteredCouponValue != "") {
          const url = `${process.env.initJson.api}/payment/api/v1/order/summary`;
          let packagesInfo =
            oderPaiDetails?.response[0]?.packageInfo?.packages[0]?.id.toString();
          const apiData = {
            couponCode: userEnteredCouponValue,
            gateway: "juspay",
            packages: packagesInfo,
          };
          try {
            setApplyLoader(true);
            mutateVoucherApply(
              {
                url,
                apiData,
              },
              {
                onError: (err) => {
                  console.log(err);
                },
                onSuccess: (response) => {
                  // console.log(data.data);
                  if (response.data.status) {
                    // console.log(">>>>>>>>>>>>>>>>",response?.data?.response);
                    setCouponCodeData(response?.data?.response);
                    couponCodeError({
                      msg: response?.data?.response?.couponInfo?.msg,
                      status: true,
                    });
                    setiscupon(true);
                    setisapplycoupeapply(true);
                  } else {
                    setCouponCodeData(null);
                    // console.log(response.data.error.message);
                    couponCodeError({
                      msg: response?.data?.error?.message,
                      status: false,
                    });
                    setiscupon(false);
                  }
                },
              }
            );
          } catch (error) {
            console.log(error);
          } finally {
            setApplyLoader(false);
          }
        } else {
          setApplycoupeErrMsg({
            msg: "Coupon code is required",
            status: false,
          });
          setApplyLoader(false);
          setTimeout(() => {
            setApplycoupeErrMsg(null);
          }, 5000);
        }
      } else {
        setisapplycoupeapply(false);
        setCouponCodeData(null);
        couponInput.current.value = "";
        setUserEnteredCouponValue("");
      }
    } else {
      popupLoginSet();
    }
  };

  const applyCouponAnalyticsHandler = (data) => {
    // console.log(data?.response);
    const tempObj = {
      plan_duration:
        data?.response[0]?.packageInfo?.packages[0]?.durationCode || "-1",
      plan_name: data?.response[0]?.packageInfo?.packages[0]?.name || "-1",
      plan_amount:
        data?.response[0]?.packageInfo?.packages[0]?.listPrice || "-1",
      plan_id: data?.response[0]?.packageInfo?.master?.id || "-1",
      coupon_code: userEnteredCouponValue,
      // source_url: "",
      cpCode: "freedom",
    };
    // if (userEnteredCouponValue != "" && applycoupeErrMsg?.status) {
    //   tempObj.coupon_code = userEnteredCouponValue;
    // }

    // console.log(tempObj);
    sendEvent("apply_coupon", tempObj);
  };

  const couponCodeError = (errMsg) => {
    setApplycoupeErrMsg(errMsg);
    setTimeout(() => {
      setApplycoupeErrMsg(null);
    }, 5000);
  };

  const how_It_Works = (event) => {
    event.preventDefault();
    let pop = {
      type: "how_It_Works",
      isActive: true,
      title1: Ordersummaryconstant[localLang]?.How_It_Works || "How it works?",
      title2: "",
      yesButton1: "Got It",
      yesButtonType: "primary",
      yesButtonTarget1: "onsubmitreport",
      noButton1: "",
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: false,
      reportLoopData: Ordersummaryconstant[localLang]?.How_It_Works_Loop || [
        "Enable Autopay by doing one-time intent or transaction.",
        "Once auto pay set up is successful, the subscription amount from your account will be deducted at the end of every billing cycle.",
        "You can revoke the auto renewal mandate anytime on your payment App or on Watcho.",
      ],
      closeTarget: handleClose,
      parentclassName: "how_It_Works",
    };
    setPopUpData(pop);
  };
  useEffect(() => {
    if (
      oderPaiDetails &&
      oderPaiDetails?.response &&
      oderPaiDetails?.response[0]?.packageInfo?.packages[0]?.durationCode
    ) {
      let tempdata =
        oderPaiDetails?.response[0]?.packageInfo?.packages[0]?.durationCode.split(
          ""
        );
      let durationCode = tempdata[tempdata.length - 1];
      let numDys = "";
      for (let i = 0; i < tempdata.length - 1; i++) {
        numDys += tempdata[i];
      }
      let showtext =
        durationCode == "D"
          ? "Days"
          : durationCode == "M"
            ? "Months"
            : durationCode == "Y"
              ? "Year"
              : durationCode == "H"
                ? "Hours"
                : undefined;
      setpackduration({
        duration: showtext,
        numDys: numDys,
      });
    }
  }, [oderPaiDetails]);
  return (
    <>
      {loader ? (
        <div className={styles.loader}>
          <Loader type="button" />
        </div>
      ) : (
        <div className={styles.order_summary_parent}>
          <div className={styles.backNav}>
            <img
              alt="back"
              onClick={handleBack}
              className={` ${styles.back}`}
              src={`${ImageConfig?.settings?.back}`}
            />{" "}
          </div>
          {oderPaiDetails && oderPaiDetails?.response && (
            <div className={styles.order_summary_container}>
              <div className={styles.order_summary_top}>
                <span>{Ordersummaryconstant[localLang]?.Order_Summary}</span>
                {/* <span>{Ordersummaryconstant[localLang]?.Price}</span> */}
              </div>
              <div className={styles.order_summary_body}>
                <div className={styles.order_summary_body_first}>
                  <p className={styles.label}>
                    {Ordersummaryconstant[localLang]?.Your_Plan}
                  </p>
                  <div className={styles.plan_info}>
                    <span className={styles.plan_info_Title}>
                      {" "}
                      {oderPaiDetails?.response[0]?.packageInfo?.master?.name}
                    </span>
                    <span className={styles.price}>
                      {
                        oderPaiDetails?.response[0]?.packageInfo?.packages[0]
                          ?.attributes?.CurrencySymbol?.value
                      }{" "}
                      &nbsp;
                      {
                        oderPaiDetails?.response[0]?.packageInfo?.packages[0]
                          ?.listPrice
                      }
                    </span>
                  </div>
                  {oderPaiDetails?.response[0]?.packageInfo?.master
                    ?.description && (
                    <p className={styles.label}>
                      {
                        oderPaiDetails?.response[0]?.packageInfo?.master
                          ?.description
                      }
                    </p>
                  )}
                  {freedomOdSryStaticPoints.length > 0 &&
                  oderPaiDetails?.response[0]?.packageInfo?.master
                    ?.packageType == "Recurring" ? (
                    <>
                      <div className={` ${styles.freedomOdSryStcPoi}`}>
                        {freedomOdSryStaticPoints.map((val, index) => {
                          return (
                            <div>
                              {" "}
                              <img
                                alt="payments"
                                className={` ${styles.back}`}
                                src={`${ThemeColor == "white" ? ImageConfig?.payments?.tickIcon_freedomtv_Black : ImageConfig?.payments?.tickIcon_freedomtv}`}
                                // src={`${ImageConfig?.payments?.tickIcon_freedomtv}`}
                              />{" "}
                              <span>{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : Object.keys(packduration).length &&
                    oderPaiDetails?.response[0]?.packageInfo?.master
                      ?.packageType == "Non Recurring" ? (
                    <p className={styles.label}>
                      {`${oderPaiDetails?.response[0]?.packageInfo.packages[0]?.attributes?.contentType?.value} ${!!oderPaiDetails?.response[0]?.packageInfo.packages[0]?.attributes?.contentType?.value ? "-" : ""} For ${packduration.numDys} ${packduration.duration}`}
                    </p>
                  ) : (
                    ""
                  )}
                </div>

                <div className={styles.order_summary_body_second}>
                  <div className={styles.plan_info}>
                    <span>
                      {Ordersummaryconstant[localLang]?.Do_You_Have_Coupon}
                    </span>
                    <span className={styles.viewCoupon}>
                      {" "}
                      {SystemConfig?.configs?.showViewCouponOrderSummary ==
                        "true" && Ordersummaryconstant[localLang]?.View_Coupons}
                    </span>
                  </div>
                  {/* <div className={styles.input_container}> */}
                  <div className={styles.formSection}>
                    <form
                      onSubmit={formHandler}
                      className={styles.input_container}
                    >
                      <div className={styles.input_div}>
                        <input
                          type="text"
                          id="couponinput"
                          className={`${styles.couponinput}  ${isapplycoupeapply ? styles.isCouponAply : ""}`}
                          ref={couponInput}
                          onChange={couponInputChange}
                          autoComplete="off"
                        />
                        {userEnteredCouponValue.length == 0 && (
                          <span className={styles.label}>
                            <img
                              src={`${ImageConfig?.payments?.hugeIconCouponMobile}`}
                            />{" "}
                            {
                              Ordersummaryconstant[localLang]
                                ?.Enter_Coupon_Code_GiftCode
                            }
                          </span>
                        )}
                      </div>
                      <div>
                        <button
                          className={`${styles.apply_btn} primary`}
                          type="submit"
                          disabled={applyLoader}
                        >
                          {applyLoader ? (
                            <span className={styles.applyLoader}>
                              <Loader type="button" />
                            </span>
                          ) : (
                            <>
                              {!!isapplycoupeapply
                                ? "Remove"
                                : Ordersummaryconstant[localLang]?.Apply}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    {applycoupeErrMsg != null && (
                      <span
                        className={`${styles.couponMsg} ${applycoupeErrMsg?.status && styles.sucCouponMsg}`}
                      >
                        {applycoupeErrMsg?.msg}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.order_summary_body_first}>
                  {oderPaiDetails?.response[0]?.packageInfo?.master
                    ?.packageType == "Recurring" && (
                    <div className={styles.checkboxContainer}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          defaultChecked
                          checked={true}
                        />
                        <span className={styles.text}>
                          {
                            Ordersummaryconstant[localLang]
                              ?.Auto_Renew_Subscription
                          }
                        </span>
                      </label>
                      <a
                        href="#"
                        className={styles.howItWorks}
                        onClick={how_It_Works}
                      >
                        {Ordersummaryconstant[localLang]?.How_It_Works}
                      </a>
                    </div>
                  )}
                  <div className={styles.plan_info}>
                    <div className={styles.rentAmountContainer}>
                      <span className={`${styles.rentLabel} ${getTypePayment}`}>
                        {getTypePayment == "subscribe"
                          ? Ordersummaryconstant[localLang]
                              ?.Total_Subscribe_Amount
                          : Ordersummaryconstant[localLang]?.Total_Rent_Amount}
                      </span>
                      <span
                        className={`${styles.rentSubLabel} ${styles.label}`}
                      >
                        {Ordersummaryconstant[localLang]?.Inclusive_Of_Taxes}
                      </span>
                    </div>
                    <div>
                      <span
                        key={"oderPrice"}
                        className={`${styles.price} ${couponCodeData != null && styles.afterprice}`}
                      >
                        {
                          oderPaiDetails?.response[0]?.packageInfo?.packages[0]
                            ?.attributes?.CurrencySymbol?.value
                        }{" "}
                        &nbsp;
                        {
                          oderPaiDetails?.response[0]?.packageInfo?.packages[0]
                            ?.salePrice
                        }
                      </span>
                      {couponCodeData != null && (
                        <span
                          key={"oderPriceAfter"}
                          className={`${styles.price}`}
                        >
                          &nbsp;
                          {couponCodeData?.finalTxnAmount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.order_summary_body_bottom}>
                  <div className={styles.total_amount}>
                    <span>
                      {Ordersummaryconstant[localLang]?.Select_An_Option_To_Pay}
                    </span>
                    {oderPaiDetails?.response[0]?.supportedGateway?.map(
                      (eachGateWay) => {
                        const { name, code, iconUrl, description } =
                          eachGateWay;
                        return (
                          <div key={name}>
                            <label className={styles.paymentOption}>
                              <input
                                type="radio"
                                name={name}
                                className={styles.radioInput}
                                value={code}
                                // onChange={paymentGatewayRadioHandler(
                                //   eachGateWay
                                // )}
                                checked={true}
                              />
                              <div className={styles.content}>
                                <span className={styles.title}>
                                  {
                                    Ordersummaryconstant[localLang]
                                      ?.Payment_Gateway
                                  }
                                </span>
                                <span className={styles.description}>
                                  {
                                    Ordersummaryconstant[localLang]
                                      ?.Payment_Gateway_for_Subscription
                                  }
                                </span>
                              </div>
                            </label>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <button
                    type="button"
                    className={`${styles.proceed_pay} primary`}
                    onClick={() => {
                      // router.replace("/buy/payment-status");
                      callOderSummary();
                    }}
                    disabled={proceedToPayLoader}
                  >
                    {proceedToPayLoader ? (
                      <span className={styles.applyLoader}>
                        <Loader type="button" />
                      </span>
                    ) : (
                      <>
                        {Ordersummaryconstant[localLang]?.Proceed_To_Pay}{" "}
                        {couponCodeData != null ? (
                          couponCodeData?.subTotal
                        ) : (
                          <>
                            {
                              oderPaiDetails?.response[0]?.packageInfo
                                ?.packages[0]?.attributes?.CurrencySymbol?.value
                            }{" "}
                            &nbsp;
                            {
                              oderPaiDetails?.response[0]?.packageInfo
                                ?.packages[0]?.listPrice
                            }
                          </>
                        )}
                      </>
                    )}
                  </button>
                  {oderPaiDetails?.response[0]?.packageInfo?.master
                    ?.packageType == "Recurring" && couponCodeData?.couponInfo?.fullDiscountMessage && (
                    <p className={`${styles.noteReport}`}>
                      {/* Note :-{" "} */}
                      <span>
                        {couponCodeData?.couponInfo?.fullDiscountMessage}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {popupData.isActive && popupData.type != "how_It_Works" && (
        <PopupModal popupData={popupData}></PopupModal>
      )}
      {popupData.isActive && popupData.type == "how_It_Works" && (
        <OverlayPopupModal popupData={popupData} />
      )}
    </>
  );
}
