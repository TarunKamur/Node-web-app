import { useEffect, useState } from "react";
import styles from "./paymentfailure.module.scss";
import { useStore } from "@/store/store";
import { Paymentconstant } from "@/.i18n/locale";
import { useRouter } from "next/router";
function PaymentFailure() {
  const {
    state: { paymentResponse, localLang },
  } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (!paymentResponse?.response) {
      router.push("/");
      return;
    }
  }, []);
  if (!paymentResponse?.response) {
    return;
  }
  return (
    <div className={`${styles.payment_success_container}`}>
      <div className={`${styles.payment_success_inner}`}>
        <img
          src={`https://d2ivesio5kogrp.cloudfront.net/static/yuppedu/images/payment_failure.svg`}
          alt="failure"
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
          <a
            href={paymentResponse?.response?.targetParams.redirectUrl}
            className={`${styles.btn}`}
          >
            {paymentResponse?.response?.targetParams.buttonText}
          </a>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;
