import React from "react";
import { actions, useStore } from "@/store/store";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath, systemConfigs } from "@/services/user.service";
import { appConfig } from "@/config/app.config";
import { Custom_PosterText } from "@/.i18n/locale";
import { SystemConfig } from "@/store/actions";

const CustomPoster = ({
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
  suggestionCardData = "",
}) => {
  // console.log(cardData,"3456789")
  const {
    state: { localLang },
    dispatch,
  } = useStore();
  // const goToSubscribe = (e) => {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   console.log("Subscribe To >>>", cardData);
  // };
  const getColorCode = (color) => {
    if (!!color) {
      try {
        return "#" + color.substring(2);
      } catch (e) {}
    } else {
      return null;
    }
  };
  const convertNumberToShortFormat = (number) => {
    number = Number(number);
    if (number >= 1000) {
      return (number / 1000).toFixed(1);
    }
    return number.toString();
  };
  const timeStampToRelativeTime = (timestamp) => {
    // console.log(timestamp,"timestamp")
    if (!timestamp) return "";
    timestamp = Number(timestamp);

    const now = Date.now();
    const diffInMilliseconds = now - timestamp;

    const msInSecond = 1000;
    const msInMinute = msInSecond * 60;
    const msInHour = msInMinute * 60;
    const msInDay = msInHour * 24;
    const msInWeek = msInDay * 7;
    const msInYear = msInDay * 365;

    if (diffInMilliseconds < msInSecond * 60)
      return `${Math.floor(diffInMilliseconds / msInSecond)} ${Custom_PosterText[localLang]?.seconds_ago}`;

    if (diffInMilliseconds < msInHour) {
      const minutes = Math.floor(diffInMilliseconds / msInMinute);
      return minutes === 1
        ? `${minutes} ${Custom_PosterText[localLang]?.minute_ago}`
        : `${minutes} ${Custom_PosterText[localLang]?.minutes_ago}`;
    }

    if (diffInMilliseconds < msInDay) {
      const hours = Math.floor(diffInMilliseconds / msInHour);
      return hours === 1
        ? `${hours} ${Custom_PosterText[localLang]?.hour_ago}}`
        : `${hours} ${Custom_PosterText[localLang]?.hours_ago}`;
    }

    if (diffInMilliseconds < msInWeek) {
      const days = Math.floor(diffInMilliseconds / msInDay);
      return days === 1
        ? `${days} ${Custom_PosterText[localLang]?.day_ago}`
        : `${days} ${Custom_PosterText[localLang]?.days_ago}`;
    }

    if (diffInMilliseconds < msInYear) {
      const weeks = Math.floor(diffInMilliseconds / msInWeek);
      return weeks === 1
        ? `${weeks} ${Custom_PosterText[localLang]?.week_ago}`
        : `${weeks} ${Custom_PosterText[localLang]?.weeks_ago}`;
    }

    const years = Math.floor(diffInMilliseconds / msInYear);
    return years === 1
      ? `${years} ${Custom_PosterText[localLang]?.year_ago}`
      : `${years} ${Custom_PosterText[localLang]?.years_ago}`;
  };

  return (
    <div
      className={`${styles.content_poster} ${styles.mb30} ${cardType} ${styles.custom_Poster} ${false && styles.applyRadius} ${styles[suggestionCardData]}`}
    >
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
        style={{ height: (systemConfigs?.configs?.showDaysAgoOption == "true" || systemConfigs?.configs?.showViewsCountOption == "true") ? CHeight + 60 : CHeight + 30, width: cWidth }}
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

          <div className={`${styles.cpSubscribeHolder}`}>
            {/* {cardData.display?.rent && (
              <span
                className={`${styles.labelRent} ${false && styles.labelRented} `}
              >
                {" "}
                {true ? "Rent" : "Rented"}{" "}
              </span>
            )} */}
            {cardData.display?.markers?.map((data, index) => {
              if (data?.markerType === "subscribe") {
                const backgroundColor = getColorCode("XX" + data?.bgColor);
                const Color = getColorCode(data?.textColor);
                return (
                  <div
                    key={`subscribe-${index}`}
                    // className={`${styles.cpSubscribeHolder}`}
                  >
                    <button
                      className={`${styles.cpSubscribe}`}
                      // onClick={goToSubscribe}
                      style={{ backgroundColor: backgroundColor, color: Color }}
                    >
                      <img
                        src={`${ImageConfig?.card?.kingCore}`}
                        alt="kingCore"
                      />
                      {data?.value}
                    </button>
                  </div>
                );
              }

              if (data?.markerType === "rent") {
                const backgroundColor = getColorCode("XX" + data?.bgColor);
                const Color = getColorCode(data?.textColor);
                return (
                  <span
                    key={`rent-${index}`}
                    className={`${styles.labelRent} ${false && styles.labelRented}`}
                    style={{ backgroundColor: backgroundColor, color: Color }}
                  >
                    {data?.value}
                  </span>
                );
              }

              // Return null for markers that do not match any condition
              return null;
            })}
          </div>
          {cardData.display?.markers?.map((data, index) => {
            if (data?.markerType === "length") {
              const backgroundColor = getColorCode("XX" + data?.bgColor);
              const Color = getColorCode(data?.textColor);
              return (
                <span
                  key={`rent-${index}`}
                  className={`${styles.labelRent} ${styles.lengthDuration}`}
                  style={{ backgroundColor: backgroundColor, color: Color }}
                >
                  {data?.value}
                </span>
              );
            }
            // Return null for markers that do not match any condition
            return null;
          })}

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
                <h3
                  className={`${styles.main_title} ${styles.main_freeDm_title}`}
                >
                  {cardData.display.title}
                </h3>
                {/* <h3 className={`${styles.main_title} ${styles.main_title2}`}>
                  {cardData.display.title}{" "}
                </h3> */}
                <span className={styles.sm_title}>
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
                  )}{" "}
                  {cardData.display.subtitle1}
                </span>
                
                  <p className={`${styles.sm_title} ${!!cardData.display.subtitle3 && styles.sm_fm_title}`}>
                  {systemConfigs?.configs?.showViewsCountOption == "true" &&  <>{cardData.display.subtitle2}{" "}
                  {cardData.display.subtitle2 == 1
                    ? Custom_PosterText[localLang]?.View_text
                    : Custom_PosterText[localLang]?.views}
                  {""}</>}
                  {
                    systemConfigs?.configs?.showDaysAgoOption == "true" && <span className={systemConfigs?.configs?.showViewsCountOption == "true" ? styles.with_dot : ""}>
                    {timeStampToRelativeTime(cardData.display.subtitle3)}
                  </span>
                  }
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPoster;
