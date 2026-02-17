import styles from "@/components/settings/subscriptions.module.scss";
import { actions, useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import useGetApiMutate from "@/hooks/useGetApidata";
import { appConfig } from "@/config/app.config";
import { deleteItem, getItem, setItem } from "@/services/local-storage.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { Subscriptionconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { sendEvent } from "@/services/analytics.service";
import { getPlansDetails } from "@/services/utility.service";
const SubscrptionModal = dynamic(
  () => import("../popups/subscription-popup/subscriptionModal-modal")
);
export default function SubscitpionList({ showButton }) {
  const {
    state: { userDetails, SystemConfig, localLang, Location },
    dispatch,
  } = useStore();
  const {
    mutate: mutateGetsubData,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const { mutate: unSubscribeApi, data: unSunscribeApiResponse } =
    usePostApiMutate();
  const { mutate: reSubscribeApi, data: reSunscribeApiResponse } =
    usePostApiMutate();
  const {
    mutate: unSubscribeApiInternational,
    data: unSubscribeApiInternationalResponse,
  } = useGetApiMutate();
  const unsubscribebtnIndexRef = useRef(null);
  const refetchUser = useRef(false);
  const [subslist, setSubsList] = useState([]);
  const [utPaymentUp, setUtPaymentUp] = useState(true);
  const [popupData, setPopUpData] = useState({});
  const router = useRouter();
  const [showUnsubScribeBtn, setShowUnsubScribeBtn] = useState(true);

  useEffect(() => {
    if (!!userDetails && refetchUser.current == false) {
      refetchUser.current = true;
      getUserSubscriptions();
    }
  }, [userDetails]);

  useEffect(() => {
    if (!!userDetails && localLang && getItem("langchanged") == true) {
      getUserSubscriptions();
      deleteItem("langchanged");
    }
  }, [localLang]);

  useEffect(() => {
    if (!!apiResponse) {
      setSubsList(
        apiResponse.data.response.map((item) => ({
          ...item,
          UnsubscribeBtnshow: true,
        }))
      );
      // const existingItems = apiResponse.data.response;

      // const duplicatedItems = Array(3) // number of times you want to repeat
      //   .fill(existingItems[0])       // take the first item
      //   .map(item => ({
      //     ...item,
      //     UnsubscribeBtnshow: true
      //   }));

      // setSubsList(duplicatedItems);
      // console.log(apiResponse.data.response)
      showButton(apiResponse.data.response);
      setItem("activePackagesList", {
        expiry: new Date().getTime() + 2 * 60 * 60 * 1000,
        data: apiResponse?.data?.response,
      });
      dispatch({
        type: actions.ActivePackages,
        payload: apiResponse.data.response,
      });
    }
  }, [apiResponse]);

  useEffect(() => {
    if (!!reSunscribeApiResponse) {
      if (reSunscribeApiResponse.data.response) {
        let pop = {
          isActive: true,
          title1: reSunscribeApiResponse.data.response?.msg1,
          warning: "Are you sure you want to unsubscribe?",
          Des: reSunscribeApiResponse.data.response?.msg2,
          yesButton2: "OK",
          yesButtonType: "primary",
          yesButtonTarget2: closePopup,
          close: true,
          closeTarget: closePopup,
          successImg: true,
        };
        setPopUpData(pop);
      } else {
        let pop = {
          isActive: true,
          title1: reSunscribeApiResponse?.data?.error?.message,
          Des: reSunscribeApiResponse?.data?.error?.details?.msg1,
          yesButton2: "OK",
          yesButtonType: "primary",
          yesButtonTarget2: handleClose,
          close: true,
          closeTarget: handleClose,
          failureImg: true,
        };
        setPopUpData(pop);
      }
    }
  }, [reSunscribeApiResponse]);

  useEffect(() => {
    if (!!unSunscribeApiResponse) {
      if (unSunscribeApiResponse.data.response) {
        sendEvent("unsubscribe_completed", getPlansDetails());
        let pop = {
          isActive: true,
          title1: "Your subscription has been cancelled successfully",
          yesButton2: "OK",
          yesButtonType: "primary",
          yesButtonTarget2: closePopup,
          close: true,
          closeTarget: closePopup,
          successImg: true,
        };
        setPopUpData(pop);
      } else {
        let pop = {
          isActive: true,
          title1: unSunscribeApiResponse?.data?.error?.message,
          Des: unSunscribeApiResponse?.data?.error?.details?.msg1,
          yesButton2: "OK",
          yesButtonTarget2: handleClose,
          close: true,
          closeTarget: handleClose,
          failureImg: true,
        };
        setPopUpData(pop);
      }
    }
  }, [unSunscribeApiResponse]);

  useEffect(() => {
    if (!!unSubscribeApiInternationalResponse) {
      if (unSubscribeApiInternationalResponse?.data?.status) {
        sendEvent("unsubscribe_completed", getPlansDetails());
        const packindex = unsubscribebtnIndexRef.current;
        const updatedList = subslist.map((item, index) =>
          index === packindex ? { ...item, UnsubscribeBtnshow: false } : item
        );
        setSubsList(updatedList);
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              unSubscribeApiInternationalResponse?.data?.response?.message ||
              "",
          },
        });
        // getUserSubscriptions();
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              unSubscribeApiInternationalResponse?.data?.error?.message ||
              "Some thing went wrong",
          },
        });
      }
    }
  }, [unSubscribeApiInternationalResponse]);

  const closePopup = () => {
    getUserSubscriptions();
    setPopUpData({});
  };

  const getUserSubscriptions = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/user/activepackages";
    mutateGetsubData(url);
  };

  const subscriptionHandler = (pack) => {
    sendEvent("unsubscribe_initiate", getPlansDetails(true));
    let date = new Date(+pack?.expiryDate);
    const {
      We_will_stop_your_recurring_payment_from,
      The_day_your_current_active_package_ends,
    } = Subscriptionconstant[localLang];
    let pop = {
      isActive: true,
      title1: Subscriptionconstant[localLang].Cancel_Subscription,
      warning:
        Subscriptionconstant[localLang].Are_you_sure_you_want_to_unsubscribe,
      Des: `${We_will_stop_your_recurring_payment_from} ${date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear()}( ${The_day_your_current_active_package_ends})`,
      yesButton1: Subscriptionconstant[localLang].Yes,
      yesButtonType: "primary",
      yesButtonTarget1: () => proceedToUnsubscribe(pack),
      noButton1: Subscriptionconstant[localLang].Cancel,
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const proceedToUnsubscribe = (packageData) => {
    console.log(packageData);
    if (
      Location?.ipInfo?.countryCode !== "IN" ||
      Location?.ipInfo?.countryCode !== "US"
    ) {
      let subPlanId = packageData?.customAttributes?.externalPackageId || "";
      let orderid = packageData.orderId;
      let url =
        process.env.initJson["api"] +
        "/service/api/v1/cancel/international/subscription?ottsmsid=" +
        userDetails.externalUserId +
        "&mobile=" +
        userDetails.phoneNumber +
        "&subs_plan_id=" +
        subPlanId +
        "&order_id=" +
        orderid;
      try {
        unSubscribeApiInternational(url);
      } catch (e) {
      } finally {
        setPopUpData({});
      }
      sendEvent("unsubscribe_yes", getPlansDetails());
    } else {
      let apiData = new FormData();
      apiData.append("package_id", packageData.id);
      apiData.append("gateway", packageData.gateway);
      let url =
        process.env.initJson["api"] + "/payment/api/v1/cancel/subscription";
      try {
        unSubscribeApi({ url, apiData });
      } catch (e) {}
      sendEvent("unsubscribe_yes", getPlansDetails());
    }
  };

  const handleClose = () => {
    setPopUpData({});
    sendEvent("unsubscribe_no", getPlansDetails(true));
  };

  const reSubscribeHandler = (packageData) => {
    let pop = {
      isActive: true,
      title1: "Resubscribe",
      subTitle: "Please click on 'Confirm' to Resubscribe",
      yesButton1: "Confirm",
      yesButtonType: "primary",
      yesButtonTarget1: () => proceedToResubscribe(packageData),
      noButton1: "Cancel",
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const proceedToResubscribe = (packageData) => {
    let apiData = { order_id: packageData.orderId };
    let url =
      process.env.initJson["api"] + "/payment/api/v1/package/resubscribe";
    try {
      reSubscribeApi({ url, apiData });
    } catch (e) {}
  };

  //need to implement this, for now setting utPaymentUp to true
  function web_setting_config_change() {
    let isUtuser = getItem("isUtuser");
    let web_setting_config = SystemConfig?.web_setting_config;
    if (!!isUtuser) {
      // let deviceType = this.ottGlobalService.recoverDeID(this.userService.getDeviceId()) ;
      let app_version = getItem("app-version");
      //ios
      // if(deviceType == 'iphone' || this.deviceType == 'ipad'){
      //   if( !!web_setting_config && !!web_setting_config.ios_pay_app && web_setting_config.ios_pay_app.length){
      //     if(web_setting_config["ios_pay_app"].includes(app_version)){
      //       setUtPaymentUp(false);
      //       return;
      //     }
      //   }
      // }
      //andriod
      // else if(deviceType == 'andriod')  {
      //   if(!.web_setting_config && !!web_setting_config.android_pay_app && web_setting_config.android_pay_app.length){
      //     if(web_setting_config["android_pay_app"].includes(app_version)){
      //       setUtPaymentUp(false);
      //       return;
      //     }
      //   }
      // }
      setUtPaymentUp(true);
    } else {
      setUtPaymentUp(true);
    }
  }

  const transactionRedirection = () => {
    let isUtuser = getItem("isUtuser");
    sendEvent("transaction_history", getPlansDetails());
    if (!!isUtuser && appConfig.settings.transaction === 2) {
      window.open(
        SystemConfig.configs.siteURL + "openlink?redirect=/transaction",
        "_self"
      );
    } else {
      router.push("/transaction");
    }
    // sendEvent("transaction_history", getPlansDetails());
  };

  const unsubScribe = (pack, index) => {
    sendEvent("unsubscribe_initiate", getPlansDetails(true));
    unsubscribebtnIndexRef.current = index;
    let date = new Date(+pack?.expiryDate);
    let pop = {
      isActive: true,
      title1: "UnSubscription",
      warning: "Are you sure you want to unsubscribe?",
      Des: `We will stop your recurring payment from ${date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear()}( the day your current active package ends)`,
      yesButton1: "Yes",
      yesButtonType: "primary",
      yesButtonTarget1: () => proceedToUnsubscribe(pack),
      noButton1: "Cancel",
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };
  return (
    <>
      <div className={`${styles.subscriptions_list}`}>
        {!!userDetails && subslist?.length == 0 ? (
          <div className={`${styles.details_hd}`}>
            {
              Subscriptionconstant[localLang]
                .You_Do_not_have_an_active_subscription
            }
          </div>
        ) : (
          <div className={`${styles.packageInfo}`}>
            {subslist?.map((pack, i) => {
              return (
                <div className={`${styles.pack_block}`} key={i}>
                  <span className={`${styles.no_of_pack}`}>{i + 1}</span>
                  <div className={`${styles.clearfix}`}>
                    <span className={`${styles.pl_name}`}>
                      {pack.name}{" "}
                      {pack.packageType === "Annual" && (
                        <span> {Subscriptionconstant[localLang].Annual}</span>
                      )}
                      {/* {!!pack.isCurrentlyActivePlan && i == 0 && (
                        <span className={`${styles.plan_status}`}>
                          ({Subscriptionconstant[localLang].Current_Plan})
                        </span>
                      )} */}
                      {!pack.isCurrentlyActivePlan && (
                        <span className={`${styles.plan_status}`}>
                          {pack.effectiveFrom}
                        </span>
                      )}
                    </span>
                    {/* {!!appConfig?.settings?.unSubscribe &&
                      !pack.isUnSubscribed &&
                      utPaymentUp &&
                      (Location?.ipInfo?.countryCode === "IN" ||
                        Location?.ipInfo?.countryCode === "US") && (
                        <button
                          onClick={() => subscriptionHandler(pack)}
                          className={`${styles.link} ${styles.mobile_link}`}
                        >
                          {Subscriptionconstant[localLang].Cancel_Subscription}
                        </button>
                      )} */}

                    {/* {!!appConfig?.settings?.resubscribe &&
                      !!pack.showResubscribe &&
                      utPaymentUp &&
                      (Location?.ipInfo?.countryCode === "IN" ||
                        Location?.ipInfo?.countryCode === "US") && (
                        <button
                          onClick={() => reSubscribeHandler(pack)}
                          className={`${styles.web_link} ${styles.mobile_link}`}
                        >
                          {Subscriptionconstant[localLang].Resubscribe}
                        </button>
                      )} */}

                    {!!(
                      Location?.ipInfo?.countryCode !== "IN" &&
                      Location?.ipInfo?.countryCode !== "US"
                    ) &&
                      showUnsubScribeBtn &&
                      !pack?.customAttributes?.sentToCancellation &&
                      pack?.UnsubscribeBtnshow && (
                        <button
                          onClick={() => unsubScribe(pack, i)}
                          className={`${styles.unsubscribe_btn}`}
                        >
                          {Subscriptionconstant[localLang].Unsubscribe}
                        </button>
                      )}
                    {!!pack?.nextBillingInfo?.chargeAmt &&
                      (Location?.ipInfo?.countryCode === "IN" ||
                        Location?.ipInfo?.countryCode === "US") && (
                        <span className={`${styles.info}`}>
                          {!!pack.currencySymbol ? pack.currencySymbol : "₹"}
                          {pack?.nextBillingInfo?.chargeAmt} /{" "}
                          {pack.packageType}
                          {pack?.isFreeTrail && (
                            <b>
                              (
                              {
                                Subscriptionconstant[localLang]
                                  .After_the_free_trial
                              }
                              )
                            </b>
                          )}
                        </span>
                      )}
                    {!!!pack?.nextBillingInfo?.chargeAmt &&
                      (Location?.ipInfo?.countryCode === "IN" ||
                        Location?.ipInfo?.countryCode === "US") && (
                        <span className={`${styles.info}`}>
                          {!!pack.currencySymbol ? pack.currencySymbol : "₹"}
                          {pack.packageAmount === 0
                            ? pack.saleAmount
                            : pack.packageAmount}{" "}
                          / {pack.packageType}{" "}
                          {pack?.isFreeTrail && (
                            <b>
                              (
                              {
                                Subscriptionconstant[localLang]
                                  .After_the_free_trial
                              }
                              )
                            </b>
                          )}
                        </span>
                      )}
                  </div>
                  {(Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") && (
                    <div>
                      {!!pack.isRecurring ? (
                        <>
                          {!pack.isUnSubscribed ? (
                            <span className={`${styles.info}`}>
                              {pack.message}
                            </span>
                          ) : (
                            <span className={`${styles.info}`}>
                              {pack.message}
                            </span>
                          )}
                        </>
                      ) : (
                        <label className={`${styles.info}`}>
                          {pack.message}
                        </label>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {Location?.ipInfo?.countryCode === "IN" && (
          <div className={`${styles.trans_history}`}>
            <div onClick={() => transactionRedirection()}>
              <div className={`${styles.trans_text}`}>
                {Subscriptionconstant[localLang].Transaction_History}
              </div>
            </div>
          </div>
        )}
      </div>
      {popupData.isActive && (
        <SubscrptionModal popupData={popupData}></SubscrptionModal>
      )}
    </>
  );
}
