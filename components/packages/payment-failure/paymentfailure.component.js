/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useStore } from "@/store/store";
import { Paymentconstant } from "@/.i18n/locale";
import {  useRouter } from "next/router";
function PaymentFailure() {
  const {
    state: { paymentResponse, localLang ,SystemConfig },
  } = useStore();
  const router= useRouter();
  useEffect(()=>{
    if(!paymentResponse?.response){
      router.push('/');
      return;
    }
  }, []);
  const handleGoBack = () => {
    if (!!isUtuser) {
      window.location.href = SystemConfig.configs.siteURL;
    }
    else if (navigateFrom) {
      router.replace(navigateFrom);
    } else {
      router.replace("/");
    }
  };
  return (
    <div className={`${styles.payment_success_container}`}>
      <div className={`${styles.payment_success_inner}`}>
        <img
          alt="payment-failure"
          src="https://d2ivesio5kogrp.cloudfront.net/static/yuppedu/images/payment_failure.svg"
        />
        <h1 className={`${styles.message1}`}>
          {Paymentconstant[localLang].Transaction_Failed}
        </h1>
        {paymentResponse?.response?.targetParams && (
          <>
            <h1 className={`${styles.message1}`}>
              {paymentResponse?.response?.targetParams.msg1}
            </h1>
            <h5 className={`${styles.message2}`}>
              {paymentResponse?.response?.targetParams.msg2}
            </h5>
          </>
        )}
        {paymentResponse?.response?.message && (
          <h5 className={`${styles.message2}`}>
            {paymentResponse?.response?.message}
          </h5>
        )}
        <div className={`${styles.btn_wrap}`}>
          <button
            type="button"
            onClick={handleGoBack}
            className={`${styles.btn}`}
          >
            {paymentResponse?.response?.targetParams.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;
