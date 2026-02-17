/*{
  type: "signin",
  isActive : true,
  title1 : "To access this feature please sign in",
  yesButton1 : "SignUp", 
  yesButtonTarget1 : navigateToSignup,
  yesButtonType:"primary",
  noButton1  : "SignIn",
  noButtontarget1 : navigateToSignIn,
  noButtonType:"secondary",
  close : false,
  closeTarget : handleClose
}*/

import {
  Dialog,
  DialogTitle,
  DialogActions,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "@/components/popups/overlay-popup/overlay-popup-modal.module.scss";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { actions, useStore } from "@/store/store";
import useGetApiMutate from "@/hooks/useGetApidata";
import useFromApiMutate from "@/hooks/useFromApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { getPagePath, getQueryParams } from "@/services/utility.service";
import { ImageConfig } from "@/config/ImageConfig";
import Loader from "@/components/loader/loader.component";
import { sendEvent } from "@/services/analytics.service";

export default function OverlayPopupModal({ popupData }) {
  const [selectedOpition, setSelectedOpition] = useState({});
  const {
    state: { userDetails, NotificationBar, localLang },
    dispatch,
  } = useStore();
  const [closePopUp, setclosePopUp] = useState(false);
  const { mutate: reportPageApi, data: reportPageApiData } = useGetApiMutate();
  const { mutate: mutateReportSubmitted, data: apiReportSubmitted } =
    usePostApiMutate();
  const router = useRouter();
  const [reportLoopData, setReportLoopData] = useState([]);
  const [loader, setLoader] = useState(false);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  useEffect(() => {
    if (popupData?.type == "ReportPopup") {
      setLoader(true);
      const apiUrl =
        process.env.initJson.api +
        `/service/api/v1/data/set/element?data_set_code=report-reasons`;
      reportPageApi(apiUrl, {
        onSuccess: (response) => {
          setLoader(false);
          console.log("?>>>>>response?.data", response?.data?.response);
          setReportLoopData(response?.data?.response?.data);
        },
      });
    } else if (popupData?.type == "how_It_Works") {
      setReportLoopData(popupData?.reportLoopData);
    }
  }, [popupData]);

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  const checkMobileView = (carryMethod, data = "") => {
    if (width < 991) {
      setTimeout(() => {
        carryMethod(data);
      }, 200);
    } else {
      carryMethod(data);
    }
  };
  const handleClose = () => {
    checkMobileView(popupData.closeTarget);
    setclosePopUp(true);
  };

  const yesButtonTarget1 = () => {
    if (popupData?.type == "ReportPopup") {
      if (Object.keys(selectedOpition).length == 0) {
        return;
      }
      let routePath = getPagePath(router.asPath);
      if (!!popupData?.shortsPath) {
        routePath = popupData?.shortsPath;
      }

      const url = `${process.env.initJson.api}/service/api/auth/content/report/submit`;
      const apiDataPath = {
        path: routePath,
        message: selectedOpition?.key,
        action: "1",
      };
      const apiData = new FormData();
      for (const key in apiDataPath) {
        if (apiDataPath.hasOwnProperty(key)) {
          apiData.append(key, apiDataPath[key]);
        }
      }
      mutateReportSubmitted(
        { url, apiData },
        {
          onSuccess: (response) => {
            let notificData = {
              message: response?.data?.response,
              code: "freedom_tv",
            };
            if (!!popupData?.analyticsFn) {
              // console.log(selectedOpition);
              // console.log(!!popupData?.analyticsFn);
              // popupData.analyticsFn(selectedOpition?.key);
              sendEvent("report", popupData.analyticsFn(selectedOpition?.key));
            }
            console.log(">>>>response", response?.data);
            if (response?.data?.status == false) {
              notificData &&
                (notificData.message = response?.data?.error?.message);
            }
            let windowWidth = window.innerWidth;
            if (windowWidth <= 991) {
              notificData["imgStatus"] =
                `${ImageConfig?.payments?.subscriptionSuccessful}`;
            }

            dispatch({
              type: actions.NotificationBar,
              payload: notificData,
            });
            handleClose();
          },
        }
      );
    } else {
      setclosePopUp(true);
      checkMobileView(popupData.closeTarget, selectedOpition);
    }
  };

  const noButtontarget1 = () => {
    setclosePopUp(true);
    checkMobileView(popupData.noButtontarget1, selectedOpition);
  };

  const handleDialog = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleQualityChange = (e, quality) => {
    e.preventDefault();
    console.log("quality", quality);
    setSelectedOpition(quality);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        open={popupData.isActive ? popupData.isActive : false}
        onClose={handleClose}
        className={`${popupData?.parentclassName}  ${closePopUp && "closePopUp"}`}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClick={(e) => handleDialog(e)}
      >
        <div
          className={`${styles.modal_size} ${styles[popupData?.parentclassName]}`}
        >
          <div className={`${styles.modal_size_before} `} onClick={handleClose}>
            {" "}
          </div>
          <CssBaseline>
            <div className={`${styles.title}`}>
              {popupData.close && (
                <CloseIcon
                  className={`${styles.cross_icon}`}
                  onClick={handleClose}
                ></CloseIcon>
              )}
              {popupData.topImg && popupData.topImgValue && (
                <div className={`${styles.popup_topImg}`}>
                  <img src={popupData.topImgValue} />
                </div>
              )}
              {popupData?.title1 && (
                <div className={`${styles.popup_title}`}>
                  <h2>{popupData.title1}</h2>
                </div>
              )}
              {popupData.title2 && (
                <div className={`${styles.popup_title2} ${styles.sub}`}>
                  <h3>{popupData.title2}</h3>
                </div>
              )}
              {popupData?.subtitle1 && (
                <div className={`${styles.subtitle1}`}>
                  {popupData.subtitle1?.map((ele, index) => {
                    return (
                      <div className={`${styles.delActpoints}`}>
                        {index + 1}.<span>{ele}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* report LoopData display  */}
            {reportLoopData?.length > 0 &&
              popupData?.type == "how_It_Works" && (
                <div className={`${styles.form_group}`}>
                  <div
                    className={`${styles.quality_list} ${styles.check_box_radio}`}
                  >
                    {reportLoopData?.map((quality) => {
                      return (
                        <label
                          // className={styles.check_box_radio}
                          key={quality}
                        >
                          {quality}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            {reportLoopData?.length > 0 && popupData?.type == "ReportPopup" && (
              <div className={`${styles.form_group}`}>
                <div
                  className={`${styles.quality_list} ${styles.check_box_radio}`}
                >
                  {reportLoopData?.map((quality) => {
                    return (
                      <label
                        // className={styles.check_box_radio}
                        key={quality.label}
                        onClick={(e) => handleQualityChange(e, quality)}
                      >
                        <div>
                          <input
                            type="radio"
                            name="videoQuality"
                            className={`${styles.radio} ${selectedOpition?.value == quality?.value ? styles.selected : ""}`}
                            onChange={(e) => handleQualityChange(e, quality)}
                          />
                          <span className={`${styles.check_radio } ${selectedOpition?.value == quality?.value ? styles.selected : ""}`}>
                         { selectedOpition?.value == quality?.value && <span className={`${styles.check_radio_Seleted }`} ></span>}
                          </span>
                        </div>
                        <span className={styles.sm_label}>
                          {quality?.value}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            {loader &&
              reportLoopData?.length == 0 &&
              popupData?.type == "ReportPopup" && (
                <div className={styles.loader}>
                  <Loader type="button" />
                </div>
              )}
            {/* PaymentHistory details display */}
            {popupData?.paymentHistoryList?.length > 0 && (
              <div className={styles.form_group}>
                <div className={styles.quality_list}>
                  {popupData?.paymentHistoryList?.map((payment, index) => {
                    return (
                      <div className={styles.paymentList} key={payment.label}>
                        <span className={styles.sm_label}>{payment.label}</span>
                        <span
                          className={`${popupData?.paymentHistoryList.length == index + 1 && styles.status}
                         ${popupData?.paymentHistoryList.length == index + 1 && (true ? styles.success : styles.canceled)}`}
                        >
                          {payment.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={`${styles.btn}`}>
              {popupData.noButton1 && (
                <button
                  className={`${!!popupData.noButtonType ? popupData.noButtonType : "secondary"} ${styles.cancel}`}
                  onClick={noButtontarget1}
                >
                  {popupData.noButton1}
                </button>
              )}
              {popupData.yesButton1 && (
                <button
                  className={`${!!popupData.yesButtonType ? popupData.yesButtonType : "primary"}  ${styles.continue_btn} ${Object.keys(selectedOpition).length == 0 && popupData?.type == "ReportPopup" ? `${styles.noOptSelected}` : ""}`}
                  onClick={yesButtonTarget1}
                  // disabled={Object.keys(selectedOpition).length == 0}
                >
                  {popupData.yesButton1}
                </button>
              )}
            </div>
          </CssBaseline>
        </div>
      </Dialog>
    </ThemeProvider>
  );
}
