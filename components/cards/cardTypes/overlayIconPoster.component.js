import React from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";
import Link from "next/link";

const OverlayIconPoster = ({
  cardType,
  cardData,
  cWidth,
  CHeight,
  openProgInfoPopUp,
  loaderProp,
  BadgeText,
}) => {
  return (
    <div
      className={`${styles.overlayIcon_poster} ${cardType}`}
      onClick={() => openProgInfoPopUp(cardData)}
    >
      <div className={styles.card_inner} style={{ height: CHeight }}>
        <Link href={cardData.target?.path} prefetch={false}>
          <div className={styles.card_header}>
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
            {!!cardData?.display?.badgeMarker && (
              <BadgeText badgeMarker={cardData.display.badgeMarker} />
            )}
            <div className={styles.overlay}>
              <div className={styles.overlay_inner}>
                {!!cardData?.display.parentIcon && (
                  <Image
                    className={` ${styles.main_img}`}
                    loader={loaderProp}
                    width="30"
                    height="30"
                    src={getImagePath(cardData?.display.parentIcon)}
                    alt={cardData?.display?.title}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
                    }}
                  />
                )}
                <div className={styles.info}>
                  <h3 className={styles.main_title}>
                    {cardData.display.title}
                  </h3>
                  <span className={styles.sm_title}>
                    {cardData.display.subtitle1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default OverlayIconPoster;
