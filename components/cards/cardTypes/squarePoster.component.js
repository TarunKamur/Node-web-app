import React from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";

const SquarePoster = ({
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
      className={`${styles.square_poster} ${cardType}`}
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
          currentTarget.srcset = `${ImageConfig?.defaultdetails}`;
        }}
      />
      {!!cardData?.display?.badgeMarker && (
        <BadgeText badgeMarker={cardData.display.badgeMarker} />
      )}
    </div>
  );
};

export default SquarePoster;
