import React, { useEffect, useState } from "react";
import styles from "@/components/acceptCookies/acceptCookies.module.scss";
import { getItem, setItem } from "@/services/local-storage.service";
import { AcceptCookiesconstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";

const AcceptCookies = () => {
  const {
    state: { localLang },
  } = useStore();
  const [cookiePopupOn, setCookiePopupOn] = useState("");

  useEffect(() => {
    const hasAcceptedCookies = getItem("AcceptCookies");
    if (hasAcceptedCookies) {
      setCookiePopupOn(false);
    } else {
      setCookiePopupOn(true);
    }
  }, [cookiePopupOn]);

  const acceptCookie = () => {
    setItem("AcceptCookies", true);
    setCookiePopupOn(false);
  };

  return (
    <>
      {cookiePopupOn && (
        <div className={`${styles.accept_cookies}`}>
          <p className={`${styles.text}`}>
            {AcceptCookiesconstant[localLang]?.para}
          </p>
          <button
            className={`${styles.accept_btn} primary`}
            onClick={acceptCookie}
            type="button"
          >
            {AcceptCookiesconstant[localLang]?.Accept}
          </button>
        </div>
      )}
    </>
  );
};

export default AcceptCookies;
