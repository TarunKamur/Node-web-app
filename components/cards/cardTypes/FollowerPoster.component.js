/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useEffect, useState, useRef } from "react";
import { actions, useStore } from "@/store/store";
import Image from "next/image";
import styles from "@/components/cards/card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useRouter } from "next/router";
import {
  getAbsolutePath,
  getNetworkIcon,
  getTemplatesList,
} from "@/services/user.service";
import { FollowerPosterText } from "@/.i18n/locale";
import { setItem } from "@/services/local-storage.service";

const FollowerPoster = ({
  cardType,
  cardData,
  UnfollowApiHit='',
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
  const [showUnFollow, setUnFollow] = useState(false);
  const [showUnFollowIndex, setUnFollowindex] = useState(null);
  const { mutate: addFavourites, data: favouriteData } = usePostApiMutate();
  const [cardsData, setCardsData] = useState(cardData);
  const unFollowRef = useRef(null);

  const router = useRouter();
  useEffect(() => {
    if (window.innerWidth <= 991) {
      if (showUnFollow) {
        unFollowRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showUnFollow]);

  useEffect(() => {
    if (!!unFollowRef.current)
      setTimeout(() => {
    if( unFollowRef.current && unFollowRef.current?.style)
        unFollowRef.current.style.height = `${window.innerHeight}px`;
      }, 1000);
  }, [unFollowRef, showUnFollowIndex]);

  const unFollowHandler = (chalData, index) => {
    let windowWidth = window.innerWidth;
    if (windowWidth <= 991) {
      setUnFollow(!showUnFollow);
      setUnFollowindex(index);

      // unfollowApiHit('channel', index, "unfollow");
    }
  };

  const unfollowApiHit = (chalData, index, action) => {
    // const action = "unfollow";
    const url =
      process.env.initJson["api"] + `/service/api/auth/${action}/channel`;
    const apiData = {
      contentPath: cardsData[index].target.path,
    };
    addFavourites(
      { url, apiData },
      {
        onSuccess: (response) => {
          if (response?.data?.status) {
            const notificationData = {
              message: response?.data?.response?.message,
              code: "freedom_tv",
            };
            dispatch({
              type: actions.NotificationBar,
              payload: notificationData,
            });
            let dubcards = cardsData;
            if (action == "follow") {
              dubcards[index].metadata.isUserFollowing.value = "true";
            } else {
              dubcards[index].metadata.isUserFollowing.value = "false";
            }
            UnfollowApiHit(true);
            setCardsData(dubcards);
          } else {
            const notificationData = {
              message: response?.data?.error?.message,
              code: "freedom_tv",
            };
            dispatch({
              type: actions.NotificationBar,
              payload: notificationData,
            });
          }
        },
      }
    );
  };
  function getImagePath(path) {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  }

  const goNavTo = (e, dataChannel) => {
    // setItem("sendFollowedEvent",1)
    e.preventDefault();
    router.push(dataChannel?.target?.path);
  };

  return (
    <div  key={cardType}
      className={`${styles.purchasePoster} ${cardType}  ${styles[cardType]}`}
    >
      {cardsData?.map((channel, index) => (
        <div
          key={`${index}_${channel?.display?.title}`}
          className={styles.channelCard}
        >
          <div className={styles.info}>
            <Image
              src={getImagePath(channel?.display?.imageUrl)}
              alt={channel?.display?.title}
              width={100}
              height={100}
              onClick={(e) => goNavTo(e, channel)}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.srcset = `${ImageConfig?.defaultMoviePoster}`;
              }}
            />
            <div className={styles.details}>
              <p className={styles.channelname}>{channel?.display?.title}</p>
              {/* <p className={styles.price}>{channel.price}</p> */}
              <p className={styles.validDate}>
                {channel?.metadata?.contentFollowersCount?.value}{" "}
                {FollowerPosterText[localLang].Followers}
              </p>
            </div>
          </div>
          <div
            className={styles.arrow}
            key={`${channel?.metadata?.isUserFollowing?.value}_${index}_${channel?.display?.title}`}
          >
            {channel?.metadata?.isUserFollowing?.value == "true" ? (
              <div
                className={styles.more_img}
                onClick={(e) => {
                  e.stopPropagation();
                  unFollowHandler(channel, index);
                }}
              >
                <img
                  src={`${ImageConfig?.card?.threeDots}`}
                  alt={channel.name}
                  className={`${styles.img}`}
                />
                <button
                  className={styles.unFollow}
                  onClick={(e) => {
                    e.preventDefault(); // e.stopPropagation();
                    unfollowApiHit(channel, index, "unfollow");
                  }}
                >
                  <img src={`${ImageConfig?.card?.userUnFollow}`} />{" "}
                  {FollowerPosterText[localLang].Unfollow}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    unfollowApiHit(channel, index, "follow");
                  }}
                >
                  {FollowerPosterText[localLang].Follow}
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {showUnFollow && (
        <div
          className={`${styles.unFollowPopup}`}
          style={{ height: `${window.innerHeight}px` }}
          ref={unFollowRef}
          onClick={(e) => {
            e.stopPropagation();
            setUnFollow(!showUnFollow);
          }}
        >
          <div
            className={`${styles.unFollowChild}`}
            onClick={(e) => {
              e.stopPropagation();
              setUnFollow(!showUnFollow);
              e.preventDefault(); // e.stopPropagation();
              unfollowApiHit("channel", showUnFollowIndex, "unfollow");
            }}
          >
            <img src={`${ImageConfig?.card?.userUnFollow}`} />
            <p>Unfollow</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowerPoster;
