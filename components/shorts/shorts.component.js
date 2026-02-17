import React, { useEffect, useState, useRef } from "react";
import styles from "@/components/shorts/shorts.module.scss";
import VideoCard from "@/components/shorts/VideoCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { actions, useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import { Manipulation, Mousewheel, Keyboard } from "swiper/modules";
import useGetApiMutate from "@/hooks/useGetApidata";
import {
  getCurrentTime,
  getPagePath,
  getQueryParams,
  jsonToQueryParams,
} from "@/services/utility.service";
import { useRouter } from "next/router";
import PageNotFound from "../page-not-found/page-not-found.component";
import useDebounce from "@/hooks/useDebounce";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import {
  Shortconstant,
  TvshowDetailsconstant,
  CardConstant,
  PopUpDataConst,
} from "@/.i18n/locale";
import { Image } from "@mui/icons-material";
import { sendEvent } from "@/services/analytics.service";
import { systemConfigs } from "@/services/user.service";
const SharePopup = dynamic(() => import("../popups/share/share-popup"));
const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const OverlayPopupModal = dynamic(
  () => import("@/components/popups/overlay-popup/overlay-popup-modal")
);

const Shorts = () => {
  const {
    state: { SystemConfig, localLang, userDetails, navigateFrom },
    dispatch,
  } = useStore();
  const swiperRef = useRef(null);
  const [playingData, setPlayingData] = useState([]);
  const pageCount = useRef(10);
  const {
    mutate: mutateShorts,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const hitApiShorts = useRef(true);
  const [shortsVideoList, setShortsVideoList] = useState([]);
  const [shortlistData, setShortlistData] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [popupData, setPopUpData] = useState({});
  const [PageNotFnd, setPageNotFnd] = useState(false);
  const [swiperChange, setSwiperChange] = useState(0);
  const [stopPlay, setStopPlay] = useState(false);
  const [pagePath, setPagePath] = useState({});
  const [nextApiHit, setNextApiHit] = useState("");
  const router = useRouter();
  const hasMoreData = useRef(false);
  const { mutate: addFavourites, data: favouritedData } = useGetApiMutate();
  const { mutate: addToWatchLater, data: watchListData } = useGetApiMutate();
  const [likeCountChange, setLikeCountChange] = useState(true);

  const distvIcons = appConfig?.shortPage?.dishtvApiHits == 1;

  const [moreBTNs_mobile, setMoreBTNs_mobile] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const swiperSlideRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const headerElement = document.getElementById("headerHomePage");
    const footerElement = document.getElementById("app_footer_id");
    if (!!SystemConfig) {
      let pPath = router.asPath;
      setPagePath({
        path: getPagePath(pPath),
        query: getQueryParams(pPath),
      });

      hitApicall();
      if (footerElement) {
        footerElement.style.display = "none";
      }
      let windowWidth = window.innerWidth;
      if (windowWidth <= 991) {
        if (headerElement) {
          headerElement.style.display = "none";
        }
      }
    }

    return () => {
      document.body.style.overflow = "auto";
      if (headerElement) {
        headerElement.style.display = "inline";
      }
      if (footerElement) {
        footerElement.style.display = "block";
      }
    };
  }, [SystemConfig]);

  const hitApicall = async () => {
    if (distvIcons) {
      setNextApiHit("fristload");
    }
    getShortsData();
  };

  useEffect(() => {
    if (!!apiResponse?.data) {
      if (!!apiResponse?.data?.status) {
        hitApiShorts.current = true;
        setShortsVideoList(apiResponse?.data?.response);
        dispatch({ type: actions.PageData, payload: null });
        let newData =
          apiResponse?.data?.response.data[0]?.section?.sectionData?.data;

        if (distvIcons) {
          newData = apiResponse?.data?.response.data;
          hasMoreData.current = apiResponse?.data?.response.hasMoreData;
        }
        if (shortlistData?.length > 0) {
          setShortlistData([...shortlistData, ...newData]);
        } else {
          setShortlistData(newData);
          newData?.length === 0 && setPageNotFnd(true);
        }
        if (nextApiHit == "fristload") {
          setNextApiHit("");

          let payload = {
            path: pagePath.path,
            count: pageCount.current,
          };
          if (pagePath?.query && pagePath.query?.source_path) {
            payload.source_path = pagePath.query.source_path;
          }
          let url =
            process.env.initJson["api"] +
            "/service/api/v1/next/videos?" +
            jsonToQueryParams(payload);
          mutateShorts(url);
        }
      } else {
        hitApiShorts.current = false;
        setPageNotFnd(true);
        if (
          apiResponse?.data?.error &&
          apiResponse?.data?.error?.code === 401
        ) {
          unAuthorisedHandler();
        }
      }
    } else {
    }
  }, [apiResponse]);

  const shareDataSet = () => {
    let sharepath = playingData?.target?.path;
    if (pagePath?.query && pagePath.query?.source_path) {
      sharepath = sharepath + "?source_path=" + pagePath.query?.source_path;
    }
    let pop = {
      type: "share",
      isActive: true,
      targetpath: sharepath,
      img: appConfig.appLogo,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const handleClose = () => {
    setPopUpData({});
  };

  const getShortsData = async (srcoll = "") => {
    let payload = {
      path: "shorts",
      count: pageCount.current,
    };
    let url =
      process.env.initJson["api"] +
      "/service/api/v1/page/content?" +
      jsonToQueryParams(payload);

    if (distvIcons) {
      let pPath = router.asPath;
      let pathData = {
        path: getPagePath(pPath),
        query: getQueryParams(pPath),
      };
      let urlPoint = "/service/api/v1/get/cards?";

      payload = {
        path: pathData.path,
      };

      if (srcoll == "srcoll") {
        let targetPath = shortlistData[shortlistData.length - 1];
        targetPath = targetPath.target.path;
        payload = {
          path: targetPath,
          count: pageCount.current,
        };
        urlPoint = "/service/api/v1/next/videos?";
        if (pagePath?.query && pagePath.query?.source_path) {
          payload.source_path = pagePath.query.source_path;
        }
      }
      url = process.env.initJson["api"] + urlPoint + jsonToQueryParams(payload);
    }

    mutateShorts(url, {
      onSuccess: (res) => {
        if (res.data.response.data.length == 1) {
          console.log(res.data.response.data);
          let dup1 = Number(
            res.data.response.data[0].metadata?.contentLikesCount?.value
          );
          setLikesCount(dup1);
          // setFirstClick(false);
        }
      },
    });
  };

  const scrollTonext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const scrollToprev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const checkarrayLng = (video) => {
    if (
      (shortlistData.length - 2 === Number(video?.id) ||
        shortlistData.length - 1 === Number(video?.id)) &&
      hitApiShorts.current
    ) {
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const slideChange = (swiper) => {
    setMoreBTNs_mobile(false);
    if (!!swiperRef?.current) {
      swiperRef.current.style.height = `${window.innerHeight}px`;
    }
    if (!!swiperSlideRef?.current) {
      swiperSlideRef.current.style.height = `${window.innerHeight}px`;
    }
    // console.log(">>>>playingData",playingData,swiper)
    if (!!playingData?.plugin?.current) {
      playingData?.plugin.current?.handlePlayEndedByUser();
    }
    setSwiperChange(swiper.activeIndex);

    let ashasMoreData =
      shortsVideoList.data[0]?.section?.sectionData?.hasMoreData;

    if (appConfig?.shortPage?.dishtvApiHits == 1) {
      ashasMoreData = hasMoreData;
    } else {
      pageCount.current = pageCount.current + 10;
    }

    if (
      swiper.activeIndex === shortlistData.length - 2 &&
      ashasMoreData &&
      hitApiShorts.current
    ) {
      let targetPath = shortlistData[shortlistData.length - 1];
      targetPath = targetPath.target.path;

      getShortsData("srcoll");

      hitApiShorts.current = false;
    }
  };

  useEffect(() => {
    if (shortlistData.length > 0) {
      setPlayingData(shortlistData[swiperChange]);
      setLikesCount(
        Number(shortlistData[swiperChange].metadata.contentLikesCount.value)
      );
    }
  }, [swiperChange]);

  const setTranslate = useDebounce(() => {
    setStopPlay(false);
  }, 300);

  const favRemove = (e) => {
    if (!!userDetails) {
      // let playingDataDup = playingData;
      // let pathof = playingDataDup.favouriteTargetPath.value;
      // let action =
      //   playingDataDup.metadata.isContentLiked.value != "true" ? 1 : 2;
      // playingDataDup.metadata.isContentLiked.value =
      //   playingDataDup.metadata.isContentLiked.value == "true"
      //     ? "false"
      //     : "true";
      // setPlayingData(playingDataDup);
      let currentPlayingShortData;
      if (shortlistData.length > 0) {
        currentPlayingShortData = shortlistData[swiperChange];
      } else {
        currentPlayingShortData = playingData;
      }
      let pathof = currentPlayingShortData?.favouriteTargetPath?.value;
      let action =
        currentPlayingShortData.metadata.isContentLiked.value != "true" ? 1 : 2;

      let likesCountDup = Number(
        currentPlayingShortData.metadata.contentLikesCount.value
      );
      if (!!firstClick) {
        setFirstClick(false);
        setLikesCount(likesCountDup);
      }
      if (currentPlayingShortData?.metadata?.isContentLiked?.value == "true") {
        setLikesCount((prevState) => {
          if (prevState - 1 >= 0) {
            return prevState - 1;
          } else {
            return prevState;
          }
        });
      } else {
        setLikesCount((prevState) => prevState + 1);
      }

      currentPlayingShortData.metadata.isContentLiked.value =
        currentPlayingShortData.metadata.isContentLiked.value == "true"
          ? "false"
          : "true";

      setPlayingData(currentPlayingShortData);
      // console.log(currentPlayingShortData);
      sendEvent(
        currentPlayingShortData.metadata.isContentLiked.value == "true"
          ? "like"
          : "unlike",
        analyticsData("like", currentPlayingShortData)
      );

      const apiUrl =
        process.env.initJson["api"] +
        `/service/api/auth/user/like?path=${pathof}&action=${action}`;

      addFavourites(apiUrl, {
        onSuccess: (response) => {
          const newData = {
            message: response?.data?.response?.message,
            code: "freedom_tv",
          };
          if (window.innerWidth <= 991) {
            newData.imgStatus = ImageConfig?.payments?.subscriptionSuccessful;
          }
          dispatch({
            type: actions.NotificationBar,
            payload: newData,
          });
        },
      });
    } else {
      popupDataSet();
    }
  };

  const analyticsData = (event, data) => {
    let obj = {};
    if (event == "like") {
      obj["time"] = getCurrentTime();
      obj["device_type"] = "web";
      if (!!data?.target?.pageAttributes?.seasonSeqNo) {
        obj["season_number"] = data?.target?.pageAttributes?.seasonSeqNo;
      }
      if (!!data?.target?.pageAttributes?.episodeSeqNo) {
        obj["episode_number"] = data?.target?.pageAttributes?.episodeSeqNo;
      }
    }

    if (event == "watchlist") {
      // add watchlist events here (added if any)...
    }
    obj.cpCode = "freedom";
    obj["rail_name"] = "-1";
    obj["header_button"] = data?.target?.path || "-1";
    obj["genre"] = data?.target?.pageAttributes?.genre || "-1";
    obj["asset_title"] = "-1";
    obj["media_type"] = data?.target?.pageAttributes?.mediaContentType || "-1";
    obj["channel_partner"] = data?.target?.pageAttributes?.networkCode || "-1";
    obj["channel_id"] = data?.target?.pageAttributes?.channelId || "-1";
    obj["content_id"] = data?.target?.pageAttributes?.id || "-1";

    if (!!data?.target?.pageAttributes?.tvShowName) {
      obj["series_name"] = data?.target?.pageAttributes?.tvShowName;
    }
    return obj;
  };

  const reportAnalyticsData = (reportVideo) => {
    const data = playingData;
    const tempObj = {
      rail_name: "-1",
      banner_title: "-1",
      header_button: data?.target?.path || "-1",
      asset_title: "-1",
      media_type: data?.target?.pageAttributes?.mediaContentType || "-1",
      genre: data?.target?.pageAttributes?.genre || "-1",
      channel_partner: data?.target?.pageAttributes?.networkCode || "-1",
      channel_id: data?.target?.pageAttributes?.channelId || "-1",
      report_video: reportVideo || "-1",
      paid_content: "-1",
    };
    if (!!data?.target?.pageAttributes?.seasonSeqNo) {
      tempObj["season_number"] = data?.target?.pageAttributes?.seasonSeqNo;
    }
    if (!!data?.target?.pageAttributes?.episodeSeqNo) {
      tempObj["episode_number"] = data?.target?.pageAttributes?.episodeSeqNo;
    }
    if (!!data?.target?.pageAttributes?.tvShowName) {
      tempObj["series_name"] = data?.target?.pageAttributes?.tvShowName;
    }
    return tempObj;
  };

  const popupDataSet = () => {
    let pop = {
      type: "signin",
      isActive: true,
      title1:
        CardConstant[localLang]?.Signin_To_Use ||
        "Please sign in to use this and more such features",
      yesButton1: CardConstant[localLang]?.Sign_In || "Sign In",
      yesButtonType: CardConstant[localLang]?.Primary || "primary",
      yesButtonTarget1: navigateToSignIn,
      noButton1: CardConstant[localLang]?.Cancel || "Cancel",
      noButtontarget1: onPopupCancel,
      noButtonType: CardConstant[localLang]?.Secondary || "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const onPopupCancel = () => {
    handleClose();
  };

  const navigateToSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signin");
  };
  const callBckEmit = (event) => {
    if (event.label == "mute") {
      toggleMute();
    } else if (event.label == "isPlay") {
      // this.isPlay = event.isMute;
    } else if (event.label == "stopStart") {
    } else if (event.label == "navtoback") {
      if (navigateFrom) {
        dispatch({ type: actions.navigateFrom, payload: null });
        router.push(navigateFrom);
      } else {
        router.push("/partner/fliqs?cpcontent=all");
      }
    } else if (event.label == "toast") {
    }
  };

  const vodChannelBtnFn = (e, data) => {
    e.preventDefault();
    closeMoreBtn();
    if (!!userDetails) {
      if (data == "Report") {
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
          shortsPath: playingData?.target?.path,
          closeTarget: handleClose,
          parentclassName: "reportPopUp",
        };
        // console.log(playingData);
        if (playingData?.target?.pageAttributes?.networkCode == "freedomtv") {
          pop.analyticsFn = reportAnalyticsData;
          // console.log("hello");
        }
        setPopUpData(pop);
      }
    } else {
      popupDataSet();
    }
  };
  const onsubmitreport = (data) => {
    // console.log(data, "<<<<<<data onsubmitreport");
    closeMoreBtn();
  };
  const openMoreBtn = () => {
    setMoreBTNs_mobile(true);
  };
  const closeMoreBtn = (e = "") => {
    try {
      e.stopPropagation();
    } catch (error) {}
    setMoreBTNs_mobile(false);
  };

  const addToFavourite = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!!userDetails) {
      // const action = addedToWatchLater ? 2 : 1;
      // const pathOf = playingData?.favouriteTargetPath?.value;
      // const apiUrl =
      //   process.env.initJson.api +
      //   `/service/api/auth/user/favourite/item?path=${pathOf}&action=${action}`;
      // addToWatchLater(apiUrl, {
      //   onSuccess: (response) => {
      //     dispatch({
      //       type: actions.NotificationBar,
      //       payload: { message: response?.data?.response?.message },
      //     });
      //   },
      // });
      // setAddedToWatchLater(!addedToWatchLater);

      let currentPlayingShortData;
      if (shortlistData.length > 0) {
        currentPlayingShortData = shortlistData[swiperChange];
      } else {
        currentPlayingShortData = playingData;
      }
      let pathof = currentPlayingShortData?.favouriteTargetPath?.value;
      let action =
        currentPlayingShortData?.isFavourite?.value != "true" ? 1 : 2;
      currentPlayingShortData.isFavourite.value =
        currentPlayingShortData.isFavourite.value == "true" ? "false" : "true";

      setPlayingData(currentPlayingShortData);
      // console.log(currentPlayingShortData);
      if (action == 1) {
        sendEvent(
          "watchlist",
          analyticsData("watchlist", currentPlayingShortData)
        );
      } else {
        sendEvent(
          "remove_watchlist",
          analyticsData("watchlist", currentPlayingShortData)
        );
      }

      const apiUrl =
        process.env.initJson["api"] +
        `/service/api/auth/user/favourite/item?path=${pathof}&action=${action}`;
      addToWatchLater(apiUrl, {
        onSuccess: (response) => {
          dispatch({
            type: actions.NotificationBar,
            payload: {
              message: response?.data?.response?.message,
              code: "freedom_tv",
            },
          });
        },
      });
    } else {
      popupDataSet();
    }
  };
  return (
    <>
      {shortlistData?.length > 0 ? (
        <>
          <div className={`${styles.shortsContainer}`}>
            <div className={`${styles.shortsLayOut}`}>
              <Swiper
                ref={swiperRef}
                cssMode={true}
                speed={2000}
                navigation={{
                  prevEl: ".swiper-button-prev",
                  nextEl: ".swiper-button-next",
                }}
                onSlideChange={slideChange}
                onInit={(swiper) => {
                  if (!!swiperRef?.current) {
                    swiperRef.current.style.height = `${window.innerHeight}px`;
                  }
                  if (!!swiperSlideRef?.current) {
                    swiperSlideRef.current.style.height = `${window.innerHeight}px`;
                  }
                  setSwiperChange(swiper?.activeIndex);
                }}
                onSetTranslate={() => {
                  if (!stopPlay) setStopPlay(true);
                  setTranslate();
                }}
                centeredSlides={true}
                centeredSlidesBounds={true}
                slidesPerView={1}
                spaceBetween={0}
                pagination={false}
                mousewheel={true}
                keyboard={true}
                direction={"vertical"}
                modules={[Manipulation, Mousewheel, Keyboard]}
                className={`${styles.videoSwiperCont} videoSwiperCont `}
              >
                {shortlistData?.map((video, id) => {
                  return (
                    <div
                      className={`video_container`}
                      id={`video-${id}`}
                      key={"video_" + id}
                    >
                      <SwiperSlide
                        key={id}
                        className="swiper-class"
                        ref={swiperSlideRef}
                      >
                        <VideoCard
                          className={`${styles.shortsVideo} video-${id} video-container`}
                          index={id}
                          videoObj={video}
                          scrollTonext={scrollTonext}
                          scrollToprev={scrollToprev}
                          callBckEmit={callBckEmit}
                          swiperChange={swiperChange}
                          isMuted={isMuted}
                          stopPlay={stopPlay}
                          playingData={(videoObj) => {
                            checkarrayLng(videoObj);
                            setPlayingData(videoObj);
                          }}
                        />
                      </SwiperSlide>
                    </div>
                  );
                })}
              </Swiper>
              <div
                className={`${styles.shortsNavTools}  ${distvIcons ? styles.dishTvVideo : ""}`}
                key={"video_Controls"}
              >
                {appConfig?.shortPage?.shortsControls == 1 ? (
                  <div className={`${styles.shortsControls}`}>
                    <button
                      key="prev"
                      className={`${
                        styles.next
                      } swiper-button-perv ${swiperChange} ${
                        swiperChange == 0 && styles.applyOpc
                      }`}
                      onClick={scrollToprev}
                    ></button>
                    <button
                      key="next"
                      className={`${styles.prev} swiper-button-next   ${
                        swiperChange == shortlistData.length - 1 &&
                        styles.applyOpc
                      }`}
                      onClick={scrollTonext}
                    ></button>
                  </div>
                ) : (
                  <div></div>
                )}
                <div
                  className={`${styles.shareControls} ${distvIcons ? styles.dishControls : ""}`}
                >
                  {!distvIcons && (
                    <div className={`${styles.video_Topcontent}`}>
                      <button
                        className={`${styles.volume}`}
                        key="muted"
                        onClick={toggleMute}
                      >
                        <img
                          key={isMuted ? "Muted" : "Unmuted"}
                          src={`${
                            ImageConfig?.shorts[
                              isMuted
                                ? distvIcons
                                  ? "dishtv_mute"
                                  : "mute"
                                : distvIcons
                                  ? "dishtv_unmute"
                                  : "unmute"
                            ]
                          }`}
                          alt=""
                        />
                      </button>
                    </div>
                  )}
                  {appConfig?.shortPage?.share == 1 && (
                    <button
                      key="likeBtn"
                      className={`${styles.share_btn}`}
                      onClick={favRemove}
                    >
                      <img
                        className={`${styles.video_share}`}
                        src={`${playingData?.metadata?.isContentLiked?.value != "true" ? ImageConfig?.shorts?.web_short_like : ImageConfig?.shorts?.shortLikeFill}`}
                        alt=""
                      />

                      <img
                        className={`${styles.video_share} ${styles.mobileView}`}
                        src={`${playingData?.metadata?.isContentLiked?.value != "true" ? ImageConfig?.shorts?.short_like_mob : ImageConfig?.playerDescription?.likeFillWhite}`}
                        alt=""
                      />
                      <span className={`${styles.next1}`}>
                        {/* {playingData?.metadata?.contentLikesCount?.value} */}
                        {likesCount}
                      </span>
                    </button>
                  )}
                  {appConfig?.shortPage?.share == 1 && (
                    <button
                      key="share_btn"
                      className={`${styles.share_btn}`}
                      onClick={shareDataSet}
                    >
                      <img
                        className={`${styles.video_share}`}
                        src={`${distvIcons ? ImageConfig?.shorts?.dishTv_share : ImageConfig?.shorts?.dishTv_share}`}
                        alt=""
                      />
                      <img
                        className={`${styles.video_share} ${styles.mobileView}`}
                        src={`${distvIcons ? ImageConfig?.shorts?.mob_dishTv_share : ImageConfig?.shorts?.mob_dishTv_share}`}
                        alt=""
                      />
                      {shortlistData[swiperChange]?.metadata?.shareCount
                        ?.value && (
                        <span className={`${styles.next1}`}>
                          {/* {Shortconstant[localLang].share} */}{" "}
                          {shortlistData[swiperChange]?.metadata?.shareCount
                            ?.value || 0}
                        </span>
                      )}
                    </button>
                  )}
                  {appConfig?.shortPage?.solarEye == 1 && systemConfigs.configs?.showViewsCountOption == "true" &&  (
                    <button key="solar-eye" className={`${styles.share_btn}`}>
                      <img
                        className={`${styles.video_share} ${styles.solarEye}`}
                        src={`${distvIcons ? ImageConfig?.shorts?.solarEyeShorts : ImageConfig?.shorts?.solarEyeShorts}`}
                        alt=""
                      />
                      <img
                        className={`${styles.video_share} ${styles.mobileView} ${styles.solarEye}`}
                        src={`${distvIcons ? ImageConfig?.shorts?.solarEyeShortsM : ImageConfig?.shorts?.solarEyeShortsM}`}
                        alt=""
                      />
                      <span className={`${styles.next1}`}>
                          {/* {Shortconstant[localLang].share} */}{" "}
                          {shortlistData[swiperChange]?.metadata?.views?.value}
                          <span className={styles.views}>
                            {shortlistData[swiperChange]?.metadata?.views
                              ?.value == 1
                              ? TvshowDetailsconstant[localLang]?.View_text
                              : TvshowDetailsconstant[localLang]?.Views_text}
                          </span>
                      </span>
                    </button>
                  )}

                  {appConfig?.shortPage?.shortsMore == 1 && (
                    <button
                      key="shortsMore"
                      className={`${styles.share_btn} ${styles.shorts_More}`}
                      onClick={openMoreBtn}
                    >
                      <img
                        className={`${styles.video_share}`}
                        src={`${ImageConfig?.shorts?.ThreeDotsShorts}`}
                      />

                      <img
                        className={`${styles.video_share} ${styles.mobileView}`}
                        src={`${ImageConfig?.card?.threeDots}`}
                      />
                      <span className={`${styles.next1}`}>
                        {CardConstant[localLang]?.More}
                      </span>
                      <div className={`${styles.moreBTNs}`}>
                        <button key={"watch-later"} onClick={addToFavourite}>
                          {" "}
                          <img
                            src={
                              playingData?.isFavourite?.value == "true"
                                ? ImageConfig?.playerDescription?.watchedTick
                                : ImageConfig?.playerDescription?.plusGray
                            }
                          />{" "}
                          <span>
                            {playingData?.isFavourite?.value == "true"
                              ? CardConstant[localLang]?.Added_to_watch
                              : CardConstant[localLang]?.Add_to_watch}
                          </span>{" "}
                        </button>

                        <button
                          key={"Report"}
                          onClick={(e) => vodChannelBtnFn(e, "Report")}
                        >
                          {" "}
                          <img
                            src={`${ImageConfig?.playerDescription?.report}`}
                          />{" "}
                          <span>{CardConstant[localLang]?.Report}</span>{" "}
                        </button>
                      </div>
                    </button>
                  )}
                </div>
              </div>
              {moreBTNs_mobile && (
                <div
                  className={`${styles.moreBTNs} ${styles.moreBTNs_mobile}`}
                  onClick={closeMoreBtn}
                >
                  <div className={styles.btn1}>
                    <button key={"Report_mobile"} onClick={addToFavourite}>
                      {" "}
                      <img
                        src={
                          playingData?.isFavourite?.value == "true"
                            ? ImageConfig?.playerDescription?.watchedTick
                            : ImageConfig?.playerDescription?.plusGray
                        }
                      />{" "}
                      <span>
                        {playingData?.isFavourite?.value == "true"
                          ? CardConstant[localLang]?.Added_to_watch
                          : CardConstant[localLang]?.Add_to_watch}
                      </span>{" "}
                    </button>

                    <button
                      key={"Report"}
                      onClick={(e) => vodChannelBtnFn(e, "Report")}
                    >
                      {" "}
                      <img
                        src={`${ImageConfig?.playerDescription?.report}`}
                      />{" "}
                      <span>{CardConstant[localLang]?.Report}</span>{" "}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {popupData.isActive &&
            popupData.type != "share" &&
            popupData.type != "ReportPopup" && (
              <PopupModal popupData={popupData}></PopupModal>
            )}
          {popupData.isActive && popupData.type == "ReportPopup" && (
            <OverlayPopupModal popupData={popupData} />
          )}
          {popupData.isActive && popupData.type === "share" && (
            <SharePopup popupData={popupData}></SharePopup>
          )}
        </>
      ) : (
        PageNotFnd && (
          <PageNotFound
            detailsInfo={{
              message: "Content you are looking for is not found",
              code: "5000",
            }}
          />
        )
      )}
    </>
  );
};

export default Shorts;
