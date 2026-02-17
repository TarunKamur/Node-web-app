import React from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";

const LivePoster = ({
  BadgeText,
  cardType,
  cardData,
  cWidth,
  CHeight,
  loaderProp,
  openProgInfoPopUp,
}) => {
  return (
    <div
      className={`${styles.live_poster} ${cardType}`}
      onClick={() => openProgInfoPopUp(cardData)}
    >
      <div className={`${styles.parentIcon}`}>
        <Image
          className={`${styles.iconImg}`}
          src={getImagePath(cardData?.display.parentIcon)}
          loader={loaderProp}
          alt={cardData.display.title}
          width={59}
          height={59}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
          }}
        />
      </div>
      <div className={`${styles.ChannelImage}`}>
        <Image
          className={`${styles.img}`}
          src={getImagePath(cardData?.display.imageUrl)}
          loader={loaderProp}
          alt={cardData.display.title}
          width={cWidth || 0}
          height={CHeight || 0}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
          }}
        />
        {!!cardData?.display?.badgeMarker && (
          <BadgeText
            badgeMarker={cardData.display.badgeMarker}
            className={`${styles.live}`}
          />
        )}
      </div>
    </div>
  );
};

export default LivePoster;
