import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";
import Rating from "./rating.component";

const OverlayPoster = ({
  BadgeText,
  cardData,
  cardType,
  eleIndex,
  cWidth,
  CHeight,
  loaderProp,
  openProgInfoPopUp,
}) => {
  const showOnHoverOnly = cardData?.hover?.elements?.some(
    (f) => f.key == "OnHoverDisplay" && f.value == "true"
  );

  const [isRating] = useState(
    cardType === "top10_landscape_poster" ? true : false
  );
  const [imagewidth, setImageWidth] = useState(() => {
    return cardType === "top10_landscape_poster"
      ? [cWidth * 0.9, cWidth * 0.9 * 0.5625]
      : [cWidth, CHeight];
  });

  useEffect(() => {
    setImageWidth(
      cardType === "top10_landscape_poster"
        ? [cWidth * 0.9, cWidth * 0.9 * 0.5625]
        : [cWidth, CHeight]
    );
  }, [cardType, cWidth]);

  return (
    <div
      className={`${styles.overlay_poster} overlay_poster ${cardData?.display?.leftOverTimeMarker?.value ? styles.continue_watching : ""} `}
    >
      {isRating && !!eleIndex && <Rating eleIndex={eleIndex} />}
      <div
        className={`${styles.card_inner} ${isRating ? `${styles.ratingInner}` : ``}`}
        style={{ height: CHeight }}
        onClick={() => openProgInfoPopUp(cardData)}
      >
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
          }}
          prefetch={false}
        >
          <div className={styles.card_header}>
            <Image
              className={styles.main_img}
              loader={loaderProp}
              src={getImagePath(cardData?.display.imageUrl)}
              alt={cardData.display.title}
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
            <div className={styles.overlay}>
              <div className={styles.overlay_inner}>
                {!!cardData?.display.parentIcon && (
                  <div className={styles.imageContainer}>
                    <Image
                      className={` ${styles.main_img}`}
                      loader={loaderProp}
                      fill
                      src={getImagePath(cardData?.display.parentIcon)}
                      alt={cardData?.display?.title}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
                      }}
                    />
                  </div>
                )}

                <div
                  className={`${styles.info} ${showOnHoverOnly ? styles.showOnHover : ""}`}
                >
                  <h3 className={styles.main_title}>
                    {cardData.display.title}
                  </h3>
                  <span className={styles.sm_title}>
                    {cardData.display.subtitle1}
                  </span>
                </div>
                {!!cardData.display.seekMarker && (
                  <div className={` ${styles.timer}`}>
                    {!!cardData.display.leftOverTimeMarker && (
                      <span
                        style={{ color: cardData.display.textLeftColor }}
                        className={styles.time}
                      >
                        {cardData.display.leftOverTimeMarker.value}
                      </span>
                    )}
                    {!!cardData.display.seekMarker &&
                      !!cardData.display.seekedValue && (
                        <div className={styles.seek}>
                          <span
                            className={styles.status}
                            style={{
                              width: `${cardData.display.seekedValue}%`,
                              backgroundColor: cardData.display.bgSeekColor,
                            }}
                          />
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
            {(!!cardData.display.title ||
              (!!cardData.display.seekMarker &&
                !!cardData.display.seekedValue)) && (
              <span
                className={`${styles.gradient} ${
                  showOnHoverOnly &&
                  !(
                    !!cardData.display.seekMarker &&
                    !!cardData.display.seekedValue
                  )
                    ? styles.showOnHover
                    : ""
                }`}
              />
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default OverlayPoster;
