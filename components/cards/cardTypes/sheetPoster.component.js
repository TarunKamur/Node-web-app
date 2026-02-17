/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";
import { appConfig } from "@/config/app.config";

const SheetPoster = ({
  cardType,
  cardData,
  cWidth,
  CHeight,
  openProgInfoPopUp,
  loaderProp,
  BadgeText,
  sectionInfo,
  removeCard,
  item,
}) => {
  return (
    <div
      className={`${styles.sheet_poster} ${cardType} ${
        cardData?.display.partnerIcon ? "with_icon" : ""
      }`}
      onClick={() => openProgInfoPopUp(cardData)}
    >
      <div className={styles.mobile_close_card}>
        {sectionInfo?.sectionData?.sectionInfo?.code == "continue_watching" &&
          appConfig?.carousel?.continue_watching_delete && (
            <>
              <div className={styles.remove_watch_list_gradient} />
              <div className={styles.remove_icon}>
                <img
                  onClick={(e) =>
                    removeCard(
                      e,
                      item,
                      sectionInfo.index,
                      sectionInfo.curosalData
                    )
                  }
                  src="https://d2ivesio5kogrp.cloudfront.net/static/aastha/images/remove-watchlist.svg"
                  className={styles.remove_watchlist_icon}
                  alt="remove"
                />
              </div>
            </>
          )}
      </div>
      <div className={`${styles.card_inner}`} style={{ width: cWidth }}>
        <div className={styles.card_header}>
          <Image
            className={styles.main_img}
            loader={loaderProp}
            src={getImagePath(cardData?.display.imageUrl)}
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
          {!!cardData?.display.partnerIcon && (
            <Image
              loader={loaderProp}
              className={styles.card_epg_image1}
              alt="partner icon"
              height={30}
              width={30}
              src={getImagePath(cardData?.display.partnerIcon)}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
              }}
            />
          )}
          {!!cardData.display.seekMarker && !!cardData.display.seekedValue && (
            <div className={`${styles.seek}`}>
              <span
                className={`${styles.status}`}
                style={{
                  width: `${cardData.display.seekedValue}%`,
                  backgroundColor: cardData.display.bgSeekColor,
                }}
              />
            </div>
          )}
        </div>
        <div className={styles.card_footer}>
          <div className={` ${styles.card_in_cont}`}>
            {/* {!!cardData?.display.parentIcon && (
              <span className={` ${styles.cardChannelLogo}`}>
                <Image
                  className={styles.card_channel_image}
                  loader={loaderProp}
                  fill
                  src={getImagePath(cardData?.display.parentIcon)}
                  alt={cardData.display.title}
                  border="0"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
                  }}
                />
              </span>
            )} */}
            <div className={` ${styles.card_info} ${styles.has_parent_icon} `}>
              <h3 className={` ${styles.main_title}`}>
                {cardData?.display.title}{" "}
              </h3>
              {cardData?.display?.subtitle1 && (
                <span className={`${styles.sm_title}`}>
                  {cardData?.display.subtitle1}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheetPoster;
