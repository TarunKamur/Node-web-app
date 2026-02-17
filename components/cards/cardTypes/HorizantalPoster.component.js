import React from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";

const HorizantalPoster = ({
  BadgeText,
  cardType,
  cardData,
  cWidth,
  CHeight,
  loaderProp,
  openProgInfoPopUp,
  isGirdPage,
}) => {
  return (
    <div
      className={`${styles.horizantal_poster} ${cardType}`}
      onClick={() => {
        isGirdPage && openProgInfoPopUp(cardData);
      }}
    >
      <Image
        src={getImagePath(cardData?.display.imageUrl)}
        loader={loaderProp}
        alt={cardData.display.title}
        width={CHeight || 0}
        height={CHeight || 0}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.srcset = `${ImageConfig?.defaultdetails}`;
        }}
      />
      {/* {!!cardData?.display?.badgeMarker && (
        <BadgeText badgeMarker={cardData.display.badgeMarker} />
      )} */}

      {!isGirdPage && cardData.display.title && (
        <h3 className={styles.title}>{cardData.display.title}</h3>
      )}

      {!isGirdPage && cardData.display.ButtonText && (
        <button
          onClick={() => openProgInfoPopUp(cardData)}
          className={styles.play_btn}
        >
          {cardData.display.ButtonText}
        </button>
      )}
    </div>
  );
};

export default HorizantalPoster;
