import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";
import Rating from "./rating.component";

const RollerPoster = ({
  BadgeText,
  cardType,
  cardData,
  cWidth,
  CHeight,
  loaderProp,
  openProgInfoPopUp,
  eleIndex,
}) => {
  const [isRating] = useState(
    cardType === "top10_portrait_poster" ? true : false
  );
  const [imagewidth, setImageWidth] = useState(() => {
    return cardType === "top10_portrait_poster"
      ? [cWidth * 0.9, cWidth * 0.9 * 1.5]
      : [cWidth, CHeight];
  });

  useEffect(() => {
    setImageWidth(
      cardType === "top10_portrait_poster"
        ? [cWidth * 0.85, cWidth * 0.85 * 1.5]
        : [cWidth, CHeight]
    );
  }, [cardType, cWidth]);

  return (
    <div className={`${styles.roller_poster} ${cardType}`}>
      {isRating && !!eleIndex && <Rating eleIndex={eleIndex} />}
      <div
        className={`${styles.card_inner} ${isRating ? `${styles.ratingInner}` : ``}`}
      >
        <div
          className={`${styles.card_header} ${cardData.display.expiryInfoDisplay ? styles.has_marker : ""}`}
          onClick={() => openProgInfoPopUp(cardData)}
        >
          <Image
            className={styles.main_img}
            loader={loaderProp}
            alt={cardData?.display.title}
            src={getImagePath(cardData?.display.imageUrl)}
            width={imagewidth[0] || 100}
            height={imagewidth[1] || 100}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
            }}
          />
          {!!cardData?.display?.badgeMarker && (
            <BadgeText badgeMarker={cardData.display.badgeMarker} />
          )}
          {!!cardData?.display.partnerIcon && (
            <Image
              loader={loaderProp}
              height={30}
              width={30}
              className={styles.card_epg_image1}
              src={getImagePath(cardData?.display.partnerIcon)}
              alt={cardData.display.title}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
              }}
            />
          )}
          {cardData.display.showtitle ? (
            <span></span>
          ) : (
            <span
              className={styles.overlay_gradient}
              style={{ width: cWidth }}
            ></span>
          )}
          {
            <div className={styles.card_info} style={{ width: cWidth }}>
              {!!cardData.display.expiryInfo && (
                <span className={styles.expiring_info}>
                  {cardData.display.expiryInfoDisplay[0]}
                  <span>{cardData.display.expiryInfoDisplay[1]}</span>
                </span>
              )}
              {cardData.display.showtitle ? (
                <span></span>
              ) : (
                <h3>{cardData?.display.title}</h3>
              )}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default RollerPoster;
