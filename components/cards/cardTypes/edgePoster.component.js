import React from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";

const EdgePoster = ({
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
      className={`${styles.edge_poster} ${cardType}`}
      onClick={() => openProgInfoPopUp(cardData)}
    >
      <Image
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
      {!!cardData?.display?.title && (
        <h3 className={`${styles.artist_title}`}>{cardData?.display?.title}</h3>
      )}
      {!!cardData?.display?.badgeMarker && (
        <BadgeText badgeMarker={cardData.display.badgeMarker} />
      )}
    </div>
  );
};

export default EdgePoster;
