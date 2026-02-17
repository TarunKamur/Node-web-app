import styles from "@/components/mobileDownloadApp/mbDwnldHeader.module.scss";
import { getItem, setItem, setCookie } from "@/services/local-storage.service";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileHeder } from "@/.i18n/locale";
import { useStore } from "@/store/store";
import { ImageConfig } from "@/config/ImageConfig";

const MobileDownloadHeader = ({ pagePath }) => {
  const [isOpen, setIsOpen] = useState("");
  const {
    state: { localLang },
  } = useStore();
  let cptabsM_sub = "";

  useEffect(() => {
    const hasmobileAppDownloadPopup = getItem("app-dwnld-hdr");
    const expirationDate = new Date(hasmobileAppDownloadPopup?.expires);
    const currentDate = new Date();

    if (!!hasmobileAppDownloadPopup && expirationDate > currentDate) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
    return () => {
      if (cptabsM_sub) {
        cptabsM_sub.style.top = "80px";
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const mobileAppDownloadPopup = () => {
    const d = new Date();
    d.setTime(d.getTime() + 3 * 24 * 60 * 60 * 1000);
    // var expires = "expires=" + d.toUTCString();
    setItem("app-dwnld-hdr", { checkStatus: true, expires: d.toUTCString() });
    setCookie("app-dwnld-hdr", { checkStatus: true, expires: d.toUTCString() });

    setIsOpen(false);
  };
  if (pagePath?.path?.includes("buy/order-summary/")) return null;
  if (
    [
      "buy/packages-list",
      "settings",
      "myaccount",
      "search",
      "favorites",
      "shorts",
      "settings/edit-profile",
    ].includes(pagePath?.path)
  )
    return null;
  return (
    <div className={`${styles.app_header}`} id="appDownloadPopup">
      <span
        className={`${styles.close_icon}`}
        onClick={mobileAppDownloadPopup}
        id="closeIconAppDownloadPopup"
      >
        <img src={ImageConfig?.mbDwnldHeader?.closeIcon} alt="close" />
      </span>
      <div className={`${styles.app_inner}`}>
        <div className={`${styles.app_left}`}>
          <h3>
            {MobileHeder[localLang]?.Download} {process.env.title}
          </h3>
          <p>{MobileHeder[localLang]?.Download_our_Mobile_App_on_your_phone}</p>
          <div className={`${styles.store_icon}`}>
            <Link
              href="https://apps.apple.com/in/app/watcho-new-web-series-livetv/id1440733653?platform=iphone"
              target="_blank"
              aria-label="app store download"
            >
              <img src={`${ImageConfig?.mbDwnldHeader?.appStore}`} alt="" />
            </Link>
            <Link
              href="https://play.google.com/store/apps/details?id=com.watcho"
              target="_blank"
              aria-label="playstore download"
            >
              <img src={`${ImageConfig?.mbDwnldHeader?.playStore}`} alt="" />
            </Link>
            <Link href="/apps.html" target="_blank">
              <button className={`${styles.btn} primary`} type="button">
                {MobileHeder[localLang]?.Download_our_Mobile_App}
              </button>
            </Link>
          </div>
        </div>
        <img
          className={`${styles.mobile}`}
          src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/app-in-mobile-watcho.png"
          alt="mobile app"
        />
      </div>
    </div>
  );
};

export default MobileDownloadHeader;
