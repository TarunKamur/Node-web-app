import React, { useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import Scrollbar from "react-scrollbars-custom";
import styles from "@/components/tvshowDetails/tvshowDetails.module.scss";
import { getAbsolutePath } from "@/services/user.service";
import { useRouter } from "next/router";
import useGetApiMutate from "@/hooks/useGetApidata";
import { appConfig } from "@/config/app.config";
import {
  TvshowDetailsconstant,
  signupconstant,
  PopUpDataConst,
} from "@/.i18n/locale";
import { postRecoData } from "@/services/myReco.service";
import {
  getPagePath,
  getResolution,
  decryptData,
  encryptData,
  getPlansDetails,
} from "@/services/utility.service";
import dynamic from "next/dynamic";
import Image from "next/image";
import usePostApiMutate from "@/hooks/usePostApidata";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent, cpAnalyticsAPI } from "@/services/analytics.service";
import { useWindowSize } from "@/hooks/useWindowSize";
import ShakaBannerVideo from "../bannersV2/ShakaBannerVideo.component";
import PageLoader from "../loader/page-loder.component";
import InnerHtmlRenderer from "../innerHtmlRenderer/InnerHtmlRenderer";
import TvShowDetailsPageActions from "./tvshowDetailsActions.component";
import ContetPartnerPopup from "../contentpartnerpopup/ContentPartner.component";
import { browserName } from "react-device-detect";
import Link from "next/link";
import { deleteItem, getItem, setItem } from "@/services/local-storage.service";
import { getCurrentTime } from "@/services/utility.service";
import { SystemConfig } from "@/store/actions";
import { systemConfigs } from "@/services/user.service";

const PopupModal = dynamic(
  () => import("@/components/popups/generic/popup-modal")
);

const OverlayPopupModal = dynamic(
  () => import("@/components/popups/overlay-popup/overlay-popup-modal")
);
const SharePopup = dynamic(() => import("../popups/share/share-popup"));
const Razorpay = dynamic(
  () => import("@/components/packages/razorpay/Razorpay.component"),
  { ssr: false }
);

const TvshowDetails = () => {
  const {
    state: { PageData, userDetails, SystemFeature, localLang },
    dispatch,
  } = useStore();
  const [playingData, setPlayingData] = useState([]);
  const [detailsObj, setDetailsobj] = useState({});
  const [popupData, setPopUpData] = useState({});
  const [isloggedin, setIsLoggedIn] = useState(null);
  const [contentPath, setContentPath] = useState("");
  const [trailerStreamUrl, setTrailerStreamUrl] = useState("");
  const [isPaymentPending, setPaymentPending] = useState(false);
  const { mutate: addFavourites, data: favouriteData } = useGetApiMutate();
  const { mutate: addLoved, data: lovedData } = useGetApiMutate();
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const [isRazorpay, setIsRazorPay] = useState({ enabled: false, data: {} });
  const { mutate: deeplinkingdata, data: deepResponse } = useGetApiMutate();
  const { mutate: mutateGetStreamData, data: streamDataResponse } =
    useGetApiMutate();

  const { mutate: mutateFetchPaymentData, data: fetchPaymentDataResponse } =
    useGetApiMutate();
  const { mutate: mutateRazorPayment, data: razorPaymentResponse } =
    usePostApiMutate();
  const mutateNotificationDetails = usePostApiMutate();
  const [activePackage, setActivePackage] = useState({});
  const windowSize = useWindowSize();
  const [vodChannel, setVodChannel] = useState(false);
  const [contentpartnerpopup, setContentpartnerpopup] = useState(undefined);
  const [vodChannelBtn, setVodChannelBtn] = useState([
    {
      code: "Watchlist",
      text: TvshowDetailsconstant[localLang]?.Watch_List,
      img: ImageConfig?.playerDescription?.plusGray,
      isShow: true,
    },
    {
      code: "Share",
      text: TvshowDetailsconstant[localLang]?.Share,
      img: ImageConfig?.playerDescription?.shareIcon,
      isShow: true,
    },
    {
      code: "Like",
      text: TvshowDetailsconstant[localLang]?.Like,
      img: ImageConfig?.playerDescription?.likeGray,
      isShow: true,
    },
    {
      code: "Report",
      text: TvshowDetailsconstant[localLang]?.Report,
      img: ImageConfig?.playerDescription?.report,
      isShow: true,
    },
  ]);
  const [clickaanalyticsData, setclickaanalyticsData] = useState("");
  const [railName, setRailName] = useState(null);

  useEffect(() => {
    if (SystemFeature?.encryptApisList?.fields?.payment === "true") {
      let responseData = razorPaymentResponse?.data?.data;
      if (responseData) {
        try {
          responseData = JSON.parse(decryptData(responseData));
          if (responseData.status) {
            setIsRazorPay({ enabled: true, data: responseData.response });
          } else {
            dispatch({
              type: actions.NotificationBar,
              payload: { message: responseData.error?.message },
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      let responseData = razorPaymentResponse?.data;
      if (responseData) {
        if (responseData.status) {
          setIsRazorPay({ enabled: true, data: responseData.response });
        } else {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: responseData.error?.message },
          });
        }
      }
    }
  }, [razorPaymentResponse]);

  // console.log("PageData", PageData);

  useEffect(() => {
    // if (!!PageData) {
    //   const newSectionData = PageData?.data?.filter(
    //     (each) => each.paneType == "section"
    //   );
    //   if (newSectionData.length > 0) {
    //     const newRailName = newSectionData[0]?.section?.sectionInfo?.name;
    //     // console.log(newRailName);
    //     setRailName(newRailName);
    //   }
    // }
    const newRailName = getItem("rail_name");
    setRailName(newRailName);
    deleteItem("rail_name");
  }, [PageData]);

  const paymentCancelled = () => {
    setIsRazorPay({ enabled: false, data: {} });
  };

  const setContentIdChannelId = () => {
    if (!!PageData) {
      setItem(
        "channel-id-order-summary",
        PageData?.info?.attributes?.channelId || "-1"
      );
      setItem(
        "content-id-order-summary",
        PageData?.info?.attributes?.id || "-1"
      );
    }
  };

  useEffect(() => {
    if (fetchPaymentDataResponse?.data?.status) {
      let packagesInfo = {};
      const { data } = fetchPaymentDataResponse;
      setActivePackage(data?.response?.[0]);
      packagesInfo.userSelectedPack =
        data.response?.[0]?.packageInfo?.packages?.[0];
      packagesInfo.masterPack = data.response?.[0]?.packageInfo?.master;
      packagesInfo.suppGateWays = data.response?.[0]?.supportedGateway;
      // SVOD Type 1
      // TVOD Type 2
      packagesInfo.package_type = 2;
      if (packagesInfo.suppGateWays?.[0].code == "razorpay") {
        proceedToPayRazor(packagesInfo);
      } else if (packagesInfo?.suppGateWays?.[0]?.code == "stripe") {
        const pathname = `/buy/order-summary/${data?.response?.[0]?.packageInfo?.packages?.[0]?.id}`;
        router.push(
          {
            pathname,
            query: {
              path: router.asPath.replace("/", ""),
              package_type: packagesInfo.package_type,
              gateway: packagesInfo?.suppGateWays?.[0]?.code,
            },
          },
          pathname
        );
      }
    }
  }, [fetchPaymentDataResponse]);

  const proceedToPayRazor = (packagesInfo) => {
    const data = {
      gateway: "razorpay",
      packages: packagesInfo.userSelectedPack.id.toString(),
    };
    if (SystemFeature?.encryptApisList?.fields?.payment == "true") {
      const encryptObj = {
        data: encryptData(JSON.stringify(data)),
        metadata: encryptData(JSON.stringify({ request: "order/checkout" })),
      };
      postPaymentData(
        `${process.env.initJson.api}/service/api/v1/send`,
        encryptObj
      );
    } else {
      postPaymentData(
        `${process.env.initJson.api}/payment/api/v1/order/checkout`,
        data
      );
    }
  };

  const postPaymentData = (url, apiData) => {
    mutateRazorPayment({ url, apiData });
  };

  useEffect(() => {
    if (!!deepResponse?.data) {
      if (!!deepResponse?.data?.status) {
        let dL = getDeeplinkInfo(deepResponse?.data.response);
        !!clickaanalyticsData &&
          cpAnalyticsAPI(clickaanalyticsData).then(() => {
            setclickaanalyticsData("");
          });
        if (browserName.includes("Safari")) {
          window.location.href = dL;
        } else {
          window.open(dL);
        }
        postRecoData({ onWatchTimer: 1, contentPath });
        // if (!handle) {
        //   window.location.href = dL;
        // }
      } else if (
        deepResponse?.data?.error &&
        deepResponse?.data?.error?.code === 401
      ) {
      } else if (
        deepResponse?.data?.error &&
        deepResponse?.data?.error?.code === 405
      ) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: deepResponse?.data?.error?.message },
        });
      } else {
        console.warn(deepResponse?.data?.error);
      }
    } else {
    }
    // to handle mobile screen
    window.addEventListener("resize", handleResize);

    // removing event once component is unmounted
    return () => window.removeEventListener("resize", handleResize);
  }, [deepResponse]);

  useEffect(() => {
    detailObject();
  }, [PageData]);

  useEffect(() => {
    if (!!userDetails) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [userDetails]);

  useEffect(() => {
    if (streamDataResponse?.data?.response?.streams?.[0]?.url) {
      setTimeout(() => {
        setTrailerStreamUrl(
          streamDataResponse?.data?.response?.streams[0]?.url
        );
        handleResize();
      }, 3000);
    } else if (!!PageData?.info?.attributes?.trailerAssetId) {
      // setTimeout(() => {
      //   setTrailerStreamUrl(PageData?.info?.attributes?.trailerAssetId);
      //   handleResize();
      // }, 3000);
    }
  }, [streamDataResponse, PageData]);

  const analyticsData = () => {
    const path = router.asPath;
    if (Object.keys(vodChannel).length > 0) {
      let cardObj = {
        rail_name: railName || "-1",
        header_button: PageData?.info?.path || path,
        asset_title: detailsObj?.title,
        media_type: PageData?.info?.attributes?.mediaContentType || "-1",
        genre: PageData?.info?.attributes?.genre || "-1",
        series_name: "-1",
        channel_partner: PageData?.info?.attributes?.networkName || "-1",
        channel_id: PageData?.info?.attributes?.channelId || "-1",
        content_id: PageData?.info?.attributes?.id || "-1",
        time: getCurrentTime(),
        cpCode: "freedom",
      };
      if (PageData?.info?.attributes?.tvShowName) {
        cardObj.series_name = PageData?.info?.attributes?.tvShowName;
      }
      return cardObj;
    }
    let cardObj = {
      asset_title: detailsObj.title,
      banner_title: detailsObj.title,
      media_type: PageData?.info?.attributes?.mediaContentType || "-1",
      genre: PageData?.info?.attributes?.genre || "-1",
      channel_partner: PageData?.info?.attributes?.networkName || "-1",
      header_button: "Details_page",
      rail_name: "-1",
      ...getPlansDetails(true),
    };
    if (PageData?.info?.attributes?.tvShowName) {
      cardObj.series_name = PageData?.info?.attributes?.tvShowName;
    }
    if (PageData?.info?.attributes?.seasonSeqNo) {
      cardObj.season_number = PageData?.info?.attributes?.seasonSeqNo;
    }
    if (PageData?.info?.attributes?.episodeSeqNo) {
      cardObj.episode_number = PageData?.info?.attributes?.episodeSeqNo;
    }
    return cardObj;
  };

  const LikeAnalyticsData = () => {
    const path = router.asPath;
    const tempObj = {
      rail_name: railName || "-1",
      header_button: PageData?.info?.path || path,
      asset_title: detailsObj.title,
      media_type: PageData?.info?.attributes?.mediaContentType || "-1",
      genre: PageData?.info?.attributes?.genre || "-1",
      channel_partner: PageData?.info?.attributes?.networkName || "-1",
      channel_id: PageData?.info?.attributes?.channelId,
      content_id: PageData?.info?.attributes?.id,
      time: getCurrentTime(),
      "device type": "web",
      cpCode: "freedom",
    };
    if (PageData?.info?.attributes?.seasonSeqNo) {
      tempObj.season_number = PageData?.info?.attributes?.seasonSeqNo || "-1";
    }
    if (PageData?.info?.attributes?.episodeSeqNo) {
      tempObj.episode_number = PageData?.info?.attributes?.episodeSeqNo || "-1";
    }
    if (PageData?.info?.attributes?.tvShowName) {
      tempObj.series_name = PageData?.info?.attributes?.tvShowName || "-1";
    }
    let locationInfo = getItem("LocationData");
    if (locationInfo?.data?.ipInfo) {
      tempObj.City = locationInfo?.data?.ipInfo?.city;
      tempObj.State = locationInfo?.data?.ipInfo?.region;
      tempObj.Country = locationInfo?.data?.ipInfo?.country;
      tempObj.IPAddress = locationInfo?.data?.ipInfo?.trueIP;
    }
    console.log();

    return tempObj;
  };

  const reportAnalyticsData = (reportVideo) => {
    // console.log("PageData>>>>",PageData)
    const path = router.asPath;
    const tempObj = {
      rail_name: railName || "-1",
      banner_title: detailsObj.title || "-1",
      header_button: PageData?.info?.path || path,
      asset_title: detailsObj.title || "-1",
      media_type: PageData?.info?.attributes?.mediaContentType || "-1",
      genre: PageData?.info?.attributes?.genre || "-1",
      channel_partner: PageData?.info?.attributes?.networkName || "-1",
      channel_id: PageData?.info?.attributes?.channelId || "-1",
      content_id: PageData?.info?.attributes?.id || "-1",
      report_video: reportVideo || "-1",
      paid_content: "",
      cpCode: "freedom",
    };
    if (PageData?.info?.attributes?.seasonSeqNo) {
      tempObj.season_number = PageData?.info?.attributes?.seasonSeqNo;
    }
    if (PageData?.info?.attributes?.episodeSeqNo) {
      tempObj.episode_number = PageData?.info?.attributes?.episodeSeqNo;
    }
    if (PageData?.info?.attributes?.tvShowName) {
      tempObj.series_name = PageData?.info?.attributes?.tvShowName;
    }
    return tempObj;
  };

  const detailObject = () => {
    let details = {};
    let vodObjData = {};

    let bgImage = PageData.data.map((data) => {
      if (data.paneType === "content") {
        let bg = data.content.backgroundImage;
        details.title = data.content.title;
        details.BgImage = getImagePath(bg);
      }
    });
    let rentalInfoData = "";
    let expiryInfoData = "";
    let subtitle = PageData?.data.map((Content) => {
      Content.content?.dataRows.map((dataRow) => {
        dataRow.elements.map((element) => {
          if (element.elementSubtype == "partnerIcon") {
            details.partnerIcon = getImagePath(element.data);
          }
          if (element.elementSubtype === "subtitle") {
            details.subtitle = element.data;
          }
          if (element.elementSubtype === "pgrating") {
            details.pgrating = element.data;
          }
          if (element.elementSubtype === "imdb") {
            details.imdb = element.data;
          }
          if (element.elementSubtype === "resume") {
            element.seekedValue = getSeekValue(
              PageData.info.attributes.watchedPosition
            );
          }
          if (element.elementSubtype === "bgImage") {
            details.BgImage = getImagePath(element.data);
          }
          if (
            element.elementSubtype == "vodChanneltitle" ||
            element.elementSubtype == "vodChannelDescription"
          ) {
            vodObjData[element.elementSubtype] = element.data;
          }
          if (element.elementSubtype == "vodChannelIcon") {
            element.data = getImagePath(element.data);
            vodObjData[element.elementSubtype] = element;
          }
          if (
            element.elementSubtype == "rentalinfo" &&
            PageData?.info?.attributes?.networkCode == "freedomtv"
          ) {
            rentalInfoData = element;
          }
          if (
            element.elementSubtype == "expiryInfo" &&
            PageData?.info?.attributes?.networkCode == "freedomtv"
          ) {
            expiryInfoData = element;
          }
        });
      });
    });
    if (
      Object.keys(vodObjData).length !== 0 &&
      PageData?.info?.attributes?.networkCode == "freedomtv"
    ) {
      vodObjData.networkCode == PageData?.info?.attributes?.networkCode;
      setVodChannel(vodObjData);
    } else setVodChannel(false);

    let Buttons = PageData?.data.map((Content) => {
      Content.content?.dataRows.map((dataRow) => {
        if (dataRow.rowDataType === "button") {
          if (dataRow?.elements?.length > 0)
            dataRow?.elements?.map((each) => {
              if (
                each.elementSubtype == "rent" &&
                PageData?.info?.attributes?.networkCode == "freedomtv"
              ) {
                return (each.rentalInfoData = rentalInfoData);
              }
              if (
                each.elementSubtype == "watchnow" &&
                PageData?.info?.attributes?.networkCode == "freedomtv"
              ) {
                return (each.expiryInfoData = expiryInfoData);
              }
            });
          details.buttons = dataRow;
        }
      });
    });
    let Description = PageData?.data.map((Content) => {
      Content.content?.dataRows.map((dataRow) => {
        dataRow.elements.map((element) => {
          if (element.elementType === "description") {
            details.description = element.data;
          } else if (element.elementType == "text") {
            if (element.elementSubtype == "rentalinfo") {
              details.rentalinfo = element.data;
            } else if (element.elementSubtype == "expiryInfo") {
              details.expiryInfo = element.data.split("@");
            } else if (element.elementSubtype == "views") {
              details.views = element;
            } else if (element.elementSubtype == "contentLikesCount") {
              details.contentLikesCount = element;
            } else if (element.elementSubtype == "isContentLiked") {
              details.isContentLiked = element;
            }
          } else if (element.elementType === "button") {
            if (Object.keys(vodObjData).length !== 0) {
              // details.buttons = dataRow.elements;
              // console.log(">>>>dataRow.elements",dataRow.elements)
              // details.buttons = {
              //   elements: dataRow.elements,
              //   rowDataType: "button",
              //   rowNumber: 8,
              // };
            }
          }
        });
      });
    });
    // castcrew
    let castcrew = PageData.data.filter(
      (ele) =>
        ele.paneType == "section" && ele.section.sectionInfo.dataType == "actor"
    );
    if (!!castcrew?.length) {
      let cw = castcrew[0].section.sectionData.data.map(
        (ele) => ele.display.title
      );
      if (!!cw.length) details.castcrew = cw.join();
    }
    // fav
    details.showFavouriteButton = PageData.pageButtons?.showFavouriteButton;
    details.isFavourite = PageData.pageButtons?.isFavourite;
    fetchMovieTrailer(details);

    setDetailsobj(details);
    watchoFreedomtv(details);
    likedFreedomtvChk(details);
    reportFreedomtvChk(details);
  };
  const reportFreedomtvChk = (da) => {
    if (PageData?.pageButtons?.userReport?.showReportButton == true) {
    } else {
      vodChannelBtn[3].isShow = false;
    }
    setVodChannelBtn(vodChannelBtn);
  };
  const getSeekValue = (value) => {
    try {
      if (value != "0" && value != "1") {
        var intval = parseFloat(value) * 100;
        var fval = intval.toString().substring(0, 2);
        return parseInt(fval);
      } else if (value != "1") {
        return 100;
      } else {
        return 0;
      }
    } catch (e) {}
  };
  const fetchMovieTrailer = (details) => {
    console.log(details);
    try {
      const trailerElement = details?.buttons?.elements.find(
        (el) => el.elementSubtype === "trailer"
      );
      if (trailerElement?.target) {
        const { api } = process.env.initJson;
        const url = `${api}/service/api/v1/page/stream?path=${trailerElement?.target}&stream_type=trailer`;

        mutateGetStreamData(url);
      }
    } catch (error) {
      console.error("Error fetching movie trailer:", error);
    }
  };

  function getImagePath(path) {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  }

  const navigateToSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signin");
  };

  const navigateToSignUp = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signup");
  };

  const handleClose = () => {
    setPopUpData({});
  };

  const popupDataSet = () => {
    let pop = {
      type: TvshowDetailsconstant[localLang]?.signin,
      isActive: true,
      title1:
        TvshowDetailsconstant[localLang]?.To_access_this_feature_please_sign_in,
      yesButton1: TvshowDetailsconstant[localLang]?.Sign_In,
      yesButtonType: "",
      yesButtonTarget1: navigateToSignIn,
      noButton1: TvshowDetailsconstant[localLang]?.Cancel,
      noButtontarget1: handleClose,
      noButtonType: "",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
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

  const handelNotificationPopup = (data = null) => {
    if (data != null) {
      postNotificationDetails(data);
    }
    setContentpartnerpopup();
  };

  const navigateToWrapper = (navigateToFunc) => {
    return (data, e) => {
      e.preventDefault();
      let type = data.elementSubtype;
      if (
        [
          "watchnow",
          "watch_latest_episode",
          "resume",
          "startover",
          "trailer",
        ].includes(type)
      ) {
        (async () => {
          let notificationDetails = await postNotificationDetails({
            networkCode: PageData.info.attributes.networkCode,
          });
          if (notificationDetails.status === true) {
            let watchObj = analyticsData();
            if (notificationDetails.response.showNotification === true) {
              sendEvent("play_button_clicked", watchObj);
              setContentpartnerpopup({
                topImg: true,
                topImgValue: detailsObj.partnerIcon,
                networkId: PageData.info.attributes.networkCode,
                isActive: true,
                sendData: handelNotificationPopup,
                navigateTo: () => navigateToFunc(data, e),
              });
            } else {
              sendEvent("play_button_clicked", watchObj);
              navigateToFunc(data, e);
            }
          } else if (notificationDetails.error.code === -101) {
            navigateToFunc(data, e);
          }
        })();
      } else {
        navigateToFunc(data, e);
      }
    };
  };

  const navigateTo = navigateToWrapper((data, e) => {
    e.preventDefault();
    let analyticsObj = analyticsData();
    let type = data.elementSubtype;
    setContentPath(data.target);
    if (type === "Share") {
      let pop = {
        type: "share",
        isActive: true,
        targetpath: getPagePath(router.asPath),
        img: `${ImageConfig?.logo}`,
        closeTarget: handleClose,
        analyticsObj,
      };
      setPopUpData(pop);
      sendEvent("share", analyticsObj);
    } else if (
      type === "watchnow" ||
      type === "watch_latest_episode" ||
      type === "trailer"
    ) {
      sendEvent("play_button_clicked", analyticsObj);
      if (data?.properties?.isDeeplinking === "true") {
        let url =
          process.env.initJson.api +
          `/service/api/v1/page/deeplink?path=${data.target}`;
        type !== "trailer" && setclickaanalyticsData(data.target);
        deeplinkingdata(url);
      } else {
        router.push(data.target);
      }
    } else if (type === "subscribe") {
      if (vodChannel && Object.keys(vodChannel).length !== 0) {
        router.push(`plans/subscribe?_subscribe=${router.asPath.slice(1)}`);
        setContentIdChannelId();
        dispatch({ type: actions.navigateFrom, payload: router.asPath });
      } else if (data?.properties?.showPopUp === "true") {
        let pop = {
          type: "payment",
          isActive: data?.properties?.showPopUp === "true",
          topImg: data?.properties?.showPopUp === "true",
          topImgValue:
            "http://mobond.yuppcdn.net/cf1/static/slt/images/payment-failure.svg",
          title1: data?.properties?.title,
          title2: data?.properties?.subtitle,
          yesButtonTarget1: handleClose,
          yesButton1: "Cancel",
          yesButtonType: "primary",
          close: true,
          closeTarget: handleClose,
        };
        setPopUpData(pop);
      } else {
        dispatch({ type: actions.navigateFrom, payload: router.asPath });
        // router.push("/buy/packages-list");
        router.push("plans/list");
      }
    } else if (type == "resume") {
      sendEvent("play_button_clicked", analyticsObj);
      if (data?.properties?.isDeeplinking === "true") {
        let url =
          process.env.initJson.api +
          `/service/api/v1/page/deeplink?path=${data.target}`;
        setclickaanalyticsData(data.target);
        deeplinkingdata(url);
      } else {
        router.push(data.target);
      }
    } else if (type == "startover") {
      sendEvent("play_button_clicked", analyticsObj);
      if (data?.properties?.isDeeplinking === "true") {
        let url =
          process.env.initJson.api +
          `/service/api/v1/page/deeplink?path=${data.target}`;
        setclickaanalyticsData(data.target);
        deeplinkingdata(url);
      } else {
        dispatch({ type: actions.playerUtils, payload: { startover: true } });
        router.push(data.target);
      }
    } else if (type == "rent") {
      dispatch({ type: actions.navigateFrom, payload: router.asPath });
      if (isloggedin === false) {
        const pop = {
          type: "signin",
          isActive: true,
          title1:
            TvshowDetailsconstant[localLang]
              ?.To_access_this_feature_please_sign_in,
          title2: TvshowDetailsconstant[localLang]?.Sign_in_or_Join,
          yesButton1: TvshowDetailsconstant[localLang]?.Sign_In,
          yesButtonType: "primary",
          yesButtonTarget1: navigateToSignIn,
          // noButton1: signupconstant[localLang]?.Sign_Up,
          // noButtontarget1: navigateToSignUp,
          noButtonType: "secondary",
          close: true,
          closeTarget: handleClose,
        };
        setPopUpData(pop);
      } else if (vodChannel && Object.keys(vodChannel).length !== 0) {
        router.push(`plans/subscribe?_rent=${router.asPath.slice(1)}`);
        setContentIdChannelId();
      } else if (
        appConfig?.packageSettings?.paymentGateway?.typeOfPayment == "internal"
      ) {
        const path = router.asPath.replace("/", "");
        const params = new URLSearchParams({
          path,
          package_type: 2,
          skip_package_content: true,
        }).toString();
        const url = `${process.env.initJson.api}${process.env.packageURL}packages/info/for/content?${params}`;
        mutateFetchPaymentData(url);
      } else {
        dispatch({ type: actions.navigateFrom, payload: router.asPath });
        router.push({
          pathname: `/buy/packages-list`,
          query: {
            _rent: router.asPath.slice(1),
          },
        });
      }
    } else {
      router.push(data.target);
    }
  });

  const shareDataSet = () => {
    let pop = {
      type: "share",
      isActive: true,
      targetpath: getPagePath(router.asPath),
      img: `${appConfig?.appLogo}`,
      closeTarget: handleClose,
      analyticsObj: { ...analyticsData() },
    };
    setPopUpData(pop);
  };
  const getDeeplinkInfo = (data) => {
    if (data == undefined || data == "") {
      return undefined;
    }
    try {
      data = JSON.parse(data);
    } catch (e) {
      // return undefined;
    }
    if (!!data?.url && data.url.length != 0) {
      return data.url;
    }
    if (!!data?.contentCode) {
      let deepLink = data.contentCode.includes("//")
        ? data.contentCode.split("//")[1]
        : data.contentCode;
      return `https://${deepLink}`;
    }
    return undefined;
  };

  useEffect(() => {
    if (favouriteData?.data?.status) {
      const action = detailsObj.isFavourite ? 2 : 1;
      detailsObj.isFavourite = action === 1;
      setDetailsobj({ ...detailsObj });
      // console.log(action);
      // console.log("Pagedata", PageData);
      if (PageData?.info?.attributes?.networkCode == "freedomtv") {
        if (action == 1) {
          sendEvent("watchlist", analyticsData());
        } else {
          sendEvent("remove_watchlist", analyticsData());
        }
      } else {
        sendEvent("favorite", analyticsData());
      }

      let notify = {
        message: favouriteData?.data?.response?.message,
        // code: "freedom_tv",
      };
      if (Object.keys(vodChannel).length !== 0) {
        watchoFreedomtv(detailsObj);
        notify.code = "freedom_tv";
      }
      dispatch({
        type: actions.NotificationBar,
        payload: notify,
      });
    }
  }, [favouriteData]);

  const watchoFreedomtv = (details) => {
    const vodData = vodChannelBtn;
    if (details.isFavourite) {
      vodData[0].text = TvshowDetailsconstant[localLang]?.Remove_Watch_List;
      vodData[0].img = ImageConfig?.playerDescription?.watchedTick;
    } else {
      vodData[0].text = TvshowDetailsconstant[localLang]?.Watch_List;
      vodData[0].img = ImageConfig?.playerDescription?.plusGray;
    }
    setVodChannelBtn(vodData);
  };

  const addToFavourite = () => {
    if (!!isloggedin) {
      try {
        const action = detailsObj.isFavourite ? 2 : 1;
        const apiUrl =
          process.env.initJson.api +
          `/service/api/auth/user/favourite/item?path=${router.asPath.slice(1)}&action=${action}`;
        addFavourites(apiUrl);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      popupDataSet();
    }
  };

  const loaderProp = ({ src }) => {
    return src;
  };

  const shakaPlayerProps = () => {
    return {
      item: {
        imageUrl: detailsObj?.BgImage,
        customClass: "tvShowTrailerimage",
      },
      streamPath: {
        streamUrl: trailerStreamUrl,
        imageUrl: detailsObj?.BgImage,
        isbannerVideo: true,
      },
    };
  };
  const streamEnded = () => {
    setTrailerStreamUrl("");
  };

  const handleResize = () => {
    let resolution = getResolution();
    if (resolution.width < 991) streamEnded();
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  const vodChannelBtnFn = (e, data) => {
    if (!!isloggedin) {
      e.preventDefault();
      // console.log("798", data.code);
      if (data.code == "Report") {
        let pop = {
          type: "ReportPopup",
          isActive: true,
          title1: PopUpDataConst[localLang]?.Report_Video || "Report Video",
          title2: "",
          yesButton1: PopUpDataConst[localLang]?.Submit || "Submit",
          yesButtonType: "primary",
          yesButtonTarget1: onsubmitreport,
          noButton1: PopUpDataConst[localLang]?.Cancel || "Cancel",
          noButtontarget1: handleClose,
          noButtonType: "secondary",
          close: true,
          reportLoopData: "reportLoopData",
          closeTarget: handleClose,
          parentclassName: "reportPopUp",
        };
        if (PageData?.info?.attributes?.networkCode == "freedomtv") {
          pop.analyticsFn = reportAnalyticsData;
        }
        setPopUpData(pop);
      } else if (data.code == "Share") {
        let pop = {
          type: "share",
          isActive: true,
          targetpath: getPagePath(router.asPath),
          yesButtonTarget1: onsubmitreport,
          noButton1: "Cancel",
          noButtontarget1: handleClose,
          noButtonType: "secondary",
          close: true,
          closeTarget: handleClose,
          // analyticsObj,
        };
        setPopUpData(pop);
      } else if (data.code == "Watchlist" || data.code == "Remove watchlist") {
        addToFavourite();
      } else if (data.code == "Like") {
        favRemove();
      }
    } else if (data.code == "Share") {
      let pop = {
        type: "share",
        isActive: true,
        targetpath: getPagePath(router.asPath),
        yesButtonTarget1: onsubmitreport,
        noButton1: "Cancel",
        noButtontarget1: handleClose,
        noButtonType: "secondary",
        close: true,
        closeTarget: handleClose,
        // analyticsObj,
      };
      setPopUpData(pop);
    } else {
      popupDataSet();
    }
  };
  const onsubmitreport = (data) => {};
  const likedFreedomtvChk = (detailsObjDt) => {
    if (PageData?.pageButtons?.userLike?.showLikeButton == true) {
      if (detailsObjDt?.isContentLiked?.properties.isContentLiked == "true") {
        vodChannelBtn[2].text = TvshowDetailsconstant[localLang]?.Liked;
        vodChannelBtn[2].img = ImageConfig?.playerDescription?.likeFillWhite;
      } else {
        vodChannelBtn[2].text = TvshowDetailsconstant[localLang]?.Like;
        vodChannelBtn[2].img = ImageConfig?.playerDescription?.likeGray;
      }
    } else {
      vodChannelBtn[2].isShow = false;
    }
    setVodChannelBtn(vodChannelBtn);
    // console.log(">detailsObjDt>>", PageData?.pageButtons);
  };
  const favRemove = (e) => {
    if (!!userDetails) {
      const action =
        detailsObj?.isContentLiked?.properties.isContentLiked == "true" ? 2 : 1;
      // console.log("791", action);
      const apiUrl =
        process.env.initJson.api +
        `/service/api/auth/user/like?path=${router.asPath.slice(1)}&action=${action}`;
      setVodChannelBtn(vodChannelBtn);
      let hasImgStatusBeenDispatched = false;
      addLoved(apiUrl, {
        onSuccess: (response) => {
          if (response?.data?.status) {
            let notificData = {
              message: response?.data?.response?.message,
              code: "freedom_tv",
            };
            let windowWidth = window.innerWidth;
            if (windowWidth <= 991 && !hasImgStatusBeenDispatched) {
              notificData = {
                ...notificData,
                imgStatus: ImageConfig?.payments?.subscriptionSuccessful,
              };
              hasImgStatusBeenDispatched = true;
            }
            dispatch({
              type: actions.NotificationBar,
              payload: notificData,
            });
            let dupdetailsObj = detailsObj;
            if (dupdetailsObj?.isContentLiked?.properties) {
              dupdetailsObj.isContentLiked.properties.isContentLiked =
                dupdetailsObj.isContentLiked.properties.isContentLiked ===
                "true"
                  ? "false"
                  : "true";
            }

            setDetailsobj(dupdetailsObj);
            likedFreedomtvChk(dupdetailsObj);

            if (PageData?.info?.attributes?.networkCode == "freedomtv") {
              sendEvent(
                detailsObj?.isContentLiked?.properties.isContentLiked == "true"
                  ? "like"
                  : "unlike",
                LikeAnalyticsData()
              );
            }
          } else {
            const notificationData = {
              message: response?.data?.error?.message,
              code: "freedom_tv",
            };
            dispatch({
              type: actions.NotificationBar,
              payload: notificationData,
            });
          }
        },
      });
    } else {
      popupDataSet();
    }
  };

  return (
    <>
      {isPaymentPending && <PageLoader />}
      <div
        className={`${styles.tvshow_details_page} ${!!vodChannel && styles.freedomTvshow_details_page}`}
      >
        {isRazorpay.enabled && (
          <Razorpay
            razorpayData={isRazorpay.data}
            activePackage={activePackage}
            paymentCancelled={paymentCancelled}
          />
        )}
        <div className={`${styles.gradient_mask}`} />
        <div className={`${styles.gradient_mask2}`} />
        {!trailerStreamUrl && (
          <Image
            fill
            className={`${styles.image}`}
            loader={loaderProp}
            src={detailsObj.BgImage}
            alt="bg"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.srcset = `${ImageConfig?.defaultdetails}`;
            }}
          />
        )}

        {trailerStreamUrl && (
          <ShakaBannerVideo {...shakaPlayerProps()} streamEnd={streamEnded} />
        )}
        {detailsObj.partnerIcon && (
          <Image
            width={0}
            height={0}
            loader={loaderProp}
            className={`${styles.partnerIcon}`}
            src={detailsObj.partnerIcon}
            alt="image"
          />
        )}

        <div
          className={`${styles.mobile_info_top} ${styles.freedomTv_bck1} ${!!vodChannel && styles.freedomBackHeader}`}
        >
          <button
            className={`${styles.detailsBack} `}
            onClick={() => router.back()}
          >
            <img
              src={`${ImageConfig?.tvShowDetails?.helpBackArrow}`}
              alt="back"
            />
            <span>{detailsObj.title}</span>
          </button>
          <div className={styles.headerright}>
            <Link href="/search" aria-label="search icon">
              <img
                className={`${styles.searchIcon}`}
                src={`${ImageConfig?.mobileHeader?.searchIcon}`}
                alt="search_icon"
              />
            </Link>
          </div>
        </div>
        <div
          className={`${styles.mobile_info_top} ${!!vodChannel && styles.freedomBack}`}
        >
          <div className={`${styles.gradient_mask}`} />
          <div className={`${styles.gradient_mask2}`} />
          <button
            className={`${styles.detailsBack} ${!!vodChannel && styles.freedomBack}`}
            onClick={() => router.back()}
          >
            <img
              src={`${ImageConfig?.tvShowDetails?.helpBackArrow}`}
              alt="back"
            />
          </button>
          <img
            className={`${styles.img_responsive} ${styles.abs_image} `}
            src={detailsObj.BgImage}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.srcset = `${ImageConfig?.defaultdetails}`;
            }}
            alt=""
          />
          <div className={styles.headerright}>
            <Link href="/search" aria-label="search icon">
              <img
                className={`${styles.searchIcon}`}
                src={`${ImageConfig?.mobileHeader?.searchIcon}`}
                alt="search_icon"
              />
            </Link>
          </div>
        </div>

        <div className={`container-fluid ${styles.details}`}>
          {!!!vodChannel && (
            <div className={` ${styles.details_left}`}>
              <div className={` ${styles.details_header}`}>
                {detailsObj.partnerIcon && (
                  <Image
                    width={0}
                    height={0}
                    loader={loaderProp}
                    className={`${styles.partnerIcon_mobile}`}
                    src={detailsObj.partnerIcon}
                    alt="image"
                  />
                )}
                <h1 className={`${styles.title}`}>{detailsObj.title}</h1>
                <div className={`${styles.subtitle}`}>
                  <span>{detailsObj.subtitle}</span>
                  {detailsObj.pgrating && (
                    <span>
                      &nbsp; | &nbsp;
                      <span className={`${styles.pgrating}`}>
                        {detailsObj.pgrating}
                      </span>
                    </span>
                  )}
                  {detailsObj.imdb && (
                    <span>
                      &nbsp; | &nbsp;
                      <span className={`${styles.imdb}`}>
                        <img
                          src={`${ImageConfig?.tvShowDetails?.imdb}`}
                          alt="IMDB"
                        />
                        {detailsObj.imdb}
                      </span>
                    </span>
                  )}
                </div>
                {/* Mobile actions */}
                {windowSize.width <= 767 && (
                  <TvShowDetailsPageActions
                    detailsObj={detailsObj}
                    navigateTo={navigateTo}
                    addToFavourite={addToFavourite}
                    shareDataSet={shareDataSet}
                    navigateToSignIn={navigateToSignIn}
                  />
                )}
                {/* Mobile actions */}

                {detailsObj.description && (
                  <div className={`${styles.descDiv}`}>
                    {/* <Scrollbar> remove this in mobile */}
                    {/* commeneted to preserve the existing functionality */}
                    {/* <p
                  className={`${styles.description}`}
                  onClick={toggleDescription}
                >
                  {showFullDescription
                    ? detailsObj.description
                    : detailsObj.description.length > 200
                      ? detailsObj.description.slice(0, 200) + "... "
                      : detailsObj.description}
                  {detailsObj.description.length > 200 && (
                    <span className={`${styles.readMore}`}>
                      {showFullDescription ? " Show Less" : " Read More"}
                    </span>
                  )}
                </p> */}
                    {/* </Scrollbar> */}
                    <InnerHtmlRenderer
                      data={detailsObj?.description}
                      isDataTruncate={true}
                      customClass={styles.description}
                      styles={styles}
                    />
                  </div>
                )}
                {detailsObj.castcrew && (
                  <div className={`${styles.castDiv}`}>
                    <Scrollbar
                      trackYProps={{
                        renderer: (props) => {
                          const { elementRef, style, ...restProps } = props;
                          return (
                            <div
                              {...restProps}
                              ref={elementRef}
                              style={{
                                ...style,
                                background: "rgba(255,255,255,0.5)",
                              }}
                            />
                          );
                        },
                      }}
                    >
                      {/*  remove this in mobile */}
                      <p className={`${styles.casting}`}>
                        <span className={`${styles.castTitle}`}>
                          {TvshowDetailsconstant[localLang].Cast_Crew + " :"}
                        </span>
                        {detailsObj.castcrew}
                      </p>
                    </Scrollbar>
                  </div>
                )}
              </div>
              {/* <div className={`${styles.mobile_share_controls}`}>
          {detailsObj.showFavouriteButton && (
              <button
                key="fav-button"
                className={` ${styles.buttons} ${styles.fav} br2`}
                onClick={() => addToFavourite()}
              >
                {detailsObj.isFavourite ? (
                  <>
                    <img
                      className={`${styles.active_fav_icon}`}
                      src={`${ImageConfig?.tvShowDetails?.favoriteActive}`}
                    />
                    <span className={`${styles.fav_text}`}>{TvshowDetailsconstant[localLang].Favourited}</span>
                  </>
                ) : (
                  <>
                    <img
                      className={`${styles.fav_icon}`}
                      src={`${ImageConfig?.tvShowDetails?.favorite}`}
                    />
                    <span className={`${styles.fav_text}`}>{TvshowDetailsconstant[localLang].Favourite}</span>
                  </>
                )}
              </button>
            )}
            {
              PageData.shareInfo.isSharingAllowed && (
                <button className={`${styles.buttons} ${styles.share} br2`}
                  onClick={() => shareDataSet()}
                ><img src={`${ImageConfig?.tvShowDetails?.share}`} alt="share"/><span className={`${styles.fancy_tool_tip}`}>{TvshowDetailsconstant[localLang].Share}</span></button>
              )
            }
                </div> */}

              {/* Desktop actions */}
              {windowSize.width > 767 && (
                <TvShowDetailsPageActions
                  detailsObj={detailsObj}
                  navigateTo={navigateTo}
                  addToFavourite={addToFavourite}
                  navigateToSignIn={navigateToSignIn}
                />
              )}
              {/* Desktop actions */}

              {!!detailsObj.rentalinfo &&
                PageData?.info?.attributes?.networkCode != "freedomtv" && (
                  <p className={`${styles.rent_info}`}>
                    <img
                      src={`${appConfig.staticImagesPath}pack-info-icon.svg`}
                      alt="Rentel Info"
                    />
                    {detailsObj.rentalinfo}
                  </p>
                )}
            </div>
          )}
          {!!vodChannel && (
            <>
              <div div className={` ${styles.vodchannelFreedomtv}`}>
                <div className={` ${styles.parentIcon} ${styles.web}`}>
                  {!!vodChannel?.vodChannelIcon?.data && (
                    <a
                      onClick={() =>
                        vodChannel?.vodChannelIcon?.target
                          ? navigateTo(vodChannel.vodChannelIcon.target)
                          : null
                      }
                    >
                      <img
                        className={`${styles.card_epg_image1} ${styles.abs_image}`}
                        src={vodChannel?.vodChannelIcon?.data}
                        alt={vodChannel.vodChannelIcon.title}
                      />
                    </a>
                  )}

                  {vodChannel?.vodChanneltitle}
                </div>
                <div className={` ${styles.details_left}`}>
                  <div className={` ${styles.details_header}`}>
                    {detailsObj.partnerIcon && (
                      <Image
                        width={0}
                        height={0}
                        loader={loaderProp}
                        className={`${styles.partnerIcon_mobile}`}
                        src={detailsObj.partnerIcon}
                        alt="image"
                      />
                    )}
                    <h1 className={`${styles.title}`}>{detailsObj.title}</h1>
                    <div className={`${styles.subtitle}`}>
                      {PageData?.info?.attributes?.networkCode ===
                        "freedomtv" &&
                        detailsObj.pgrating && (
                          <span className={`${styles.pgRatingFreedom}`}>
                            {detailsObj.pgrating}
                          </span>
                        )}
                      <span>{detailsObj.subtitle}</span>
                      {detailsObj.pgrating &&
                        !(
                          PageData?.info?.attributes?.networkCode ===
                          "freedomtv"
                        ) && (
                          <span>
                            &nbsp; | &nbsp;
                            <span className={`${styles.pgrating}`}>
                              {detailsObj.pgrating}
                            </span>
                          </span>
                        )}
                      {detailsObj.imdb && (
                        <span>
                          &nbsp; | &nbsp;
                          <span className={`${styles.imdb}`}>
                            <img
                              src={`${ImageConfig?.tvShowDetails?.imdb}`}
                              alt="IMDB"
                            />
                            {detailsObj.imdb}
                          </span>
                        </span>
                      )}
                    </div>

                    {detailsObj.castcrew && (
                      <div className={`${styles.castDiv}`}>
                        <Scrollbar>
                          {/*  remove this in mobile */}
                          <p className={`${styles.casting}`}>
                            <span className={`${styles.castTitle}`}>
                              {TvshowDetailsconstant[localLang].Cast_Crew +
                                " :"}
                            </span>
                            {detailsObj.castcrew}
                          </p>
                        </Scrollbar>
                      </div>
                    )}
                  </div>
                  <div
                    className={` ${styles.vodLikeWatch}  ${styles.vodLikeWatch_text}`}
                  >
                    {systemConfigs?.configs?.showViewsCountOption == "true" && (
                      <div className={` ${styles.vodLike}`}>
                        <img
                          src={`${ImageConfig?.playerDescription?.solarEye}`}
                          alt="like-thin"
                          className={`${styles.img}`}
                        />
                        {detailsObj?.views?.data}{" "}
                        {detailsObj?.views?.data == 1
                          ? TvshowDetailsconstant[localLang]?.View_text
                          : TvshowDetailsconstant[localLang]?.Views_text}
                      </div>
                    )}
                    <div className={` ${styles.vodLike}`}>
                      <img
                        src={`${ImageConfig?.playerDescription?.likeGray}`}
                        className={`${styles.img}`}
                        alt="watchEye"
                      />{" "}
                      {detailsObj?.contentLikesCount?.data}{" "}
                      {detailsObj?.contentLikesCount?.data == 1
                        ? TvshowDetailsconstant[localLang]?.Like
                        : TvshowDetailsconstant[localLang]?.Likes}
                    </div>
                  </div>
                  {/* Mobile actions */}
                  {windowSize.width <= 767 && (
                    <TvShowDetailsPageActions
                      detailsObj={detailsObj}
                      navigateTo={navigateTo}
                      addToFavourite={addToFavourite}
                      shareDataSet={shareDataSet}
                      navigateToSignIn={navigateToSignIn}
                    />
                  )}

                  {/* Mobile actions */}
                  <div
                    className={` ${styles.vodLikeWatch} ${styles.vodLikeWatchBTN}  ${styles.mobile}`}
                  >
                    {vodChannelBtn.map((value) => {
                      // console.log(value, "<<<<value");
                      if (value?.isShow == true) {
                        return (
                          <div
                            key={`${value.text}_${value.isShow}`}
                            className={` ${styles.vodLike} ${value?.isShow}`}
                            onClick={(e) => vodChannelBtnFn(e, value)}
                          >
                            <img src={value.img} alt="like-thin" />
                            <span>{value.text}</span>
                          </div>
                        );
                      }
                    })}
                  </div>

                  {/* Desktop actions */}
                  {windowSize.width > 767 && (
                    <TvShowDetailsPageActions
                      detailsObj={detailsObj}
                      navigateTo={navigateTo}
                      addToFavourite={addToFavourite}
                      navigateToSignIn={navigateToSignIn}
                    />
                  )}
                  {/* Desktop actions */}

                  {!!detailsObj.rentalinfo &&
                    PageData?.info?.attributes?.networkCode != "freedomtv" && (
                      <p className={`${styles.rent_info}`}>
                        <img
                          src={`${appConfig.staticImagesPath}pack-info-icon.svg`}
                          alt="Rentel Info"
                        />
                        {detailsObj.rentalinfo}
                      </p>
                    )}
                </div>
                {detailsObj.description && (
                  <div className={`${styles.descDiv} ${styles.web}`}>
                    {/* <Scrollbar> remove this in mobile */}
                    {/* commeneted to preserve the existing functionality */}
                    {/* <p
                  className={`${styles.description}`}
                  onClick={toggleDescription}
                >
                  {showFullDescription
                    ? detailsObj.description
                    : detailsObj.description.length > 200
                      ? detailsObj.description.slice(0, 200) + "... "
                      : detailsObj.description}
                  {detailsObj.description.length > 200 && (
                    <span className={`${styles.readMore}`}>
                      {showFullDescription ? " Show Less" : " Read More"}
                    </span>
                  )}
                </p> */}
                    {/* </Scrollbar> */}
                    <InnerHtmlRenderer
                      data={detailsObj?.description}
                      isDataTruncate={true}
                      customClass={styles.description}
                      styles={styles}
                    />
                  </div>
                )}
                <div className={` ${styles.parentIcon} ${styles.mobile}`}>
                  {!!vodChannel?.vodChannelIcon?.data && (
                    <a
                      onClick={() =>
                        vodChannel?.vodChannelIcon?.target
                          ? navigateTo(vodChannel.vodChannelIcon.target)
                          : null
                      }
                    >
                      <img
                        className={`${styles.card_epg_image1} ${styles.abs_image}`}
                        src={vodChannel?.vodChannelIcon?.data}
                        alt={vodChannel.vodChannelIcon.title}
                      />
                    </a>
                  )}

                  {vodChannel?.vodChanneltitle}
                </div>
                {detailsObj.description && (
                  <div className={`${styles.descDiv} ${styles.mobile}`}>
                    {/* <Scrollbar> remove this in mobile */}
                    {/* commeneted to preserve the existing functionality */}
                    {/* <p
                  className={`${styles.description}`}
                  onClick={toggleDescription}
                >
                  {showFullDescription
                    ? detailsObj.description
                    : detailsObj.description.length > 200
                      ? detailsObj.description.slice(0, 200) + "... "
                      : detailsObj.description}
                  {detailsObj.description.length > 200 && (
                    <span className={`${styles.readMore}`}>
                      {showFullDescription ? " Show Less" : " Read More"}
                    </span>
                  )}
                </p> */}
                    {/* </Scrollbar> */}
                    <InnerHtmlRenderer
                      data={detailsObj?.description}
                      isDataTruncate={true}
                      customClass={styles.description}
                      styles={styles}
                    />
                  </div>
                )}

                <div className={` ${styles.vodChannelDescription}`}>
                  {/* {vodChannel?.vodChannelDescription} */}
                  <InnerHtmlRenderer
                    data={vodChannel?.vodChannelDescription}
                    isDataTruncate={true}
                    customClass={styles.description}
                    styles={styles}
                  />
                </div>
                <div
                  className={` ${styles.vodLikeWatch} ${styles.vodLikeWatchBTN}  ${styles.web}`}
                >
                  {vodChannelBtn.map((value, index) => {
                    if (value?.isShow == true) {
                      return (
                        <div
                          className={` ${styles.vodLike}`}
                          onClick={(e) => vodChannelBtnFn(e, value)}
                          key={index}
                        >
                          <img src={value.img} alt="like-thin" />
                          <span>{value.text}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {popupData.isActive &&
          popupData.type != "favourite" &&
          popupData.type != "share" &&
          popupData.type != "ReportPopup" && (
            <PopupModal popupData={popupData} />
          )}
        {popupData.isActive && popupData.type === "share" && (
          <SharePopup popupData={popupData} />
        )}
        {contentpartnerpopup && (
          <ContetPartnerPopup popupData={contentpartnerpopup} />
        )}
        {popupData.isActive && popupData.type == "ReportPopup" && (
          <OverlayPopupModal popupData={popupData} />
        )}
      </div>
    </>
  );
};

export default TvshowDetails;
