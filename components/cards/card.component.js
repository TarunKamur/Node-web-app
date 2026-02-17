import styles from "@/components/cards/card.module.scss";
import useGetApiMutate from "@/hooks/useGetApidata";
import getApiStaticData from "@/hooks/useGetApidata";
import { getItem, setItem } from "@/services/local-storage.service";
import { browserName } from "react-device-detect";
import {
  getAbsolutePath,
  getNetworkIcon,
  getTemplatesList,
} from "@/services/user.service";
import {
  getDeeplinkData,
  getEventName,
  getPagePath,
  getPlansDetails,
  jsonToQueryParams,
  generateRandomString,
  getCurrentTime,
} from "@/services/utility.service";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { actions, useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ImageConfig } from "@/config/ImageConfig";
import {
  sendEvent,
  distroAnalyicsEventCall,
  cpAnalyticsAPI,
} from "@/services/analytics.service";
import { CardConstant } from "@/.i18n/locale";
import { analyticsForMyReco, postRecoData } from "@/services/myReco.service";
import { SectionsContext } from "../sections/sectionsContext";
import HorizantalPoster from "./cardTypes/HorizantalPoster.component";
import usePostApiMutate from "@/hooks/usePostApidata";
import ContetPartnerPopup from "../contentpartnerpopup/ContentPartner.component";

const BottomLayout = dynamic(
  () => import("../bottomLayout/bottomLayout.component")
);
const SharePopup = dynamic(() => import("../popups/share/share-popup"));
const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const CardPreview = dynamic(
  () => import("./cardPreview/cardPreview.component")
);

// Card components
const SheetPoster = dynamic(() => import("./cardTypes/sheetPoster.component"));
const OverlayIconPoster = dynamic(
  () => import("./cardTypes/overlayIconPoster.component")
);
const NetworkPoster = dynamic(
  () => import("./cardTypes/networkPoster.component")
);
const IconPoster = dynamic(() => import("./cardTypes/iconPoster.component"));
const SquarePoster = dynamic(
  () => import("./cardTypes/squarePoster.component")
);
const EdgePoster = dynamic(() => import("./cardTypes/edgePoster.component"));
const LargePoster = dynamic(() => import("./cardTypes/largePoster.component"));
const PromoPoster = dynamic(() => import("./cardTypes/promoPoster.component"));
const CirclePoster = dynamic(
  () => import("./cardTypes/circlePoster.component")
);
const ContentPoster = dynamic(
  () => import("./cardTypes/contentPoster.component")
);

const CustomPoster = dynamic(
  () => import("./cardTypes/customPoster.component")
);
const RollerPoster = dynamic(
  () => import("./cardTypes/rollerPoster.component")
);

const ShortsRollerPoster = dynamic(
  () => import("./cardTypes/shortsRollerPoster.component")
);
const ExpandsPoster = dynamic(
  () => import("./cardTypes/expandsPoster.component")
);
const ExpandRollerPoster = dynamic(
  () => import("./cardTypes/expandRollerPoster.component")
);
const ExpandActionPoster = dynamic(
  () => import("./cardTypes/expandActionPoster.component")
);
const OverlayPoster = dynamic(
  () => import("./cardTypes/overlayPoster.component")
);

const LivePoster = dynamic(() => import("./cardTypes/livePoster.component"));
const TagPoster = dynamic(() => import("./cardTypes/tagPoster.component"));
const Card = ({
  eleIndex,
  pagedata,
  item,
  cardType,
  cWidth = 100,
  CHeight = 100,
  noofCards,
  nofcardsperSlide,
  originMedium,
  searchQuery,
  sectionData = {},
  sectionInfo = {},
  removeCard,
  isGirdPage,
  isChannelContent,
}) => {
  const {
    state: {
      userDetails,
      NotificationBar,
      navigateFrom,
      cardPreviewData,
      localLang,
    },
    dispatch,
  } = useStore();
  const expands_poster_scroll_height = useRef(null);
  const [expand_poster_scroll_height, set_expands_poster_scroll_height] =
    useState(0);

  const { mutate: mutateDeeplinkAPi, data: deepLinkData } = useGetApiMutate();
  const { mutate: addFavourites, data: favouritedData } = useGetApiMutate();
  const mutateNotificationDetails = usePostApiMutate();
  const [isBottomLayoutOpen, setIsBottomLayoutOpen] = useState(false);
  const [popupData, setPopUpData] = useState({});
  const [templateData, setTemplateData] = useState({});
  const [cardData, setCardData] = useState(item);
  const [randomId, setRandomId] = useState("");
  const [showpreviewplayer, setShowpreviewPlayer] = useState(false);
  const [contentpartnerpopup, setContentpartnerpopup] = useState(undefined);
  let timer = useRef();
  const previewRef = useRef();

  const router = useRouter();
  const { onFavStatusChange, favInfo } = useContext(SectionsContext);

  const { mutate: mutateGetStreamDatas, data: streamDataResponses } =
    getApiStaticData();
  const [clickaanalyticsData, setclickaanalyticsData] = useState("");
  useEffect(() => {
    set_expands_poster_scroll_height(
      expands_poster_scroll_height?.current?.clientHeight
    );
    prepareMarkers(item);
  }, [pagedata]);

  useEffect(() => {
    setRandomId(generateRandomString(10));
  }, [item]);

  useEffect(() => {
    if (
      randomId != cardPreviewData &&
      randomId != "" &&
      cardPreviewData != null
    ) {
      if (cardType === "expands_preview_poster") {
        previewHide();
      }
    }
  }, [cardPreviewData]);

  useEffect(() => {
    if (!!deepLinkData?.data?.response) {
      if (deepLinkData.data?.status) {
        let dL = getDeeplinkData(deepLinkData?.data?.response);
        // MYRECO :for deeplink watch time value default value is 1
        postRecoData({ onWatchTimer: 1 });
        let handle = navigateToWrapper(() => {
          cpAnalyticsAPI(clickaanalyticsData);
          if (browserName.includes("Safari")) {
            window.location.href = dL;
          } else {
            window.open(dL);
          }
        });
        handle(deepLinkData?.data?.response.partnerCode);

        // if (!handle) {
        //   window.location.href = dL;
        // }
      }
    } else if (deepLinkData?.data?.error?.message) {
      dispatch({
        type: actions.NotificationBar,
        payload: { message: deepLinkData.data?.error?.message },
      });
    }
  }, [deepLinkData]);

  function getImagePath(path) {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  }

  const myRecoAnalytics = (data) => {
    let carouselPosition;
    let contentPosition;
    if (eleIndex.length == 2) {
      [carouselPosition, contentPosition] = eleIndex;
      carouselPosition += 1;
    } else {
      [carouselPosition, contentPosition] = ["", eleIndex];
    }
    carouselPosition = carouselPosition.toString() || "";
    contentPosition = contentPosition.toString() || "";
    const myRecoAnalyticsData = {
      contentPath: data?.targetPath?.includes("play")
        ? data.targetPath
        : data.target.path,
      carouselPosition,
      contentPosition,
      trackingId: sectionData?.sectionData?.myRecoTrackingId || "",
      originMedium,
    };
    if (originMedium == "S" && searchQuery != "") {
      myRecoAnalyticsData.originName = searchQuery;
      if (searchQuery == "searchPage")
        myRecoAnalyticsData.originName = data?.display?.title;
    } else {
      myRecoAnalyticsData.originName = sectionData?.sectionInfo?.name || "";
    }
    const pagePath = {
      dataType: sectionData?.sectionInfo?.dataType,
      pagePath: router.asPath,
    };
    analyticsForMyReco(myRecoAnalyticsData, pagePath);
  };

  const openProgInfoPopUp = (data, profile = "") => {
    console.log(data, "2378987654");
    if (
      data.name == "Freedom TV" ||
      data?.target?.path == "partner/freedomtv" ||  data?.target?.path == "partner/fliqs"
    ) {
      const sessionID = getItem("sessionId");
      const newObj = {
        header_button: data?.target?.path || "Freedom TV",
        cpCode: "freedom",
      };
      sendEvent("freedomTV", newObj);
    } else if (
      data?.target?.pageAttributes?.networkCode == "freedomtv" &&
      !isChannelContent
    ) {
      sendEvent("rail_banner_clicked", {
        rail_name: sectionData?.sectionInfo?.name || "-1",
        header_button: data?.targetPath || data?.target?.path || "-1",
        asset_title: data?.display?.title || "-1",
        media_type: data?.target?.pageAttributes?.mediaContentType || "-1",
        genre: data?.target?.pageAttributes?.genre || "-1",
        channel_partner: data?.target?.pageAttributes?.networkName || "-1",
        channel_id: data?.target?.pageAttributes?.channelId || "-1",
        // ip_address: "",
        time: getCurrentTime(),
        device: "web",
        cpCode: "freedom",
      });
      setItem("rail-name", sectionData?.sectionInfo?.name);
    } else if (isChannelContent) {
      //  console.log(data,"---data");
      if (data.cardType == "shorts_roller_poster") {
        sendEvent("channel_shorts", channelAnalytic(data));
      } else if (data?.target?.pageAttributes?.mediaContentType == "Movies") {
        sendEvent("channel_movie", channelAnalytic(data));
      } else {
        sendEvent("channel_series", channelAnalytic(data));
      }
    } else {
      sendEvent("rail_banner_clicked", analyticsData(true));
    }
    myRecoAnalytics(data);
    sessionStorage.setItem("isInternalNaviagtion", true);
    if (!!data.template) {
      let tempData = {};
      tempData["target_path"] = data.target.path;
      let templatesList = getTemplatesList();
      if (templatesList.length > 0) {
        templatesList.map((template) => {
          if (data.template === template.code) {
            let assignedTemplate = template;
            tempData.assignedTemplate = assignedTemplate;
            setTemplateData(tempData);
            setIsBottomLayoutOpen(true);
          }
        });
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: "Sorry template not found." },
        });
      }
    } else if (data?.target?.pageAttributes?.isDeeplinking == "true") {
      getDeeplinkInfo(data.target.path);
    } else if (data?.metadata?.gameszop) {
      // If logged in, adding sub query param
      if (data.metadata.gameszop.value == "externalbrowser") {
        window.open(
          `${data.target.path}${userDetails?.externalUserId ? `?sub=${userDetails?.externalUserId}` : ""}`,
          "_blank"
        );
      } else {
        window.open(
          `${data.target.path}${userDetails?.externalUserId ? `?sub=${userDetails?.externalUserId}` : ""}`,
          "_self"
        );
      }
    } else {
      if (!!profile) {
        router.push(data?.metadata?.parentIconPath?.value);
      } else {
        if (data.cardType == "shorts_roller_poster") {
          dispatch({ type: actions.navigateFrom, payload: router.asPath });
        }
        if (data?.target?.pageAttributes?.hasSubMenus == "true") {
          let path = `${data?.target?.path}?cpcontent=all`;
          router.push(path);
        } else {
          router.push(data?.target?.path);
        }
      }
    }
  };

  const channelAnalytic = (data) => {
    // console.log(data, "---data")
    let tempObj = {
      channel_id: data?.target?.pageAttributes?.channelId || "-1",
      channel_name:
        data?.display?.parentName || data?.display?.subtitle1 || "-1",
      cpCode: "freedom",
    };
    return tempObj;
  };

  const getDeeplinkInfo = (tPath) => {
    setclickaanalyticsData(tPath);
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
    // console.log(apiData.showNotification);
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
            let watchObj = { ...analyticsData(), ...getPlansDetails(true) };
            sendEvent("play_button_clicked", watchObj);
            setContentpartnerpopup({
              topImg: true,
              topImgValue: getNetworkIcon(networkCode),
              networkId: networkCode,
              isActive: true,
              sendData: handelNotificationPopup,
              navigateTo: () => navigateToFunc(),
            });
          } else {
            let watchObj = { ...analyticsData(), ...getPlansDetails(true) };
            sendEvent("play_button_clicked", watchObj);
            navigateToFunc();
          }
        } else if (notificationDetails.error.code === -101) {
          navigateToFunc();
        }
      })();
    };
  };

  const checkDeeplink = (cData) => {
    console.log("called");
    myRecoAnalytics(cData);
    if (cData?.targetPath === "deeplink") {
      getDeeplinkInfo(cData?.target?.path);
    } else if (!!cData.targetPath) {
      let watchObj = { ...analyticsData(), ...getPlansDetails(true) };
      if (cData?.targetPath?.includes("play")) {
        sendEvent("play_button_clicked", watchObj);
      }
      router.push(cData.targetPath);
    }
  };

  const prepareMarkers = (data) => {
    if (data?.display?.markers?.length > 0) {
      data.display.markers.forEach((marker) => {
        switch (marker.markerType) {
          case "rating": {
            data.display.ratingMarker = marker;
            break;
          }
          case "tag": {
            data.display.tagMarker = marker;
            data.display.bgTagColor = getColorCode(marker.bgColor);
            data.display.textTagColor = getColorCode(marker.textColor);
            break;
          }
          case "expiryInfo": {
            data.display.expiryInfo = marker;
            data.display["expiryInfoDisplay"] = marker.value.split("@");
            break;
          }
          case "badge": {
            data.display.badgeMarker = marker;
            data.display.bgColor = getColorCode(marker.bgColor);
            data.display.textColor = getColorCode(marker.textColor);
            break;
          }
          case "special": {
            marker.value == "live_dot" && (data.display.liveMarker = marker);
            marker.value == "now_playing" &&
              (data.display.nowPlayingMarker = marker);
            marker.value == "playable" &&
              (data.display.playableMarker = marker);
            break;
          }
          case "duration": {
            data.display.durationMarker = marker;
            break;
          }
          case "seek": {
            data.display.seekMarker = marker;
            data.display.seekedValue = getSeekValue(marker.value);
            data.display.textSeekColor = getColorCode(marker.textColor);
            data.display.bgSeekColor = getColorCode(marker.bgColor);
            break;
          }
          case "startTime": {
            data.display.startTime = marker.value;
            break;
          }
          case "exipiryDays": {
            data.display.expiryMarker = marker;
            break;
          }
          case "available_soon": {
            data.display.availableSoon = marker;
            break;
          }
          case "leftOverTime": {
            data.display.leftOverTimeMarker = marker;
            data.display.textLeftColor = getColorCode(marker.textColor);
            data.display.bgLeftColor = getColorCode(marker.bgColor);
            break;
          }
          case "showtitle": {
            marker.value === "false" && (data.display.showtitle = marker);
            data.display.textColor = getColorCode(marker.textColor);
            data.display.bgColor = getColorCode(marker.bgColor);
            break;
          }
          case "ButtonText": {
            data.display.ButtonText = marker.value;
            break;
          }
          default:
            break;
        }
      });
    }

    if (data?.hover?.elements?.length > 0) {
      data.hover.elements.forEach((element) => {
        switch (element.key) {
          case "name":
            data.name = element.value;
            break;
          case "description":
            data.description = element.value;
            break;
          case "subtitle":
            data.subtitle = element.value;
            break;
          case "subtitle1":
            data.subtitle1 = element.value;
            break;
          case "showPlayButton":
            data.showPlayButton = element.value;
            break;
          case "targetPath":
            data.targetPath = element.value;
            break;
          case "showFavouriteButton":
            data.showFavouriteButton = element.value;
            break;
          case "isFavourite":
            data.isFavourite = element.value;
            break;
          case "showButton":
            data.showButton = element.value;
            break;
          case "ButtonText":
            data.ButtonText = element.value;
            break;
          case "showWatchButtonText":
            data.showWatchButtonText = element.value;
            break;
          case "favOnHoverText":
            data.favOnHoverText = element.value;
            break;
          case "shareOnHoverText":
            data.shareOnHoverText = element.value;
            break;
          case "favouriteTargetPath":
            data.favouriteTargetPath = element.value;
            break;
          case "showShareButton":
            data.showShareButton = element.value;
            break;
          case "showWatchButton":
            data.showWatchButton = element.value;
            break;
          case "previewUrl":
            data.previewUrl = element.value;
            break;
          default:
            break;
        }
      });
    }
    setCardData({ ...data });
  };

  const getColorCode = (color) => {
    if (!!color) {
      try {
        return "#" + color.substring(2);
      } catch (e) {}
    } else {
      return null;
    }
  };

  const getSeekValue = (value) => {
    try {
      if (value != "0" && value != "1") {
        let intval = parseFloat(value) * 100;
        let fval = intval.toString().substring(0, 2);
        return parseInt(fval) == 0 ? 1 : parseInt(fval);
      } else if (value != "1") {
        return 100;
      } else {
        return 0;
      }
    } catch (e) {}
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
    let pop = {
      type: "share",
      isActive: true,
      targetpath:
        item?.targetPath === "plans/list" || item?.targetPath === "deeplink"
          ? item.target.path
          : item.targetPath,
      img: appConfig.appLogo,
      closeTarget: handleClose,
      analyticsObj: { ...analyticsData() },
    };
    sendEvent("share", analyticsData());
    setPopUpData(pop);
  };

  const popupDataSet = () => {
    let pop = {
      type: "signin",
      isActive: true,
      title1:
        CardConstant[localLang]?.Signin_To_Use ||
        "To access this feature please signin",
      yesButton1: CardConstant[localLang]?.Sign_In || "Sign In",
      yesButtonType: "",
      yesButtonTarget1: navigateToSignIn,
      noButton1: CardConstant[localLang]?.Cancel || "Cancel",
      noButtontarget1: onPopupCancel,
      noButtonType: "",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  // Combining local and server state to check if a card is marked as fav or not
  const getIsFavValue = (cardData) => {
    let isFavourite = cardData?.isFavourite === "true";

    if (favInfo?.added?.[cardData?.targetPath]) {
      isFavourite = true;
    }
    if (favInfo?.removed?.[cardData?.targetPath]) {
      isFavourite = false;
    }
    return isFavourite;
  };

  const addTofav = (data) => {
    const isFavourite = getIsFavValue(data)?.toString();

    const action = isFavourite === "true" ? 2 : 1;
    const path = data.favouriteTargetPath;
    if (!!userDetails) {
      try {
        const apiUrl =
          process.env.initJson["api"] +
          `/service/api/auth/user/favourite/item?path=${path}&action=${action}`;
        addFavourites(apiUrl);

        // update in context here
        onFavStatusChange(
          data.favouriteTargetPath,
          isFavourite.toString() === "true" ? "remove" : "add"
        );

        setCardData({
          ...cardData,
          isFavourite: isFavourite.toString() === "true" ? "false" : "true",
        });
        sendEvent("favorite", analyticsData());
      } catch (error) {}
    } else {
      popupDataSet();
    }
  };

  const onPopupCancel = () => {
    handleClose();
  };

  const isLeftCard = (eleIndex) => {
    let slideElement = document.querySelector(
      `div[data-test-slide='slide-${eleIndex[0]}-${eleIndex[1]}']`
    );
    return slideElement.classList.contains("swiper-slide-active");
  };

  const isRightCard = (eleIndex) => {
    let slideElement = document.querySelector(
      `div[data-test-slide='slide-${eleIndex[0]}-${Math.abs(nofcardsperSlide - 1 - eleIndex[1])}']`
    );
    return slideElement.classList.contains("swiper-slide-active");
  };

  const previewShow = () => {
    clearTimeout(timer.current);
    dispatch({ type: actions.cardPreviewData, payload: randomId });

    setShowpreviewPlayer(true);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      if (document.getElementById(randomId)) {
        if (document.querySelector(`div.${styles.right_edge_card}`)) {
          document
            .querySelector(`div.${styles.right_edge_card}`)
            .classList.remove(styles.right_edge_card);
        }
        if (document.querySelector(`div.${styles.left_edge_card}`)) {
          document
            .querySelector(`div.${styles.left_edge_card}`)
            .classList.remove(styles.left_edge_card);
        }

        document
          .getElementById(randomId)
          .classList.add(`${styles.preview_hoverd}`);
        // let slide = document.querySelector(`div[data-test-slide='slide-${eleIndex[0]}-${eleIndex[1]}']`)
        if (!eleIndex) return;
        let preview_ele = document.querySelector(
          `div[data-test-slide='slide-${eleIndex[0]}-${eleIndex[1]}'] .${styles.overlaypreview}`
        );
        if (!preview_ele) return;
        if (isLeftCard(eleIndex)) {
          preview_ele.classList.add(styles.left_edge_card);
        } else if (isRightCard(eleIndex)) {
          preview_ele.classList.add(styles.right_edge_card);
        }
      }
    }, 500);
  };

  const previewHide = () => {
    setShowpreviewPlayer(false);
    if (
      document
        .getElementById(randomId)
        ?.classList.contains(styles.preview_hoverd)
    ) {
      // document.getElementById(randomId).style.display = "none";
      document
        .getElementById(randomId)
        .classList.remove(`${styles.preview_hoverd}`);
    }
    if (timer.current) {
      clearTimeout(timer.current);
    }
  };

  // next's loader is encoding the url, to get past this you can define your own loader which simply returns src
  const loaderProp = ({ src }) => {
    return src;
  };

  const analyticsData = (send_rail = false) => {
    let isGridView = pagedata?.info?.pageType == "list";
    let pageOrMenu = getEventName(
      getPagePath(router.asPath.replace("/", "")),
      pagedata?.info,
      isGridView
    );
    let cardObj = {
      rail_name: sectionData?.sectionInfo?.name
        ? sectionData?.sectionInfo?.name
        : "-1",
      header_button: pageOrMenu,
      banner_title: cardData?.display?.title,
      channel_partner: cardData?.target?.pageAttributes?.networkName,
    };
    if (!send_rail) {
      cardObj["asset_title"] = cardData?.display?.title;
      cardObj["media_type"] =
        cardData?.target?.pageAttributes?.mediaContentType;
      cardObj["genre"] = cardData?.target?.pageAttributes?.genre;
      cardObj["redirection_link"] = cardData?.target?.path;
    }
    if (cardData?.target?.pageAttributes?.tvShowName) {
      cardObj["series_name"] = cardData?.target?.pageAttributes?.tvShowName;
    }
    if (cardData?.target?.pageAttributes?.seasonSeqNo) {
      cardObj["season_number"] = cardData?.target?.pageAttributes?.seasonSeqNo;
    }
    if (cardData?.target?.pageAttributes?.episodeSeqNo) {
      cardObj["episode_number"] =
        cardData?.target?.pageAttributes?.episodeSeqNo;
    }
    return cardObj;
  };

  const isFavourite = getIsFavValue(cardData);

  return (
    <>
      {cardData && (
        <div className={`${styles.cardsHome} cardsHome`}>
          {cardType !== "expands_preview_poster" && (
            <DynamicCardComponent
              eleIndex={eleIndex}
              addTofav={addTofav}
              BadgeText={BadgeText}
              cardData={cardData}
              cardType={cardType}
              checkDeeplink={checkDeeplink}
              CHeight={CHeight}
              cWidth={cWidth}
              loaderProp={loaderProp}
              previewShow={previewShow}
              previewHide={previewHide}
              shareDataSet={shareDataSet}
              timer={timer}
              openProgInfoPopUp={openProgInfoPopUp}
              removeCard={removeCard}
              sectionInfo={sectionInfo}
              item={item}
              isGirdPage={isGirdPage}
            />
          )}

          {cardType === "expands_preview_poster" && (
            <div
              className={`${styles.expands_preview_poster}`}
              onMouseEnter={previewShow}
              onMouseLeave={() => {
                if (timer.current) {
                  previewHide();
                }
              }}
            >
              {/* <p>{CHeight + expand_poster_scroll_height}</p> */}
              <div
                className={`${styles.card_inner}`}
                style={{
                  height: CHeight + expand_poster_scroll_height,
                  width: cWidth,
                }}
              >
                <div
                  style={{
                    height: CHeight + expand_poster_scroll_height,
                    width: cWidth,
                  }}
                >
                  <div
                    className={`${styles.card_header}`}
                    onClick={() => openProgInfoPopUp(cardData)}
                  >
                    <Image
                      className={` ${styles.main_img}`}
                      alt={cardData?.display.title}
                      loader={loaderProp}
                      src={getImagePath(cardData?.display.imageUrl)}
                      width={cWidth || 0}
                      height={CHeight || 0}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
                      }}
                    />
                    {!!cardData?.display?.badgeMarker && (
                      <BadgeText badgeMarker={cardData.display.badgeMarker} />
                    )}
                    <div
                      className={` ${styles.text_scroll}`}
                      ref={expands_poster_scroll_height}
                    >
                      <div className={` ${styles.top_section}`}>
                        <h3>{cardData?.display.title}</h3>
                        <h6>{cardData?.display.subtitle1}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {cardType === "expands_preview_poster" && (
        <div
          className={`${styles.overlaypreview}`}
          id={randomId}
          onMouseLeave={previewHide}
          ref={previewRef}
        >
          {/* ${eleIndex == 0 && `${styles.leftoverlay}`} */}
          <div className={`${styles.overlaypreview_info}`}>
            <div className={`${styles.overlaypreview_inner}`}>
              <div className={`${styles.expand_header}`}>
                {/* <img className={`${styles.expand_img}`} src={getImagePath(cardData?.display.imageUrl)} onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src=`${ImageConfig?.defaultMoviePoster}`;
                }}/> */}
                {showpreviewplayer && (
                  <CardPreview
                    preview_url={cardData?.previewUrl}
                    posterImg={getImagePath(cardData?.display.imageUrl)}
                  />
                )}
                {!!cardData?.display?.badgeMarker && (
                  <BadgeText badgeMarker={cardData.display.badgeMarker} />
                )}
              </div>
              <div className={`${styles.expand_info}`}>
                <div className={` ${styles.actions}`}>
                  <button
                    onClick={() => {
                      checkDeeplink(cardData);
                    }}
                    className={` ${styles.defaultBtn} primary ${cardData.showButton === `${styles.playBtn}` ? "hello" : ""}`}
                  >
                    {cardData?.ButtonText?.includes(" ")
                      ? cardData?.ButtonText?.split(" ")[0]
                      : cardData?.ButtonText}
                  </button>
                  <div className={`${styles.share_like}`}>
                    {!!cardData.showFavouriteButton && (
                      <button
                        className={` ${styles.like}`}
                        onClick={() => addTofav(cardData)}
                      >
                        {isFavourite && (
                          <img
                            src={`${ImageConfig?.playerDescription?.watchedTick}`}
                            alt="favorite"
                          />
                        )}
                        {!isFavourite && (
                          <img
                            src={`${ImageConfig?.playerDescription?.plusGray}`}
                            alt="favorite"
                          />
                        )}
                        <span>{cardData?.favOnHoverText}</span>
                      </button>
                    )}
                    {!!cardData.showShareButton && (
                      <button
                        className={` ${styles.share}`}
                        onClick={() => shareDataSet(cardData)}
                      >
                        <img
                          fill
                          src={`${ImageConfig?.card?.share}`}
                          alt="share"
                        />
                        <span>{cardData?.shareOnHoverText}</span>
                      </button>
                    )}
                  </div>
                </div>
                <h3>{cardData?.display.title}</h3>
                <div className={`${styles.expand_category}`}>
                  {cardData?.display.subtitle1?.includes("|") ? (
                    cardData?.display.subtitle1?.split("|").map((ele) => {
                      return <span>{ele}</span>;
                    })
                  ) : (
                    <span>{cardData?.display.subtitle1}</span>
                  )}
                </div>
                <p className={` ${styles.sm_title}`}>{cardData?.subtitle2}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBottomLayoutOpen && (
        <BottomLayout
          open={isBottomLayoutOpen}
          onClose={() => setIsBottomLayoutOpen(false)}
          templateData={templateData}
        />
      )}

      {popupData.isActive && popupData.type != "share" && (
        <PopupModal popupData={popupData}></PopupModal>
      )}

      {popupData.isActive && popupData.type === "share" && (
        <SharePopup popupData={popupData}></SharePopup>
      )}

      {contentpartnerpopup && (
        <ContetPartnerPopup popupData={contentpartnerpopup} />
      )}
    </>
  );
};

const BadgeText = ({ badgeMarker }) => {
  return (
    <span
      className={styles.rent}
      style={{
        backgroundColor: "#" + badgeMarker?.bgColor,
        color: "#" + badgeMarker?.textColor,
      }}
    >
      {badgeMarker?.value}
    </span>
  );
};

export default Card;

const DynamicCardComponent = (props) => {
  const components = {
    // expands_preview_poster: ExpandsPreviewPoster,
    circle_poster: CirclePoster,
    sheet_poster: SheetPoster,
    top10_landscape_poster: OverlayPoster,
    overlayIcon_poster: OverlayIconPoster,
    network_poster: NetworkPoster,
    icon_poster: IconPoster,
    edge_poster: EdgePoster,
    square_poster: SquarePoster,
    large_poster: LargePoster,
    promo_poster: PromoPoster,
    content_poster: ContentPoster,
    custom_poster: CustomPoster,
    roller_poster: RollerPoster,
    shorts_roller_poster: ShortsRollerPoster,
    top10_portrait_poster: RollerPoster,
    expands_poster: ExpandsPoster,
    expand_roller_poster: ExpandRollerPoster,
    expand_action_poster: ExpandActionPoster,
    overlay_poster: OverlayPoster,
    expand_poster: OverlayPoster,
    live_poster: LivePoster,
    tag_poster: TagPoster,
    horizontal_poster: HorizantalPoster,
    default: SheetPoster, // Default card component
  };
  const ResolvedComponent =
    components?.[props?.cardType] || components?.default; // Fallback for new cardType will be sheetposter
  return <ResolvedComponent {...props} />;
};
