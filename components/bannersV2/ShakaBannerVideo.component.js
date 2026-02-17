/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable func-names */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { appConfig } from "@/config/app.config";
import _shaka from "shaka-player";
import { useStore } from "@/store/store";
import styles from "./SlickBanners.module.scss";
import { BannerImage } from "./bannerImage";

const ShakaBannerVideo = ({ streamPath, streamEnd, item }) => {
  const videoRef = useRef(null);
  const shakaPlayerRef = useRef(null);
  const shakaeventManager = useRef();
  const [muted, setMuted] = useState(true);
  const [isVideoStarted, setVideoStarted] = useState(false);
  const videoStartedRef = useRef(false);
  const {
    state: { shakaCardHoverState },
  } = useStore();
  const [isInteractingView, setIsInteractingView] = useState(false);
  const isMutedSessionStored = sessionStorage.getItem("isMutedSessionStored");

  useEffect(() => {
    initiateShakaPlayer();
    return () => {
      destroyPlayer();
    };
  }, [streamPath?.streamUrl]);

  useEffect(() => {
    if (shakaCardHoverState) {
      videoRef?.current?.pause();
    }
    return () => {
      isInteractingView && videoRef?.current?.play();
    };
  }, [shakaCardHoverState]);

  useEffect(() => {
    const options = {
      root: null, // viewport as the root
      rootMargin: "0px", // no margin
      threshold: 0.5, // 50% of the element must be visible to trigger the callback
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [shakaCardHoverState]);

  const initiateShakaPlayer = () => {
    shakaeventManager.current = new _shaka.util.EventManager();
    _shaka.polyfill.installAll();
    if (_shaka.Player.isBrowserSupported()) {
      shakaPlayerRef.current = new _shaka.Player(videoRef.current);
    } else {
      console.log("Shaka Player is not supported in this browser.");
    }
    loadStream(streamPath.streamUrl);
  };

  const destroyPlayer = () => {
    setVideoStarted(false);
    videoStartedRef.current = false;
    if (shakaeventManager.current) {
      shakaeventManager.current.removeAll();
    }
    if (shakaPlayerRef.current) {
      shakaPlayerRef.current.destroy();
    }
  };

  const loadStream = (stream_url) => {
    const onError = (error) => {
      console.error("Error code", error.code, "object", error);
      // incase if video can't playback end the stream
      streamEnd();
    };
    shakaPlayerRef.current.attach(videoRef.current, true);
    // shakaPlayerRef.current.configure({
    //   disablePictureInPicture: true,
    // });
    if (stream_url.includes(".m3u8")) {
      shakaPlayerRef.current
        .getNetworkingEngine()
        .registerRequestFilter(function requestFilter(type, request) {
          if (type === _shaka.net.NetworkingEngine.RequestType.SEGMENT) {
            request.method = "GET";
          }
        });

      shakaPlayerRef.current.configure({
        streaming: {
          lowLatencyMode: true,
          inaccurateManifestTolerance: 0,
          rebufferingGoal: 0.01,
          segmentPrefetchLimit: 2,
        },
      });
    }
    // For testing
    // shakaPlayerRef.current.load('https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4').then(function () {
    // shakaPlayerRef.current.load('https://content.jwplatform.com/manifests/yp34SRmf.m3u8').then(function () {
    shakaPlayerRef.current
      .load(stream_url)
      .then(function () {
        if (shakaCardHoverState) {
          videoRef?.current?.pause();
        } else {
          videoRef.current?.play();
          if (isMutedSessionStored == "false") {
            videoRef.current.muted = false;
            setMuted(false);
          } else {
            videoRef.current.muted = muted;
          }
        }
      })
      .catch(onError);

    videoRef.current?.addEventListener("ended", function () {
      streamEnd(true);
    });

    // hits when video starts playing
    shakaeventManager?.current?.listen(
      videoRef.current,
      `timeupdate`,
      (event) => {
        if (event.target.currentTime > 0 && videoStartedRef.current === false) {
          setVideoStarted(true);
          videoStartedRef.current = true;
        }
      }
    );
    shakaPlayerRef.current.addEventListener("error", (error) =>
      handleShakaPlayerError(error)
    );
  };

  const handleShakaPlayerError = (event) => {
    const shakaError = event.detail;
    console.error("Shaka Player error:", shakaError);
    streamEnd();
  };
  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Element is in view!
        setIsInteractingView(true);
        if (videoRef?.current?.src === "") {
          // video src isn't loaded
          initiateShakaPlayer();
        } else {
          // Check if Shaka Player is not already initialized
          if (!shakaPlayerRef?.current) {
            initiateShakaPlayer();
          }
          setTimeout(() => {
            videoRef?.current?.play();
          }, 300);
        }
      } else {
        // Element is out of view!
        setIsInteractingView(false);
        videoRef?.current?.pause();
      }
    });
  };

  const toggleMute = (e) => {
    e.stopPropagation(e);
    const newMuted = !muted;
    setMuted(newMuted);
    sessionStorage.setItem("isMutedSessionStored", newMuted);
    if (shakaPlayerRef?.current) {
      videoRef.current.muted = newMuted;
    }
  };

  return (
    <>
      {!isVideoStarted && <BannerImage item={item} />}
      <ShakaVideoElement
        isVideoStarted={isVideoStarted}
        toggleMute={toggleMute}
        videoRef={videoRef}
        muted={muted}
      />
    </>
  );
};

export default ShakaBannerVideo;

const ShakaVideoElement = React.memo(
  ({ isVideoStarted, toggleMute, videoRef, muted }) => {
    return (
      <>
        <video
          style={{
            width: "100%",
            visibility: isVideoStarted ? "visible" : "hidden",
          }}
          ref={videoRef}
          disablePictureInPicture
        />
        <img
          key={muted ? "volume-mute" : "volume-unmute"}
          className={`${styles.player_mute}`}
          onClick={(e) => toggleMute(e)}
          src={`${appConfig.staticImagesPath}${muted ? "volume-mute.svg" : "volume-unmute.svg"}`}
          width="30"
          alt="unmute"
          style={{ visibility: isVideoStarted ? "visible" : "hidden" }}
        />
      </>
    );
  }
);
