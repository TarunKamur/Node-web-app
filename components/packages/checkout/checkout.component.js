import usePostApiMutate from "@/hooks/usePostApidata";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styles from "./checkout.module.scss";
import useGetApiMutate from "@/hooks/useGetApidata";
import {
  decryptData,
  encryptData,
  jsonToQueryParams,
} from "@/services/utility.service";
import {
  CardElement,
  CardNumberElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { getItem } from "@/services/local-storage.service";
import PageLoader from "@/components/loader/page-loder.component";
import { Checkoutconstant } from "@/.i18n/locale";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { ImageConfig } from "@/config/ImageConfig";
import useUserDetailsUpdate from "@/hooks/useUserDetailsUpdate";
import StripeAddressComponent from "./StripeAddress";
import { getNewConfigdata } from "@/services/user.service";

let stripePromise;

const CheckoutForm = (props) => {
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const [stripeRegulationError, setStripeRegulationError] = useState(false);
  const [addressFromData, setAddressFromData] = useState({});
  const [isPaydisabled, setPayDisabled] = useState(false);
  const { back } = useRouter();
  const { summary, checkoutdata } = props;
  const { push } = useRouter();
  const elements = useElements();
  const stripe = useStripe();
  const cardRef = useRef(null);
  const stripecardRef = useRef(null);
  const [errormsg, setErrormsg] = useState("");
  const { mutate: mutatePaymentCapture, data: paymentCaptureResponse } =
    usePostApiMutate();

  useEffect(() => {
    if (paymentCaptureResponse?.data?.status === true) {
      props.checkOrder(paymentCaptureResponse?.data?.response?.orderId);
    } else {
      // paymentErrorHandle(res['error'].message);
    }
  }, [paymentCaptureResponse]);

  useEffect(() => {
    if (elements) {
      const style = {
        base: {
          lineHeight: "24px",
          fontSmoothing: "antialiased",
          fontSize: "16px",
          fontFamily: "Poppins, sans-serif",
          paddingLeft: "40px",
          marginTop: "15px",
          "::placeholder": {
            color: "#999",
          },
          color: "#fff",
        },
      };
      stripecardRef.current = elements.create("card", { style });
      stripecardRef.current.addEventListener("change", ({ error }) => {
        // setErrormsg(error)
        error && error.message && setErrormsg(error.message);
        !error && setErrormsg("");
      });
      stripecardRef.current.mount(cardRef.current);
    }
  }, [elements]);
  const handleBack = () => {
    back();
  };

  const handlePayment = async (eve) => {
    eve.preventDefault();
    setLoading(true);
    setErrormsg("");
    if (!stripe || !elements) {
      return;
    }
    const addressData = {
      address: {
        line1: addressFromData?.address,
        city: addressFromData.city,
        state: addressFromData?.state,
        country: addressFromData?.country,
      },
    };
    const result = await stripe.confirmCardPayment(
      checkoutdata.response.targetParams.clientSecret,
      {
        payment_method: {
          card: stripecardRef.current,
          billing_details: {
            name: addressFromData?.name,
            // need to submit billing details and shipping details if purchased from INDIA
            ...(stripeRegulationError && { ...addressData }),
          },
        },
        ...(stripeRegulationError && {
          shipping: {
            name: addressFromData?.name,
            ...addressData,
          },
        }),
      }
    );

    if (result.error) {
      setLoading(false);
      const errorMsg = result.error.message;
      const addressMandatory =
        "As per Indian regulations, export transactions require a customer name and address.";
      if (errorMsg.includes(addressMandatory)) {
        setStripeRegulationError(true);
        setErrormsg(addressMandatory);
        setPayDisabled(true);
      } else if (errorMsg) {
        setErrormsg(errorMsg);
      }
    } else if (result.paymentIntent.status === "succeeded") {
      if (checkoutdata.response.targetParams.isCaptureCall) {
        let postData = {
          paymentintent_id: checkoutdata.response.targetParams.paymentIntentId,
          order_id: checkoutdata.response.orderId,
          customerId: checkoutdata.response.targetParams.customerId,
          address: "",
          postalCode: "",
          country: "",
        };
        paymentCapture(postData); // capture payments
      }
    }
  };

  const paymentCapture = (data) => {
    let url = process.env.initJson["api"] + "/payment/api/v1/payment/capture";
    try {
      mutatePaymentCapture({ url, apiData: data });
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      {/* <PaymentElement /> */}
      {/* <CardElement options={{
        layout: "tabs",
      }} styles={{ color: '#fff' }} ref={cardRef}/> */}
      <div ref={cardRef} />
      {stripeRegulationError && (
        <StripeAddressComponent
          stripeErrorStatus={stripeRegulationError}
          formData={setAddressFromData}
          setPayDisabledProp={setPayDisabled}
        />
      )}
      <div className={`${styles.stripe_btns_footer}`}>
        <div className={`${styles.btns}`}>
          <button
            type="button"
            className={`${styles.btn}`}
            onClick={handleBack}
          >
            Back
          </button>
          <button
            className={`${styles.btn} primary ${isPaydisabled || checkoutdata?.error?.code === -1 ? styles.disabled : ""}`}
            type="submit"
            disabled={!stripe || isPaydisabled}
          >
            {Checkoutconstant[localLang].PAY}
            {summary?.subTotal}
          </button>
        </div>
        <div className={styles.checkout_err_msg}>
          {checkoutdata && checkoutdata.error && checkoutdata.error.message}
        </div>
        <div className={styles.checkout_err_msg}>{errormsg && errormsg}</div>
      </div>
      {loading && <PageLoader />}
    </form>
  );
};

export default function CheckOut() {
  const {
    state: { Session, userDetails, packageUtil, SystemFeature, localLang },
    dispatch,
  } = useStore();
  const { mutate: mutatePostorderSummary, data: orderSummaryResponse } =
    usePostApiMutate();
  const { mutate: mutateCheckout, data: checkoutResponse } = usePostApiMutate();
  const { mutate: mutateCheckoutEncrypted, data: checkoutResponseEncrypted } =
    usePostApiMutate();
  const { mutate: mutateGetPackagesData, data: packageapiResponse } =
    useGetApiMutate();
  const { mutate: getOrderStatus, data: OrderStatusResponse } =
    useGetApiMutate();
  const { query, back } = useRouter();
  const [summary, setSummary] = useState();
  const [checkoutdata, setCheckoutData] = useState();
  const [stripeOptions, setStripeOptions] = useState();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const checkOrderTimer = useRef();
  const [timerCount, setTimerCount] = useState(0);
  const { updateUser } = useUserDetailsUpdate();

  useEffect(() => {
    let stripe_key = getItem("systemConfigs")?.data.configs.stripeKey;
    stripePromise = loadStripe(stripe_key);
    return () => {
      stripePromise = undefined;
    };
  }, []);

  useEffect(() => {
    if (!!userDetails) {
      if (packageUtil && packageUtil.packages_data) {
        if (!packageUtil.packages_data || !packageUtil.order_summary) {
          getPackages();
        } else {
          setSummary(packageUtil.order_summary);
          let params = {
            gateway: getPackagegateway(packageUtil.packages_data, query.pid[0]),
            packages: query.pid[0],
          };
          checkOutapi(params);
        }
      }
      // passing path and package type in query object "STRIPE gateway" rent package payment
      else if (router.query.gateway == "stripe") {
        getRentPackage();
      } else {
        getPackages();
      }
    }
  }, [userDetails, packageUtil]);

  const getRentPackage = () => {
    let params = {
      skip_package_content: true,
      ...router.query,
    };
    const url = `${process.env.initJson.api}${process.env.packageURL}packages/info/for/content?${jsonToQueryParams(params)}`;
    try {
      mutateGetPackagesData(url);
    } catch (e) {}
  };

  useEffect(() => {
    if (packageapiResponse && packageapiResponse.data) {
      if (packageapiResponse?.data?.status) {
        let params = {
          gateway: getPackagegateway(packageapiResponse.data, query.pid[0]),
          packages: query.pid[0],
        };
        getOrderSummary(params);
      } else if (
        packageapiResponse?.data?.error &&
        packageapiResponse?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      }
    }
  }, [packageapiResponse]);

  useEffect(() => {
    if (OrderStatusResponse?.data) {
      dispatch({
        type: actions.paymentResponse,
        payload: OrderStatusResponse.data,
      });
    }
    if (OrderStatusResponse?.data?.status === true) {
      if (OrderStatusResponse.data.response.status.toLowerCase() == "p") {
        checkOrderTimer.current = setTimeout(() => {
          setTimerCount((prevCount) => prevCount + 5000);
          reCheckOrder(dataResponse.orderID);
        }, 5000);
      } else if (
        OrderStatusResponse.data.response.status.toLowerCase() == "s" ||
        OrderStatusResponse.data.response.status.toLowerCase() == "e"
      ) {
        updateUser();
        getNewConfigdata();
        router.push("/buy/payment-success");
      } else {
        // paymentErrorHandle(OrderStatusResponse.data.message);
      }
    } else {
      // paymentErrorHandle(OrderStatusResponse.data.error.message);
    }
  }, [OrderStatusResponse]);

  const checkOrder = (orderID) => {
    let url =
      process.env.initJson["api"] +
      "/payment/api/v1/order/status?order_id=" +
      orderID;
    try {
      getOrderStatus(url);
    } catch (e) {
      setLoading(false);
    }
  };

  // Rechecking order incase of pending for 1 min
  const reCheckOrder = (orderID) => {
    setTimerCount((prevCount) => prevCount + 5000);
    if (timerCount < 60000) {
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
            redirectUrl: router.pathname,
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
  const checkOutResponseHandling = (checkoutResponse) => {
    if (checkoutResponse?.data?.status) {
      if (
        checkoutResponse?.data?.response?.targetParams?.skipCardDetails ==
        "true"
      ) {
        setLoading(true);
        setTimeout(() => {
          checkOrder(checkoutResponse?.data?.response?.orderId);
        }, 2000);
        return;
      } else {
        //gate way integration...
        setStripeOptions({
          clientSecret:
            checkoutResponse.data.response.targetParams.clientSecret,
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
          appearance: {
            theme: "night",
            variables: {
              colorPrimaryText: "#262626",
              colorBackground: "#282828",
              colorPrimary: "#c30",
            },
            labels: "floating",
          },
        });
      }
    } else if (
      checkoutResponse?.data?.error &&
      checkoutResponse?.data?.error?.code === 401
    ) {
      unAuthorisedHandler();
    } else if (checkoutResponse?.data?.error?.code === -4) {
      // fail case
      // For Rent movies: if user refresh on checkout page redirecting to home
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
    checkoutResponse?.data && setCheckoutData(checkoutResponse.data);
  };

  useEffect(() => {
    if (checkoutResponse && checkoutResponse.data) {
      checkOutResponseHandling(checkoutResponse);
    }
  }, [checkoutResponse]);

  useEffect(() => {
    if (checkoutResponseEncrypted?.data) {
      const checkoutResponseLocal = JSON.parse(
        decryptData(checkoutResponseEncrypted.data.data)
      );
      checkOutResponseHandling({ data: checkoutResponseLocal });
    }
  }, [checkoutResponseEncrypted]);

  useEffect(() => {
    if (orderSummaryResponse && orderSummaryResponse.data) {
      if (orderSummaryResponse?.data?.status) {
        setSummary(orderSummaryResponse?.data?.response);
        if (packageapiResponse && packageapiResponse.data) {
          let params = {
            gateway: getPackagegateway(packageapiResponse.data, query.pid[0]),
            packages: query.pid[0],
          };
          checkOutapi(params);
        }
      } else if (
        orderSummaryResponse?.data?.error &&
        orderSummaryResponse?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      }
    }
  }, [orderSummaryResponse]);

  function getPackagegateway(packageapiResponse, id) {
    if (
      packageapiResponse.response &&
      packageapiResponse.response.packageResponse
    ) {
      for (
        let i = 0;
        i < packageapiResponse.response.packageResponse.length;
        i++
      ) {
        for (
          let j = 0;
          j <
          packageapiResponse.response.packageResponse[i].packageInfo.packages
            .length;
          j++
        ) {
          let pkg_id =
            packageapiResponse.response.packageResponse[i].packageInfo.packages[
              j
            ].id;
          if (pkg_id.toString() === id) {
            return packageapiResponse.response.packageResponse[i]
              .supportedGateway[0].code;
          }
        }
      }
    }
    // incase of rental movie
    else if (packageapiResponse?.response?.[0]?.supportedGateway[0]?.code) {
      return packageapiResponse.response?.[0].supportedGateway[0].code;
    }
  }

  const getPackages = () => {
    let params = {
      skip_package_content: true,
    };
    let url =
      process.env.initJson["api"] +
      "/package/api/v2/packages/info?" +
      jsonToQueryParams(params);
    try {
      mutateGetPackagesData(url);
    } catch (e) {}
  };

  const getOrderSummary = (params) => {
    let url = process.env.initJson["api"] + "/payment/api/v1/order/summary";
    try {
      mutatePostorderSummary({ url, apiData: params });
    } catch (e) {}
  };

  const checkOutapi = (params) => {
    // Based on system features condition, encrypting request
    if (SystemFeature?.encryptApisList?.fields?.payment === "true") {
      const encryptObj = {
        data: encryptData(JSON.stringify(params)),
        metadata: encryptData(JSON.stringify({ request: "order/checkout" })),
      };
      const url = `${process.env.initJson.api}/service/api/v1/send`;
      try {
        mutateCheckoutEncrypted({ url, apiData: encryptObj });
      } catch (e) {}
    } else {
      const url =
        process.env.initJson["api"] + "/payment/api/v1/order/checkout";
      try {
        mutateCheckout({ url, apiData: params });
      } catch (e) {}
    }
  };

  return (
    <div className={`${styles.checkout_container}`}>
      <div className={`${styles.checkout_inner}`}>
        <div className={`${styles.secure_details}`}>
          <img
            className={`${styles.secure_img}`}
            src={`${ImageConfig?.checkOut?.payLock}`}
            alt=""
          />
          <p>{Checkoutconstant[localLang].Secure_Payments} </p>
        </div>
        <div className={`${styles.checkout_header}`}>
          {Checkoutconstant[localLang].Make_Payment}
        </div>
        <div className={`${styles.checkout_body}`}>
          <div className={`${styles.checkout_rows}`}>
            <div className={`${styles.checkout_row} ${styles.heading}`}>
              {Checkoutconstant[localLang].You_have_selected}
            </div>
            <div className={`${styles.checkout_row}`}>
              <span>{summary?.planName?.split("-")[0]}</span>
              <span>{summary?.subTotal}</span>
            </div>
            <div className={`${styles.checkout_row}`}></div>
            <div className={`${styles.checkout_row}`}></div>
            <div className={`${styles.checkout_row}`}></div>
            <div
              className={`${styles.checkout_row} ${styles.stripe_container}`}
            >
              {stripePromise && stripeOptions && (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <CheckoutForm
                    checkoutdata={checkoutdata}
                    summary={summary}
                    checkOrder={checkOrder}
                  />
                </Elements>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.checkout_footer}`}>
          {/* <div className={`${styles.btns}`}>
          <button className={`${styles.btn}`} onClick={handleBack}>Back</button>
          <button className={`${styles.btn} ${(checkoutdata?.error?.code === -1 ? styles.disabled : '')}`} type="submit" disabled={!false}>PAY {summary?.subTotal}</button>
        </div> */}
          <div className={styles.checkout_err_msg}>
            {checkoutdata && checkoutdata.error && checkoutdata.error.message}
          </div>
        </div>
      </div>
      {loading && <PageLoader />}
    </div>
  );
}
