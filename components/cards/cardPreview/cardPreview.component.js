import { CardpreviewContext } from "@/components/sections/previewContext";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ImageConfig } from "@/config/ImageConfig";
import styles from "./cardPreview.module.scss";

function CardPreview({ preview_url, posterImg }) {
  const videoRef = useRef(null);
  const { attachMedia, detachMedia } = useContext(CardpreviewContext);
  const [mute, setMute] = useState("mute");
  const [enableMute, setEnableMute] = useState(false);

  const handlePlayerEvents = useCallback((event) => {
    switch (event.state) {
      case "load":
        if (!enableMute) setEnableMute(!enableMute);
        break;
      // for safari
      case "src-equals":
        if (!enableMute) setEnableMute(!enableMute);
        break;
      case "detach":
        setEnableMute(false);
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (preview_url) {
      attachMedia(videoRef.current, preview_url, handlePlayerEvents);
    }

    return () => {
      if (preview_url) {
        detachMedia();
      }
    };
  }, [preview_url]);

  const poster = !posterImg ? `${ImageConfig?.defaultMoviePoster}` : posterImg;

  const handleMuteClick = () => {
    setMute(() => (mute === "mute" ? "unmute" : "mute"));
  };

  const isMute = () => (mute === "mute" ? true : false);

  return (
    <div>
      <video
        id="video"
        poster={poster}
        ref={videoRef}
        className={`${styles.video_tag}`}
        autoPlay="true"
        muted={isMute()}
        alt="video"
        // controls
      />
      {enableMute && (
        <div className={`${styles.mute_container}`} onClick={handleMuteClick}>
          <img
            src={`https://d2ivesio5kogrp.cloudfront.net/static/timesplay/images/volume-${mute}.svg`}
            alt={`${mute}`}
          />
        </div>
      )}
    </div>
  );
}

export default CardPreview;
