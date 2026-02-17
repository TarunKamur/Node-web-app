import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";
import { SectionsContext } from "@/components/sections/sectionsContext";

const ExpandRollerPoster = ({
  addTofav,
  BadgeText,
  cardType,
  cardData,
  checkDeeplink,
  cWidth,
  CHeight,
  loaderProp,
  openProgInfoPopUp,
  shareDataSet,
}) => {
  const textScrollRef = useRef();
  const [textScrollHeight, setTextScrollHeight] = useState(0);

  const { favInfo } = useContext(SectionsContext);

  const getFavStatus = () => {
    let isFavourite = cardData?.isFavourite === "true";

    if (favInfo?.added?.[cardData?.targetPath]) {
      isFavourite = true;
    }
    if (favInfo?.removed?.[cardData?.targetPath]) {
      isFavourite = false;
    }
    return isFavourite;
  };

  const isFavourite = getFavStatus();

  useEffect(() => {
    if (textScrollRef?.current?.clientHeight) {
      setTextScrollHeight(textScrollRef?.current?.clientHeight);
    }
  }, []);

  return (
    <div
      className={
        !!(
          cardData.subtitle ||
          cardData.subtitle1 ||
          cardData.showFavouriteButton ||
          cardData.showShareButton
        )
          ? `${styles.expands_roller_poster} ${cardType}`
          : `${styles.expands_roller_poster} ${styles.no_data}`
      }
    >
      <div
        className={`${styles.card_inner}`}
        style={{ height: CHeight + textScrollHeight, width: cWidth }}
      >
        <div style={{ height: CHeight + textScrollHeight, width: cWidth }}>
          <div
            className={`${styles.card_header}`}
            onClick={() => openProgInfoPopUp(cardData)}
          >
            <Image
              className={` ${styles.main_img}`}
              loader={loaderProp}
              src={getImagePath(cardData?.display.imageUrl)}
              alt={cardData.display.title}
              width={cWidth || 0}
              height={CHeight || 0}
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
                height={30}
                width={30}
                loader={loaderProp}
                className={` ${styles.card_epg_image1}`}
                alt="partner icon"
                src={getImagePath(cardData?.display.partnerIcon)}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
                }}
              />
            )}
            <div className={` ${styles.text_scroll}`} ref={textScrollRef}>
              <div className={` ${styles.top_section}`}>
                {cardData.display.showtitle ? (
                  <span></span>
                ) : (
                  <h3>{cardData?.display.title}</h3>
                )}
                {/* <h5> {cardData?.display.subtitle1}</h5> */}
              </div>
            </div>
          </div>
          <div className={`${styles.card_footer}`}>
            <div className={` ${styles.bottom_section}`}>
              <h6> {cardData?.display?.subtitle1}</h6>
            </div>
            <div className={` ${styles.actions}`}>
              {!!cardData.subtitle && cardData.subtitle1 ? (
                <div className={`${styles.top_section}`}>
                  <h6>{cardData.subtitle}</h6>
                  <h5>{cardData.subtitle1}</h5>
                </div>
              ) : (
                <span></span>
              )}
              {!!cardData?.showButton && (
                <button
                  onClick={() => {
                    checkDeeplink(cardData);
                  }}
                  className={` ${styles.defaultBtn} primary ${
                    cardData.showWatchButton || cardData.showPlayButton
                      ? `${styles.playBtn}`
                      : ""
                  }`}
                >
                  {cardData?.ButtonText?.includes(" ")
                    ? cardData?.ButtonText
                    : cardData?.ButtonText}
                </button>
              )}
              {/* </Link> */}
              {!!cardData.showFavouriteButton && (
                <button
                  className={` ${styles.like}`}
                  onClick={() => addTofav(cardData)}
                >
                  {isFavourite && (
                    <img
                      fill
                      src={ImageConfig?.playerDescription?.watchedTick}
                      alt="favorite"
                    />
                  )}
                  {!isFavourite && (
                    <img src={ImageConfig?.playerDescription?.plusGray} alt="favorite" />
                  )}

                  <span>{cardData?.favOnHoverText}</span>
                </button>
              )}
              {!!cardData.showShareButton && (
                <button
                  className={` ${styles.share}`}
                  onClick={() => shareDataSet(cardData)}
                >
                  <img src={ImageConfig?.card?.share} alt="share" />
                  <span>{cardData?.shareOnHoverText}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandRollerPoster;
