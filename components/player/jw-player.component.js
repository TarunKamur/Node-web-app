import useGetApiMutate from "@/hooks/useGetApidata";
import getApiStaticData from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { getAbsolutePath, isloggedin } from "@/services/user.service";
import {
  debounceFunction,
  decryptData,
  encryptData,
  getPlansDetails,
  jsonToQueryParams,
  base64EncodeUint8Array,
  base64DecodeUint8Array,
} from "@/services/utility.service";
import { useEffect, useRef, useState } from "react";
import { actions, useStore } from "@/store/store";
import { deleteItem, getItem, setItem } from "@/services/local-storage.service";
import styles from "@/components/player/player.module.scss";
import { useRouter } from "next/router";
import { appConfig } from "@/config/app.config";
import { getBoxId } from "@/services/data-manager.service";
import { getRandonNumber } from "@/services/utility.service";
import Link from "next/link";
import { isMobile, isTablet } from "react-device-detect";
import { Jwplayerconstant } from "@/.i18n/locale";
// import usePostApiMutate from "@/hooks/usePostApidata";
import dynamic from "next/dynamic";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { common } from "@mui/material/colors";
import { ImageConfig } from "@/config/ImageConfig";
import PageLoader from "../loader/page-loder.component";
import useBeforeUnload from "@/hooks/useBeforeUnload";
import { postRecoData } from "@/services/myReco.service";

const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const Razorpay = dynamic(
  () => import("@/components/packages/razorpay/Razorpay.component"),
  { ssr: false }
);
import Image from "next/image";
import {
  sendEvent,
  distroAnalyicsEventCall,
} from "@/services/analytics.service";
import VerifyOtpPopup from "../verify-otp-popup/verify-otp-popup.component";
import { createPortal } from "react-dom";

const PinProfile = dynamic(
  () =>
    import("../popups/profile/pin-profile-popup/pin-profile-popup.component")
);

const ButtonWrapper = (props) => {
  const { button, btnHandler } = props;
  const btnClick = () => {
    btnHandler(button);
  };
  if (button.elementType == "button") {
    return (
      <>
        <button
          onClick={() => btnClick()}
          className={` ${button.data?.includes("Sign In") ? "" : "primary"} ${styles[button.data]} ${button.data}`}
        >
          {" "}
          {button.data} {props.children}
        </button>
      </>
    );
  }
};

let cid;

const JWPlayer = ({ streamPath, setVideoBgImage }) => {
  const {
    state: {
      PageData,
      userDetails,
      navigateFrom,
      SystemFeature,
      playerUtils,
      SystemConfig,
      localLang,
    },
    dispatch,
  } = useStore();

  const { mutate: mutateGetStreamData, data: streamDataResponse } =
    useGetApiMutate();
  const { mutate: mutateStreamApi, data: EncSteamApiRes } = usePostApiMutate();
  const [playerPage, setPlayerPage] = useState({});
  const playerRef = useRef(null);
  const isEtvWinContent = useRef(null);
  const isEtvWinVideoComplete = useRef(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const router = useRouter();
  // const [strmData,setStrmData] = useState()
  const plugin = useRef(null);
  const playerState = useRef({});
  const [showBackgroundImage, setBackgroundImage] = useState(true);
  const [errorButtons, setErrorButtons] = useState([]);
  const errorRef = useRef(null);
  const [streamErrorOne, setStreamErrorOne] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const pollInterval = useRef(null);
  const { mutate: mutateGetPoll, data: pollKeyResponse } = usePostApiMutate();
  const { mutate: mutateEndPoll, data: EndpollKeyResponse } =
    usePostApiMutate();
  const [sessionClosed, setSessionClosed] = useState({ status: false });
  const initialplay = useRef(true);
  const isStartOver = useRef(false);
  const streamDataRef = useRef(null);
  const [otpData, setOtpData] = useState();

  const [popupData, setPopUpData] = useState({});
  const [isParentalPopup, setParentalPopup] = useState({});
  const Playerstream = useRef(false);
  const playerRtry = useRef(3);
  let pCount = useRef(0);
  let stramData = [];
  const selectedBitrate = useRef(null);
  const streamVideoQualities = useRef(null);
  const bitrateApplied = useRef(false);

  // jio ads
  const [allowedJioAdsState, setAllowJioAds] = useState(false);
  const [cuePointsState, setCuePoints] = useState([]);
  const [adSpotsState, setAdSpots] = useState([]);
  const [selectedAdspot, setSelectedAdspot] = useState("");

  // player buttons
  const [displayStartOver, setDisplayStartOver] = useState(false);
  const [displayLive, setDisplayLive] = useState(false);
  const [displaySkipIntro, setDisplaySkipIntro] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isPreviewAvalibale, setIsPreviewAvalibale] = useState(false);
  const [displayNextEpisode, setDisplayNextEpisode] = useState({});
  const [displayBack, setDisplayBack] = useState(false);
  const [displayBackError, setDisplayBackError] = useState(false);
  const [forwardIcon, setForwardIcon] = useState(false);
  const { mutate: mutateNextVideoInfo, data: nextVideoResponse } =
    useGetApiMutate();
  const [pgRating, setPgRating] = useState({});
  const [showPGRating, setShowPGRating] = useState(false);
  const rating = useRef(true);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [displayUpNextTooltip, setDisplayUpNextTooltip] = useState(false);
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [LastChannel, setLastChannel] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [isVideoPlaying, setVideoPlaying] = useState(false);
  const [selectedaudioTrack, setSelectedAudioTrack] = useState(-1);
  const onWatchTimerIntervalRef = useRef(null);
  const onWatchTimerRef = useRef(0);

  let previewTimer;
  let position = 0;
  const [timeLeft, setTimeLeft] = useState(0);

  // Payment
  const [isRazorpay, setIsRazorPay] = useState({ enabled: false, data: {} });
  const [activePackage, setActivePackage] = useState({});
  const [isPaymentPending, setPaymentPending] = useState(false);
  const [isWaterMarkLogoEnabled, setisWaterMarkLogoEnabled] = useState(false);
  const [waterMarkLogo, setwaterMarkLogo] = useState(
    JSON.parse(SystemConfig?.configs?.waterMarkInfoOnPlayer || "{}")
  );
  const { mutate: mutateFetchPaymentData, data: fetchPaymentDataResponse } =
    useGetApiMutate();
  const { mutate: mutateRazorPayment, data: razorPaymentResponse } =
    usePostApiMutate();
  useBeforeUnload(() => {
    sessionStorage.clear();
  });

  // google Pal  distroPartner
  const nonceManager = useRef(false);
  const isGpalEnabled = useRef(false);

  const distroPartner = useRef(false);
  const { mutate: mutateGetStreamDatas, data: streamDataResponses } =
    getApiStaticData();

  const currentTime = useRef(1);
  const playerPause = useRef(false);
  const vPlayHitDistro = useRef(false);
  const isFirstPhase = useRef(true);
  const intervalIdRef = useRef(null);
  const [jwUserP, setjwUserP] = useState({ mute: false, volume: 90 });

  const { mutate: deeplinkingdata, data: deepResponse } = useGetApiMutate();

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
        } catch (e) {}
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

  useEffect(() => {
    if (isVideoPlaying) onWatchTimerStartTimer();

    return () => {
      if (isVideoPlaying) {
        postRecoData({
          onWatchTimer: onWatchTimerRef.current,
          path: router.asPath,
        });
        onWatchTimerStopTimerClear();
      }
    };
  }, [isVideoPlaying]);

  const onWatchTimerStartTimer = () => {
    if (onWatchTimerRef.current) return;
    onWatchTimerIntervalRef.current = setInterval(() => {
      // console.log(">>>>", onWatchTimerRef.current);
      if (!playerPause.current) {
        onWatchTimerRef.current = onWatchTimerRef.current + 1;
      }
    }, 1000);
    // }
  };

  const onWatchTimerStopTimer = () => {
    if (onWatchTimerIntervalRef.current) {
      console.log(">>>> clear interval", onWatchTimerRef.current);
      clearInterval(onWatchTimerIntervalRef.current);
      onWatchTimerIntervalRef.current = null;
    }
  };

  const onWatchTimerStopTimerClear = () => {
    clearInterval(onWatchTimerIntervalRef.current);
    onWatchTimerIntervalRef.current = null;
    onWatchTimerRef.current = 0;
  };

  useEffect(() => {
    if (waterMarkLogo && Object.keys(waterMarkLogo).length > 0) {
      const { supportedNetworkCode, supportedContentTypes } = waterMarkLogo;
      const { networkCode, contentType } = PageData.info.attributes;
      const isEnabled =
        supportedNetworkCode?.split(",").includes(networkCode) &&
        supportedContentTypes?.split(",").includes(contentType);
      setisWaterMarkLogoEnabled(isEnabled);
    }
  }, [waterMarkLogo, PageData]);

  const paymentCancelled = () => {
    setIsRazorPay({ enabled: false, data: {} });
  };

  useEffect(() => {
    if (fetchPaymentDataResponse?.data?.status) {
      let packagesInfo = {};
      const { data } = fetchPaymentDataResponse;
      setActivePackage(data.response[0]);
      packagesInfo.userSelectedPack =
        data.response?.[0]?.packageInfo?.packages[0];
      packagesInfo.masterPack = data.response?.[0]?.packageInfo?.master;
      packagesInfo.suppGateWays = data.response?.[0]?.supportedGateway;
      // SVOD Type 1
      // TVOD Type 2
      packagesInfo.package_type = 2;
      if (packagesInfo.suppGateWays[0].code == "razorpay") {
        proceedToPayRazor(packagesInfo);
      } else if (packagesInfo.suppGateWays[0].code == "stripe") {
        const pathname = `/buy/order-summary/${data.response[0].packageInfo?.packages[0]?.id}`;
        router.push(
          {
            pathname,
            query: {
              path: router.asPath.replace("/", ""),
              package_type: "2",
              gateway: packagesInfo.suppGateWays[0].code,
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

  const userloggged = getItem("isloggedin");
  const showLastChannel = getItem("last_channel_info") || "";

  useEffect(() => {
    const playerScrit = process.env.playerScript;
    if (typeof window.jwplayer === "undefined") {
      const script = document.createElement("script");
      script.src = playerScrit?.playerSrc;
      script.type = "text/javascript";
      script.onload = () => {
        window.jwplayer.key = playerScrit?.playerKey;
      };
      document.body.appendChild(script);
    }
    return () => {
      try {
        if (window?.jwplayer()?.getFullscreen()) {
          window.jwplayer()?.setFullscreen(false);
        }
      } catch (error) {}
    };
  }, []);

  useEffect(() => {
    if (!!playerUtils) {
      if (playerUtils.startover) {
        isStartOver.current = playerUtils.startover;
        dispatch({ type: actions.playerUtils, payload: {} });
      }
    }
  }, [playerUtils]);

  useEffect(() => {
    if (!!SystemConfig?.configs?.videoQualitySettings) {
      streamVideoQualities.current = JSON.parse(
        SystemConfig.configs.videoQualitySettings
      );
      if (!!streamVideoQualities.current) {
        getSelectedBitrate(streamVideoQualities.current);
      }
    }
  }, [SystemConfig]);

  useEffect(() => {
    if (appConfig?.adsSupport?.jioAds) {
      setAllowJioAds(true);
    }
    setErrorinfoHeight();
    return () => {
      try {
        streamDataRef.current.pageAttributes?.isLive === "true"
          ? setItem("last_channel_info", router.asPath)
          : deleteItem("last_channel_info");
        if (!!plugin.current) {
          plugin.current?.handlePlayEndedByUser();
        }
        if (
          !!streamDataRef.current &&
          !!streamDataRef.current?.response?.sessionInfo
        ) {
          endActiveStream(
            streamDataRef.current.response.sessionInfo.streamPollKey
          );
        }
        if (pollInterval?.current) {
          clearInterval(pollInterval.current);
        }
      } catch (e) {}
      if (window?.jwplayer) {
        try {
          window?.jwplayer(playerRef.current).stop();
          window?.jwplayer(playerRef.current).remove();
          allowedJioAdsState && distroyJioVideo();
        } catch (error) {
          console.log(error);
        }
      }
    };
  }, []);

  useEffect(() => {
    setErrorinfoHeight();
    const debounceErrorinfoHeight = debounceFunction(setErrorinfoHeight, 200);
    window.addEventListener("resize", debounceErrorinfoHeight);
    return () => {
      window.removeEventListener("resize", debounceErrorinfoHeight);
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [streamError]);

  useEffect(() => {
    let hasButtons = false;
    PageData?.data?.map((data) => {
      if (data?.paneType === "content") {
        data?.content?.dataRows.map((data_rows) => {
          if (data_rows?.rowDataType === "button") {
            hasButtons = true;
            setErrorButtons(data_rows.elements);
          }
        });
      }
    });

    if (!!PageData)
      if (
        PageData?.streamStatus?.hasAccess ||
        (PageData?.streamStatus?.trailerStreamStatus &&
          PageData?.info.attributes.playerType == "trailer") ||
        (PageData?.streamStatus?.previewStreamStatus &&
          PageData?.info.attributes.playerType == "preview")
      ) {
        setBackgroundImage(false);
        setPlayerPage(PageData);
        PageData?.streamStatus?.previewStreamStatus &&
          PageData?.info.attributes.playerType == "preview" &&
          setIsPreviewAvalibale(true);
        getStream();
        setStreamError("");
        setStreamErrorOne("");
        setLocationInfo(getItem("LocationData"));
        PageData?.info?.attributes?.showNextButton == "true" &&
          getNextEpisodePre();
      } else {
        setBackgroundImage(true);
        setStreamError(PageData?.streamStatus?.message);
        if (PageData?.streamStatus?.errorCode == -15 && !hasButtons) {
          const buttonData = [
            {
              elementSubtype: "verify_email",
              data: "Verify Email",
              id: 64,
              target: "verify_email",
              elementType: "button",
            },
          ];
          setErrorButtons(buttonData);
        }
      }

    PageData?.data?.map((data) => {
      if (data?.paneType === "content") {
        data?.content?.dataRows.map((data_rows) => {
          if (data_rows?.rowDataType === "button") {
            setErrorButtons(data_rows.elements);

            !!data_rows.elements.length &&
              data_rows.elements.forEach((ele) => {
                if (
                  ele?.elementSubtype == "signup" ||
                  ele?.elementSubtype == "signin"
                ) {
                  setStreamError(PageData?.streamStatus?.message);
                } else if (ele.elementSubtype == "subscribe") {
                  setStreamErrorOne(
                    PageData?.info?.attributes?.ContentAccessErrorMessage
                  );
                  setStreamError(
                    PageData?.info?.attributes?.SubscribeErrorMessage ||
                      PageData?.streamStatus?.message
                  );
                } else if (ele.elementSubtype == "rent") {
                  setStreamErrorOne(
                    PageData?.info?.attributes?.ContentAccessErrorMessage
                  );
                  setStreamError(
                    PageData?.info?.attributes?.RentErrorMessage ||
                      PageData?.streamStatus?.message
                  );
                }
              });
          }
        });
      }
    });
  }, [PageData]);

  useEffect(() => {
    if (allowedJioAdsState) {
      jioConfig();
    }
  }, [allowedJioAdsState]);

  useEffect(() => {
    !!locationInfo && !!locationInfo?.data?.analyticsInfo && initAnalytics();
  }, [locationInfo]);

  const setErrorinfoHeight = () => {
    if (!!errorRef.current) {
      errorRef.current.style.height =
        errorRef.current.clientWidth * 0.5625 + "px";
    }
  };
  const googlePalenabled = () => {
    let gPal = playerPage.adUrlResponse.adUrlTypes.filter(
      (ele) =>
        ele.urlType == "postUrl" ||
        ele.urlType == "postRollUrl" ||
        ele.urlType == "midRollUrl" ||
        ele.urlType == "midUrl" ||
        ele.urlType == "preUrl" ||
        ele.urlType == "preRollUrl"
    );
    isGpalEnabled.current =
      appConfig?.adsSupport?.googlepal &&
      !!gPal &&
      !!gPal[0] &&
      !!gPal[0].attributes &&
      gPal[0].attributes["googlepal"] == "true"
        ? true
        : false;
    return isGpalEnabled.current;
  };

  const googleGenerateNonce = async (urlstrm) => {
    if (!!window.goog) {
      let nonceLoader = new goog.pal.NonceLoader();
      if (!!!nonceLoader) {
        return;
      }
      const request = new goog.pal.NonceRequest();
      let managerPromise;
      request.adWillAutoPlay = true;
      request.adWillPlayMuted = true;
      // request.continuousPlayback = false;
      // request.descriptionUrl = 'http://localhost:4200/';
      request.iconsSupported = true;
      request.playerType = "jwplayer";
      request.playerVersion = "3.0";
      request.ppid = "";
      request.sessionId = ``;
      // Player support for VPAID 2.0, OMID 1.0, and SIMID 1.1
      request.supportedApiFrameworks = "2,7,9";
      request.url = urlstrm;

      managerPromise = nonceLoader.loadNonceManager(request);
      await managerPromise
        .then((manager) => {
          nonceManager.current = manager;
          let nonceManagerDup = manager;
          if (
            nonceManagerDup &&
            typeof nonceManagerDup.getNonce === "function"
          ) {
            console.log(">>>>nonceManager>>>", nonceManager.current.getNonce());
          } else {
          }
        })
        .catch((error) => {
          console.log("Error generating nonce: " + error);
        });
    }
  };

  const getNextEpisodePre = () => {
    setDisplayNextEpisode({ ...displayNextEpisode, displayStatus: false });
    let params = {
      path: streamPath,
      count: "1",
    };
    let apiPath =
      !!streamDataRef.current &&
      !!streamDataRef.current?.analyticsInfo &&
      streamDataRef.current?.analyticsInfo?.dataType == "epg" &&
      streamDataRef.current?.analyticsInfo?.contentType == "vod"
        ? "/service/api/v1/next/epgs?"
        : "/service/api/v1/next/videos?";

    let url = process.env.initJson["api"] + apiPath + jsonToQueryParams(params);
    try {
      mutateNextVideoInfo(url);
    } catch (e) {}
  };

  const initAnalytics = () => {
    if (!!locationInfo && locationInfo?.data?.analyticsInfo) {
      let loadObj = {
        analytics_id: process.env.analyticsId,
        authKey: locationInfo?.data?.analyticsInfo.authKey,
        trueIp: locationInfo?.data?.ipInfo.trueIP,
        clientId: locationInfo?.data?.ipInfo.trueIP,
      };

      let playerData = {
        playerName: "jwplayer",
        playerVersion: "jw_8_14",
      };
      let clientData = {
        appVersion: "",
        connectionType: "",
        clientIP: locationInfo?.data?.ipInfo.trueIP,
        NWProvider: "",
      };
      try {
        const loadedPlugin = window?.VideoAnalyticsPlugin?.load(loadObj);

        if (loadedPlugin) {
          plugin.current = loadedPlugin;
          plugin.current.setPlayerMetaData(playerData);
          plugin.current.setClientMetaData(clientData);
        } else {
          console.warn("VideoAnalyticsPlugin.load returned null or undefined.");
        }
      } catch (e) {
        console.error("Error loading VideoAnalyticsPlugin:", e);
      }
    }
  };

  const initVideoAnalytics = (strmData) => {
    let contentMetaData = {
      CDNetwork: !!strmData ? strmData?.streams?.[0]?.streamType : "",
      navigationFrom: navigateFrom ? navigateFrom : PageData.info.path,
      metaId: !!strmData ? strmData.analyticsInfo.dataKey : "", //  set content identifier.
      metaMap: "", // currently we are sending empty value.
      a1:
        !!strmData && !!strmData.analyticsInfo.customData
          ? strmData.analyticsInfo.customData
          : "",
      a2: "",
      syp: "watcho",
    };
    let userMetaData = {
      userId: !!userDetails ? userDetails.userId : "",
      profileId: !!userDetails?.profileId ? userDetails?.profileId : "",
      boxId: getBoxId(),
      deviceType: "web",
      deviceClient: !!plugin && plugin.current?.getBrowserName(),
      deviceOS: !!plugin && plugin.current?.getPlatForm(),
      deviceId: "5",
      isSubscribed: !userDetails
        ? "0"
        : !!PageData && !!PageData?.streamStatus?.hasAccess
          ? "1"
          : "0",
    };
    let videoMetaData = {
      autoplay: true,
      productName: process.env.initJson["tenantCode"], // new requirement send tenant code
      streamURL: !!strmData ? strmData?.streams?.[0]?.url.split("?")[0] : "",
      contentType: !!strmData ? strmData.analyticsInfo.contentType : "",
    };

    // setting meta data.
    if (!!plugin.current) {
      plugin.current?.setContentMetaData(contentMetaData);
      plugin.current?.setUserMetaData(userMetaData);
      plugin.current?.setVideoMetaData(videoMetaData);
    }
  };

  const nextVideoCheck = () => {
    const localRemainingSeconds = Math.round(
      window.jwplayer().getDuration() - window.jwplayer().getPosition()
    );
    const nextVideosList = nextVideoResponse?.data?.response?.data;
    if (nextVideosList?.length) {
      setRemainingSeconds(localRemainingSeconds);
      const creditsStartTime = PageData?.info?.attributes?.creditsStartTime
        ? parseInt(PageData?.info?.attributes?.creditsStartTime)
        : null;
      const nextVideoDisplaySeconds = SystemConfig?.configs
        ?.nextVideoDisplaySeconds
        ? parseInt(SystemConfig?.configs?.nextVideoDisplaySeconds)
        : null;

      //next episode button
      if (
        window.jwplayer().getPosition() > 10 &&
        PageData?.info?.attributes?.showNextButton == "true" &&
        !isPreviewAvalibale
      ) {
        setIsPreviewAvalibale(false);
        setDisplayNextEpisode((prevValue) => ({
          ...prevValue,
          displayStatus: true,
        }));
      } else {
        setDisplayNextEpisode((prevValue) => ({
          ...prevValue,
          displayStatus: false,
        }));
      }

      //next episode autoplay button (or) credit button hat render autoplay button
      if (
        ((creditsStartTime &&
          creditsStartTime < window.jwplayer().getPosition()) ||
          (!creditsStartTime &&
            nextVideoDisplaySeconds &&
            nextVideoDisplaySeconds >= localRemainingSeconds)) &&
        !isPreviewAvalibale
      ) {
        setDisplayUpNextTooltip(true);
        setIsPreviewAvalibale(false);
        setDisplayNextEpisode((prevValue) => ({
          ...prevValue,
          displayStatus: true,
        }));
      } else {
        setDisplayUpNextTooltip(false);
      }
      // else {
      //     setDisplayUpNextTooltip(false);
      //     setDisplayNextEpisode((prevValue) => ({ ...prevValue, displayStatus: false }));
      // }
    }
  };

  useEffect(() => {
    if (!!nextVideoResponse?.data) {
      setDisplayNextEpisode({
        ...displayNextEpisode,
        nextVideoTargetPath:
          nextVideoResponse?.data?.response?.data[0]?.target?.path,
        displayStatus: false,
      });
    } else {
      setDisplayNextEpisode({ ...displayNextEpisode, displayStatus: false });
    }
  }, [nextVideoResponse]);

  useEffect(() => {
    if (!!streamDataResponse?.data?.status) {
      setBackgroundImage(false);
      //  setStrmData({...strmData,...streamDataResponse.data})
      streamDataRef.current = streamDataResponse?.data?.response;
      initStreamData(streamDataResponse.data);
    } else if (streamDataResponse?.data?.status != undefined) {
      if (!isParentalPopup?.isActive) {
        setStreamError(streamDataResponse?.data?.error?.message);
        setBackgroundImage(true);
      }
      if (
        streamDataResponse?.data?.error?.code == -820 ||
        streamDataResponse?.data?.error?.code == -821 ||
        streamDataResponse?.data?.error?.code == -823
      ) {
        setParentalPopup({
          isActive: true,
          code: streamDataResponse?.data?.error?.code,
          errorMessage: streamDataResponse?.data?.error?.message,
          hideImgName: true,
          closeTarget: () => router.back(),
        });
      } else if (streamDataResponse?.data?.error?.code == -610) {
        setBackgroundImage(false);
        let url =
          process.env.initJson.api +
          `/service/api/v1/page/deeplink?path=${router.asPath.replace("/", "")}`;
        deeplinkingdata(url);
      } else if (streamDataResponse?.data?.error?.code == 404) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: streamDataResponse.data?.error?.message },
        });
      }
    }
  }, [streamDataResponse]);

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
    if (!!deepResponse?.data) {
      if (!!deepResponse?.data?.status) {
        let dL = getDeeplinkInfo(deepResponse?.data.response);
        // let handle = window.open(dL);
        window.open(dL, "_self");
        let contentPath = router.asPath.replace("/", "");
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
        setBackgroundImage(true);
        setStreamError(deepResponse?.data?.error?.message);
        dispatch({
          type: actions.NotificationBar,
          payload: { message: deepResponse?.data?.error?.message },
        });
      } else {
        setBackgroundImage(true);
        setStreamError(deepResponse?.data?.error?.message);
        console.warn(deepResponse?.data?.error);
      }
    } else {
    }
    // to handle mobile screen
    // window.addEventListener("resize", handleResize);

    // removing event once component is unmounted
    // return () => window.removeEventListener("resize", handleResize);
  }, [deepResponse]);

  useEffect(() => {
    if (pollKeyResponse) {
      if (!pollKeyResponse.data.status) {
        let data = {
          status: true,
          title: pollKeyResponse?.data?.error?.message,
          description: pollKeyResponse?.data?.error?.details?.description,
          code: pollKeyResponse?.data?.error?.code,
        };
        setSessionClosed(data);
        try {
          window.jwplayer(playerRef.current).pause();
          window?.jwplayer(playerRef.current).stop();
          window.jwplayer().pause();
          window.jwplayer().stop();
          clearInterval(pollInterval.current);
        } catch (e) {}
      }
    }
  }, [pollKeyResponse]);

  const closePlayer = () => {
    router.push("/");
  };
  useEffect(() => {
    if (!!EncSteamApiRes?.data) {
      let decrypteData = JSON.parse(decryptData(EncSteamApiRes?.data?.data));
      if (decrypteData.status) {
        // setStrmData(decrypteData);
        // setStreamError("");
        setStreamErrorOne("");
        setBackgroundImage(false);
        streamDataRef.current = decrypteData?.response;
        initStreamData(decrypteData);
      } else {
        setStreamError(decrypteData?.error?.message);
        setBackgroundImage(true);
        if (
          decrypteData?.error?.code == -820 ||
          decrypteData?.error?.code == -821 ||
          decrypteData?.error?.code == -823
        ) {
          setParentalPopup({
            isActive: true,
            code: decrypteData?.error?.code,
            errorMessage: decrypteData?.error?.message,
            closeTarget: () => router.back(),
          });
        } else {
          setParentalPopup({
            isActive: true,
            code: decrypteData?.error?.code,
            errorMessage: decrypteData?.error?.message,
            closeTarget: () => router.back(),
          });
        }
      }
    }
  }, [EncSteamApiRes]);

  // Auto play next video on completion of current video
  useEffect(() => {
    if (isVideoComplete && displayUpNextTooltip) {
      nextEpisode();
    }
  }, [isVideoComplete, displayUpNextTooltip]);

  useState(() => {
    if (selectedAdspot != "") {
      window.jwplayer().pause();
    }
  }, [selectedAdspot, adSpotsState, cuePointsState]);
  const analyticsData = () => {
    // to get title and genere
    let setData = PageData?.data?.reduce((acc, data) => {
      if (data?.paneType === "content") {
        data.content.dataRows?.forEach((md) => {
          if (md.rowDataType === "content") {
            md.elements.forEach((res) => {
              switch (res?.elementSubtype) {
                case "title":
                  acc.title = res.data;
                  break;
                case "pgrating":
                  acc.pgrating = res.data;
                  break;
                default:
                  break;
              }
            });
          }
        });
      }
      return acc;
    }, {});
    const position = window?.jwplayer()?.getPosition();
    const duration = window?.jwplayer()?.getDuration();
    const percentage = (position / duration) * 100;
    const playerPercentage = Math.round(percentage);
    let playerObj = {
      ar_status:
        userDetails?.packages &&
        userDetails?.packages?.[0]?.recurrenceStatus == "A"
          ? "true"
          : "false",
      ...getPlansDetails(true),
      asset_title: setData?.title,
      banner_title: setData?.title,
      media_type:
        streamDataRef.current?.pageAttributes?.mediaContentType || "-1",
      genre:
        streamDataRef.current?.pageAttributes?.genre ||
        setData?.pgrating ||
        "-1",
      channel_partner:
        streamDataRef.current?.pageAttributes?.networkName || "-1",
      video_play_duration: `${playerPercentage}%` || "NA",
    };
    if (streamDataRef.current?.pageAttributes?.tvShowName) {
      playerObj["series_name"] =
        streamDataRef.current?.pageAttributes?.tvShowName;
    }
    if (streamDataRef.current?.pageAttributes?.seasonSeqNo) {
      playerObj["season_number"] =
        streamDataRef.current?.pageAttributes?.seasonSeqNo;
    }
    if (streamDataRef.current?.pageAttributes?.episodeSeqNo) {
      playerObj["episode_number"] =
        streamDataRef.current?.pageAttributes?.episodeSeqNo;
    }
    return playerObj;
  };

  const distroApiHit = (path) => {
    try {
      mutateGetStreamDatas(path);
    } catch (error) {}
  };
  const startDistroTimestamps = () => {
    intervalIdRef.current = setInterval(
      () => {
        const obj = getDristrocpObj("vs" + currentTime.current);

        if (
          window.jwplayer(playerRef.current)?.play &&
          typeof window.jwplayer(playerRef.current)?.play == "function"
        ) {
          if (isFirstPhase.current) {
            if (currentTime.current <= 10) {
              distroApiHit(distroAnalyicsEventCall(obj));
              currentTime.current = currentTime.current + 1;
            } else {
              isFirstPhase.current = false;
              currentTime.current = 60; // Start from 60 for the next phase
              clearInterval(intervalIdRef.current); // Clear the interval
              startDistroTimestamps(); // Restart with the new phase
            }
          } else {
            distroApiHit(distroAnalyicsEventCall(obj));

            currentTime.current = currentTime.current + 60;
          }
        } else {
          clearInterval(intervalIdRef.current); // Clear the interval
        }
      },
      isFirstPhase.current ? 1000 : 60000
    );
  };
  // distro cp analytics
  const getDristrocpObj = (event_name) => {
    let customData = JSON.parse(
      streamDataRef.current?.analyticsInfo?.customData
    );
    // console.log(">>>customData.cpShowId",customData, '>>>>>',!!customData.cpShowId ? customData.cpShowId : "")
    return {
      partner_name: "dishtv",
      random: new Date().getTime(),
      event_name: event_name,
      // advertising_id:this.playSource[0].sources[0].sParams.token,
      // playback_id: this.playSource[0].sources[0].sParams.sessionid,
      advertising_id: getBoxId(),
      playback_id: getItem("sessionId"),
      content_provider_id: !!customData.cpContentProviderId
        ? customData.cpContentProviderId
        : "",
      show_id: !!customData.cpShowId ? customData.cpShowId : "",
      episode_id: !!customData.cpEpisodeId ? customData.cpEpisodeId : "",
      device_category: "web",
      encoded_video_url: encodeURIComponent(stramData[0].sources[0].file),
    };
  };
  const setJioAdState = (isAllow) => {
    setAllowJioAds(isAllow);
  };

  const setAudioTrack = (audioTracks = []) => {
    let language = getItem("player-audio-lang");
    //check local stroage
    if (language) {
      audioTracks.map((audio, index) => {
        if (audio.name === language) {
          setSelectedAudioTrack(index);
          //if matches set that index
          window?.jwplayer()?.setCurrentAudioTrack(index);
        }
      });
    } else {
      //search for english
      let eng_found = false;
      audioTracks.map((audio, index) => {
        if (audio.name.toLowerCase() === "english") {
          setSelectedAudioTrack(index);
          //if matches set that index
          window?.jwplayer()?.setCurrentAudioTrack(index);
          eng_found = true;
        }
      });
      if (eng_found === false) {
        //defalut keep it as -1
        setSelectedAudioTrack(-1);
        window?.jwplayer()?.setCurrentAudioTrack(-1);
      }
    }
  };

  const startPlay = (stream) => {
    //hide loader
    let jwerror = document.querySelector(".jw-error-msg");
    if (!!jwerror && !isEtvWinVideoComplete.current) {
      jwerror.style.display = "flex";
    }
    const { adSpots: jioAdSpots, cuepoints } = checkJioAds();
    initialplay.current = true;
    //refer https://docs.jwplayer.com/players/reference/jwplayersetconfig
    let jwset = !!getItem("jwUserP") ? getItem("jwUserP") : jwUserP;
    currentTime.current = 1;
    let playerSetUP = {
      playlist: stream,
      advertising: getAdDada(),
      primary: "html5",
      width: "100%",
      autostart: "viewable",
      mute: jwset.mute,
      preload: "auto",
      pipIcon: "disabled",
      aspectratio: "16:9",
      floating: false,
      intl: {
        en: {
          notLive: "Go Live",
        },
      },
      captions: {
        fontSize: 10,
        backgroundOpacity: 0,
      },
      logo: {
        hide: "false",
        file:
          PageData?.info?.attributes?.isLive == "true" && isWaterMarkLogoEnabled
            ? userDetails?.userCategory == 2
              ? waterMarkLogo?.d2hImagePath
              : userDetails?.userCategory == 1
                ? waterMarkLogo?.dishtvImagePath
                : ""
            : "",
        position: "bottom-right",
      },
      cast: {
        appid: "8D3B1F4E", //pointed to test v3
        // appid : process?.env?.castID
      },
      events: {
        ready: (data) => {
          setVideoBgImage();
          if (pCount.current == 0) {
            !!plugin.current && plugin.current?.thumbnailVideoClick();
            !!plugin.current && plugin.current?.handlePlayerLoad();
          }
          let spinner = document.querySelector(".videospinner");
          if (!spinner) {
            document.querySelector(".jw-preview").innerHTML +=
              "<div class='videospinner' style='display: none'><span class='loader'></span></div>";
          } else {
            spinner.style.display = "none";
          }

          if (streamDataRef.current.pageAttributes?.isLive === "true") {
            setForwardIcon(false);
            showLastChannel != "" && setLastChannel(true);
          } else {
            setForwardIcon(true);
          }
          if (allowedJioAdsState) {
            setTimeout(() => {
              const jioAdsDiv = document.getElementById("player-wrap-jio");
              $("#player_div").append(jioAdsDiv);
              if (
                jioAdSpots?.[0]?.length &&
                (isStartOver.current ||
                  streamDataRef.current.streamStatus.seekPositionInMillis <=
                    600000)
              ) {
                managePreRole(cuepoints);
              } else {
                setJioAdState(false);
              }
              if (jioAdSpots?.[1]?.length) {
                addCuePoints(cuepoints);
              }
            }, 500);
          }
        },
        play: (data) => {
          sendEvent("video_play", analyticsData());
          setVideoPlaying(true);
          if (onWatchTimerStartTimer) {
            onWatchTimerStartTimer();
          }
          console.log(">>>play");
          if (distroPartner.current) {
            if (!playerPause.current && !vPlayHitDistro.current) {
              distroApiHit(distroAnalyicsEventCall(getDristrocpObj("vplay")));
              vPlayHitDistro.current = true;
            }
            startDistroTimestamps();
          }
          playerPause.current = false;
          if (
            !bitrateApplied.current &&
            streamVideoQualities?.current?.length > 0 &&
            !!userDetails
          ) {
            setTimeout(() => {
              adjustVideoQuality();
            }, 5000);
          }

          Playerstream.current = true;
          if (!!pgRating.pgRatingTitle || !!pgRating.pgRatingSubtitle) {
            addPgRating();
          }
          if (streamDataRef.current.pageAttributes?.isLive === "true") {
            showLastChannel != "" && setLastChannel(true);
          }
          if (
            streamDataRef.current?.pageAttributes?.categoryType ==
              "simulcast" &&
            PageData?.info?.attributes?.isLive == "true"
          ) {
            liveText();
          }
          try {
            addForwardIcons();
          } catch (e) {}
          if (streamDataRef?.current?.streamStatus?.previewStreamStatus) {
            setIsPreviewAvalibale(true);
            showPreview(true);
            $(".jw-slider-time").hide();
            $(".jw-display-controls .jw-display-icon-rewind").css(
              "visibility",
              "hidden"
            );
            $(".jw-controlbar .jw-icon-rewind").hide();
            $(".jw-icon-cast").css("visibility", "hidden");
            $("#frwdIcon").css("visibility", "hidden");
            setIsPreviewPlaying(true);
            document.querySelectorAll(".jwplayer").forEach((elem) => {
              elem.addEventListener(
                "keydown",
                (e) => e.stopImmediatePropagation(),
                true
              );
            });
          }
          const playerControlls =
            document.getElementsByClassName("jw-controlbar")[0];
          const playerControllTop = document.getElementsByClassName(
            "jw-button-container"
          )[0];
          const strBt = document.getElementById("playerButtons");

          // Appending next video element before last child of player
          const playerDiv = document.getElementById("player_div");
          const nextVideoTooltip = document.getElementById("nextVideoTooltip");
          // if (playerDiv && nextVideoTooltip && !isPreviewAvalibale) {
          //   playerDiv.insertBefore(nextVideoTooltip, playerDiv.lastChild);
          // }

          !!strBt &&
            playerControlls.insertBefore(strBt, playerControlls.firstChild);
          if (isMobile) {
            setDisplayBack(true);
            playerControllTop.insertBefore(
              document.createElement("div"),
              playerControllTop.firstChild
            );
          }
          playEvent();
          if (!playerState.current?.isVideoPlaying) {
            !!plugin.current && plugin.current?.handlePlayStarted();
            playerState.current.isVideoPlaying = true;
          }
          if (!!playerState.current?.isVideoBuffering) {
            !!plugin.current && plugin.current?.handleBufferEnd();
            playerState.current.isVideoBuffering = false;
          }
          if (!!playerState.current?.isVideoPaused) {
            !!plugin.current && plugin.current?.handleResume();
            playerState.current.isVideoPaused = false;
          }
          if (
            isGpalEnabled.current &&
            nonceManager.current &&
            typeof nonceManager.current?.sendAdTouch === "function"
          ) {
            nonceManager.current.sendPlaybackStart(data);
          }
        },
        fullscreen: (data) => {
          try {
            addForwardIcons();
          } catch (e) {}
        },
        resize: (data) => {
          if (window.jwplayer().getFullscreen()) {
            let fricon = document.getElementById("frwdIcon");
            !!fricon && fricon.classList.add("fullScreen_t");
          } else {
            let fricon = document.getElementById("frwdIcon");
            !!fricon && fricon.classList.remove("fullScreen_t");
          }
          try {
            addForwardIcons();
          } catch (e) {}
        },
        pause: (data) => {
          onWatchTimerStopTimer();
          if (!playerState.current?.isVideoPaused) {
            !!plugin.current && plugin.current?.handlePause();
            playerState.current.isVideoPaused = true;
          }
          if (!!isPreviewAvalibale) {
            showPreview(false);
          }
          sendEvent("video_pause", analyticsData());
          playerPause.current = true;
          if (intervalIdRef.current) clearInterval(intervalIdRef.current);
        },
        buffer: (data) => {
          !!plugin.current && plugin.current?.handleBufferStart();
          playerState.current.isVideoBuffering = true;
          if (!!isPreviewAvalibale) {
            showPreview(false);
          }
        },
        seek: (data) => {
          !!plugin.current &&
            plugin.current?.handleSeek({
              STPosition: Math.floor(data.position * 1000),
              ETPosition: Math.floor(data.offset * 1000),
            });

          if (isEtvWinVideoComplete.current) {
            getStream();
          }
        },
        seeked: (data) => {},
        complete: (data) => {
          console.log("isEtvWinContent", isEtvWinContent.current);
          if (!!isEtvWinContent.current) {
            isEtvWinVideoComplete.current = true;
            const replayBtn = document.querySelector(
              '.jw-icon[aria-label="Replay"]'
            );
            if (!!replayBtn) {
              replayBtn.addEventListener("click", () => {
                getStream();
              });
            }
          }
          pCount.current = 0;
          !!plugin.current && plugin.current?.handlePlayCompleted();
          setIsVideoComplete(true);
          sendEvent("video_completed", analyticsData());
          allowedJioAdsState && resetAdSpot();

          const isPreviewPlaying =
            streamDataRef?.current?.streamStatus?.previewStreamStatus;
          if (intervalIdRef.current) clearInterval(intervalIdRef.current);
          if (isPreviewPlaying) {
            try {
              if (window?.jwplayer()?.getFullscreen()) {
                window.jwplayer()?.setFullscreen(false);
              }
            } catch (e) {
              console.log(e);
            }
          }
          if (
            isGpalEnabled.current &&
            nonceManager.current &&
            typeof nonceManager.current?.sendPlaybackEnd === "function"
          ) {
            nonceManager.current.sendPlaybackEnd();
          }
        },
        error: (data) => {
          if (!!isEtvWinVideoComplete.current) {
            document.querySelector(".jw-error-msg").style.display = "none";
            document.querySelector(".videospinner").style.display = "flex";
          }
          if (distroPartner.current) {
            distroApiHit(
              distroAnalyicsEventCall(getDristrocpObj("err"), data.message)
            );
            // startDistroTimestamps();
          }
          if (!!Playerstream.current) {
            pCount.current = 0;
          }
          ++pCount.current;
          if (
            pCount.current <= playerRtry.current &&
            !!PageData?.info?.attributes?.isLive &&
            PageData?.info?.attributes?.isLive == "true"
          ) {
            document.querySelector(".videospinner").style.display = "flex";
            document.querySelector(".jw-error-msg").style.display = "none";
            Playerstream.current = false;
            setTimeout(() => {
              startPlay(stramData);
            }, 5000);
          } else {
            pCount.current = 0;
            const playerControllTop = document.getElementsByClassName(
              "jw-controls-backdrop"
            )[0];
            const backBtn = document.getElementById("playerButtons");
            if (!!backBtn) {
              playerControllTop.insertBefore(
                backBtn,
                playerControllTop.firstChild
              );
              if (isMobile) {
                setDisplayBackError(true);
                setDisplayBack(true);
                playerControllTop.insertBefore(
                  playerControllTop,
                  playerControllTop.firstChild
                );
              }
            }
            !!streamDataRef.current &&
              !!streamDataRef.current?.response?.sessionInfo &&
              endActiveStream(
                streamDataRef.current.response.sessionInfo.streamPollKey
              )(!!plugin.current) &&
              plugin.current?.thumbnailVideoClick();
            !!plugin.current && plugin.current?.handlePlayerLoad();
            !!plugin.current &&
              plugin.current?.handleError({
                errorMsg:
                  !!data && !!data.message ? data.message : "network error",
              });
          }
        },
        setupError: (data) => {
          setVideoBgImage();
          !!streamDataRef.current &&
            !!streamDataRef.current?.response?.sessionInfo &&
            endActiveStream(
              streamDataRef.current.response.sessionInfo.streamPollKey
            );
        },
        cast: (data) => {},
        levelsChanged: (data) => {},
        time: (data) => {
          const isPreviewPlaying =
            streamDataRef?.current?.streamStatus?.previewStreamStatus &&
            PageData?.info?.attributes?.playerType === "preview";
          if (
            data.position > 0 &&
            data.position > 60 &&
            window.jwplayer().getDuration() != "Infinity" &&
            !isPreviewPlaying
          ) {
            setDisplayStartOver(true);
            // if(!isPreviewAvalibale){
            //     setDisplayStartOver(false);
            // }
          } else if (data.position < 0 && data.position < -50) {
            setDisplayLive(true);
          } else {
            setDisplayStartOver(false);
            setDisplayLive(false);
          }
          let streamData = streamDataRef.current;
          if (
            streamData.pageAttributes.introStartTime <=
              Math.round(data.currentTime) &&
            Math.round(data.currentTime) <
              streamData.pageAttributes.introEndTime
          ) {
            setDisplaySkipIntro(true);
          } else if (
            Math.round(data.currentTime) >
            streamData.pageAttributes.introEndTime
          ) {
            setDisplaySkipIntro(false);
          } else {
            setDisplaySkipIntro(false);
          }
          nextVideoCheck();
          if (
            Math.round(data.currentTime) > 0 &&
            Math.round(data.currentTime) <= 4
          ) {
            setShowPGRating(true);
          } else {
            setShowPGRating(false);
          }
          if (allowedJioAdsState && jioAdSpots?.[1]?.length) {
            manageMidRole(cuepoints);
          }

          if (isPreviewPlaying) {
            $(".jw-slider-time").hide();
            $(".jw-display-controls .jw-display-icon-rewind").css(
              "visibility",
              "hidden"
            );
            $(".jw-controlbar .jw-icon-rewind").hide();
            $(".fastBtn").hide();
          }
        },
        firstFrame: () => {
          if (
            appConfig.settings?.ccToggleType &&
            appConfig.settings?.ccToggleType !== "none"
          ) {
            const isCCGloballyEnabled = getItem("closedCaption");
            if (isCCGloballyEnabled) setCaptions();
            else window.jwplayer().setCurrentCaptions(0);
          }
        },
        beforePlay: () => {},
        mute: (data) => {
          if (!initialplay.current) {
            let jmute = { ...jwUserP, mute: data.mute };
            setjwUserP(jmute);
            setItem("jwUserP", jmute);
          }
        },
        volume: (data) => {},
        adStarted: (data) => {
          adEvents("adStarted", data.adposition);
        },
        adSkipped: (data) => {
          adEvents("adSkipped", data.adposition);
          if (
            isGpalEnabled.current &&
            nonceManager.current &&
            typeof nonceManager.current?.sendAdTouch === "function"
          ) {
            nonceManager.current.sendAdTouch(data);
          }
        },
        adClick: (data) => {
          if (
            isGpalEnabled.current &&
            nonceManager.current &&
            typeof nonceManager.current?.sendAdClick === "function"
          ) {
            nonceManagenonceManagerrSet.sendAdClick(data);
          }
        },
        adPlay: (data) => {
          adEvents("adStarted", data.adposition);
        },
        adComplete: (data) => {
          adEvents("adComplete", data.adposition);
        },
        adError: (data) => {
          adEvents("adError", data.adposition);
        },
        autostartNotAllowed: (data) => {
          window?.jwplayer(playerRef.current)?.setMute(true);
          window?.jwplayer(playerRef.current)?.play();
        },
        captionsList: (data) => {},
        audioTracks: (data) => {
          //initially all the tracks is present
          setAudioTrack(data.tracks);
        },
        audioTrackChanged: (data) => {
          // on changing event
          setSelectedAudioTrack(data.currentTrack);
          let selected_lang = data.tracks[data.currentTrack]?.name;
          if (selected_lang) {
            setItem("player-audio-lang", selected_lang);
          }
          // setAudioTrack(data.tracks);
          debouncedSetAudioTrack(data.tracks);
        },
      },
    };
    if (window.jwplayer) {
      setTimeout(() => {
        window?.jwplayer(playerRef.current)?.setup(playerSetUP);
      }, 200);
    }
    isEtvWinVideoComplete.current = false;
  };
  const liveText = () => {
    document.querySelectorAll(".jw-text-live").forEach((el) => {
      el.innerText = Jwplayerconstant[localLang].streaming;
    });
  };
  const getSelectedBitrate = (streamVideoQualities) => {
    let bitRate = getItem("selectedBitRate");
    streamVideoQualities.map((quality, index) => {
      if (bitRate == quality.code) {
        selectedBitrate.current = quality.maxBitRate;
      }
    });
  };

  const debounce = (func, delay) => {
    let timerId;

    return function (...args) {
      // Clear the previous timer if it's still active
      clearTimeout(timerId);

      // Set a new timer
      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const debouncedSetAudioTrack = debounce(setAudioTrack, 500);

  const adjustVideoQuality = () => {
    let streamBandwidths =
      !!window.jwplayer() &&
      typeof window.jwplayer()?.getQualityLevels === "function" &&
      // !!window.jwplayer()?.getQualityLevels() &&
      window.jwplayer()?.getQualityLevels();
    let bitrateStatus = false;
    bitrateApplied.current = true;
    if (!!selectedBitrate.current) {
      for (let i = 0; i < streamBandwidths.length; i++) {
        if (streamBandwidths[i].bitrate / 1000 <= selectedBitrate.current) {
          window.jwplayer()?.setCurrentQuality(i);
          bitrateStatus = true;
          break;
        }
      }
      if (
        bitrateStatus == false &&
        typeof window.jwplayer()?.setCurrentQuality === "function"
      ) {
        window.jwplayer()?.setCurrentQuality(streamBandwidths.length - 1);
      }
    } else {
      if (typeof window.jwplayer()?.setCurrentQuality === "function")
        window.jwplayer()?.setCurrentQuality(0);
    }
  };

  const addPgRating = () => {
    try {
      let inside_player_data = document.getElementById("inside_player_data");
      let player_div = document.getElementById("player_div");
      player_div.append(inside_player_data);
    } catch (e) {
      console.log(e);
    }
  };
  const addForwardIcons = () => {
    var mainElement = document.querySelector(".jw-button-container");
    var childElementWithIdAcc = mainElement.querySelector("#frwdIcon");
    document.querySelector(".jw-display-icon-next").style.visibility =
      "visible";
    document.querySelector(".jw-icon-next").style.display = "none";

    // if(!childElementWithIdAcc){
    let frwd = document.getElementById("frwdIcon");
    if (frwd) {
      frwd.style.display = "block";
      frwd.style.pointerEvents = "all";

      if (window && window.innerWidth < 420) {
        $(".jw-display-icon-next .jw-icon-next").after(frwd);
      } else {
        $(".jw-controlbar .jw-icon-next").after(frwd);

        //    }
      }
    }
  };
  const concurrenceStreamRequest = () => {
    try {
      let stream_Data = streamDataRef.current;
      if (stream_Data?.sessionInfo.streamPollKey == undefined) return;
      let apiData = new FormData();
      apiData.append("poll_key", stream_Data?.sessionInfo?.streamPollKey);
      let url = process.env.initJson["api"] + "/service/api/v1/stream/poll";
      mutateGetPoll({ url, apiData });
    } catch (e) {
      console.log(e);
    }
  };

  const endActiveStream = (pollKey) => {
    var apiData = new FormData();
    apiData.append("poll_key", pollKey);
    let url =
      process.env.initJson["api"] + "/service/api/v1/stream/session/end";
    try {
      mutateEndPoll({ url, apiData });
    } catch (e) {}
  };

  const playEvent = () => {
    let stream_Data = streamDataRef.current;
    if (!!stream_Data?.sessionInfo) {
      if (pollInterval.current === null)
        pollInterval.current = setInterval(() => {
          try {
            concurrenceStreamRequest();
          } catch (e) {
            console.log(e);
          }
        }, stream_Data?.sessionInfo?.pollIntervalInMillis);
    }
    if (initialplay.current == true && isStartOver.current == false) {
      initialplay.current = false;
      resumePlayBack();
    } else {
      initialplay.current = false;
    }
    if (isStartOver.current == true) {
      isStartOver.current = false;
    }
  };

  const resumePlayBack = () => {
    let stream_Data = streamDataRef.current;
    if (stream_Data.streamStatus.seekPositionInMillis > 0) {
      window
        .jwplayer()
        .seek(stream_Data.streamStatus.seekPositionInMillis / 1000);
    }
  };

  const adEvents = (type, adType) => {
    let aa;
    if (adType == "pre") aa = "preRoll";
    else if (adType == "post") aa = "postRoll";
    else aa = "midRoll";
    switch (type) {
      case "adStarted": {
        setAdPlaying(true);
        !!plugin && plugin.current?.handleAdStarted({ adType: aa });
        break;
      }
      case "adComplete": {
        setAdPlaying(false);
        !!plugin && plugin.current?.handleAdCompleted({ adType: aa });
        break;
      }
      case "adSkipped": {
        setAdPlaying(false);
        !!plugin && plugin.current?.handleAdSkipped({ adType: aa });
        break;
      }
      case "adPlay": {
        setAdPlaying(true);
        break;
      }
      case "adError": {
        setAdPlaying(false);
        break;
      }
    }
  };

  const getStream = (hasPin) => {
    !!streamDataRef?.current &&
      !!streamDataRef?.current?.response?.sessionInfo &&
      endActiveStream(streamDataRef.current.response.sessionInfo.streamPollKey);
    let url = process.env.initJson["api"];
    let params = {
      path:
        PageData?.streamStatus.streamType == "preview"
          ? `${streamPath}&stream_type=preview`
          : streamPath,
    };
    hasPin && (params.pin = hasPin);
    if (SystemFeature?.encryptApisList?.fields?.stream == "true") {
      PageData?.info?.attributes?.playerType == "trailer" &&
        (params["stream_type"] = "trailer");
      let apiData = {
        data: encryptData(JSON.stringify(params)),
        metadata: encryptData(JSON.stringify({ request: "page/stream" })),
      };

      url += "/service/api/v1/send";
      try {
        mutateStreamApi({ url, apiData });
      } catch (e) {}
    } else {
      (PageData?.info?.attributes?.playerType == "trailer" &&
        (params["stream_type"] = "trailer")) ||
        (PageData?.info?.attributes?.playerType == "preview" &&
          (params["stream_type"] = "preview"));
      url += "/service/api/v1/page/stream?" + jsonToQueryParams(params);
      try {
        mutateGetStreamData(url);
      } catch (e) {}
    }
  };
  const startOver = () => {
    try {
      window.jwplayer().seek(0);
    } catch (e) {
      console.log(e);
    }
  };

  const goToLastChannel = () => {
    router.push(showLastChannel);
  };

  const stopPlayer = () => {
    setTimeLeft(0);
    if (!isPreviewAvalibale) {
      return;
    }
    clearInterval(previewTimer);
    window?.jwplayer(playerRef.current).stop();
  };
  useEffect(() => {
    let streamData = streamDataRef.current;
    if (streamData) {
      let totalDuration =
        streamData?.streamStatus?.totalDurationInMillis / 1000;
      if (streamData.streams.length > 0) {
        let streamPreviewTime = parseInt(
          streamData.streams[0].params.duration < totalDuration
            ? streamData.streams[0].params.duration
            : totalDuration
        );
        setTimeLeft(streamPreviewTime);
      }
    }
  }, [streamDataResponse]);
  const secondsToMinutesAndSeconds = (seconds) =>
    `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? "0" : ""}${seconds % 60}`;

  /**
   * If preview is playing in full screen mode and preview ends,
   * We exit full screen so that error messages can display properly
   */
  const exitFullScreen = () => {
    try {
      if (window?.jwplayer()?.getFullscreen()) {
        window.jwplayer()?.setFullscreen(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Hiding un necessary controls of jwplayer once preview ends
  const removePlayerIcons = () => {
    $(".jw-display-icon-container.jw-display-icon-display.jw-reset").css(
      "visibility",
      "hidden"
    );
  };

  const showPreview = (pauseplay) => {
    if (!!pauseplay) {
      previewTimer = setInterval(() => {
        setTimeLeft((t) => {
          if (Math.floor(t) <= 0) {
            stopPlayer();
            setIsPreviewPlaying(false);
            setIsPreviewAvalibale(false);
            exitFullScreen();
            removePlayerIcons();
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(previewTimer);
    }
  };

  const nextEpisode = () => {
    pCount.current = 0;

    if (screen.orientation && screen.orientation.lock) {
      try {
        screen.orientation.lock("landscape");
      } catch (error) {
        console.error("Failed to lock screen orientation:", error);
      }
    }
    if (displayNextEpisode["nextVideoTargetPath"]) {
      router.push(displayNextEpisode["nextVideoTargetPath"]);
    }
  };

  const golive = () => {
    window.jwplayer().seek(-15);
    setDisplayLive(false);
  };
  const processCaptions = (captions) => {
    var captionslist = [];
    if (!!captions && !!captions.ccList) {
      for (var i = 0; i < captions.ccList.length; i++) {
        let obj = {
          file: getAbsolutePath(captions.ccList[i].filePath),
          label: captions.ccList[i].language,
          kind: "captions",
        };
        captionslist.push(obj);
      }
      return captionslist;
    } else {
      return [];
    }
  };

  const getAdDada = () => {
    let karray = [];
    let advertising = {};
    let adp = playerPage.adUrlResponse.adUrlTypes.filter(
      (ele) =>
        ele.urlType == "postUrl" ||
        ele.urlType == "postRollUrl" ||
        ele.urlType == "midRollUrl" ||
        ele.urlType == "midUrl" ||
        ele.urlType == "preUrl" ||
        ele.urlType == "preRollUrl"
    );
    let adType =
      !!adp && !!adp[0] && !!adp[0].attributes && !!adp[0].attributes["adTag"]
        ? adp[0].attributes["adTag"]
        : "googima";
    advertising["preloadAds"] = true;
    advertising["vpaidmode"] = "insecure";
    advertising["client"] = adType == "vmap" ? "googima" : adType;
    for (let eachAd of playerPage?.adUrlResponse?.adUrlTypes) {
      if (eachAd.url != undefined) {
        eachAd.url = eachAd.url.replace("{{WIDTH}}", "__player-width__");
        eachAd.url = eachAd.url.replace("{{HEIGHT}}", "__player-height__");
        eachAd.url = eachAd.url.replace(
          "{{ENCODED_URL}}",
          encodeURI(window.location.href)
        );
        if (!!playerPage.info?.attributes?.contentId)
          eachAd.url = eachAd.url.replace(
            "{{CONTENT_ID}}",
            playerPage.info.attributes.contentId
          );
        if (!!playerPage.title)
          eachAd.url = eachAd.url.replace(
            "{{CONTENT_TITLE}}",
            encodeURI(playerPage.title)
          );
        if (!!locationInfo?.data?.ipInfo?.trueIP)
          eachAd.url = eachAd.url.replace(
            "{{IP}}",
            locationInfo.data?.ipInfo.trueIP
          );
        if (!!locationInfo?.data?.ipInfo?.latitude)
          eachAd.url = eachAd.url.replace(
            "{{LAT}}",
            locationInfo.data?.ipInfo.latitude
          );
        if (!!locationInfo?.data?.ipInfo?.longitude)
          eachAd.url = eachAd.url.replace(
            "{{LON}}",
            locationInfo.data?.ipInfo.longitude
          );
        eachAd.url = eachAd.url.replace("{{USER_AGENT}}", "__device-ua__");
        eachAd.url = eachAd.url.replace("{{DNT}}", "");
        eachAd.url = eachAd.url.replace("{{US_PRIVACY}}", 0);
      }
      if (adType == "vmap") {
        advertising["schedule"] = eachAd["url"];
        break;
      } else {
        if (
          (eachAd.urlType == "preRollUrl" || eachAd.urlType == "preUrl") &&
          eachAd.url != undefined
        ) {
          karray.push({
            tag: eachAd.url
              .replace(
                "{{CACHEBUSTER}}",
                new Date().getTime() + getRandonNumber()
              )
              .replace(
                "{{CORRELATOR}}",
                new Date().getTime() + getRandonNumber()
              ),
            offset: "pre",
          });
        } else if (
          (eachAd.urlType == "postRollUrl" || eachAd.urlType == "postUrl") &&
          eachAd.url != undefined &&
          playerPage.info.attributes.isLive != "true"
        ) {
          karray.push({
            tag: eachAd.url
              .replace(
                "{{CACHEBUSTER}}",
                new Date().getTime() + getRandonNumber()
              )
              .replace(
                "{{CORRELATOR}}",
                new Date().getTime() + getRandonNumber()
              ),
            offset: "post",
          });
        } else if (
          (eachAd.urlType == "midRollUrl" || eachAd.urlType == "midUrl") &&
          playerPage.info?.attributes?.isLive != "true"
        ) {
          if (!!eachAd.position?.adplaypositions?.length) {
            let slots = eachAd.position?.adplaypositions.split(",");
            slots.forEach((element) => {
              element = Math.round(parseInt(element.trim()));
              karray.push({
                tag: eachAd.url
                  .replace(
                    "{{CACHEBUSTER}}",
                    new Date().getTime() + getRandonNumber()
                  )
                  .replace(
                    "{{CORRELATOR}}",
                    new Date().getTime() + getRandonNumber()
                  ),
                offset: element,
              });
            });
          } else if (
            !!eachAd.position &&
            (!!eachAd.position.interval || !!eachAd.position.offset)
          ) {
            if (!!eachAd.position.offset) {
              karray.push({
                tag: eachAd.url
                  .replace(
                    "{{CACHEBUSTER}}",
                    new Date().getTime() + getRandonNumber()
                  )
                  .replace(
                    "{{CORRELATOR}}",
                    new Date().getTime() + getRandonNumber()
                  ),
                offset: parseInt(eachAd.position.offset),
              });
            } else {
              eachAd.position.offset = 0;
            }
            if (!!eachAd.position.interval) {
              let offset = parseInt(eachAd.position.offset);
              if (
                !!playerPage.streamStatus &&
                !!playerPage.streamStatus.totalDurationInMillis
              ) {
                let totalDuratation = Math.round(
                  Math.abs(playerPage.streamStatus.totalDurationInMillis / 1000)
                );
                offset += parseInt(eachAd.position.interval);
                eachAd.position.maxCount = eachAd.position.maxCount || 10; // setting 10 count default
                while (
                  totalDuratation >= offset &&
                  karray.length < eachAd.position.maxCount
                ) {
                  karray.push({
                    tag: eachAd.url
                      .replace(
                        "{{CACHEBUSTER}}",
                        new Date().getTime() + getRandonNumber()
                      )
                      .replace(
                        "{{CORRELATOR}}",
                        new Date().getTime() + getRandonNumber()
                      ),
                    offset: offset,
                  });
                  offset += parseInt(eachAd.position.interval);
                }
              }
            }
          }
        }
      }
    }
    if (adType != "vmap") {
      advertising["schedule"] = karray;
    }
    if (!!streamDataRef?.current.streams[0].params?.daiAssetKey)
      advertising["client"] = "dai";
    return advertising;
  };

  const macroReplace = (url) => {
    if (url != undefined) {
      url = url
        .replace("{{cb}}", new Date().getTime())
        .replace("{{ua}}", window.navigator.userAgent)
        .replace("{{did}}", getBoxId())
        .replace("{{ENCODED_URL}}", encodeURI(window.location.href))
        .replace("{{USER_AGENT}}", window.navigator.userAgent)
        .replace("{{CACHEBUSTER}}", new Date().getTime() + getRandonNumber())
        .replace("{{CORRELATOR}}", new Date().getTime() + getRandonNumber());
      if (!!locationInfo?.data?.ipInfo?.trueIP)
        url = url.replace("{{IP}}", locationInfo.data?.ipInfo.trueIP);
      if (!!locationInfo?.data?.ipInfo?.latitude)
        url = url.replace("{{LAT}}", locationInfo.data?.ipInfo.latitude);
      if (!!locationInfo?.data?.ipInfo?.longitude)
        url = url.replace("{{LON}}", locationInfo.data?.ipInfo.longitude);
      if (!!playerPage.info?.attributes?.contentId)
        url = url.replace(
          "{{CONTENT_ID}}",
          playerPage.info.attributes.contentId
        );
      if (!!playerPage.title)
        url = url.replace("{{CONTENT_TITLE}}", encodeURI(playerPage.title));
    }
    return url;
  };

  const initStreamData = async (streamData) => {
    //  let streamData = streamDataRef.current
    if (!streamData) return;
    let drmStreamData = [];
    isParentalPopup?.isActive && setParentalPopup({});
    if (
      streamData?.response?.pageAttributes.pgRatingTitle ||
      streamData?.response?.pageAttributes.pgRatingSubtitle
    ) {
      setPgRating({
        pgRatingTitle: streamData?.response?.pageAttributes.pgRatingTitle,
        pgRatingSubtitle: streamData?.response?.pageAttributes.pgRatingSubtitle,
      });
    }

    if (!!streamData?.response?.streams?.length) {
      initVideoAnalytics(streamData?.response);
      for (let strData of streamData.response.streams) {
        console.log(
          ">>partnerCode>>",
          strData.attributes.partnerCode,
          PageData.info.attributes.networkCode
        );
        if (
          PageData.info.attributes.networkCode == "distro" &&
          strData.url.includes("__PALN__")
        ) {
          distroPartner.current = true;
          await googleGenerateNonce(window.location.href);

          drmStreamData.push({
            file: macroReplace(strData.url),
          });
        }

        if (
          strData.streamType == "fairplay" &&
          strData.attributes.partnerCode == "manorama_max"
        ) {
          strData.keys.licenseKey = strData.keys.licenseKey.replace(
            "http:",
            "https:"
          );
          drmStreamData.push({
            file: macroReplace(strData.url),
            drm: {
              fairplay: {
                certificateUrl: !!strData.keys?.certificate
                  ? strData.keys?.certificate
                  : "/assets/fairplay.cer",
                processSpcUrl: strData.keys.licenseKey,

                licenseRequestHeaders: [
                  {
                    name: "Content-type",
                    value: "application/x-www-form-urlencoded",
                  },
                  // { "name": "pallycon-customdata-v2", "value": strData.keys?.certificate}
                ],

                extractContentId: function (initData) {
                  let contentId = initData;
                  cid = contentId;

                  //   return contentId
                  if (contentId.indexOf("skd://") > -1)
                    return initData.substring(initData.indexOf("skd://") + 6);

                  throw "Invalid Content ID format. The format of the Content ID must be the following: skd://xxx where xxx is the Key ID in hex format.";
                },
                licenseResponseType: "text",

                licenseRequestMessage: function (keyMessage, session) {
                  var data =
                    "spc=" +
                    base64EncodeUint8Array(keyMessage) +
                    "&assetId=" +
                    cid.split("//")[1];
                  return data;
                },
                extractKey: function (response) {
                  return base64DecodeUint8Array(response);
                },
              },
            },
          });
        } else if (
          strData.streamType == "fairplay" &&
          strData.attributes.partnerCode != "manorama_max" &&
          strData.params.partnerCode != "ultrajhakas" &&
          strData.attributes.partnerCode != "lionsgateplay"
        ) {
          strData.keys.licenseKey = strData.keys.licenseKey.replace(
            "http:",
            "https:"
          );
          drmStreamData.push({
            file: macroReplace(strData.url),
            drm: {
              fairplay: {
                certificateUrl: !!strData.keys?.certificate
                  ? strData.keys?.certificate
                  : "/assets/fairplay.cer",
                processSpcUrl: strData.keys.licenseKey,
                licenseRequestHeaders: [
                  {
                    name: "Content-type",
                    value: "application/octet-stream",
                  },
                ],
              },
            },
          });
        } else if (
          strData.params.partnerCode == "ultrajhakas" &&
          strData.streamType == "widevine"
        ) {
          let UrlWidevine = strData.keys.licenseKey;
          if (strData.params.partnerCode == "ultrajhakas") {
            UrlWidevine = strData.keys.licenseKey + "/" + strData.streamType;
          }
          // console.log( strData.keys.licenseKey + "/" + strData.streamType,"streamType<<<")
          drmStreamData.push({
            file: strData.url,
            drm: {
              widevine: {
                url: UrlWidevine,
                licenseRequestFilter: function (request) {
                  var rawLicenseRequest = new Uint8Array(request.body);
                  request.headers["Content-Type"] = "application/json";
                  request.headers["x-provider-id"] = "watcho";
                  var wrapped = {};
                  let customData = {
                    packageid: strData.params.packageId,
                    drmtoken: strData.params.drmToken,
                  };
                  wrapped["payload"] = btoa(
                    String.fromCharCode.apply(null, rawLicenseRequest)
                  ); // Encode the payload in Base64.
                  wrapped["drmscheme"] = strData.streamType;
                  wrapped["customdata"] = customData;
                  wrapped["contentid"] = strData.params.contentId;
                  wrapped["providerid"] = strData.params.providerId;
                  wrapped["timestamp"] = Math.floor(Date.now() / 1000);

                  var wrappedJson = JSON.stringify(wrapped);

                  request.body = new Uint8Array(wrappedJson.length);
                  for (var i = 0; i < wrappedJson.length; ++i) {
                    request.body[i] = wrappedJson.charCodeAt(i);
                  }
                },
                licenseResponseFilter: function (response) {
                  var wrappedArray = new Uint8Array(response.data);
                  var wrappedString = String.fromCharCode.apply(
                    null,
                    wrappedArray
                  );
                  var wrapped = JSON.parse(wrappedString);

                  var rawLicenseBase64 = wrapped.body;

                  var rawLicenseString = atob(rawLicenseBase64);
                  response.data = new Uint8Array(rawLicenseString.length);
                  for (var i = 0; i < rawLicenseString.length; ++i) {
                    response.data[i] = rawLicenseString.charCodeAt(i);
                  }
                },
              },
            },
          });
        } else if (
          strData.params.partnerCode == "ultrajhakas" &&
          strData.streamType == "fairplay"
        ) {
          drmStreamData.push({
            file: strData.url,
            drm: {
              fairplay: {
                certificateUrl: "https://ottapps.revlet.net/apps/y/ultra.cer",
                processSpcUrl:
                  strData.keys.licenseKey + "/" + strData.streamType,
                licenseRequestFilter: function (request) {
                  var rawLicenseRequest = new Uint8Array(request.body);
                  request.headers["Content-Type"] = "application/json";
                  request.headers["x-provider-id"] = "watcho";
                  var wrapped = {};
                  let customData = {
                    packageid: strData.params.packageId,
                    drmtoken: strData.params.drmToken,
                  };
                  wrapped["payload"] = btoa(
                    String.fromCharCode.apply(null, rawLicenseRequest)
                  ); // Encode the payload in Base64.
                  wrapped["drmscheme"] = strData.streamType;
                  wrapped["customdata"] = customData;
                  wrapped["contentid"] = strData.params.contentId;
                  wrapped["providerid"] = strData.params.providerId;
                  wrapped["timestamp"] = Math.floor(Date.now() / 1000);

                  var wrappedJson = JSON.stringify(wrapped);

                  request.body = new Uint8Array(wrappedJson.length);
                  for (var i = 0; i < wrappedJson.length; ++i) {
                    request.body[i] = wrappedJson.charCodeAt(i);
                  }
                },
                licenseResponseFilter: function (response) {
                  var wrappedArray = new Uint8Array(response.data);
                  var wrappedString = String.fromCharCode.apply(
                    null,
                    wrappedArray
                  );
                  var wrapped = JSON.parse(wrappedString);

                  var rawLicenseBase64 = wrapped.body;

                  var rawLicenseString = atob(rawLicenseBase64);
                  response.data = new Uint8Array(rawLicenseString.length);
                  for (var i = 0; i < rawLicenseString.length; ++i) {
                    response.data[i] = rawLicenseString.charCodeAt(i);
                  }
                },
              },
            },
          });
          // })
        }
        if (
          strData?.attributes?.partnerCode == "lionsgateplay" &&
          strData?.streamType == "widevine"
        ) {
          var StreamURL = strData.url;
          var vudrmToken = strData.params.drmToken;

          drmStreamData.push({
            file: StreamURL,
            drm: {
              widevine: {
                url: "https://widevine-license.vudrm.tech/proxy",
                headers: [
                  {
                    name: "X-VUDRM-TOKEN",
                    value: vudrmToken,
                    // "kid":"4498547E-4017-D7D4-C99A-A72B3D2E7070"
                  },
                ],
              },
              playready: {
                url: "https://playready-license.vudrm.tech/rightsmanager.asmx",
                headers: [
                  {
                    name: "X-VUDRM-TOKEN",
                    value: vudrmToken,
                  },
                ],
              },
            },
          });
        } else if (
          strData?.attributes?.partnerCode == "lionsgateplay" &&
          strData?.streamType == "fairplay"
        ) {
          var vudrmToken = strData.params.drmToken;
          drmStreamData.push({
            file: strData.url,
            drm: {
              fairplay: {
                certificateUrl: strData.keys?.certificate,
                processSpcUrl: function (initData) {
                  return "https://" + initData.split("skd://").pop();
                },
                headers: [
                  {
                    name: "Content-Type",
                    value: "application/json",
                  },
                ],
                licenseRequestHeaders: [
                  {
                    name: "Content-type",
                    value: "arraybuffer",
                  },
                  {
                    name: "X-VUDRM-TOKEN",
                    value: vudrmToken,
                  },
                ],
              },
            },
          });
        } else if (strData.streamType == "widevine") {
          strData.keys.licenseKey = strData.keys.licenseKey.replace(
            "http:",
            "https:"
          );
          drmStreamData.push({
            file: macroReplace(strData.url),
            drm: {
              widevine: {
                url: strData.keys.licenseKey,
              },
            },
          });
        } else if (strData.streamType == "playready") {
          strData.keys.licenseKey = strData.keys.licenseKey.replace(
            "http:",
            "https:"
          );
          drmStreamData.push({
            file: macroReplace(strData.url),
            drm: {
              playready: {
                url: strData.keys.licenseKey,
              },
            },
          });
        } else if (
          strData.keys.licenseKey.length == 0 &&
          strData.url.includes(".mpd")
        ) {
          drmStreamData.push({
            file: macroReplace(strData.url),
          });
        } else {
          let source = {
            file: macroReplace(strData.url),
            default: false,
            label: "0",
            preload: "metadata",
            sParams: strData.params,
            subType: strData.streamType,
            onXhrOpen: function (xhr, url) {
              xhr.setRequestHeader("sessionid", strData.params?.sessionid);
              xhr.setRequestHeader("token", strData.params?.token);
            },
          };
          if (!!!strData.params?.sessionid && !!!strData.params?.token)
            delete source.onXhrOpen;
          strData.url.includes(".mp4")
            ? (source["type"] = "mp4")
            : (source["type"] = "hls");
          playerPage.info.attributes.networkName === "etvwin" &&
            playerPage.info.attributes.isLive === "true" &&
            (source["withCredentials"] = true);

          // if(strData?.attributes?.partnerCode == "etvwin" && !!strData?.attributes?.subscriberId && strData?.attributes?.userAgent){

          //       source.onXhrOpen =  function (xhr, url) {
          //         xhr.setRequestHeader("User-Agent", strData?.attributes?.userAgent);
          //         xhr.setRequestHeader("user_id", userDetails?.userId);
          //         xhr.setRequestHeader("subscriber_id", strData?.attributes?.subscriberId);
          //         xhr.setRequestHeader("Content-Type", "application/x-mpegURL");
          //     }

          // }
          drmStreamData.push(source);
          if (
            strData?.attributes?.partnerCode == "etvwin" &&
            !!strData?.attributes?.subscriberId &&
            !!strData?.attributes?.userAgent
          ) {
            isEtvWinContent.current = true;
            drmStreamData.push({
              file: macroReplace(strData.url),
              onXhrOpen: function (xhr, url) {
                xhr.setRequestHeader(
                  "User-Agent",
                  strData?.attributes?.userAgent
                );
                xhr.setRequestHeader(
                  "user_id",
                  strData?.attributes?.subscriberId
                );
                xhr.setRequestHeader(
                  "subscriber_id",
                  strData?.attributes?.subscriberId
                );
                xhr.setRequestHeader("Content-Type", "application/x-mpegURL");
              },
            });
          }
        }
      }
    }
    let hlsStreams = drmStreamData.filter((ele) => {
      return ele.type == "hls";
    });
    if (hlsStreams.length > 0) {
      drmStreamData = drmStreamData.filter((ele) => {
        return ele.type != "hls";
      });
      let regular = hlsStreams.filter((ele) => {
        return ele.subType != "akamai";
      });
      let safariS = hlsStreams.filter((ele) => {
        return ele.subType == "akamai";
      });

      // if (this.browserAgent.browser == 'safari' || this.deviceService.isMobile() || this.deviceService.isTablet()) {
      if (safariS.length == 0) {
        if (regular[0].onXhrOpen != undefined) {
          delete regular[0].onXhrOpen;
          regular[0].file =
            regular[0].file +
            "?sessionid=" +
            regular[0].sParams.sessionid +
            "&token=" +
            regular[0].sParams?.token;
          delete regular[0].sParams;
        }
        drmStreamData.push(regular[0]);
      } else {
        drmStreamData.push(safariS[0]);
      }
      // }
      //  else if (!!regular[0]) {
      //     drmStreamData.push(regular[0])
      // }
      // else {
      //     drmStreamData.push(hlsStreams[0]);
      // }
    }
    let playSource = [
      {
        sources: drmStreamData,
        //  image : getAbsolutePath(PageData?.sectionInfo?.shareInfo?.imageUrl),
        tracks:
          !!streamData?.response &&
          !!streamData?.response.streams[0]?.closeCaptions
            ? processCaptions(streamData?.response?.streams[0].closeCaptions)
            : [],
      },
    ];

    const networkCodeCheck = PageData.info.attributes.networkName;
    if (networkCodeCheck == "DistroTV" || networkCodeCheck == "Distro") {
      await playSource[0]?.sources.map((value) => {
        value.file = replaceDistroMacros(value.file);
      });
      console.log(">>>>playSource[0]?.sources", playSource[0]?.sources);
    }
    // DAI asset key

    if (!!streamData?.response.streams[0].params.daiAssetKey) {
      let DAIsetting = {
        assetKey: streamData?.response.streams[0].params.daiAssetKey,
      };
      playSource[0].daiSetting = DAIsetting;
    }
    stramData = playSource;
    startPlay(playSource);
  };

  const replaceDistroMacros = (url) => {
    const cacheBuster = Date.now();

    const advertisingID = generateGUID();

    const userAgent = window.navigator.userAgent;

    const playerWidth = playerRef.current.offsetWidth;
    const playerHeight = playerRef.current.offsetHeight;
    let deviceMake = "WebDesktop";
    let windowWidth = window.innerWidth;
    if (windowWidth <= 991) {
      deviceMake = "WebMobile";
    }
    url = url.replace("__CACHE_BUSTER__", cacheBuster);
    url = url.replace("__PLAYBACK_ID__", advertisingID);

    url = url.replace("__ADVERTISING_ID__", getBoxId());
    url = url.replace("__ADVERTISING_ID__", getBoxId());

    url = url.replace("__USER_AGENT__", encodeURIComponent(userAgent));
    url = url.replace("__APP_BUNDLE__", "distro.tv");

    url = url.replace(
      "__PAGEURL_ESC__",
      encodeURIComponent(window.location.href)
    );
    url = url.replace("__DEVICE_ID__", getBoxId());
    url = url.replace("__DEVICE_CATEGORY__", "web");

    url = url.replace("__APP_VERSION__", "1.0.0");
    url = url.replace("__DEVICE_MAKE__", deviceMake);

    url = url.replace("__STORE_URL__", "");
    url = url.replace("__LIMIT_AD_TRACKING__", "");
    url = url.replace("__AID_TYPE__", "");

    url = url.replace("__APP_CATEGORY__", "");
    url = url.replace("__APP_NAME__", "");
    url = url.replace("__APP_DOMAIN__", "");
    url = url.replace("__IS_GDPR__", "");
    url = url.replace("__IS_CCPA__", "");
    url = url.replace("__GEO_COUNTRY__", "");
    url = url.replace("__LATITUDE__", "");
    url = url.replace("__LONGITUDE__", "");

    url = url.replace("__WIDTH__", "1920");
    url = url.replace("__HEIGHT__", "1080");

    url = url.replace("__CONNECTION_TYPE__", "");
    url = url.replace("__CLIENT_IP__", "");

    if (
      nonceManager.current &&
      typeof nonceManager.current?.getNonce === "function"
    ) {
      url = url.replace("__PALN__", nonceManager.current.getNonce());
    } else {
      url = url.replace("__PALN__", "");
    }

    console.log("Macros replaced:", url);
    return url;
  };

  const generateGUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const forwardClick = () => {
    let crPosition = window?.jwplayer().getPosition();
    window?.jwplayer().seek(crPosition + 10);
  };
  const skipIntro = () => {
    let streamData = streamDataRef.current;
    window?.jwplayer().seek(parseInt(streamData?.pageAttributes?.introEndTime));
    setDisplaySkipIntro(false);
  };

  const btnHandler = (button, target) => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    if (button?.properties?.showPopUp) {
      let pop = {
        isActive: button?.properties?.showPopUp,
        topImg: button?.properties?.showPopUp,
        topImgValue:
          "http://mobond.yuppcdn.net/cf1/static/slt/images/payment-failure.svg",
        title1: button?.properties?.title,
        title2: button?.properties?.subtitle,
        yesButtonTarget1: handleClose,
        yesButton1: "Cancel",
        yesButtonType: "primary",
        close: true,
        closeTarget: handleClose,
      };
      setPopUpData(pop);
    } else if (button.target === "subscribe") {
      if (userloggged) {
        if (button?.properties?.isFreedomTv) {
          router.push(`plans/subscribe?_subscribe=${router.asPath.slice(1)}`);
        } else {
          router.push("/plans/list");
        }
      } else {
        router.push("/signin");
      }
    } else if (button.target === "verify_email") {
      if (userloggged) {
        let fd = {
          from: "player",
          verification: "email",
          context: "verify_email",
          data: {
            title1: `One Time Passcode (OTP) has been sent to your email ${userDetails.email.slice(0, 5)}******${userDetails.email.substring(8)}`,
            mobile: userDetails.phoneNumber,
            email: userDetails.email,
          },
        };
        setOtpData(fd);
      } else {
        router.push("/signin");
      }
    } else if (button.target === "rent") {
      if (button.properties.isFreedomTv) {
        router.push(`plans/subscribe?_rent=${router.asPath.slice(1)}`);
      } else {
        if (
          appConfig?.packageSettings?.paymentGateway?.typeOfPayment ==
          "internal"
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
      }
    } else if (button.target === "rent") {
      const path = router.asPath.replace("/", "");
      const params = new URLSearchParams({
        path,
        package_type: 2,
        skip_package_content: true,
      }).toString();
      const url = `${process.env.initJson.api}${process.env.packageURL}packages/info/for/content?${params}`;
      mutateFetchPaymentData(url);
    } else if (button.target === "verify_email") {
      if (userloggged) {
        let fd = {
          from: "player",
          verification: "email",
          context: "verify_email",
          data: {
            title1: `One Time Passcode (OTP) has been sent to your email ${userDetails.email.slice(0, 5)}******${userDetails.email.substring(8)}`,
            mobile: userDetails.phoneNumber,
            email: userDetails.email,
          },
        };
        setOtpData(fd);
      } else {
        router.push("/signin");
      }
    } else router.push("/" + button?.target);
  };
  const handleClose = () => {
    if (isParentalPopup) {
      router.back();
    }
    setPopUpData({});
  };

  const getImagePath = (path) => {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  };

  //Jio config
  const jioConfig = () => {
    const isInternalNaviagtion =
      sessionStorage.getItem("isInternalNaviagtion") || false;
    JioAds?.setConfiguration({
      logLevel: "debug",
      initialUnMute: isInternalNaviagtion,
    });
    initJioAds();
  };

  // check jio ads are available from response
  const checkJioAds = () => {
    let adSpots = [];
    let cuepoints = [];
    if (!allowedJioAdsState) {
      return { adSpots, cuepoints };
    }
    const { adUrlResponse: adInfo } = PageData;

    if (!adInfo || !adInfo?.adUrlTypes || adInfo?.adUrlTypes?.length === 0) {
      setAllowJioAds(false);
      return [];
    }

    adInfo.adUrlTypes.forEach((urlType) => {
      if (urlType.attributes?.adTag === "jio" && urlType.urlType === "preUrl") {
        setAllowJioAds(true);
        adSpots[0] = urlType.url;
      } else if (
        urlType.attributes?.adTag === "jio" &&
        urlType.urlType === "midUrl"
      ) {
        setAllowJioAds(true);
        adSpots[1] = urlType.url;
        cuepoints = manageCuePoints(urlType.position);
      }
    });

    setAdSpots(adSpots);
    return { adSpots, cuepoints };
  };

  // adding cuepoints in between video player
  const manageCuePoints = (pos) => {
    const sectionInfo = PageData;
    const cuePoints = [];

    if (!sectionInfo?.streamStatus?.totalDurationInMillis) {
      return cuePoints;
    }

    const totalDuration = Math.round(
      Math.abs(sectionInfo.streamStatus.totalDurationInMillis / 1000)
    );
    let offset = pos.offset ? parseInt(pos.offset) : 0;

    if (pos.interval) {
      while (totalDuration >= offset) {
        cuePoints.push({
          begin: offset,
          cueType: "custom",
          text: "",
        });
        offset += parseInt(pos.interval);
      }
    }
    setCuePoints(cuePoints);
    return cuePoints;
  };

  // pre roll ads intialization
  const managePreRole = (cuepoints) => {
    const sectionInfo = PageData;
    window.jwplayer().pause();
    // window.jwplayer().setControls(false);
    $(".jw-wrapper").hide();
    setSelectedAdspot("pre");
    setAllowJioAds(true);
    let isTrailer =
      sectionInfo.info.attributes &&
      sectionInfo.info.attributes.playerType == "trailer"
        ? true
        : false;
    if (
      sectionInfo.streamStatus.seekPositionInMillis > 0 &&
      !isTrailer &&
      cuepoints.length > 1
    ) {
      cuepoints.forEach((element) => {
        if (
          element.begin <
            sectionInfo.streamStatus.seekPositionInMillis / 1000 &&
          !element.istrigger
        ) {
          element.istrigger = true;
          if (allowedJioAdsState) {
            playMidRoleAds();
          }
        } else if (
          element.begin <
          sectionInfo.streamStatus.seekPositionInMillis / 1000
        ) {
          element.istrigger = true;
        }
      });
    }
  };

  // adding cuepoints to jwplayer
  const addCuePoints = (cuePoints) => {
    cuePoints.length > 0 &&
      window.jwplayer() &&
      window?.jwplayer()?.addCues(cuePoints);
  };

  // midrole ads
  const manageMidRole = (cuePoints) => {
    cuePoints?.forEach((element) => {
      if (
        element.begin < window?.jwplayer().getPosition() &&
        !element.istrigger
      ) {
        element.istrigger = true;
        if (allowedJioAdsState) {
          playMidRoleAds();
        }
      } else if (element.begin < window.jwplayer().getPosition()) {
        element.istrigger = true;
      }
    });
  };

  // resuming video
  const resumeVideoPlay = () => {
    setSelectedAdspot("");
    setAllowJioAds(false);
    $(".jw-wrapper").show();
    window.jwplayer(playerRef.current).play();
    // window.jwplayer(playerRef.current).setControls(true);

    // below is work around for very inital time player is getting paused after ad is played
    setTimeout(() => {
      window.jwplayer(playerRef.current).play();
    }, 1000);
  };

  // playing midrole ads
  const playMidRoleAds = () => {
    setAllowJioAds(true);
    window.jwplayer(playerRef.current).pause();
    // window.jwplayer(playerRef.current).setControls(false);
    $(".jw-wrapper").hide();
    setSelectedAdspot("mid");
  };

  // jio ads event listners
  const initJioAds = () => {
    JioAds.onAdRender = function (placementId) {
      window.jwplayer() && window.jwplayer(playerRef.current).pause();
    };
    JioAds.onMediaURLReady = function () {};
    JioAds.onAdPrepared = function (placementId, options) {};
    JioAds.onAdMediaStart = function (placementId, options) {};
    JioAds.onAdChange = function (placementId, options) {};
    JioAds.onAdMediaEnd = function (placementId, reward, options) {
      resumeVideoPlay();
    };
    JioAds.onAdSkipped = function (placementId, reward, options) {
      resumeVideoPlay();
    };
    JioAds.onAdClosed = function () {
      resumeVideoPlay();
    };
    JioAds.onAdFailedToLoad = function (placementId, options) {
      resumeVideoPlay();
    };
    JioAds.onMediaURLFailedToLoad = function (streamURL, options) {
      resumeVideoPlay();
    };
  };
  const distroyJioVideo = () => {
    const stopImmediatePropagation = (e) => {
      e.stopImmediatePropagation();
    };
    window.stopImmediatePropagation = stopImmediatePropagation;
    window.addEventListener("visibilitychange", stopImmediatePropagation, true);
    try {
      JioAds.closeAd("ins-unique-1");
      JioAds.closeAd("ins-unique-2");
    } catch (e) {
      console.log(e);
    }
  };
  const resetAdSpot = () => {
    let cuePoints = cuePointsState;
    cuePoints.forEach((element) => {
      element.istrigger = false;
    });
    setCuePoints(cuePoints);
  };

  const setCaptions = () => {
    if (
      appConfig.settings?.ccToggleType &&
      appConfig.settings?.ccToggleType !== "none"
    ) {
      let tracks = window.jwplayer().getCaptionsList();
      const desiredSubtitleIndex = tracks.findIndex(
        (caption) => caption.language?.toLowerCase() === "en"
      );
      // setting default as english
      if (desiredSubtitleIndex !== -1) {
        window.jwplayer().setCurrentCaptions(desiredSubtitleIndex);
      } else {
        window.jwplayer().setCurrentCaptions(1);
      }
    }
  };

  const containerClass = showPGRating ? "show" : "";

  const subscritionTypeButtonHandler = (subtype) => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    if (subtype.toLowerCase() == "subscribe") {
      router.push(`plans/subscribe?_subscribe=${router.asPath.slice(1)}`);
    } else if (subtype.toLowerCase() == "rent") {
      router.push(`plans/subscribe?_rent=${router.asPath.slice(1)}`);
    }
  };

  return (
    <>
      {isPaymentPending && <PageLoader />}
      {displayBackError && (
        <button
          className={`${displayBackError ? `${styles.errBack}` : ""}`}
          onClick={() => router.back()}
        >
          <img src={`${ImageConfig?.jwPlayer?.helpBackArrow}`} alt="back" />
        </button>
      )}
      {!showBackgroundImage && (
        <div className={`${styles.player}`}>
          <div ref={playerRef} id="player_div">
            {" "}
          </div>
          <div
            className={`plyr_fullscreen ${styles.player_buttons}`}
            id="playerButtons"
          >
            {displayBack && !displayBackError && (
              <button
                className={`${styles.playerBack} playerBack ${displayBackError ? `${styles.errBack}` : ""}`}
                onClick={() => router.back()}
              >
                <img
                  src={`${ImageConfig?.jwPlayer?.helpBackArrow}`}
                  alt="back"
                />
              </button>
            )}

            {displayStartOver && !adPlaying && (
              <button
                className={`${styles.start_over}`}
                onClick={() => startOver()}
              >
                {Jwplayerconstant[localLang].Start_Over}
              </button>
            )}
            {LastChannel && !adPlaying && (
              <button
                className={`${styles.start_over}`}
                onClick={() => goToLastChannel()}
              >
                {Jwplayerconstant[localLang].Last_Channel}
              </button>
            )}

            {displayLive && !adPlaying && (
              <button
                className={`${styles.start_over}`}
                onClick={() => golive()}
              >
                {streamDataRef.current?.pageAttributes?.categoryType ==
                "simulcast"
                  ? Jwplayerconstant[localLang].go_to_latest
                  : Jwplayerconstant[localLang].Go_Live}
              </button>
            )}

            {displaySkipIntro && !adPlaying && (
              <button
                className={`${styles.start_over}`}
                onClick={() => skipIntro()}
              >
                {Jwplayerconstant[localLang].Skip_intro}
              </button>
            )}

            {displayNextEpisode &&
              displayNextEpisode?.displayStatus &&
              !isPreviewAvalibale &&
              !adPlaying && (
                <button
                  className={`${styles.next_episode} ${displayUpNextTooltip ? styles.upNextActive : ""}`}
                  onClick={() => nextEpisode()}
                >
                  {Jwplayerconstant[localLang].Next_Episode}
                </button>
              )}

            {/* Up next tooltip */}
            <div id="nextVideoTooltip">
              {displayUpNextTooltip && (
                <Link
                  prefetch={false}
                  href={
                    nextVideoResponse?.data?.response?.data[0]?.target?.path ||
                    "/"
                  }
                >
                  <div
                    className={`${styles.nextVideoContainer} nextVideoContainer`}
                  >
                    <div className={styles.nxtLeft}>
                      <img
                        alt="video"
                        src={getImagePath(
                          nextVideoResponse?.data?.response?.data[0]?.display
                            ?.imageUrl
                        )}
                      />
                      <div className={styles.playButton}>
                        <span className={styles.playButtonText}>
                          <div className={styles.loading}>
                            <div className={styles.innerShadow}>
                              <PlayArrowRoundedIcon
                                fontSize="large"
                                sx={{ color: common.white }}
                              />
                            </div>
                          </div>
                        </span>
                      </div>
                    </div>
                    <div className={styles.nxtRight}>
                      <span>
                        {Jwplayerconstant[localLang]?.Up_Next_In ||
                          "Up next in"}{" "}
                        {remainingSeconds}{" "}
                        {Jwplayerconstant[localLang]?.Sec || "sec"}
                      </span>
                      <h4>
                        {
                          nextVideoResponse?.data?.response?.data[0]?.display
                            ?.title
                        }
                      </h4>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {!!showPGRating &&
            pgRating &&
            (!!pgRating.pgRatingTitle || !!pgRating.pgRatingSubtitle) && (
              <div id="inside_player_data">
                <div className={` Rating  ${containerClass}`}>
                  <div className="rectanglePG"></div>
                  <div className="pgRatingTitle">{pgRating.pgRatingTitle}</div>
                  <div className="pgRatingSub">{pgRating.pgRatingSubtitle}</div>
                </div>
              </div>
            )}

          {isPreviewPlaying &&
            createPortal(
              <div id="preview_data" className={`${styles.preview_timer}`}>
                {`Preview ends in : ${secondsToMinutesAndSeconds(timeLeft)}`}
              </div>,
              document.getElementById("player_div")
            )}
          {streamDataRef?.current?.streamStatus?.previewStreamStatus &&
            timeLeft <= 0 &&
            !isPreviewPlaying(
              <div className={`${styles.errorSec}`}>
                <div>{streamDataRef.current?.streamStatus?.message}</div>
                <div>
                  {!!(errorButtons.length > 0) &&
                    errorButtons
                      .filter((button) => button.elementSubtype !== "preview")
                      .map((button) => (
                        <ButtonWrapper
                          key={button.id}
                          button={button}
                          btnHandler={btnHandler}
                        ></ButtonWrapper>
                      ))}
                </div>
              </div>
            )}

          {!showBackgroundImage && !!sessionClosed && sessionClosed?.status && (
            <div className={`${styles.sessionClosed}`}>
              <div className={`${styles.sessionClosedText}`}>
                <div className={`${styles.sessionClosed_inner}`}>
                  <div>
                    <h5> {sessionClosed.title} </h5>
                    <p>{sessionClosed.description}</p>
                  </div>
                  {sessionClosed?.code == "-4001" ? (
                    <div
                      className={`${styles.sessionClosed_btn}`}
                      onClick={() => router.push("/active/screens")}
                    >
                      <button>
                        {Jwplayerconstant[localLang].View_Active_Screens ||
                          "View Active Screens"}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`${styles.sessionClosed_btn}`}
                      onClick={() => closePlayer()}
                    >
                      <button>
                        {Jwplayerconstant[localLang].Close_player}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {pollKeyResponse?.data?.error?.code == -4001 &&
            !pollKeyResponse?.data?.error?.details &&
            !pollKeyResponse?.data?.error?.description && (
              <div className={`${styles.maxLimitpopup}`}>
                <div className={`${styles.main_model}`}>
                  <div className={`${styles.modal_wrapper}`}>
                    <div className={styles.modal_content}>
                      <h5 className={`${styles.modal_title}`}>
                        Concurrent Viewing Exceeded. Please stop viewing on
                        another device to continue viewing on this device. Thank
                        you for your cooperation.
                      </h5>
                      <p className={`${styles.modal_desc}`}>
                        You have reached the limit on the number of screens
                        being used at the exact same time. If you want to watch
                        on this device, please stop using another device to
                        allow you to watch on more screens at the same time
                      </p>
                      <div className={`${styles.btn_wrap}`}>
                        <button
                          className={` ${styles.secondary}`}
                          onClick={() => router.push("/active/screens")}
                        >
                          {Jwplayerconstant[localLang].View_Active_Screens ||
                            "View Active Screens"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
      <div id="player-wrap-jio">
        {allowedJioAdsState && adSpotsState.length > 0 && (
          <>
            <div
              class={styles.adsStreamContainer}
              id="my-instream-video-container"
              style={{ zIndex: allowedJioAdsState ? "" : "-1" }}
            ></div>

            {allowedJioAdsState && selectedAdspot == "pre" && (
              <ins
                id="ins-unique-1"
                data-adspot-key={adSpotsState[0]}
                data-source="www.reeldrama.com"
                data-container-id="my-instream-video-container"
              ></ins>
            )}
            {allowedJioAdsState && selectedAdspot == "mid" && (
              <ins
                id="ins-unique-2"
                data-adspot-key={adSpotsState[1]}
                data-source="www.reeldrama.com"
                data-container-id="my-instream-video-container"
              ></ins>
            )}
          </>
        )}
      </div>

      {showBackgroundImage && (
        <div className={`${styles.errorSec}`} ref={errorRef}>
          <button
            className={`${styles.playerBack}`}
            onClick={() => router.back()}
          >
            <img src={`${ImageConfig?.jwPlayer?.helpBackArrow}`} alt="back" />
          </button>
          {/* <div> {streamErrorOne} </div> */}
          <div className={`${styles.streamError}`}> {streamError} </div>
          <div>
            {!!(errorButtons.length > 0) &&
              errorButtons
                .filter((button) => button.elementSubtype !== "preview")
                .map((button) => (
                  <ButtonWrapper
                    key={button.id}
                    button={button}
                    btnHandler={btnHandler}
                  ></ButtonWrapper>
                ))}
            {!!PageData?.info?.attributes?.subscriptionType && isloggedin && (
              <button
                className={styles.subscritionTypeButton}
                onClick={() => {
                  subscritionTypeButtonHandler(
                    PageData?.info?.attributes?.subscriptionType
                  );
                }}
              >
                {PageData?.info?.attributes?.subscriptionType}
              </button>
            )}
          </div>
        </div>
      )}
      <>
        {forwardIcon && (
          <div
            className={`${styles.forwardIcon}`}
            onClick={() => forwardClick()}
            id="frwdIcon"
          >
            <span
              className={
                isPreviewPlaying || adPlaying
                  ? `${styles.frd_icon_hide}`
                  : `${styles.frd_icon}`
              }
            >
              <img
                src={`${ImageConfig?.jwPlayer?.forwardIcon}`}
                alt="forward-Icon"
              />
              <span className={`${styles.tooltip} tooltip`}>
                Forward 10 Seconds
              </span>
            </span>
          </div>
        )}
      </>

      {popupData?.isActive && <PopupModal popupData={popupData}></PopupModal>}
      {isRazorpay.enabled && (
        <Razorpay
          razorpayData={isRazorpay.data}
          activePackage={activePackage}
          paymentCancelled={paymentCancelled}
        />
      )}
      {isParentalPopup?.isActive && (
        <PinProfile
          isParentalPopup
          popupdata={isParentalPopup}
          validatePincodeCallBack={getStream}
        ></PinProfile>
      )}
      {!!otpData && (
        <VerifyOtpPopup
          isOpen={true}
          otpData={otpData}
          returnBack={() => setOtpData()}
        />
      )}
    </>
  );
};

export default JWPlayer;
