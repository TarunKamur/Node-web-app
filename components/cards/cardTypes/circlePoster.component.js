import React from "react";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import { getImagePath } from "@/services/user.service";

const CirclePoster = ({
  BadgeText,
  cardType,
  cardData,
  cWidth,
  CHeight,
  loaderProp,
  openProgInfoPopUp,
}) => {
  const goToSubscribe = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Subscribe To >>>", cardData);
  };

  const getColorCode = (color) => {
    if (!!color) {
      try {
        return "#" + color.substring(2);
      } catch (e) {}
    } else {
      return null;
    }
  };

  return (
    <div
      className={`${styles.circle_poster} ${cardType}`}
      onClick={() => openProgInfoPopUp(cardData)}
      style={{ width: `${cWidth}px` || "100%" }}
    >
      <div className={`${styles.circle_posterImg}`}>
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

        {cardData?.display?.markers.length !== 0 &&
          cardData?.display?.markers.map((data, index) => {
            if (data?.markerType === "subscribe") {
              const backgroundColor = getColorCode("XX" + data?.bgColor);
              const Color = getColorCode(data?.textColor);
              return (
                <div
                  key={`subscribe-${index}`}
                  className={`${styles.cpSubscribeHolder}`}
                >
                  <button
                    className={`${styles.cpSubscribe}`}
                    onClick={goToSubscribe}
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
            } else if (data?.markerType === "checkMark") {
              return (
                <img
                  className={`${styles.tickMark} `}
                  src={`${ImageConfig?.card?.checkMark}`}
                  alt="kingCore"
                />
              );
            }
          })}

        {/* {(markers.length !== 0) && (
          <div className={`${styles.cpSubscribeHolder}`}>
            <button className={`${styles.cpSubscribe}`} onClick={goToSubscribe} style={{backgroundColor:backgroundColor, color: Color}}>
              <img src={`${ImageConfig?.card?.kingCore}`} alt="kingCore" />{" "}
              {subscribeMarker?.value}
            </button>
          </div>
        )} */}
      </div>
      {!!cardData?.display?.title && (
        <h3 className={`${styles.artist_title}`}>{cardData?.display?.title}</h3>
      )}
      {!!cardData?.display?.badgeMarker && (
        <BadgeText badgeMarker={cardData.display.badgeMarker} />
      )}
    </div>
  );
};

export default CirclePoster;
