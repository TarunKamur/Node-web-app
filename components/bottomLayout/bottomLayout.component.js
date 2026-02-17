import Drawer from "@mui/material/Drawer";
import styles from "@/components/bottomLayout/bottomLayout.module.scss";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { actions, useStore } from "@/store/store";
import useGetApiMutate from "@/hooks/useGetApidata";
import { getAbsolutePath, getNetworkIcon } from "@/services/user.service";
import {
  getDeeplinkData,
  jsonToQueryParams,
  getEventName,
  getPlansDetails,
} from "@/services/utility.service";
import { bottomLayout } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import dynamic from "next/dynamic";
const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const SharePopup = dynamic(() => import("../popups/share/share-popup"));

import Image from "next/image";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent, cpAnalyticsAPI } from "@/services/analytics.service";
import InnerHtmlRenderer from "../innerHtmlRenderer/InnerHtmlRenderer";
import ContetPartnerPopup from "../contentpartnerpopup/ContentPartner.component";
import usePostApiMutate from "@/hooks/usePostApidata";
import { browserName } from "react-device-detect";

export default function BottomLayout({ open, onClose, templateData }) {
  const { mutate: mutateTemplateData, data: apiTemplateResponse } =
    useGetApiMutate();
  const { mutate: mutateDeeplinkAPi, data: deepLinkData } = useGetApiMutate();
  const { mutateAsync: addFavourites } = useGetApiMutate();
  const mutateNotificationDetails = usePostApiMutate();
  const {
    state: { PageData, userDetails, NotificationBar, localLang },
    dispatch,
  } = useStore();
  const router = useRouter();
  const [templateResponse, setTemplateResponse] = useState({});
  const [templateFields, settemplateFields] = useState({});
  const [popupData, setPopUpData] = useState({});
  const [contentpartnerpopup, setContentpartnerpopup] = useState(undefined);
  const [clickaanalyticsData, setclickaanalyticsData] = useState("");

  useEffect(() => {
    getLocalTemplateData();
  }, [templateData]);

  useEffect(() => {
    if (!!apiTemplateResponse) {
      setTemplateResponse(apiTemplateResponse?.data?.response?.data);
      mapTemplateData(apiTemplateResponse?.data?.response?.data);
    }
  }, [apiTemplateResponse]);

  useEffect(() => {
    if (!!deepLinkData?.data) {
      if (deepLinkData.data?.status) {
        let dL = getDeeplinkData(deepLinkData?.data?.response);
        let handle = navigateToWrapper(() => {
          !!clickaanalyticsData && cpAnalyticsAPI(clickaanalyticsData);
          if (browserName.includes("Safari")) {
            window.location.href = dL;
          } else {
            window.open(dL);
          }
        });
        handle(deepLinkData?.data?.response.partnerCode);
        // if (!handle) {
        //     window.location.href=dL;
        // }
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: deepLinkData?.data?.error?.message },
        });
      }
    }
  }, [deepLinkData]);

  const closeOverlay = () => {
    onClose();
  };

  const getLocalTemplateData = () => {
    const url =
      process.env.initJson["api"] +
      "/service/api/v1/template/data?template_code=" +
      templateData.assignedTemplate?.code +
      "&path=" +
      templateData.target_path;
    try {
      mutateTemplateData(url);
    } catch (e) {}
  };

  const getImagePath = (path) => {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  };

  const getSeekValue = (value) => {
    try {
      if (value != "0" && value != "1") {
        const intval = parseFloat(value) * 100;
        const fval = intval.toString().substring(0, 2);
        return parseInt(fval);
      } else {
        return value != "1" ? 100 : 0;
      }
    } catch (e) {}
  };

  const mapTemplateData = (dData) => {
    if (!!dData) {
      let tField = {};
      tField.apiData = dData;
      templateData.assignedTemplate.rows.map((ele) => {
        ele.templateElements.map((e) => {
          e?.elementType == "image" &&
            (tField[e.elementCode] = {
              displayCondition: dData[e.displayCondition.replace("key:", "")],
              data: getImagePath(dData[e.elementCode]),
            });
          e.elementType == "description" &&
            (tField[e.elementCode] = {
              displayCondition: dData[e.displayCondition.replace("key:", "")],
              data: dData[e.elementCode],
            });

          e.elementType == "text" &&
            e.elementSubtype == "title" &&
            (tField[e.elementSubtype] = {
              displayCondition: dData[e.displayCondition.replace("key:", "")],
              data: dData[e.elementCode],
            });

          //for subtitle, 1 , 2 , 3 ,4 we are considering
          e.elementType == "text" &&
            e.elementSubtype != "title" &&
            (tField[e.elementCode] = {
              displayCondition: dData[e.displayCondition.replace("key:", "")],
              data: dData[e.elementCode],
            });

          // mapping all types aof buttons like watchlive ,watchnow, record, browseepisodes, resume, startorver, watchlatestepisode,....
          e.elementType == "button" &&
            e.elementSubtype != "form-field" &&
            e.elementCode != "removeFavourite" &&
            e.elementCode != "addFavourite" &&
            e.elementCode != "startover_live" &&
            e.elementCode != "startover_past" &&
            e.elementCode != "record" &&
            (tField[e.elementSubtype] = {
              displayCondition: dData[e.displayCondition?.replace("key:", "")],
              data: dData[e.elementCode],
              target: dData[e.target.replace("key:", "")],
              seekedValue: getSeekValue(templateResponse.watchedPosition),
              deeplink:
                dData["isDeeplinking_" + e.elementCode] == "true"
                  ? true
                  : false,
            });

          //  startover_live' , startover_past' buttons
          e.elementType == "button" &&
            e.elementSubtype != "form-field" &&
            (e.elementCode == "startover_live" ||
              e.elementCode == "startover_past") &&
            (tField[e.elementCode] = {
              displayCondition: dData[e.displayCondition.replace("key:", "")],
              data: e.data,
              target: dData[e.target.replace("key:", "")],
              deeplink:
                dData["isDeeplinking_" + e.elementCode] == "true"
                  ? true
                  : false,
            });

          e.elementType == "button" &&
            e.elementSubtype == "form-field" &&
            (tField[e.elementCode] = {
              displayCondition: dData[e.displayCondition.replace("key:", "")],
              data: e.data,
              target: e.target,
              deeplink:
                dData["isDeeplinking_" + e.elementCode] == "true"
                  ? true
                  : false,
            });

          if (e.elementType == "favourite" || e.elementType == "share") {
            tField[e.elementCode] = {
              displayCondition: dData[e.displayCondition.replace("key:", "")],
              data: dData[e.elementCode],
              target: dData[e.target.replace("key:", "")],
            };
          }
          if (e.elementType == "button" && e.elementCode == "record") {
            tField[e.elementCode] = {
              displayCondition: dData[e.displayCondition.replace("key:", "")],
              data: dData[e.elementCode],
              target: e.target,
            };
          }
        });
      });
      settemplateFields(tField);
    }
  };

  const navigateToSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signin");
  };

  const handleClose = () => {
    setPopUpData({});
  };

  const shareDataSet = (item) => {
    const pop = {
      type: "share",
      isActive: true,
      targetpath: templateData.target_path,
      img: `${appConfig?.appLogo}`,
      closeTarget: handleClose,
      analyticsObj: { ...analyticsData() },
    };
    setPopUpData(pop);
    sendEvent("share", analyticsData());
  };

  const addTofav = async () => {
    if (!!userDetails) {
      try {
        const action = templateFields.apiData.isFavourite === "true" ? 2 : 1;
        const apiUrl =
          process.env.initJson["api"] +
          `/service/api/auth/user/favourite/item?path=${templateData.target_path}&action=${action}`;
        const response = await addFavourites(apiUrl);
        templateFields.apiData.isFavourite =
          templateFields.apiData.isFavourite === "true" ? "false" : "true";
        settemplateFields({ ...templateFields });
        if (response.data.status) {
          sendEvent("favorite", analyticsData());
        } else {
        }
      } catch (error) {}
    } else {
      popupDataSet();
    }
  };

  const popupDataSet = () => {
    const pop = {
      type: "signin",
      isActive: true,
      title1: bottomLayout[localLang]?.To_access_this_feature_please_sign_in,
      yesButton1: bottomLayout[localLang]?.Sign_In,
      yesButtonType: "primary",
      yesButtonTarget1: navigateToSignIn,
      noButton1: bottomLayout[localLang]?.Cancel,
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const handleBtnClick = (type) => {
    let analyticsObj = analyticsData();
    if (type === "startover" || type === "resume") {
      sendEvent("play_button_clicked", analyticsObj);
    }
    if (type === "share") {
      shareDataSet();
    } else if (type === "favourite") {
      addTofav();
    } else if (type === "upgrade") {
    } else if (type === "subscribe") {
      if (templateResponse?.showPopUp === "true") {
        let pop = {
          type: "payment",
          isActive: templateResponse?.showPopUp === "true" ? true : false,
          topImg: templateResponse?.showPopUp === "true" ? true : false,
          topImgValue:
            "http://mobond.yuppcdn.net/cf1/static/slt/images/payment-failure.svg",
          title1: templateResponse?.title,
          title2: templateResponse?.subtitle,
          yesButtonTarget1: handleClose,
          yesButton1: "Cancel",
          yesButtonType: "primary",
          close: true,
          closeTarget: handleClose,
        };
        setPopUpData(pop);
      } else router.push("plans/list");
    } else if (type === "browse_episode" || type === "browse_episodes") {
      router.push(templateFields[type].target);
    } else {
      if (templateFields[type].deeplink == true) {
        getDeeplinkInfo(templateFields[type].target);
        console.log(templateFields[type].target);
        type !== "trailer" &&
          setclickaanalyticsData(templateFields[type].target);
      } else {
        router.push(templateFields[type].target);
      }
    }
  };

  const getDeeplinkInfo = (tPath) => {
    let analyticsObj = analyticsData();
    sendEvent("play_button_clicked", analyticsObj);
    let params = { path: tPath };
    let url =
      process.env.initJson["api"] +
      "/service/api/v1/page/deeplink?" +
      jsonToQueryParams(params);
    try {
      mutateDeeplinkAPi(url);
    } catch (e) {}
  };

  const postNotificationDetails = async (apiData) => {
    let url;
    if (apiData?.showNotification === undefined) {
      url = `${process.env.initJson.api}/service/api/auth/get/notification/details`;
    } else {
      url = `${process.env.initJson.api}/service/api/auth/update/notification/details`;
    }

    let notification_response = await mutateNotificationDetails.mutateAsync({
      url,
      apiData,
    });
    return notification_response?.data;
  };

  const handelNotificationPopup = (data) => {
    postNotificationDetails(data);
    setContentpartnerpopup();
  };

  const navigateToWrapper = (navigateToFunc) => {
    return (networkCode) => {
      (async () => {
        let notificationDetails = await postNotificationDetails({
          networkCode,
        });
        if (notificationDetails.status === true) {
          if (notificationDetails.response.showNotification === true) {
            setContentpartnerpopup({
              topImg: true,
              topImgValue: getNetworkIcon(networkCode),
              networkId: networkCode,
              isActive: true,
              sendData: handelNotificationPopup,
              navigateTo: () => navigateToFunc(),
            });
          } else {
            navigateToFunc();
          }
        } else if (notificationDetails.error.code === -101) {
          navigateToFunc();
        }
      })();
    };
  };

  const loaderProp = ({ src }) => {
    return src;
  };

  const analyticsData = () => {
    let cardObj = {};
    if (router.asPath == "tvguide" || router.asPath.includes("channel/live")) {
      cardObj = {
        ...getPlansDetails(true),
        rail_name: "-1",
        asset_title: templateFields?.title?.data,
        banner_title: templateFields?.title?.data,
        header_button: "tvguide",
        media_type: "Live TV",
        genre: "-1",
        channel_partner: "-1",
      };
    } else {
      if (router.asPath.includes("play")) {
        let pageOrMenu = getEventName("", PageData?.info);
        cardObj = {
          asset_title: templateFields?.title?.data,
          banner_title: templateFields?.title?.data,
          header_button: pageOrMenu,
          media_type: PageData?.info?.attributes?.mediaContentType || "-1",
          genre: PageData?.info?.attributes?.genre || "-1",
          channel_partner: PageData?.info?.attributes?.networkName || "-1",
        };
      }
    }

    if (PageData?.info?.attributes?.tvShowName) {
      cardObj["series_name"] = PageData?.info?.attributes?.tvShowName;
    }
    if (PageData?.info?.attributes?.seasonSeqNo) {
      cardObj["season_number"] = PageData?.info?.attributes?.seasonSeqNo;
    }
    if (PageData?.info?.attributes?.episodeSeqNo) {
      cardObj["episode_number"] = PageData?.info?.attributes?.episodeSeqNo;
    }
    return cardObj;
  };

  return (
    <div>
      <Drawer
        className={`${styles.parent}`}
        anchor="bottom"
        open={open}
        onClose={closeOverlay}
      >
        <div className={`${styles.bottomLayout}`}>
          <span
            className={`${styles.close_icon}`}
            onClick={closeOverlay}
          ></span>
          <div className={`${styles.container}`}>
            <div className={`${styles.bottomLayout_inner}`}>
              <div className={`${styles.layout_left}`}>
                <div className={`layout_img ${styles.layout_img}`}>
                  {!!templateFields.image &&
                    templateFields.image.displayCondition == "true" && (
                      <Image
                        loader={loaderProp}
                        fill
                        src={templateFields.image.data}
                        alt="image"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.srcset = `${ImageConfig?.defaultdetails}`;
                        }}
                      />
                    )}
                  {!!templateFields.networkIcon &&
                    templateFields.networkIcon.displayCondition == "true" && (
                      <span className={`${styles.icon}`}>
                        <Image
                          loader={loaderProp}
                          fill
                          src={templateFields.networkIcon.data}
                          alt="image"
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.srcset = `${ImageConfig?.defaultdetails}`;
                          }}
                        />
                      </span>
                    )}
                </div>
              </div>

              <div className={`${styles.layout_right}`}>
                <div className={`${styles.right_data}`}>
                  {!!templateFields.title &&
                    templateFields.title.displayCondition == "true" &&
                    !!templateFields.title.data && (
                      <div>
                        <h2 className={`${styles.program__name}`}>
                          {templateFields.title.data}
                        </h2>
                      </div>
                    )}
                  {!!templateFields.subtitle &&
                    templateFields.subtitle.displayCondition == "true" &&
                    !!templateFields.subtitle.data && (
                      <div className={`${styles.program_info}`}>
                        <span className={`${styles.subtitle}`}>
                          {templateFields.subtitle.data}
                        </span>
                      </div>
                    )}
                  {!!templateFields.imdb &&
                    templateFields.imdb.displayCondition == "true" &&
                    !!templateFields.imdb.data && (
                      <div className={`${styles.program_info}`}>
                        <div className={`${styles.imdb}`}>
                          |{" "}
                          <img
                            alt="imdb"
                            src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/imdb.png"
                          />
                          {templateFields.imdb.data}
                        </div>
                      </div>
                    )}
                  {!!templateFields.duration &&
                    templateFields.duration.displayCondition == "true" &&
                    !!templateFields.duration.data && (
                      <div className={`${styles.program_info}`}>
                        <span className={`${styles.subtitle}`}>
                          {templateFields.duration.data}
                        </span>
                      </div>
                    )}
                  {!!templateFields.subtitle1 &&
                    templateFields.subtitle1.displayCondition == "true" &&
                    !!templateFields.subtitle1.data && (
                      <div className={`${styles.program_info}`}>
                        <span className={`${styles.subtitle}`}>
                          {templateFields.subtitle1.data}
                        </span>
                      </div>
                    )}
                  {!!templateFields.subtitle2 &&
                    templateFields.subtitle2.displayCondition == "true" &&
                    !!templateFields.subtitle2.data && (
                      <div className={`${styles.program_info}`}>
                        <span className={`${styles.subtitle}`}>
                          {templateFields.subtitle2.data}
                        </span>
                      </div>
                    )}
                  {!!templateFields.subtitle3 &&
                    templateFields.subtitle3.displayCondition == "true" &&
                    !!templateFields.subtitle3.data && (
                      <div className={`${styles.program_info}`}>
                        <span className={`${styles.subtitle}`}>
                          {templateFields.subtitle3.data}
                        </span>
                      </div>
                    )}
                  {!!templateFields.subtitle4 &&
                    templateFields.subtitle4.displayCondition == "true" &&
                    !!templateFields.subtitle4.data && (
                      <div className={`${styles.program__nfo}`}>
                        <span className={`${styles.subtitle}`}>
                          {templateFields.subtitle4.data}
                        </span>
                      </div>
                    )}
                  {!!templateFields.description &&
                    templateFields.description.displayCondition == "true" &&
                    !!templateFields.description.data && (
                      <div className={`${styles.program__nfo}`}>
                        {/* <span className={`${styles.subtitle} ${styles.description}`}>
                          {templateFields.description.data}
                        </span> */}
                        <InnerHtmlRenderer
                          data={templateFields.description?.data}
                          isDataTruncate={false}
                          customClass={`${styles.subtitle} ${styles.description}`}
                        />
                      </div>
                    )}

                  {!!templateFields.cast &&
                    templateFields.cast.displayCondition == "true" &&
                    !!templateFields.cast.data && (
                      <div className={`${styles.program__nfo} ${styles.cast}`}>
                        <label>{bottomLayout[localLang].Cast_Crew + ":"}</label>
                        <span className={`${styles.subtitle}`}>
                          {templateFields.cast.data}
                        </span>
                      </div>
                    )}
                  {!!templateFields.languageDisplayText &&
                    templateFields.languageDisplayText.displayCondition ==
                      "true" &&
                    !!templateFields.languageDisplayText.data && (
                      <div
                        className={`${styles.program__nfo} ${styles.available}`}
                      >
                        <label>{bottomLayout[localLang].Available_In}</label>
                        <span className={`${styles.subtitle}`}>
                          {templateFields.languageDisplayText.data}
                        </span>
                      </div>
                    )}
                </div>
                <div className={`${styles.mobile_share_controls}`}>
                  <div className={`${styles.fav_btn}`}>
                    {!!templateFields.favourite &&
                      templateFields.favourite.displayCondition == "true" && (
                        <button
                          onClick={() => handleBtnClick("favourite")}
                          className={` ${styles.btn}   ${styles.btn_primary} ${styles.add_fav}`}
                        >
                          <span>
                            {!!templateFields.apiData &&
                              templateFields.apiData.isFavourite != "true" && (
                                <img
                                  src={`${ImageConfig?.playerDescription?.plusGray}`}
                                  alt="favourite"
                                />
                              )}
                            {!!templateFields.apiData &&
                              templateFields.apiData.isFavourite == "true" && (
                                <img
                                  src={`${ImageConfig?.playerDescription?.watchedTick}`}
                                  alt="favorite"
                                />
                              )}
                          </span>
                          {templateFields.apiData.isFavourite == "true"
                            ? `${bottomLayout[localLang].Favourited}`
                            : `${bottomLayout[localLang].Favourite}`}
                        </button>
                      )}
                  </div>
                  <div className={`${styles.share_btn}`}>
                    {!!templateFields.share &&
                      templateFields.share.displayCondition == "true" && (
                        <button
                          onClick={() => handleBtnClick("share")}
                          className={` ${styles.btn}   ${styles.btn_primary}  ${styles.share}`}
                        >
                          <span>
                            <img
                              src={`${ImageConfig?.bottomLayout?.share}`}
                              alt="share"
                            />
                          </span>
                          {templateFields.share.data}
                        </button>
                      )}
                  </div>
                </div>
                <div className={`${styles.layout_btns}`}>
                  {!!templateFields.signin &&
                    templateFields.signin.displayCondition == "true" && (
                      <Link
                        href="/signin"
                        onClick={() => sendEvent("signin", {})}
                      >
                        <button
                          className={` ${styles.btn}   ${styles.btn_primary}`}
                        >
                          {templateFields.signin.data}
                        </button>
                      </Link>
                    )}
                  {!!templateFields.signup &&
                    templateFields.signup.displayCondition == "true" && (
                      <Link href="/signup">
                        <button
                          className={` ${styles.btn}   ${styles.btn_primary}`}
                        >
                          {templateFields.signup.data}
                        </button>
                      </Link>
                    )}
                  {!!templateFields.watchlive &&
                    templateFields.watchlive.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("watchlive")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.watchlive.data}
                      </button>
                    )}
                  {!!templateFields.watch_latest_episode &&
                    templateFields.watch_latest_episode.displayCondition ==
                      "true" && (
                      <button
                        onClick={() => handleBtnClick("watch_latest_episode")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.watch_latest_episode.data}
                      </button>
                    )}
                  {!!templateFields.startover_live &&
                    templateFields.startover_live.displayCondition ==
                      "true" && (
                      <button
                        onClick={() => handleBtnClick("startover_live")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.startover_live.data}
                      </button>
                    )}
                  {!!templateFields.watchnow &&
                    templateFields.watchnow.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("watchnow")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.watchnow.data}
                      </button>
                    )}
                  {!!templateFields.startover &&
                    templateFields.startover.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("startover")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.startover.data}
                      </button>
                    )}
                  {!!templateFields.trailer &&
                    templateFields.trailer.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("trailer")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.trailer.data}
                      </button>
                    )}
                  {!!templateFields.resume &&
                    templateFields.resume.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("resume")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.resume.data}
                      </button>
                    )}
                  {!!templateFields.browse_episodes &&
                    templateFields.browse_episodes.displayCondition ==
                      "true" && (
                      <button
                        onClick={() => handleBtnClick("browse_episodes")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.browse_episodes.data}
                      </button>
                    )}
                  {!!templateFields.browse_episode &&
                    templateFields.browse_episode.displayCondition ==
                      "true" && (
                      <button
                        onClick={() => handleBtnClick("browse_episodes")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.browse_episode.data}
                      </button>
                    )}
                  {!!templateFields.subscribe &&
                    templateFields.subscribe.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("subscribe")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.subscribe.data}
                      </button>
                    )}
                  {!!templateFields.upgrade &&
                    templateFields.upgrade.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("upgrade")}
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.upgrade.data}
                      </button>
                    )}
                  {!!templateFields.available_soon &&
                    templateFields.available_soon.displayCondition ==
                      "true" && (
                      <button
                        disabled
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.available_soon.data}
                      </button>
                    )}
                  {!!templateFields.stream_not_available &&
                    templateFields.stream_not_available.displayCondition ==
                      "true" && (
                      <button
                        disabled
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.stream_not_available.data}
                      </button>
                    )}
                  {!!templateFields.available_soon_record &&
                    templateFields.available_soon_record.displayCondition ==
                      "true" && (
                      <button
                        disabled
                        className={` ${styles.btn}   ${styles.btn_primary}`}
                      >
                        {templateFields.available_soon_record.data}
                      </button>
                    )}
                  {!!templateFields.favourite &&
                    templateFields.favourite.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("favourite")}
                        className={` ${styles.btn}   ${styles.btn_primary} ${styles.add_fav}`}
                      >
                        <span>
                          {!!templateFields.apiData &&
                            templateFields.apiData.isFavourite != "true" && (
                              <img
                                src={`${ImageConfig?.playerDescription?.plusGray}`}
                                alt="watchlist"
                              />
                            )}
                          {!!templateFields.apiData &&
                            templateFields.apiData.isFavourite == "true" && (
                              <img
                                src={`${ImageConfig?.playerDescription?.watchedTick}`}
                                alt="remove-watchlist"
                              />
                            )}
                        </span>
                        {templateFields.apiData.isFavourite == "true"
                          ? `${bottomLayout[localLang].Favourited}`
                          : `${bottomLayout[localLang].Favourite}`}
                      </button>
                    )}
                  {!!templateFields.share &&
                    templateFields.share.displayCondition == "true" && (
                      <button
                        onClick={() => handleBtnClick("share")}
                        className={` ${styles.btn}   ${styles.btn_primary}  ${styles.share}`}
                      >
                        <span>
                          <img
                            src={`${ImageConfig?.bottomLayout?.share}`}
                            alt="share"
                          />
                        </span>
                        {templateFields.share.data}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
      {popupData.isActive &&
        (popupData.type === "signin" || popupData.type === "payment") && (
          <PopupModal popupData={popupData}></PopupModal>
        )}
      {popupData.isActive && popupData.type === "share" && (
        <SharePopup popupData={popupData}></SharePopup>
      )}
      {contentpartnerpopup && (
        <ContetPartnerPopup popupData={contentpartnerpopup} />
      )}
    </div>
  );
}
