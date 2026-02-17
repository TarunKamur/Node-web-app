import styles from "@/components/promotional-popup/promotional-popup.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/store";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { appConfig } from "@/config/app.config";
import { setItem } from "@/services/local-storage.service";

const Promotional_popup = ({ onClose }) => {
  const {
    state: { SystemConfig },
  } = useStore();
  const [socialPopupConfigs, setSocialPopupConfigs] = useState();
  const [open, setOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState();

  const [expireTime, setExpireTime] = useState(24);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    let PopupConfigs = !!SystemConfig?.configs?.interstitialStaticPopup
      ? SystemConfig?.configs?.interstitialStaticPopup
      : "";
    setSocialPopupConfigs(JSON.parse(PopupConfigs));
    let totalSec = expireTime * 3600;

    let setExpireTm = !!PopupConfigs?.popupFrequencyIntervalInSecs
      ? PopupConfigs?.popupFrequencyIntervalInSecs
      : totalSec;

    setItem("socialpop", Math.floor(Date.now() / 1000) + setExpireTm);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [SystemConfig]);

  const handleResize = () => {
    setWindowWidth(getResolution());
  };

  const getResolution = () => {
    var width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;

    var height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    return { width: width, height: height };
  };

  const LanguageModalClose = () => {
    onClose();
  };

  const navogateTo = (url, isInternal) => {
    if (typeof window !== "undefined") {
      if (isInternal === "true" || isInternal === true) {
        window.open(url, "_self");
      } else {
        window.open(url, "_blank");
      }
    } else {
    }
  };

  const buttonClasses = (data) => {
    return { background: data.backgroundColor, color: data.titleColor };
  };
  return (
    <div>
      <Dialog
        open={open}
        // onClose={LanguageModalClose}
        aria-labelledby="responsive-dialog-title"
        className={`promotional_modal_dialog `}
      >
        <DialogContent>
          <div className={` ${styles.promotional_popup}`}>
            <img
              className={`${styles.banner}`}
              key={windowWidth?.width > 990 ? "webImg" : "Mobile Img"}
              alt="Giri Bapu Ji"
              src={
                windowWidth?.width > 990
                  ? socialPopupConfigs?.backGroundImagePathWeb
                  : socialPopupConfigs?.backGroundImagePathMobile
              }
            />
            <button
              className={`${styles.close_icon}`}
              onClick={LanguageModalClose}
            >
              <img
                src={`${appConfig.staticImagesPath}lan-popup-close.png`}
                alt="lang_close"
              />
            </button>

            <div
              className={`${styles.confirmation}`}
              onClick={() =>
                socialPopupConfigs?.targetPath &&
                navogateTo(
                  socialPopupConfigs?.targetPath,
                  socialPopupConfigs?.isInternal
                )
              }
            >
              <div className={`${styles.socialPopup}`}>
                <h1 className={`${styles.title}`}>
                  {socialPopupConfigs?.title}{" "}
                </h1>
                {windowWidth?.width > 990 && (
                  <h3 className="sub_title">{socialPopupConfigs?.subtitle} </h3>
                )}
                <div className={`${styles.social_media}`}>
                  {socialPopupConfigs?.buttons?.map((data, index) => {
                    return (
                      <>
                        <img width="42" src={data.imagePath} alt="" />

                        {windowWidth?.width >= 990 ? (
                          <button
                            onClick={() =>
                              navogateTo(data?.targetPath, data.isInternal)
                            }
                            style={buttonClasses(data)}
                          >
                            {data?.titleWeb}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navogateTo(data?.targetPath, data.isInternal)
                            }
                            style={buttonClasses(data)}
                          >
                            {data?.title}
                          </button>
                        )}
                      </>
                    );
                  })}
                </div>
                {windowWidth?.width < 991 && (
                  <h3 className={`${styles.sub_title}`}>
                    {socialPopupConfigs?.subtitle}
                  </h3>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Promotional_popup;
