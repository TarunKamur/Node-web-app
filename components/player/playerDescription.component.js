import styles from "@/components/player/player.module.scss";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useGetApiMutate from "@/hooks/useGetApidata";
import {
  PlayerDescriptionconstant,
  PopUpDataConst,
  TvshowDetailsconstant,
} from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { getCurrentTime, getPagePath } from "@/services/utility.service";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const SharePopup = dynamic(() => import("../popups/share/share-popup"));
import { getAbsolutePath } from "@/services/user.service";
import InnerHtmlRenderer from "../innerHtmlRenderer/InnerHtmlRenderer";
import React from "react";
import { SystemConfig } from "@/store/actions";
const OverlayPopupModal = dynamic(
  () => import("@/components/popups/overlay-popup/overlay-popup-modal")
);

const PlayerDescription = ({ playerMetaData }) => {
  const {
    state: { PageData, userDetails, localLang },
    dispatch,
  } = useStore();
  // console.log("PageData", PageData);
  const [popupData, setPopUpData] = useState({});
  const [detailsObj, setDetailsobj] = useState({});
  const { mutate: addFavourites, data: favouriteData } = useGetApiMutate();
  const [isloggedin, setIsLoggedIn] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showTvGuidebtn, setShowTvGuidebtn] = useState(false);
  const router = useRouter();
  const [setData, setSetData] = useState("");
  let details = {};
  const [vodChannel, setVodChannel] = useState({});
  const { mutate: addLoved, data: lovedData } = useGetApiMutate();
  const [detailsLikeObj, setDetailsLikeobj] = useState({});
  const [vodChannelBtn, setVodChannelBtn] = useState([
    {
      code: "Watchlist",
      text: PlayerDescriptionconstant[localLang]?.Watch_List,
      img: ImageConfig?.playerDescription?.plusGray,
      isShow: true,
    },
    {
      code: "Share",
      text: PlayerDescriptionconstant[localLang]?.Share,
      img: ImageConfig?.playerDescription?.shareIcon,
      isShow: true,
    },
    {
      code: "Like",
      text: PlayerDescriptionconstant[localLang]?.Like,
      img: ImageConfig?.playerDescription?.likeGray,
      isShow: true,
    },
    {
      code: "Report",
      text: PlayerDescriptionconstant[localLang]?.Report,
      img: ImageConfig?.playerDescription?.report,
      isShow: true,
    },
  ]);

  useEffect(() => {
    let setData = {};
    let vodDataDetails = {};
    const isFavourite = PageData?.pageButtons?.isFavourite;
    const showWatchlist = PageData?.pageButtons?.showFavouriteButton;
    detailsLikeObj.isFavourite =isFavourite;
    setDetailsLikeobj(detailsLikeObj);
    setDetailsobj({ ...detailsObj, isFavourite });

    playerMetaData?.content?.dataRows?.map((md) => {
      if (md.rowDataType === "content") {
        md.elements.map((res) => {
          if (res?.elementSubtype === "title") {
            setData["title"] = res?.data;
          }
          if (res?.elementType === "description") {
            setData["description"] = res?.data;
          }
          if (res?.elementSubtype === "subtitle") {
            let data = res?.data;
            data = data?.split("|");
            setData["subtitle"] = data;
          }
          if (res?.elementSubtype === "pgrating") {
            setData["pgrating"] = res?.data;
          }
          if (res?.elementSubtype === "imdb") {
            setData["imdb"] = res?.data;
          }
          if (res?.elementSubtype === "cast" && res?.elementType == "text") {
            setData["castcrew"] = res?.data;
          }
          if (
            res?.elementType === "image" &&
            res.elementSubtype != "vodChannelIcon"
          ) {
            setData["channel_img"] = getImagePath(res?.data);
          }
          if (
            res.elementSubtype == "vodChanneltitle" ||
            res.elementSubtype == "vodChannelDescription"
          ) {
            vodDataDetails[res.elementSubtype] = res.data;
          }

          if (res.elementSubtype == "vodChannelIcon") {
            res.data = getImagePath(res.data);
            vodDataDetails[res.elementSubtype] = res;
          }
          if (res.elementSubtype == "views") {
            setData.views = res;
          } else if (res.elementSubtype == "contentLikesCount") {
            setData.contentLikesCount = res;
          } else if (res.elementSubtype == "isContentLiked") {
            setData.isContentLiked = res;
          }
          if (
            res?.elementType == "tvguide" &&
            (res?.elementSubtype == "tvguide" || res?.elementSubtype == "")
          ) {
            setShowTvGuidebtn(true);
          }
        });
      }
    });
    if (PageData?.info?.attributes?.networkCode == "freedomtv") {
      vodDataDetails.networkCode = PageData?.info?.attributes?.networkCode;
    }

    
    setVodChannel(vodDataDetails);

    if (!setData["castcrew"]) {
      let castcrew = PageData.data.filter(
        (ele) =>
          ele.paneType == "section" &&
          ele.section.sectionInfo.dataType == "actor"
      );
      if (!!castcrew?.length) {
        let cw = castcrew[0].section.sectionData.data.map(
          (ele) => ele.display.title
        );
        if (!!cw.length) details.castcrew = cw.join();
      } else {
      }
    }
    likedFreedomtvChk(detailsLikeObj);
    watchoFreedomtv(detailsLikeObj);
    reportFreedomtvChk();

    setSetData(setData);
  }, [playerMetaData]);

  useEffect(() => {
    if (!!userDetails) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [userDetails]);
  const handleClose = () => {
    setPopUpData({});
  };
  const navigateToSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signin");
  };
  const shareDataSet = () => {
    let pop = {
      type: "share",
      isActive: true,
      targetpath: getPagePath(router.asPath),
      img: `${appConfig?.appLogo}`,
      closeTarget: handleClose,
      analyticsObj: { ...analyticsData() },
    };
    setPopUpData(pop);
  };
  const popupDataSet = () => {
    let pop = {
      type: "signin",
      isActive: true,
      title1:
        PlayerDescriptionconstant[localLang]
          ?.To_access_this_feature_please_sign_in,
      yesButton1: PlayerDescriptionconstant[localLang]?.Sign_In,
      yesButtonType: "primary",
      yesButtonTarget1: navigateToSignIn,
      noButton1: PlayerDescriptionconstant[localLang]?.Cancel,
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
      parentclassName: "addToFavourite",
    };
    setPopUpData(pop);
  };

  const detailsLikeObject = () => {
    const value = PageData?.pageButtons?.userLike?.isLiked;
    const showLike = PageData?.pageButtons?.userLike?.showLikeButton;
    // console.log("286", value);
    detailsLikeObj.isContentLiked = value;
    setDetailsLikeobj(detailsLikeObj);
    const dup = vodChannelBtn;
    if (!!value) {
      dup[2].text = PlayerDescriptionconstant[localLang]?.Liked;
      dup[2].img = ImageConfig?.playerDescription?.likeFillWhite;
      dup[2].isShow = showLike;
    }
    setVodChannelBtn(dup);
  };

  useEffect(() => {
    detailsLikeObject();
  }, []);

  useEffect(() => {
    if (favouriteData?.data?.status) {
      const action = detailsObj.isFavourite ? 2 : 1;
      detailsObj.isFavourite = action === 1;
      setDetailsobj({ ...detailsObj });
      if (PageData?.info?.attributes?.networkCode == "freedomtv") {
        if (action == 1) {
          sendEvent("watchlist", analyticsData());
        } else {
          sendEvent("remove_watchlist", analyticsData());
        }
      } else {
        sendEvent("favorite", analyticsData());
      }
      let apiData1= {
         message: favouriteData?.data?.response?.message,
      }
      if(PageData?.info?.attributes?.networkCode == "freedomtv"){
        apiData1.code = "freedom_tv";
      }
      dispatch({
        type: actions.NotificationBar,
        payload: apiData1,
      });
      if (Object.keys(vodChannel).length !== 0) {
        watchoFreedomtv(detailsObj);
      }
    }
  }, [favouriteData]);

  const addToFavourite = () => {
    if (!!isloggedin) {
      try {
        const action = detailsObj.isFavourite ? 2 : 1;
        const apiUrl =
          process.env.initJson["api"] +
          `/service/api/auth/user/favourite/item?path=${router.asPath.slice(1)}&action=${action}`;
        addFavourites(apiUrl);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      popupDataSet();
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const likeAnalyticsData = () => {
    let tempObj = {
      rail_name: "-1",
      header_button: PageData?.info?.path || path,
      asset_title: setData?.title,
      media_type: PageData?.info?.attributes?.mediaContentType || "-1",
      genre: PageData?.info?.attributes?.genre || "-1",
      channel_partner: PageData?.info?.attributes?.networkName || "-1",
      channel_id: PageData?.info?.attributes?.channelId,
      content_id: PageData?.info?.attributes?.id,
      time: getCurrentTime(),
      deviceType: "web",
      cpCode: "freedom",
    };
    if (PageData?.info?.pageAttributes?.episodeSeqNo) {
      cardObj["episode_number"] = PageData?.info?.pageAttributes?.episodeSeqNo;
    }
    if (PageData?.info?.pageAttributes?.tvShowName) {
      cardObj["series_name"] = PageData?.info?.pageAttributes?.tvShowName;
    }
    if (PageData?.info?.pageAttributes?.seasonSeqNo) {
      cardObj["season_number"] = PageData?.info?.pageAttributes?.seasonSeqNo;
    }
    return tempObj;
  };

  const analyticsData = () => {
    if (PageData?.info?.attributes?.networkCode == "freedomtv") {
      let cardObj = {
        // rail_name: railName || "-1",
        header_button: PageData?.info?.path || path,
        asset_title: setData?.title,
        media_type: PageData?.info?.attributes?.mediaContentType || "-1",
        genre: PageData?.info?.attributes?.genre || "-1",
        series_name: "-1",
        channel_partner: PageData?.info?.attributes?.networkName || "-1",
        channel_id: PageData?.info?.attributes?.channelId,
        content_id: PageData?.info?.attributes?.id,
        time: getCurrentTime(),
        cpCode: "freedom",
      };
      if (PageData?.info?.attributes?.tvShowName) {
        cardObj.series_name = PageData?.info?.attributes?.tvShowName;
      }
      return cardObj;
    }
    let cardObj = {
      asset_title: setData?.title,
      banner_title: setData?.title,
      media_type: PageData?.info?.pageAttributes?.mediaContentType || "-1",
      genre: PageData?.info?.pageAttributes?.genre || "-1",
      channel_partner: PageData?.info?.pageAttributes?.networkName || "-1",
    };
    if (PageData?.info?.pageAttributes?.tvShowName) {
      cardObj["series_name"] = PageData?.info?.pageAttributes?.tvShowName;
    }
    if (PageData?.info?.pageAttributes?.seasonSeqNo) {
      cardObj["season_number"] = PageData?.info?.pageAttributes?.seasonSeqNo;
    }
    if (PageData?.info?.pageAttributes?.episodeSeqNo) {
      cardObj["episode_number"] = PageData?.info?.pageAttributes?.episodeSeqNo;
    }
    return cardObj;
  };

  const navigateToTvGuide = () => {
    router.push("/tvguide");
  };

  const getImagePath = (path) => {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  };

  const watchoFreedomtv = (details) => {
    const vodData = vodChannelBtn;
    if (details.isFavourite) {
      vodData[0].text = PlayerDescriptionconstant[localLang]?.Remove_Watch_List;
      vodData[0].img = ImageConfig?.playerDescription?.watchedTick;
    } else {
      vodData[0].text = PlayerDescriptionconstant[localLang]?.Watch_List;
      vodData[0].img = ImageConfig?.playerDescription?.plusGray;
    }
    setVodChannelBtn(vodData);
  };

  const vodChannelBtnFn = (e, data) => {
    e.preventDefault();
    console.log(">>>>>vodChannelBtnFn", data);
    if (data.code == "Report") {
      if (!!isloggedin) {
        let pop = {
          type: "ReportPopup",
          isActive: true,
          title1: PopUpDataConst[localLang]?.Report_Video || "Report Video",
          title2: "",
          yesButton1: PopUpDataConst[localLang]?.Submit || "Submit",
          yesButtonType: "primary",
          yesButtonTarget1: onsubmitreport,
          noButton1: PopUpDataConst[localLang]?.Cancel || "Cancel",
          noButtontarget1: handleClose,
          noButtonType: "secondary",
          close: true,
          closeTarget: handleClose,
          parentclassName: "reportPopUp",
        };
        if (PageData?.info?.attributes?.networkCode == "freedomtv") {
          pop.analyticsFn = reportAnalyticsData;
        }
        setPopUpData(pop);
      } else {
        popupDataSet();
      }
    } else if (data.code == "Share") {
      let pop = {
        type: "share",
        isActive: true,
        targetpath: getPagePath(router.asPath),
        img: `${ImageConfig?.logo}`,
        closeTarget: handleClose,
        // analyticsObj,
      };
      setPopUpData(pop);
    } else if (data.code == "Like") {
      favRemove();
    } else if (data.code == "Watchlist" || data.code == "Remove Watchlist") {
      addToFavourite();
    }
  };
  const onsubmitreport = (data) => {
    console.log(data, "<<<<<<data onsubmitreport");
  };

  const reportAnalyticsData = (reportVideo) => {
    const path = router.asPath;
    const tempObj = {
      // rail_name: railName || "-1",
      banner_title: "",
      header_button: PageData?.info?.path || path,
      asset_title: setData?.title,
      media_type: PageData?.info?.attributes?.mediaContentType || "-1",
      genre: PageData?.info?.attributes?.genre || "-1",
      channel_partner: PageData?.info?.attributes?.networkName || "-1",
      channel_id: PageData?.info?.attributes?.channelId,
      report_video: reportVideo || "-1",
      paid_content: "",
    };
    if (PageData?.info?.attributes?.seasonSeqNo) {
      tempObj.season_number = PageData?.info?.attributes?.seasonSeqNo;
    }
    if (PageData?.info?.attributes?.episodeSeqNo) {
      tempObj.episode_number = PageData?.info?.attributes?.episodeSeqNo;
    }
    if (PageData?.info?.attributes?.tvShowName) {
      tempObj.series_name = PageData?.info?.attributes?.tvShowName;
    }
    return tempObj;
  };

  const likedFreedomtvChk = (data) => {
    // console.log(!data.isContentLiked);
    if (PageData?.pageButtons?.userLike?.showLikeButton == true) {
      if (!data.isContentLiked) {
        vodChannelBtn[2].text = PlayerDescriptionconstant[localLang]?.Like;
        vodChannelBtn[2].img = ImageConfig?.playerDescription?.likeGray;
      } else {
        vodChannelBtn[2].text = PlayerDescriptionconstant[localLang]?.Liked;
        vodChannelBtn[2].img = ImageConfig?.playerDescription?.likeFillWhite;
      }
    } else {
      vodChannelBtn[2].isShow = false;
    }
    setVodChannelBtn(vodChannelBtn);
  };
  const reportFreedomtvChk = () => {
    if (PageData?.pageButtons?.userReport?.showReportButton == true) {
    } else {
      vodChannelBtn[3].isShow = false;
    }
    setVodChannelBtn(vodChannelBtn);
  };
  const favRemove = (e) => {
    if (!!userDetails) {
      console.log("789", detailsLikeObj.isContentLiked);
      const action = detailsLikeObj.isContentLiked ? 2 : 1;
      console.log("791", action);
      const apiUrl =
        process.env.initJson.api +
        `/service/api/auth/user/like?path=${router.asPath.slice(1)}&action=${action}`;
      setVodChannelBtn(vodChannelBtn);
      let hasImgStatusBeenDispatched = false;
      addLoved(apiUrl, {
        onSuccess: (response) => {
          sendEvent(
            detailsLikeObj.isContentLiked ? "unlike" : "like",
            likeAnalyticsData()
          );
          if (response?.data?.status) {
            let notificData = {
              message: response?.data?.response?.message,
              code: "freedom_tv",
            };
            let windowWidth = window.innerWidth;
            if (windowWidth <= 991 && !hasImgStatusBeenDispatched) {
              notificData = {
                ...notificData,
                imgStatus: ImageConfig?.payments?.subscriptionSuccessful,
              };
              hasImgStatusBeenDispatched = true;
            }
            dispatch({
              type: actions.NotificationBar,
              payload: notificData,
            });
            const dupDetailsLikeObj = detailsLikeObj;
            dupDetailsLikeObj.isContentLiked =
              !dupDetailsLikeObj.isContentLiked;
            setDetailsLikeobj(dupDetailsLikeObj);
            likedFreedomtvChk(dupDetailsLikeObj);
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
      });
    } else {
      popupDataSet();
    }
  };

  return (
    <div
      className={`${styles.player_data} ${PageData?.info?.attributes?.networkCode == "freedomtv" && styles.player_datafreedom}`}
    >
      <div className={`${styles.channel_desc} `}>
        {setData && (
          <div className={` ${styles.headerTitle} `}>
            {setData?.channel_img &&
              PageData?.info?.attributes?.networkCode != "freedomtv" && (
                <>
                  <img
                    className={` ${styles.channel_logo}`}
                    src={setData?.channel_img}
                    alt=""
                  />
                </>
              )}
            <div className={`${styles.player_desc_left}`}>
              <h1 className={`${styles.title}`}>{setData?.title}</h1>
              <span className={`${styles.subtitleDup}`}>
                {PageData?.info?.attributes?.networkCode === "freedomtv" &&
                  setData.pgrating && (
                    <span className={`${styles.pgRatingFreedom}`}>
                      {setData.pgrating}
                    </span>
                  )}
                <span className={`${styles.subtitle}`}>
                  {setData?.subtitle?.join(" | ")}
                </span>
                {setData?.pgrating &&
                  PageData?.info?.attributes?.networkCode != "freedomtv" && (
                    <span className={`${styles.pgrating}`}>
                      {setData?.pgrating}
                    </span>
                  )}
                {setData?.imdb && (
                  <span className={`${styles.imdb}`}>
                    <img
                      alt="imdb"
                      src={ImageConfig?.playerDescription?.imdb}
                      loading="lazy"
                      decoding="async"
                    />
                    {setData?.imdb}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
        {Object.keys(vodChannel).length == 0 && (
          <div className={`${styles.player_desc_right}`}>
            <div
              className={`${PageData.pageButtons.showFavouriteButton && PageData.shareInfo.isSharingAllowed ? `${styles.divider}` : ""}`}
            >
              <div className={`${styles.fav}`}>
                {PageData.pageButtons.showFavouriteButton && (
                  <span
                    key="fav-button"
                    className={` ${styles.button} `}
                    onClick={() => addToFavourite()}
                  >
                    {detailsObj.isFavourite ? (
                      <>
                        <img
                          src={`${ImageConfig?.playerDescription?.watchedTick}`}
                          alt="remove-watchlist"
                        />
                        <span>
                          {PlayerDescriptionconstant[localLang].Favourited}
                          {/* {
                            PlayerDescriptionconstant[localLang]
                              .Remove_Watch_List
                          } */}
                        </span>{" "}
                      </>
                    ) : (
                      <>
                        <img
                          src={`${ImageConfig?.playerDescription?.plusGray}`}
                          alt="watchlist"
                        />
                        <span>
                          {PlayerDescriptionconstant[localLang].Favourite}
                          {/* {PlayerDescriptionconstant[localLang].Watch_List} */}
                        </span>
                      </>
                    )}
                  </span>
                )}
              </div>
              {PageData.shareInfo.isSharingAllowed && (
                <div className={`${styles.share}`}>
                  <span
                    className={`${styles.button}`}
                    onClick={() => shareDataSet()}
                  >
                    <img
                      src={`${ImageConfig?.playerDescription?.share}`}
                      className={`${styles.img}`}
                    />
                    <span className={`${styles.fancy_tool_tip}`}>
                      {PlayerDescriptionconstant[localLang].Share}
                    </span>
                  </span>
                </div>
              )}
            </div>
            {/* {PageData.shareInfo.isSharingAllowed && (
              <div className={`${styles.share}`}>
                <span
                  className={`${styles.button}`}
                  onClick={() => shareDataSet()}
                >
                  <img
                    src={`${ImageConfig?.playerDescription?.share}`}
                    alt="share"
                    className={`${styles.img}`}
                  />
                  <span className={`${styles.fancy_tool_tip}`}>
                    {PlayerDescriptionconstant[localLang].Share}
                  </span>
                </span>
              </div>
            )} */}
          </div>
        )}
        {Object.keys(vodChannel).length !== 0 && (
          <div
            className={` ${styles.vodLikeWatch} ${styles.vodLikeWatchBTN}  ${styles.web}`}
          >
            {vodChannelBtn.map((value) => {
              if (!!value.isShow) {
                return (
                  <div
                    className={` ${styles.vodLike}`}
                    onClick={(e) => vodChannelBtnFn(e, value)}
                  >
                    <img src={value.img} alt="like-thin" />
                    <span>{value.text}</span>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
      {setData.description && (Object.entries(vodChannel).length === 0) && (
        <div className={`${styles.channel_desc_new}`}>
          {/* <p className={`${styles.description}`} onClick={toggleDescription}>
            {showFullDescription
              ? setData.description
              : setData.description?.length > 200
                ? setData.description.slice(0, 200) + "... "
                : setData.description}
            {setData.description?.length > 200 && (
              <span className={`${styles.readMore}`}>
                {showFullDescription ? " Show Less" : " Read More"}
              </span>
            )}
          </p> */}
          <InnerHtmlRenderer
            data={setData.description}
            isDataTruncate={true}
            customClass={styles.description}
            styles={styles}
          />
        </div>
      )}
      {(showTvGuidebtn || !!setData.castcrew) && (
        <>
          <div className={`${styles.castDetails}`}>
            {showTvGuidebtn && (
              <button onClick={navigateToTvGuide}>
                {PlayerDescriptionconstant[localLang].explore_tv_guide}
              </button>
            )}
            {!!setData.castcrew && (
              <p>
                <span>{PlayerDescriptionconstant[localLang].Cast} :</span>
                {setData?.castcrew}
              </p>
            )}
          </div>
        </>
      )}

      {!!vodChannel && !(Object.entries(vodChannel).length === 0) && (
        <div className={` ${styles.vodLikeWatch} ${styles.vodLikeViews}`}>
         {
          SystemConfig?.configs?.showViewsCountOption == "true" &&  <div className={` ${styles.vodLike}`}>
          <img
            src={`${ImageConfig?.playerDescription?.solarEye}`}
            alt="like-thin"
            className={`${styles.img}`}
          />{" "}
          {setData?.views?.data}{" "}
          {setData?.views?.data == 1
            ? TvshowDetailsconstant[localLang]?.View_text
            : TvshowDetailsconstant[localLang]?.Views_text}
        </div>
         }
          <div className={` ${styles.vodLike}`}>
            <img
              src={`${ImageConfig?.playerDescription?.likeGray}`}
              className={`${styles.img}`}
              alt="watchEye"
            />{" "}
            {setData?.contentLikesCount?.data}{" "}
            {setData?.contentLikesCount?.data == 1
              ? TvshowDetailsconstant[localLang]?.Like
              : TvshowDetailsconstant[localLang]?.Likes}
          </div>
        </div>
      )}
      {!!vodChannel && !(Object.entries(vodChannel).length === 0) && (
        <div
          className={` ${styles.vodLikeWatch} ${styles.vodLikeWatchBTN}  ${styles.mobile}`}
        >
          {vodChannelBtn.map((value) => {
            return (
              <div
                className={` ${styles.vodLike}`}
                onClick={(e) => vodChannelBtnFn(e, value)}
              >
                <img src={value.img} alt="like-thin" />
                <span>{value.text}</span>
              </div>
            );
          })}
        </div>
      )}
      {!!vodChannel && !(Object.entries(vodChannel).length === 0) && (
        <>
          <div div className={` ${styles.vodchannelFreedomtv}`}>
            <div className={` ${styles.parentIcon}`}>
              {!!vodChannel?.vodChannelIcon?.data && (
                <a
                  onClick={() =>
                    vodChannel?.vodChannelIcon?.target
                      ? navigateTo(vodChannel.vodChannelIcon.target)
                      : null
                  }
                >
                  <img
                    className={`${styles.card_epg_image1} ${styles.abs_image}`}
                    src={vodChannel?.vodChannelIcon?.data}
                    alt={vodChannel.vodChannelIcon.title}
                  />
                </a>
              )}

              {vodChannel?.vodChanneltitle}
            </div>
            <div className={` ${styles.vodChannelDescription}`}>
              {/* {vodChannel?.vodChannelDescription} */}
              <InnerHtmlRenderer
                data={vodChannel?.vodChannelDescription}
                isDataTruncate={true}
                customClass={styles.description}
                styles={styles}
              />
            </div>
          </div>
        </>
      )}

      {popupData.isActive &&
        popupData.type != "favourite" &&
        popupData.type != "share" &&
        popupData.type != "ReportPopup" && (
          <PopupModal popupData={popupData}></PopupModal>
        )}
      {popupData.isActive && popupData.type === "share" && (
        <SharePopup popupData={popupData}></SharePopup>
      )}
      {popupData.isActive && popupData.type == "ReportPopup" && (
        <OverlayPopupModal popupData={popupData} />
      )}
    </div>
  );
};

export default PlayerDescription;
