import { useRef, useState, useEffect } from "react";
import styles from "@/components/shorts/shorts.module.scss";
import useIsInViewport from "@/hooks/useIsInViewport";
import { appConfig } from "@/config/app.config";
import _shaka from "shaka-player";
import { getAbsolutePath } from "@/services/user.service";
import { ImageConfig } from "@/config/ImageConfig";
import { actions, useStore } from "@/store/store";
import { getBoxId } from "@/services/data-manager.service";
import { useRouter } from "next/router";
import {
  getPagePath,
  getQueryParams,
  jsonToQueryParams,
} from "@/services/utility.service";
import { deleteItem, getItem, setItem } from "@/services/local-storage.service";

const VideoCard = ({
  videoObj,
  index,
  playingData,
  isMuted,
  stopPlay,
  callBckEmit,
}) => {
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
  const video = useRef();
  const playerRef = useRef();
  const isPlayRef = useRef({ current: true });
  const shakaeventManager = useRef();
  const isInViewport = useIsInViewport(video);
  const [isPlay, setIsPlay] = useState(true);
  const progressBarRef = useRef(null);
  const [parentIcon, setParentIcon] = useState(appConfig?.appLogo);
  const [widthExpression, setwidthExpression] = useState("0%");

  const distvIcons = appConfig?.shortPage?.dishtvApiHits == 1;

  const router = useRouter();
  const pCount = useRef({ current: 0 });
  const playerState = useRef({});

  const [locationInfo, setLocationInfo] = useState(getItem("LocationData"));
  const plugin = useRef(null);

  useEffect(() => {
    analyticscheck();
    shakaeventManager.current = new _shaka.util.EventManager();
    playerRef.current = new _shaka.Player(video.current);
    // shakaeventManager.current.listen(playerRef.current, "manifestparsed", () => {
    //   only for mpd and m3u8
    //   update start time here....
    // })

    // shakaeventManager.current.listen(playerRef.current, "error", (err) => {
    //   console.log(err)
    // })
    return () => {
      if (shakaeventManager.current) {
        shakaeventManager.current.removeAll();
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const analyticscheck = async () => {
    await setTimeout(() => {
      initAnalytics();
    }, 0);
  };
  useEffect(() => {
    if (stopPlay) {
      video.current?.pause();
      setIsPlay(false);
    } else if (!stopPlay && isInViewport) {
      if (
        playerRef.current.getLoadMode() ==
          _shaka.Player.LoadMode.MEDIA_SOURCE ||
        playerRef.current.getLoadMode() == _shaka.Player.LoadMode.SRC_EQUALS
      ) {
        video.current?.play();
        setIsPlay(true);
      }
    }
  }, [stopPlay]);

  useEffect(() => {
    let mounted = true;
    let timer;
    if (isInViewport) {
      if (
        playerRef.current.getLoadMode() ==
          _shaka.Player.LoadMode.MEDIA_SOURCE ||
        playerRef.current.getLoadMode() == _shaka.Player.LoadMode.SRC_EQUALS
      ) {
        // video.current?.play()
      } else {
        timer = setTimeout(() => {
          if (mounted) {
            isPlayRef.current = true;
            let videoData = videoObj;
            videoData.id = index;
            setParentIcon(getImagePath(videoData.display.parentIcon));
            videoData.hover.elements.forEach((ele) => {
              if (ele.key == "favouriteTargetPath") {
                videoData.favouriteTargetPath = ele;
              } else if (ele.key == "isFavourite") {
                videoData.isFavourite = ele;
              }
            });
            videoData.plugin = plugin;
            playingData(videoData);
            attachMedia(videoData, mounted);
          }
        }, 1000);
      }
    }

    if (
      !isInViewport &&
      (playerRef.current.getLoadMode() == _shaka.Player.LoadMode.MEDIA_SOURCE ||
        playerRef.current.getLoadMode() == _shaka.Player.LoadMode.SRC_EQUALS)
    ) {
      video.current?.pause();
      setIsPlay(false);
    }

    const player = video.current;

    const handleVideoEnd = () => {
      if (
        isInViewport &&
        (playerRef.current.getLoadMode() ==
          _shaka.Player.LoadMode.MEDIA_SOURCE ||
          playerRef.current.getLoadMode() == _shaka.Player.LoadMode.SRC_EQUALS)
      ) {
        video.current?.play();
      }
    };

    player.addEventListener("ended", handleVideoEnd);

    player.addEventListener("timeupdate", (e) => {
      if (player.duration) {
        let progress = (player.currentTime / player.duration) * 100;
        let widthExpression = progress.toFixed(2) + "%";
        setwidthExpression(widthExpression);
      }
    });

    return () => {
      player.removeEventListener("ended", handleVideoEnd);
      mounted = false;
      if (timer) {
        clearTimeout(timer);
      }
      setIsPlay(true);
    };
  }, [isInViewport]);

  useEffect(() => {
    const videoElement = video.current;
    videoElement.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const videoElement = video.current;
    const handleReady = () => {
      console.log(">>>>>>handleReady");
      if (pCount.current == 0) {
        !!plugin.current && plugin.current?.thumbnailVideoClick();
        !!plugin.current && plugin.current?.handlePlayerLoad();
      }
      pCount.current == 1;
    };

    const handlePlay = () => {
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
      console.log("Video playing");
    };
    const handleBufferingStart = () => {
      console.log("Buffering started...");
      !!plugin.current && plugin.current?.handleBufferStart();
      playerState.current.isVideoBuffering = true;
    };

    const handlePause = () => {
      if (!playerState.current?.isVideoPaused) {
        !!plugin.current && plugin.current?.handlePause();
        playerState.current.isVideoPaused = true;
      }
      console.log("Video paused");
    };
    const handleEnded = () => {
      !!plugin.current && plugin.current?.handlePlayCompleted();
      pCount.current == 0;
      console.log("Video ended");
    };
    const handleError = (e) => {
      pCount.current = 0;
      !!plugin.current && plugin.current?.thumbnailVideoClick();
      !!plugin.current && plugin.current?.handlePlayerLoad();
      !!plugin.current &&
        plugin.current?.handleError({
          errorMsg: !!data && !!data.message ? data.message : "network error",
        });
      console.error("Video error:", e);
    };
    if (videoElement) {
      videoElement.addEventListener("loadeddata", handleReady);
      videoElement.removeEventListener("waiting", handleBufferingStart);
      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("waiting", handleBufferingStart);
      videoElement.addEventListener("pause", handlePause);
      videoElement.addEventListener("ended", handleEnded);
      videoElement.addEventListener("error", handleError);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("loadeddata", handleReady);
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("pause", handlePause);
        videoElement.removeEventListener("ended", handleEnded);
        videoElement.removeEventListener("error", handleError);
      }
    };
  }, [isInViewport]);

  const initAnalytics = async () => {
    if (!!locationInfo && locationInfo?.data?.analyticsInfo) {
      let loadObj = {
        analytics_id: process.env.analyticsId,
        authKey: locationInfo?.data?.analyticsInfo.authKey,
        trueIp: locationInfo?.data?.ipInfo.trueIP,
        clientId: locationInfo?.data?.ipInfo.trueIP,
      };

      let playerData = {
        playerName: "shaka-player",
        playerVersion: "4.5.0",
      };
      let clientData = {
        appVersion: "",
        connectionType: "",
        clientIP: locationInfo?.data?.ipInfo.trueIP,
        NWProvider: "",
      };
      plugin.current = window?.VideoAnalyticsPlugin?.load(loadObj);
      plugin.current?.setPlayerMetaData(playerData);
      plugin.current?.setClientMetaData(clientData);
      // console.log(">>>>plugin.current", plugin.current);
    }
  };

  const initVideoAnalytics = async () => {
    console.log(">>>>>>>>plugin.current", plugin.current);
    let pPath = router.asPath;
    pPath = {
      path: await getPagePath(pPath),
      query: await getQueryParams(pPath),
    };
    let contentMetaData = {
      CDNetwork: "shorts",
      navigationFrom: navigateFrom ? navigateFrom : pPath.path,
      metaId: !!videoObj ? videoObj.target.pageAttributes.id : "", //  set content identifier.  ...metaId
      metaMap: "", // currently we are sending empty value.
      a1:
        !!videoObj && !!videoObj?.analyticsInfo?.customData
          ? videoObj.analyticsInfo.customData
          : -1,
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
      isSubscribed: !userDetails ? "0" : "-1" ? "1" : "0",
    };
    let videoMetaData = {
      autoplay: true,
      productName: process.env.initJson["tenantCode"], // new requirement send tenant code
      streamURL: !!videoObj ? videoObj?.metadata?.previewUrl?.value : "", // value
      contentType: "shorts", // shorts
    };

    // setting meta data.
    if (!!plugin.current) {
      plugin.current?.setContentMetaData(contentMetaData);
      plugin.current?.setUserMetaData(userMetaData);
      plugin.current?.setVideoMetaData(videoMetaData);
    }
  };

  function getImagePath(path) {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  }

  function attachMedia(stream, mounted) {
    const onError = (error) => {
      console.error("Error code", error.code, "object", error);
    };

    video.current.poster = getImagePath(stream?.display?.imageUrl);

    let stream_url = stream?.metadata?.previewUrl?.value;
    initVideoAnalytics();
    setIsPlay(true);
    // let stream_url ='https://manoramavod.akamaized.net/shorts/preview/149348.hd1.mp4'
    playerRef.current
      .load(stream_url)
      .then(function () {
        video.current?.play();
      })
      .catch(onError);
  }

  const togglePlay = (e) => {
    e.preventDefault();
    let currentVideo = video.current;
    if (currentVideo.paused) {
      currentVideo?.play();
      setIsPlay(true);
      isPlayRef.current = true;
    } else {
      setIsPlay(false);
      isPlayRef.current = false;
      currentVideo?.pause();
    }
  };

  const seekVideo = (event) => {
    const progressBar = progressBarRef.current;
    const progressBarRect = progressBar.getBoundingClientRect();
    const clickPosition = event.clientX - progressBarRect.left;
    const progressBarWidth = progressBar.offsetWidth;
    const clickPercentage = clickPosition / progressBarWidth;
    const videoin = video?.current;
    videoin.currentTime = videoin.duration * clickPercentage;

    !!plugin.current &&
      plugin.current?.handleSeek({
        STPosition: Math.floor(clickPosition * 1000),
        ETPosition: Math.floor(progressBar.offsetWidth * 1000),
      });
    // videoin.play();
  };
  const navtoback = () => {
    callBckEmit({ label: "navtoback", isMute: true });
  };

  const mutethePlayer = () => {
    callBckEmit({ label: "mute", isMute: !isMuted });
  };
  const navToParner = () => {
    // let urlNav =
    //   window.location.origin + "/" + videoObj?.metadata?.parentIconPath?.value;
    // if (typeof window !== "undefined") {
    //   window.open(urlNav, "_self");
    // }
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    router.push("/" + videoObj?.metadata?.parentIconPath?.value)
  };
  return (
    <div className={`${styles.slider_children}`}>
      <div className={`${styles.backIcon}`}>
        <button onClick={navtoback}>
          <img src={`${ImageConfig?.shorts?.short_close}`} alt="back" />
        </button>
      </div>
      <video
        muted={isMuted}
        className={`${styles.video_Tag} ${distvIcons ? styles.dishTvVideo : ""}`}
        ref={video}
        id={index}
        onClick={togglePlay}
        autoPlay={isPlay}
      ></video>
      {
        <div className={`${styles.overlayBtns}`}>
          <div>
            <button className={`${styles.backBnt}`} onClick={navtoback}>
              <img src={`${ImageConfig?.shorts?.back_arrow}`} alt="back" />
            </button>

            <button
              className={`${styles.video_center} ${styles.overPlay}`}
              key={isPlay ? "Playing" : "Paused"}
              onClick={togglePlay}
            >
              <img
                className={`${styles.web}`}
                src={
                  !isPlay
                    ? `${distvIcons ? ImageConfig?.shorts?.dishTv_play : ImageConfig?.shorts?.play}`
                    : `${distvIcons ? ImageConfig?.shorts?.dishTv_pause : ImageConfig?.shorts?.pause}`
                }
                key={!isPlay ? "Playing_img" : "Paused_img"}
                alt=""
              />

              <img
                className={`${styles.mobile}`}
                src={
                  !isPlay
                    ? `${distvIcons ? ImageConfig?.shorts?.short_mobile_Play : ImageConfig?.shorts?.play}`
                    : `${distvIcons ? ImageConfig?.shorts?.short_mobile_Pause : ImageConfig?.shorts?.pause}`
                }
                key={!isPlay ? "Playing" : "Paused"}
                alt=""
              />
            </button>
          </div>

          <button
            className={`${styles.video_center} ${styles.overPlay}`}
            key={isMuted ? "Muted" : "Unmuted"}
            onClick={mutethePlayer}
          >
            <img
              className={`${styles.web}`}
              src={`${
                ImageConfig?.shorts[
                  !isMuted
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
            <img
              className={`${styles.mobile}`}
              key={isMuted ? "Muted" : "Unmuted"}
              src={`${
                ImageConfig?.shorts[
                  !isMuted
                    ? distvIcons
                      ? "short_mobile_Mute"
                      : "mute"
                    : distvIcons
                      ? "short_mobile_Unmute"
                      : "unmute"
                ]
              }`}
              alt=""
            />
          </button>
        </div>
      }

      {appConfig?.shortPage?.programBar == 1 && (
        <div
          className={`${styles.progressBar}`}
          onClick={seekVideo}
          ref={progressBarRef}
        >
          <div className={`${styles.innerprogressBar}`}>
            <div
              className={`${styles.totalplayVideo}`}
              style={{ width: widthExpression }}
            ></div>
          </div>
        </div>
      )}

      {!distvIcons && (
        <button
          className={`${styles.video_center} ${!isPlay ? styles.showPlayBtn : "Paused"}`}
          key={isPlay ? "Playing" : "Paused"}
          onClick={togglePlay}
        >
          <img
            src={
              !isPlay
                ? `${distvIcons ? ImageConfig?.shorts?.dishTv_play : ImageConfig?.shorts?.play}`
                : `${distvIcons ? ImageConfig?.shorts?.dishTv_pause : ImageConfig?.shorts?.pause}`
            }
            alt={!isPlay ? "Playing" : "Paused"}
          />
        </button>
      )}

      <div className={`${styles.video_bTMcontent}`}>
        <div className={`${styles.parentIcon}`} onClick={navToParner}>
          <img src={parentIcon} alt="usimg" />
          <label> {videoObj?.display?.parentName}</label>
        </div>
        <p>{videoObj?.display?.title}</p>
        <span> {videoObj?.display?.subtitle} </span>
      </div>
    </div>
  );
};

export default VideoCard;
