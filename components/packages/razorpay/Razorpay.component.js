/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { appConfig } from "@/config/app.config";
import { getDateByEpoc } from "@/services/utility.service";
import { actions, useStore } from "@/store/store";
import usePostApiMutate from "@/hooks/usePostApidata";
import useGetApiMutate from "@/hooks/useGetApidata";
import { useRouter } from "next/router";
import { Paymentconstant } from "@/.i18n/locale";
import useUserDetailsUpdate from "@/hooks/useUserDetailsUpdate";
import { ImageConfig } from "@/config/ImageConfig";
import { getNewConfigdata } from "@/services/user.service";

const Razorpay = ({
  razorpayData,
  activePackage,
  paymentCancelled,
  isPaymentPending,
}) => {
  const {
    state: { SystemConfig, userDetails, localLang },
    dispatch,
  } = useStore();
  const { mutate: mutateRazorPayment, data: razorPaymentCaptureResponse } =
    usePostApiMutate();
  const { mutate: mutateRazorCheckPayment, data: razorPaymentCheckResponse } =
    useGetApiMutate();
  const [razorpayResp, setRazorPayResponse] = useState({});
  const [timerCount, setTimerCount] = useState(0);
  const checkOrderTimer = useRef();
  const router = useRouter();
  const { updateUser } = useUserDetailsUpdate();

  // Initiate razorpay sdk
  useEffect(() => {
    displayRazorpay();
  }, []);

  // To check the payment status at our end
  useEffect(() => {
    if (razorPaymentCaptureResponse && razorPaymentCaptureResponse.status) {
      checkOrder();
    }
  }, [razorPaymentCaptureResponse]);

  useEffect(() => {
    if (razorpayResp && razorpayResp?.isCallCapture == false) {
      checkOrder();
    }
  }, [razorpayResp]);

  // To handle payment status
  useEffect(() => {
    if (razorPaymentCheckResponse && razorPaymentCheckResponse.status) {
      let dataResponse = razorPaymentCheckResponse.data.response;

      // setting payment response to context
      if (razorPaymentCheckResponse.data) {
        dispatch({
          type: actions.paymentResponse,
          payload: razorPaymentCheckResponse.data,
        });
      }

      // payment pending case
      if (dataResponse?.status?.toLowerCase() == "p") {
        // setting backdrop as loader
        isPaymentPending(true);
        checkOrderTimer.current = setTimeout(() => {
          setTimerCount((prevCount) => prevCount + 5000);
          reCheckOrder(dataResponse.orderID);
        }, 5000);
      }
      // payment success case
      else if (
        dataResponse?.status.toLowerCase() == "s" ||
        dataResponse?.status.toLowerCase() == "e"
      ) {
        updateUser();
        getNewConfigdata();
        router.push("/buy/payment-success");
      } else {
        router.push("/buy/payment-failure");
      }
    }
  }, [razorPaymentCheckResponse]);

  // Check the payment at our end with razorpay orderId
  const checkOrder = () => {
    let url = `${process.env.initJson.api}/payment/api/v1/order/status?order_id=${razorpayResp.order_id}`;
    mutateRazorCheckPayment(url);
  };

  // Rechecking order incase of pending for 1 min
  const reCheckOrder = (orderID) => {
    setTimerCount((prevCount) => prevCount + 5000);
    if (timerCount < 6000) {
      // check for 1 minute.
      checkOrder(orderID);
    } else {
      isPaymentPending(false);
      clearTimeout(checkOrderTimer.current);
      // redirecting to payment failure
      const paymentFailureResponse = {
        response: {
          targetParams: {
            msg1: activePackage.supportedGateway[0].name,
            msg2: Paymentconstant[localLang].Transaction_Failed,
            buttonText: Paymentconstant[localLang].Retry,
          },
        },
      };
      dispatch({
        type: actions.paymentResponse,
        payload: paymentFailureResponse,
      });
      router.push("/buy/payment-failure");
    }
  };

  // attaching razorpay script to dom
  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // razorpay initiation
  const displayRazorpay = async () => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert(
        "Razorpay SDK failed to load. Please check your internet connection."
      );
      return;
    }

    if (razorpayData?.isCaptureCall) {
      const payDetails = {
        key:
          process.env.environment == "beta"
            ? SystemConfig.configs.rpayTestId
            : SystemConfig.configs.rpayLiveId,
        amount: razorpayData.targetParams.amount,
        name: activePackage.packageInfo.master.name,
        email: userDetails.email,
        description: `Valid till ${getDateByEpoc(
          activePackage.packageInfo?.packages?.[
            activePackage.activ_pkg_indx || 0
          ]?.expiryDate
        )}`,
        image: ImageConfig?.payments?.logo,
        modal: { escape: false },
        prefill: {
          name: userDetails.firstName
            ? userDetails.firstName
            : userDetails.name,
          contact: userDetails.phoneNumber,
          email: userDetails.email,
        },
        notes: { name: appConfig?.appName },
        theme: { color: Paymentconstant.eng.RazorpayColorCode },
      };

      if (razorpayData.targetParams.razorpay_order_id) {
        payDetails.order_id = razorpayData.targetParams.razorpay_order_id;
      } else {
        payDetails.subscription_id =
          razorpayData.targetParams.razorpay_subscription_id;
      }

      payDetails.handler = (response) => {
        let razorPayResponsedata = {
          order_id: razorpayData.orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };

        if (razorpayData.targetParams.razorpay_order_id) {
          razorPayResponsedata.razorpay_order_id =
            razorpayData.targetParams.razorpay_order_id;
        } else {
          razorPayResponsedata.razorpay_subscription_id =
            razorpayData.targetParams.razorpay_subscription_id;
        }
        // eslint-disable-next-line no-unused-expressions
        isPaymentPending && isPaymentPending(true); // to enable loader
        paymentCapture(razorPayResponsedata);
        setRazorPayResponse(razorPayResponsedata);
      };
      payDetails.modal.ondismiss = () => {
        // This function will be called when the user dismisses the Razorpay modal
        paymentCancelled();
      };

      const paymentObject = new window.Razorpay(payDetails);
      paymentObject.open();
    } else {
      setRazorPayResponse({
        order_id: razorpayData.orderId,
        isCallCapture: false,
      });
    }
  };

  const paymentCapture = (apiData) => {
    let url = `${process.env.initJson.api}/payment/api/v1/payment/capture`;
    mutateRazorPayment({ url, apiData });
  };

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
};
export default Razorpay;
