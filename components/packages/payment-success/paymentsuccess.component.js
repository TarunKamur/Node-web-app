import React, { useState, useRef, useEffect } from "react";
import { actions, useStore } from "@/store/store";
import { Paymentconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import { useRouter } from "next/router";
import styles from "./paymentsuccess.module.scss";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import {
  getPagePath,
  getQueryParams,
  jsonToQueryParams,
} from "@/services/utility.service";
import {
  clearStorage,
  deleteItem,
  getItem,
} from "@/services/local-storage.service";
// import { setItem } from "@/services/local-storage.service";

import {
  decryptData,
  encryptData,
  fromStyle,
  validateE,
  validateM,
} from "@/services/utility.service";
import Loader from "@/components/loader/loader.component";
import { sendEvent } from "@/services/analytics.service";
import { getDeviceId } from "@/services/data-manager.service";
function PaymentSuccess() {
  const paymentStatus = {
    success: ImageConfig?.payments?.subscriptionSuccessful,
    failure: ImageConfig?.payments?.paymentFailure,
  };
  const {
    state: {
      paymentResponse,
      navigateFrom,
      localLang,
      SystemConfig,
      SystemFeature,
      PageData
    },
    dispatch,
  } = useStore();
  const isUtUser = getItem("isUtuser");
  const { mutate: mutateJustPayCheckApi, data: justPayCheckApi } =
    usePostApiMutate();
  const { mutate: mutateGetUData, data: apiUResponse } = useGetApiMutate();

  const [pagePath, setPagePath] = useState({});
  const [onsuccess, setOnsuccess] = useState("");
  const [onfailure, setOnfailure] = useState("");
  const router = useRouter();
  const [loader, setLoader] = useState(true);
  const [targetPath, setTargetPath] = useState(null);

  useEffect(() => {
    const fetchPathData = async () => {
      const pPath = router.asPath;
      const path = {
        path: await getPagePath(pPath),
        query: await getQueryParams(pPath),
      };
      setPagePath(path);
    };

    fetchPathData();
  }, [router.asPath]);

  useEffect(() => {
    if (Object.keys(pagePath).length !== 0) {
      // console.log("pagePath", pagePath);
      let orderId = pagePath?.query?.order_id;
      let tvodData = JSON.parse(sessionStorage.getItem(`tvodData-orderId:${orderId}`));
      if (!!tvodData) {
        if (tvodData?.targetParams?.msg2) {
          let msg2Dup = tvodData?.targetParams?.msg2?.split("@@@");
          let dup = msg2Dup.map((item) =>
            item
              .replace("Start Date : ", "")
              .replace("End Date : ", "")
              .replace("Transaction Amount : ", "")
          );
          tvodData.startEndData = dup;
        }
        setOnsuccess(tvodData);
        setLoader(false);
      } else {
        callOderDetails();
      }
    }
  }, [pagePath]);

  const callOderDetails = async () => {
    let pacakageDetails = await JSON.parse(getItem("juspay_oi"));
    console.log(">>>>juspay_oi>>>>", pacakageDetails);
    setTargetPath(pacakageDetails);
    const data = {
      order_id: pagePath?.query?.order_id,
      gateway: "juspay",
      packages: pacakageDetails?.packageId,
      juspay_order_id: pagePath?.query?.mandate_id,
      customer_id: pagePath?.query?.signature,
    };
    if (SystemFeature?.encryptApisList?.fields?.payment == "true") {
      const encryptObj = {
        data: encryptData(JSON.stringify(data)),
        metadata: encryptData(JSON.stringify({ request: "payment/capture" })),
      };
      postPaymentData(
        `${process.env.initJson.api}/service/api/v1/send`,
        encryptObj
      );
    } else {
      postPaymentData(
        `${process.env.initJson.api}/payment/api/v1/payment/capture`,
        data
      );
    }
  };

  const postPaymentData = (url, apiData) => {
    mutateJustPayCheckApi(
      { url, apiData },
      {
        onSuccess: (response) => {
          setLoader(false);
          console.log(
            response?.data,
            "?>>>>>mutateDetails",
            response?.data?.response
          );
          if (response?.data?.status) {
            // setOnsuccess(response?.data?.response);
            getPaymentStatus(response?.data?.response);
            let responseData = response?.data?.response;
            if (responseData?.targetParams?.msg2) {
              let msg2Dup = responseData?.targetParams?.msg2.split("@@@");

              let dup = msg2Dup.map((item) =>
                item
                  .replace("Start Date : ", "")
                  .replace("End Date : ", "")
                  .replace("Transaction Amount : ", "")
              );
              responseData.startEndData = dup;
            }
            setOnsuccess(responseData);
            // analyticsData("success");
            console.log("responseData");
            // analyticsData("success", responseData);
          } else {
            setOnfailure(response?.data);
            // analyticsData("failed");
            // analyticsData("failed", response?.data);
            // console.log("response");
          }
        },
      }
    );
  };

  const analyticsData = async (status, data) => {
    let temporaryObject = (await getItem("payment-status")) || {};
    console.log(PageData);
    if (status == "success") {
      temporaryObject["start_date"] = onsuccess?.startEndData[0] || "-1";
      temporaryObject["end_date"] = onsuccess?.startEndData[1] || "-1";
      temporaryObject["channel_partner"] = PageData?.info?.attributes?.networkName || "-1";
      sendEvent("Purchase", temporaryObject);
    } else if (status == "failed") {
      sendEvent("payment_failed", temporaryObject);
    }

    // setTimeout(() => {
    //   deleteItem("payment-status");
    // }, 20000);
  };

  const getPaymentStatus = (Response) => {
    switch (Response.status) {
      case "F":
        setOnfailure(Response);
        // analyticsData("failed");
        // analyticsData("failed", Response);
        break;
      case "S":
        setOnsuccess(Response);
        // analyticsData("success");
        // analyticsData("success", Response);
        break;
      case "P": //failure
        setOnfailure(Response);
        // analyticsData("failed");
        // analyticsData("failed", Response);
        break;
    }
  };

  const handleBack = () => {
    console.log("navigateFrom",navigateFrom);
    let deviceId = getDeviceId();
    if (isUtUser && deviceId == 40) {
      clearStorage();
      setTimeout(() => {
        window.location.href = SystemConfig.configs.siteURL;
      }, 100);
    } else if (isUtUser) {
      window.location.href = SystemConfig.configs.siteURL;
    } else if (!!targetPath?.tragetPath) {
      if (!!onfailure) {
        window.location.href = targetPath?.tragetPathFull;
      } else {
        window.location.href = "/" + targetPath.tragetPath;
      }
    } else if (!!navigateFrom) {
      // console.log(navigateFrom,window.location);
      // dispatch({ type: actions.navigateFrom, payload: null });
      // router.push(navigateFrom);
      let temp = navigateFrom;
      if (!navigateFrom.startsWith("/")) {
        temp = "/" + navigateFrom;
      }
      window.location.href = temp;
    } else {
      // router.replace("/home");
      window.location.href = "/";
    }
  };

  useEffect(() => {
    if (!loader) {
      if (!!onfailure || !onsuccess?.targetParams?.msg1) {
        analyticsData("failed");
      } else {
        analyticsData("success");
      }
      console.log("false");
    }
    // console.log("true")
  }, [onfailure, onsuccess, loader]);

  return (
    <div>
      {loader ? (
        <div className={styles.loader}>
          <Loader type="button" />
        </div>
      ) : (
        <div className={`${styles.payment_success_containerparent}`}>
          <div className={`${styles.payment_success_container}`}>
            <div className={`${styles.payment_success_inner}`}>
              {!!onfailure || !onsuccess?.targetParams?.msg1 ? (
                <img
                  src={`${paymentStatus?.failure}`}
                  key={"failure"}
                  alt="payment-failure"
                />
              ) : (
                <img
                  src={`${paymentStatus?.success}`}
                  key={"success"}
                  alt="payment-success"
                />
              )}

              {!!onsuccess && onsuccess?.targetParams?.msg1 && (
                <>
                  {/* {console.log(onsuccess)} */}
                  <h1 className={`${styles.message1}`}>
                    {Paymentconstant?.[localLang]?.Hurray}
                  </h1>
                  <p className={`${styles.message2}`}>
                    {/* {Paymentconstant?.[localLang]?.You_have_now_BuyRent_to}
                <span className={styles.seriesname}> Sapne vs Everyone </span>
                {Paymentconstant?.[localLang]?.Series} */}
                    {onsuccess?.targetParams?.msg1}
                  </p>
                  <div className={styles.restmsgs}>
                    <p>
                      {Paymentconstant?.[localLang]?.Start_Date}:{" "}
                      {onsuccess?.startEndData?.length > 0
                        ? onsuccess?.startEndData[0]
                        : ""}
                    </p>
                    <p>
                      {Paymentconstant?.[localLang]?.End_Date}:{" "}
                      {onsuccess?.startEndData?.length > 0
                        ? onsuccess.startEndData[1]
                        : ""}
                    </p>
                    <p className={styles.addspace}>
                      {Paymentconstant?.[localLang]?.Order_ID}:{" "}
                      {onsuccess?.orderId}
                    </p>
                    <p>
                      {Paymentconstant?.[localLang]?.Transaction_Amount}:{" "}
                      {onsuccess?.startEndData?.length > 0
                        ? onsuccess?.startEndData[2]
                        : ""}
                    </p>
                  </div>
                </>
              )}
              {(!!onfailure || !onsuccess?.targetParams?.msg1) && (
                <>
                  <h1 className={`${styles.message1}`}>
                    {Paymentconstant?.[localLang]?.Oh_on_Payment_Failed}
                  </h1>
                  <h1 className={`${styles.message2}`}>
                    {onfailure?.error?.message ||
                      Paymentconstant?.[localLang]?.sorry_thisPaymen}
                  </h1>
                </>
              )}
              <div className={`${styles.btn_wrap}`}>
                <button
                  type="button"
                  className={`${styles.btn}`}
                  onClick={handleBack}
                >
                  {!!onfailure
                    ? Paymentconstant?.[localLang]?.try_again
                    : Paymentconstant?.[localLang]?.Okay}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentSuccess;
