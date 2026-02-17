/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from "react";
import styles from "@/components/cards/card.module.scss";
import Image from "next/image";
import { ImageConfig } from "@/config/ImageConfig";
import { useRouter } from "next/router";
import { getImagePath } from "@/services/user.service";
import { appConfig } from "@/config/app.config";
import {
  getAbsolutePath,
  getNetworkIcon,
  getTemplatesList,
} from "@/services/user.service";
import { useStore } from "@/store/store";
import { FollowerPosterText } from "@/.i18n/locale";
import { setItem } from "@/services/local-storage.service";

const PurchasePoster = ({
  cardType = "",
  cardData,
  // cWidth,
  // CHeight,
  // openProgInfoPopUp,
  // loaderProp,
  // BadgeText,
  // sectionInfo,
  // removeCard,
  // item,
}) => {
  const {
    state: { localLang },
    dispatch,
  } = useStore();
  const router = useRouter();
  function getImagePath(path) {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  }

  const goNavTo = (e, dataChannel) => {
    // setItem("sendEvent", 1);
    e.stopPropagation();
    e.preventDefault();
    router.push(dataChannel?.target?.path);
  };
  return (
    <div
      key={cardType}
      className={`${styles.purchasePoster} ${cardType}  ${styles[cardType]}`}
    >
      {cardData?.map((channel) => (
        <div
          key={channel.id}
          className={styles.channelCard}
          onClick={(e) => goNavTo(e, channel)}
        >
          <div className={styles.info}>
            <div>
              <Image
                src={getImagePath(channel?.display?.imageUrl)}
                // loader={loaderProp}
                // alt={cardData.display.title}
                width={100}
                height={100}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
                }}
              />
            </div>
            <div className={styles.details}>
              <p
                className={`${styles.channelname} ${cardType == "mylikedvideos" && styles.channelnameFree}`}
              >
                {cardType == "mylikedvideos" && (
                  <p className={styles.youlike}>
                    {" "}
                    {FollowerPosterText[localLang].You_Liked_on}{" "}
                  </p>
                )}
                {channel?.display?.title}
              </p>
              {cardType != "mylikedvideos" && (
                <>
                  {/* <p className={styles.price}>{channel?.display?.parentName}</p>
                  <p className={styles.validDate}>{channel.validTill}</p> */}
                  <p className={styles.price}>{channel?.display?.subtitle1}</p>
                  <p
                    className={`${styles.validDate} ${channel.display?.subtitle2 === "Expired" ? styles.exp : ""}`}
                  >
                    {channel.display?.subtitle2}
                  </p>
                </>
              )}
            </div>
          </div>
          {cardType != "mylikedvideos" && (
            <div className={`${styles.arrow} arrowWhiteTeme`}>
              <img src={`${ImageConfig?.card?.rightArrowWhite}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PurchasePoster;
