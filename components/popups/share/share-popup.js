import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleSharpIcon from "@mui/icons-material/CheckCircleSharp";
import Link from "next/link";
import styles from "./share-popup.module.scss";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  WhatsappShareButton,
} from "react-share";
import { appConfig } from "@/config/app.config";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import { sharePopupConstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";
import { Flag } from "@mui/icons-material";

export default function SharePopup({ popupData }) {
  const [copyText, setCopyText] = useState(false);
  const {
    state: { localLang },
  } = useStore();

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";
  const timerRef = useRef();
  const handleClose = (e) => {
    e.preventDefault();
    popupData.closeTarget();
    clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  const handleCopyButton = (e) => {
    e.preventDefault();
    if (copyText === false) {
      navigator?.clipboard?.writeText(document.getElementById("textId").value);
      sendEvent("share_copy_link", popupData?.analyticsObj);
    }
    setCopyText(true);
    // timerRef.current = setTimeout(() => {
    //   setCopyText(false);
    // }, 3000);
  };
  const shareDialog = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <Dialog
      open={popupData.isActive ? popupData.isActive : false}
      onClose={(e) => handleClose(e)}
      onClick={(e) => shareDialog(e)}
    >
      <div className={styles.sharecontent_modal}>
        <div className={styles.main_modal}>
          <div className={styles.modal_wrapper}>
            <div className={styles.modal_content}>
              <CloseIcon
                className={`${styles.cross_icon}`}
                onClick={handleClose}
              ></CloseIcon>
              <h2 className={styles.modal_title}>
                {sharePopupConstant?.[localLang]?.share || "Share"}
              </h2>
              <div className={styles.sharing_content}>
                <div className={styles.url_text}>
                  <input
                    id="textId"
                    type="text"
                    value={`${origin}/${popupData.targetpath}`}
                    readOnly
                  />
                </div>
                <div
                  className={styles.copy_content}
                  onClick={(e) => handleCopyButton(e)}
                >
                  <button>
                    {/* <button onClick={(e) =>handleCopyButton(e)}> */}
                    {copyText ? (
                      <span className="share_checkicon">
                        <CheckCircleSharpIcon />
                      </span>
                    ) : (
                      <span className={styles.copy_text}>
                        {sharePopupConstant?.[localLang]?.copy || "Copy"}
                      </span>
                    )}
                    {/* </button> */}
                  </button>
                </div>
              </div>
              <p className={styles.share_via_text}>
                {sharePopupConstant?.[localLang]?.or_share_via ||
                  "Or Share Via"}
              </p>
              <div className={styles.social_sharing}>
                <ul>
                  <li>
                    <FacebookShareButton
                      url={`${origin}/${popupData.targetpath}`}
                      onClick={() =>
                        sendEvent("share_social", {
                          ...popupData?.analyticsObj,
                          social_handle: "facebook",
                        })
                      }
                    >
                      <img
                        src={`${ImageConfig?.sharePopUp?.facebook}`}
                        alt="social media icons"
                      />
                    </FacebookShareButton>
                  </li>
                  <li>
                    <TwitterShareButton
                      url={`${origin}/${popupData.targetpath}`}
                      onClick={() =>
                        sendEvent("share_social", {
                          ...popupData?.analyticsObj,
                          social_handle: "twitter",
                        })
                      }
                    >
                      <img
                        src={`${ImageConfig?.sharePopUp?.twitter}`}
                        alt="social media icons"
                      />
                    </TwitterShareButton>
                  </li>
                  <li>
                    <LinkedinShareButton
                      url={`${origin}/${popupData.targetpath}`}
                      onClick={() =>
                        sendEvent("share_social", {
                          ...popupData?.analyticsObj,
                          social_handle: "linkedin",
                        })
                      }
                    >
                      <img
                        src={`${ImageConfig?.sharePopUp?.linkedin}`}
                        alt="social media icons"
                      />
                    </LinkedinShareButton>
                  </li>
                  <li>
                    <PinterestShareButton
                      url={`${origin}/${popupData.targetpath}`}
                      media={popupData.img}
                      onClick={() =>
                        sendEvent("share_social", {
                          ...popupData?.analyticsObj,
                          social_handle: "pintrest",
                        })
                      }
                    >
                      <img
                        src={`${ImageConfig?.sharePopUp?.pintrest}`}
                        alt="social media icons"
                      />
                    </PinterestShareButton>
                  </li>
                  <li>
                    <WhatsappShareButton
                      url={`${origin}/${popupData.targetpath}`}
                      onClick={() =>
                        sendEvent("share_social", {
                          ...popupData?.analyticsObj,
                          social_handle: "whatsapp",
                        })
                      }
                    >
                      <img
                        src={`${ImageConfig?.sharePopUp?.whatsapp}`}
                        alt="social media icons"
                      />
                    </WhatsappShareButton>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
