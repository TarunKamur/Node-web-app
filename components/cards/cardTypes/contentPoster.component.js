import React from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";
import { appConfig } from "@/config/app.config";

const ContentPoster = ({
  BadgeText,
  cardType,
  cardData,
  cWidth,
  CHeight,
  loaderProp,
  openProgInfoPopUp,
  sectionInfo,
  removeCard,
  item,
}) => {
  return (
    <div className={`${styles.content_poster} ${styles.mb30} ${cardType} `}>
      {sectionInfo?.sectionData?.sectionInfo?.code == "continue_watching" &&
        appConfig?.carousel?.continue_watching_delete && (
          <>
            <div class={styles.remove_watch_list_gradient}></div>
            <div class={styles.remove_icon}>
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
                class={styles.remove_watchlist_icon}
                alt="remove"
              />
              <span class={styles.fancy_tool_tip}>Remove</span>
            </div>
          </>
        )}
      <div
        className={styles.card_inner}
        style={{ height: CHeight + 60, width: cWidth }}
        onClick={() => openProgInfoPopUp(cardData)}
      >
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
              currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
            }}
          />
          {/* <span
            className={`${styles.labelRent} ${true && styles.labelRented} `}
          >
            {" "}
            {false ? "Rent" : "Rented"}{" "}
          </span> */}

          {!!cardData?.display?.badgeMarker && (
            <BadgeText badgeMarker={cardData.display.badgeMarker} />
          )}
          {!!cardData?.display.partnerIcon && (
            <Image
              loader={loaderProp}
              className={` ${styles.card_epg_image1}`}
              height={30}
              width={30}
              src={getImagePath(cardData?.display.partnerIcon)}
              alt={cardData.display.title}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
              }}
            />
          )}
          {!!cardData.display.leftOverTimeMarker && (
            <span
              style={{ color: cardData.display.textLeftColor }}
              className={styles.time}
            >
              {cardData.display.leftOverTimeMarker.value}
            </span>
          )}
          {!!cardData.display.seekMarker && !!cardData.display.seekedValue && (
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
          <div className={styles.overlay} />
        </div>
        <div className={styles.card_footer}>
          <div className={styles.card_in_cont}>
            {/* {
					!!cardData?.display?.parentIcon &&
					<span className={` ${styles.cardChannelLogo}`} >
							<img className={` ${styles.card_channel_image}`} src=`${appConfig.staticImagesPath}default-movie-poster.png` border="0" />
					</span>
				 }   */}

            <div
              className={` ${styles.card_info} ${cardData?.display.parentIcon ? styles.has_parent_icon : ""} `}
            >
              {!!cardData?.display.parentIcon && (
                <span className={` ${styles.parentIcon}`}>
                  <Image
                    loader={loaderProp}
                    className={` ${styles.card_channel_image}`}
                    height={30}
                    width={30}
                    src={getImagePath(cardData?.display.parentIcon)}
                    alt={cardData.display.title}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
                    }}
                  />
                </span>
              )}
              <div>
                <h3 className={styles.main_title}>{cardData.display.title} </h3>
                <span className={styles.sm_title}>
                  {cardData.display.subtitle1}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPoster;
