import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath, systemConfigs } from "@/services/user.service";
import Rating from "./rating.component";
import { TvshowDetailsconstant } from "@/.i18n/locale";
import { actions, useStore } from "@/store/store";
import { SystemConfig } from "@/store/actions";

const ShortsRollerPoster = ({
  BadgeText,
  cardType,
  cardData,
  cWidth,
  CHeight,
  loaderProp,
  openProgInfoPopUp,
  eleIndex,
}) => {
  const {
    state: { localLang },
    dispatch,
  } = useStore();
  const [isRating] = useState(
    cardType === "top10_portrait_poster" ? true : false
  );
  const [imagewidth, setImageWidth] = useState(() => {
    return cardType === "top10_portrait_poster"
      ? [cWidth * 0.9, cWidth * 0.9 * 1.7]
      : [cWidth, CHeight];
  });

  useEffect(() => {
    // let windowWidth = window.innerWidth;
    setImageWidth(
      cardType === "top10_portrait_poster"
        ? [cWidth * 0.85, cWidth * 0.85 * 1.7]
        : [cWidth, CHeight]
    );
  }, [cardType, cWidth]);

  return (
    <div
      className={`${styles.roller_poster} ${styles.shorts_roller_poster} ${cardType}`}
    >
      {isRating && !!eleIndex && <Rating eleIndex={eleIndex} />}
      <div
        className={`${styles.card_inner} ${isRating ? `${styles.ratingInner}` : ``}`}
      >
        <div
          style={{ maxWidth: imagewidth[0] || 100 }}
          className={`${styles.card_header} ${cardData.display.expiryInfoDisplay ? styles.has_marker : ""}`}
        >
          <Image
            className={styles.main_img}
            loader={loaderProp}
            alt={cardData?.display.title}
            src={getImagePath(cardData?.display.imageUrl)}
            onClick={() => openProgInfoPopUp(cardData)}
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
          {
            <div className={styles.card_info} style={{ width: "100%" }}>
              {!!cardData?.display.parentIcon && (
                <Image
                  loader={loaderProp}
                  height={30}
                  width={30}
                  className={styles.card_epg_image1}
                  src={getImagePath(cardData?.display.parentIcon)}
                  onClick={() => {
                    openProgInfoPopUp(cardData, true);
                  }}
                  alt={cardData.display.title}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
                  }}
                />
              )}
              <div className={styles.card_tiltle}>
                <h3>{cardData?.display?.title}</h3>
                {
                  systemConfigs?.configs?.showViewsCountOption == "true" && <h4>
                  {cardData?.metadata?.views?.value || 0}{" "}
                  {cardData?.metadata?.views?.value == 1
                    ? TvshowDetailsconstant[localLang]?.View_text
                    : TvshowDetailsconstant[localLang]?.Views_text}
                </h4>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default ShortsRollerPoster;
