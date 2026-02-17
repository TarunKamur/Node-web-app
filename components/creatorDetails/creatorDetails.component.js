import React, { useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import Scrollbar from "react-scrollbars-custom";
import styles from "@/components/creatorDetails/creatorDetails.module.scss";
import { getAbsolutePath } from "@/services/user.service";
import { useRouter } from "next/router";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import {
  TvshowDetailsconstant,
  signupconstant,
  DeviceLogoutConstant,
} from "@/.i18n/locale";
import {
  getPagePath,
  getPlansDetails,
  getResolution,
} from "@/services/utility.service";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import { postRecoData } from "@/services/myReco.service";
import ShakaBannerVideo from "../bannersV2/ShakaBannerVideo.component";
const OverlayPopupModal = dynamic(
  () => import("@/components/popups/overlay-popup/overlay-popup-modal")
);
import { browserName } from "react-device-detect";
import SubscrptionModal from "../popups/subscription-popup/subscriptionModal-modal";
import { getCurrentTime } from "@/services/utility.service";
import { deleteItem, getItem, setItem } from "@/services/local-storage.service";

const PopupModal = dynamic(
  () => import("@/components/popups/generic/popup-modal")
);
const SharePopup = dynamic(() => import("../popups/share/share-popup"));
const CreatorDetails = () => {
  const {
    state: { PageData, userDetails, localLang, navigateFrom },
    dispatch,
  } = useStore();
  const [detailsObj, setDetailsobj] = useState({});
  const [popupData, setPopUpData] = useState({});
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isloggedin, setIsLoggedIn] = useState(null);
  const [contentPath, setContentPath] = useState("");
  const [trailerStreamUrl, setTrailerStreamUrl] = useState("");
  const { mutate: addFavourites, data: favouriteData } = usePostApiMutate();
  const router = useRouter();
  const { mutate: deeplinkingdata, data: deepResponse } = useGetApiMutate();
  const { mutate: mutateGetStreamData, data: streamDataResponse } =
    useGetApiMutate();
  const { mutate: mutateUnSubscribe, data: unSubscribedData } =
    usePostApiMutate();
  const [follow, setFollow] = useState(false);

  useEffect(() => {
    if (!!deepResponse?.data) {
      if (!!deepResponse?.data?.status) {
        let dL = getDeeplinkInfo(deepResponse?.data.response);
        if (browserName.includes("Safari")) {
          window.location.href = dL;
        } else {
          window.open(dL);
        }
        postRecoData({ onWatchTimer: 1, contentPath });
        // if (!handle) {
        //   window.location.href = dL;
        // }
      } else if (
        deepResponse?.data?.error &&
        deepResponse?.data?.error?.code === 401
      ) {
      } else if (
        deepResponse?.data?.error &&
        deepResponse?.data?.error?.code === 405
      ) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: deepResponse?.data?.error?.message },
        });
      } else {
        console.warn(deepResponse?.data?.error);
      }
    } else {
    }
    // to handle mobile screen
    window.addEventListener("resize", handleResize);

    // removing event once component is unmounted
    return () => window.removeEventListener("resize", handleResize);
  }, [deepResponse]);

  useEffect(() => {
    detailObject();
    // const newSectionData
  }, [PageData]);

  useEffect(() => {
    if (!!userDetails) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [userDetails]);

  useEffect(() => {
    if (streamDataResponse?.data?.response?.streams?.[0]?.url) {
      setTimeout(() => {
        setTrailerStreamUrl(
          streamDataResponse?.data?.response?.streams[0]?.url
        );
        handleResize();
      }, 3000);
    }
  }, [streamDataResponse]);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const analyticsData = () => {
    let cardObj = {
      asset_title: detailsObj.title,
      banner_title: detailsObj.title,
      media_type: PageData?.info?.attributes?.mediaContentType || "-1",
      genre: PageData?.info?.attributes?.genre || "-1",
      channel_partner: PageData?.info?.attributes?.networkName || "-1",
      ...getPlansDetails(true),
    };
    if (PageData?.info?.attributes?.tvShowName) {
      cardObj.series_name = PageData?.info?.attributes?.tvShowName;
    }
    if (PageData?.info?.attributes?.seasonSeqNo) {
      cardObj.season_number = PageData?.info?.attributes?.seasonSeqNo;
    }
    if (PageData?.info?.attributes?.episodeSeqNo) {
      cardObj.episode_number = PageData?.info?.attributes?.episodeSeqNo;
    }
    return cardObj;
  };

  const setContentIdChannelId = () => {
    if (!!PageData) {
      setItem(
        "channel-id-order-summary",
        PageData?.info?.attributes?.channelId
      );
      setItem("content-id-order-summary", "-1");
    }
  };

  const detailObject = () => {
    let details = {};
    let bgImage = PageData.data.map((data) => {
      if (data.paneType === "content") {
        let bg = data.content.backgroundImage;
        details.title = data.content.title;
        details.BgImage = getImagePath(bg);
      }
    });
    let subtitle = PageData?.data.map((Content) => {
      Content.content?.dataRows.map((dataRow) => {
        dataRow.elements.map((element) => {
          if (element.elementSubtype == "partnerIcon") {
            details.partnerIcon = getImagePath(element.data);
          }
          if (element.elementSubtype === "subtitle") {
            details.subtitle = element.data;
          }
          if (element.elementSubtype === "pgrating") {
            details.pgrating = element.data;
          }
          if (element.elementSubtype === "imdb") {
            details.imdb = element.data;
          }
          if (element.elementSubtype === "cast") {
            details.castcrew = element.data;
          }
          if (element.elementSubtype === "resume") {
            element.seekedValue = getSeekValue(
              PageData.info.attributes.watchedPosition
            );
          }

          if (element.elementSubtype === "contentFollowersCount") {
            details.contentFollowersCount = element.data;
            // const eventInvoking = getItem("sendFollowedEvent") || 0;
            // if (!!eventInvoking) {
            //   sendEvent("followed_channel_list", {
            //     followed_channel_count: element.data,
            //     cpCode: "freedom",
            //   });
            //   deleteItem("sendFollowedEvent");
            // }
          }
          if (element.elementSubtype === "subscribersCount") {
            details.subscribersCount = element.data;
            // const eventInvoking = getItem("sendEvent") || 0;
            // if (!!eventInvoking) {
            //   sendEvent("subscribed_channel_list", {
            //     subscribe_channel_count: element.data,
            //     cpCode: "freedom",
            //   });
            //   deleteItem("sendEvent");
            // }
          }
          if (element.elementSubtype === "follow") {
            details.followData = element;
          }
          if (element.elementSubtype === "unsubscribe") {
            details.unsubscribe = element;
          }
        });
      });
    });
    let Buttons = PageData?.data.map((Content) => {
      Content.content?.dataRows.map((dataRow) => {
        if (dataRow.rowDataType === "button") {
          details.buttons = dataRow;
        }
      });
    });
    let Description = PageData?.data.map((Content) => {
      Content.content?.dataRows.map((dataRow) => {
        dataRow.elements.map((element) => {
          if (element.elementType === "description") {
            details.description = element.data;
          } else if (element.elementType == "text") {
            if (element.elementSubtype == "rentalinfo") {
              details.rentalinfo = element.data;
            } else if (element.elementSubtype == "expiryInfo") {
              details.expiryInfo = element.data.split("@");
            }
          }
        });
      });
    });
    // castcrew
    let castcrew = PageData.data.filter(
      (ele) =>
        ele.paneType == "section" && ele.section.sectionInfo.dataType == "actor"
    );
    if (!!castcrew?.length) {
      let cw = castcrew[0].section.sectionData.data.map(
        (ele) => ele.display.title
      );
      if (!!cw.length) details.castcrew = cw.join();
    }
    // fav
    details.showFavouriteButton = PageData.pageButtons?.showFavouriteButton;
    details.isFavourite = PageData.pageButtons?.isFavourite;
    fetchMovieTrailer(details);
    setDetailsobj(details);

    setFollow(
      details?.followData?.properties?.isUserFollowing == "true" ? true : false
    );
  };

  const getSeekValue = (value) => {
    try {
      if (value != "0" && value != "1") {
        var intval = parseFloat(value) * 100;
        var fval = intval.toString().substring(0, 2);
        return parseInt(fval);
      } else if (value != "1") {
        return 100;
      } else {
        return 0;
      }
    } catch (e) {}
  };
  const fetchMovieTrailer = (details) => {
    try {
      const trailerElement = details?.buttons?.elements.find(
        (el) => el.elementSubtype === "trailer"
      );
      if (trailerElement?.target) {
        const { api } = process.env.initJson;
        const url = `${api}/service/api/v1/page/stream?path=${trailerElement?.target}&stream_type=trailer`;

        mutateGetStreamData(url);
      }
    } catch (error) {
      console.error("Error fetching movie trailer:", error);
    }
  };

  function getImagePath(path) {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  }

  const navigateToSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signin");
  };

  const navigateToSignUp = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    handleClose();
    router.push("/signup");
  };

  const handleClose = () => {
    setPopUpData({});
  };

  const popupDataSet = () => {
    let pop = {
      type: "signin",
      isActive: true,
      title1:
        TvshowDetailsconstant[localLang]?.To_access_this_feature_please_sign_in,
      yesButton1: TvshowDetailsconstant[localLang]?.Sign_In,
      yesButtonType: "primary",
      yesButtonTarget1: navigateToSignIn,
      noButton1: TvshowDetailsconstant[localLang]?.Cancel,
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const navigateTo = (data, e) => {
    e.preventDefault();
    let analyticsObj = analyticsData();
    console.log(">>datadata>", data);
    let type = data.elementSubtype;
    setContentPath(data.target);
    if (type === "Share") {
      let pop = {
        type: "share",
        isActive: true,
        targetpath: router.asPath,
        img: `${ImageConfig?.logo}`,
        closeTarget: handleClose,
        analyticsObj,
      };
      setPopUpData(pop);
      sendEvent("share", analyticsObj);
    } else if (type == "watchnow" || type == "watch_latest_episode") {
      sendEvent("play_button_clicked", analyticsObj);
      if (data?.properties?.isDeeplinking === "true") {
        let url =
          process.env.initJson.api +
          `/service/api/v1/page/deeplink?path=${data.target}`;
        deeplinkingdata(url);
      } else {
        router.push(data.target);
      }
    } else if (type === "subscribe") {
      if (data?.properties?.showPopUp === "true") {
        let pop = {
          type: "payment",
          isActive: data?.properties?.showPopUp === "true",
          topImg: data?.properties?.showPopUp === "true",
          topImgValue:
            "http://mobond.yuppcdn.net/cf1/static/slt/images/payment-failure.svg",
          title1: data?.properties?.title,
          title2: data?.properties?.subtitle,
          yesButtonTarget1: handleClose,
          yesButton1: "Cancel",
          yesButtonType: "primary",
          close: true,
          closeTarget: handleClose,
        };
        setPopUpData(pop);
      } else {
        dispatch({ type: actions.navigateFrom, payload: router.asPath });
        setContentIdChannelId();
        router.push(`plans/subscribe?_subscribe=${router.asPath.slice(1)}`);
      }
    } else if (type == "resume") {
      sendEvent("play_button_clicked", analyticsObj);
      if (data?.properties?.isDeeplinking === "true") {
        let url =
          process.env.initJson.api +
          `/service/api/v1/page/deeplink?path=${data.target}`;
        deeplinkingdata(url);
      } else {
        router.push(data.target);
      }
    } else if (type === "unsubscribe") {
      openUnSubscribe();
      sendEvent("unsubscribe", unSubscribeAnalyticsData());
    } else if (type == "startover") {
      sendEvent("play_button_clicked", analyticsObj);
      if (data?.properties?.isDeeplinking === "true") {
        let url =
          process.env.initJson.api +
          `/service/api/v1/page/deeplink?path=${data.target}`;
        deeplinkingdata(url);
      } else {
        dispatch({ type: actions.playerUtils, payload: { startover: true } });
        router.push(data.target);
      }
    } else if (type == "rent") {
      dispatch({ type: actions.navigateFrom, payload: router.asPath });
      if (isloggedin === false) {
        const pop = {
          type: "signin",
          isActive: true,
          title1:
            TvshowDetailsconstant[localLang]
              ?.To_access_this_feature_please_sign_in,
          title2: TvshowDetailsconstant[localLang]?.Sign_in_or_Join,
          yesButton1: TvshowDetailsconstant[localLang]?.Sign_In,
          yesButtonType: "primary",
          yesButtonTarget1: navigateToSignIn,
          noButton1: signupconstant[localLang]?.Sign_Up,
          noButtontarget1: navigateToSignUp,
          noButtonType: "secondary",
          close: true,
          closeTarget: handleClose,
        };
        setPopUpData(pop);
      } else {
        router.push({
          pathname: `/buy/packages-list`,
          query: {
            _rent: router.asPath.slice(1),
          },
        });
      }
    } else if (data == "follow") {
      if (!!isloggedin) {
        const action = !follow ? "follow" : "unfollow";
        const url =
          process.env.initJson["api"] + `/service/api/auth/${action}/channel`;
        const apiData = {
          contentPath: router.asPath.slice(1),
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
                setFollow(!follow);
                const pPath = router.asPath;
                let tempObj = {
                  rail_name: "-1",
                  header_button: PageData?.info?.path || pPath || "-1",
                  channel_partner:
                    PageData?.info?.attributes?.networkName || "-1",
                  time: getCurrentTime() || "-1",
                  channel_id: PageData?.info?.attributes?.channelId || "-1",
                  content_id: PageData?.info?.attributes?.id || "-1",
                  device_type: "web",
                  cpCode: "freedom",
                };
                let locationInfo = getItem("LocationData");
                if (locationInfo?.data?.ipInfo) {
                  tempObj.City = locationInfo?.data?.ipInfo?.city;
                  tempObj.State = locationInfo?.data?.ipInfo?.region;
                  tempObj.Country = locationInfo?.data?.ipInfo?.country;
                  tempObj.IPAddress = locationInfo?.data?.ipInfo?.trueIP;
                }
                const newRailName = getItem("rail_name");
                if (!!newRailName) {
                  tempObj["rail_name"] = newRailName;
                }
                // console.log(PageData);
                if (action == "follow") {
                  sendEvent("follow", tempObj);
                } else {
                  sendEvent("unfollow", tempObj);
                }
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
      } else {
        popupDataSet();
      }
    } else {
      router.push(data.target);
    }
  };

  const unSubscribeAnalyticsData = () => {
    let tempObj = {
      channel_partner: PageData?.info?.attributes?.networkName || "-1",
      channel_id: PageData?.info?.attributes?.channelId,
      cpCode: "freedom",
    };
    return tempObj;
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
  const getDeeplinkInfo = (data) => {
    if (data == undefined || data == "") {
      return undefined;
    }
    try {
      data = JSON.parse(data);
    } catch (e) {
      // return undefined;
    }
    if (!!data?.url && data.url.length != 0) {
      return data.url;
    }
    if (!!data?.contentCode) {
      let deepLink = data.contentCode.includes("//")
        ? data.contentCode.split("//")[1]
        : data.contentCode;
      return `https://${deepLink}`;
    }
    return undefined;
  };

  useEffect(() => {
    if (favouriteData?.data?.status) {
      const action = detailsObj.isFavourite ? 2 : 1;
      detailsObj.isFavourite = action === 1;
      setDetailsobj({ ...detailsObj });
      // sendEvent("favorite", analyticsData());
      dispatch({
        type: actions.NotificationBar,
        payload: { message: favouriteData?.data?.response?.message },
      });
    }
  }, [favouriteData]);

  const addToFavourite = () => {
    if (!!isloggedin) {
      try {
        const action = detailsObj.isFavourite ? 2 : 1;
        const apiUrl =
          process.env.initJson.api +
          `/service/api/auth/user/favourite/item?path=${router.asPath.slice(1)}&action=${action}`;
        addFavourites(apiUrl);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      popupDataSet();
    }
  };

  const loaderProp = ({ src }) => {
    return src;
  };

  const shakaPlayerProps = () => {
    return {
      item: {
        imageUrl: detailsObj?.BgImage,
        customClass: "tvShowTrailerimage",
      },
      streamPath: {
        streamUrl: trailerStreamUrl,
        imageUrl: detailsObj?.BgImage,
        isbannerVideo: true,
      },
    };
  };
  const streamEnded = () => {
    setTrailerStreamUrl("");
  };

  const handleResize = () => {
    let resolution = getResolution();
    if (resolution.width < 991) streamEnded();
  };

  const unSubscribeHandler = () => {
    sendEvent("confirm_unsubscribe", unSubscribeAnalyticsData());
    const { api } = process.env.initJson;
    const url = `${api}/payment/api/v1/unsubscribe/content`;
    let apiData = new FormData();
    apiData.append("path", router.asPath.substring(1));
    mutateUnSubscribe(
      { url, apiData },
      {
        onSuccess: (res) => {
          console.log(res?.data?.status);
          let notify = { code: "freedom_tv" };
          if (res?.data?.status) {
            notify.message = res?.data?.response?.message;
            dispatch({
              type: actions.NotificationBar,
              payload: notify,
            });
            window.location.reload();
          } else {
            setPopUpData({});
            notify.message = res?.data?.error?.message;
            dispatch({
              type: actions.NotificationBar,
              payload: notify,
            });
          }
          handleClose();
          // console.log("Hii");
        },
        onError: (err) => {
          console.log(err);
        },
      }
    );
  };

  const openUnSubscribe = () => {
    let pop = {
      type: "subscriptionPopUp",
      isActive: true,
      title1: detailsObj.unsubscribe?.properties?.unsubscribeTitle,
      title2: detailsObj.unsubscribe?.properties?.unsubscribeSubtitle,
      yesButton1: DeviceLogoutConstant[localLang].Confirm,
      yesButtonType: "primary",
      yesButtonTarget1: unSubscribeHandler,
      noButton1: DeviceLogoutConstant[localLang].Cancel,
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: false,
      topImg: true,
      topImgValue: detailsObj.partnerIcon,
      closeTarget: unSubscribeHandler,
      parentclassName: "freedomTvSubscribe",
    };

    setPopUpData(pop);
  };

  // const clickMeBtnHandler = () => {
  //   openUnSubscribe();
  // };
  const handleBack = () => {
    if (navigateFrom) {
      dispatch({ type: actions.navigateFrom, payload: null });
      router.push(navigateFrom);
    } else {
      router.push("/");
    }
  };
  return (
    <div className={`${styles.tvshow_details_page}`}>
      {/* <div className={`${styles.gradient_mask}`} />
      <div className={`${styles.gradient_mask2}`} /> */}
      {!trailerStreamUrl && (
        <Image
          fill
          className={`${styles.image}`}
          loader={loaderProp}
          src={detailsObj.BgImage}
          alt="bg"
        />
      )}
      {trailerStreamUrl && (
        <ShakaBannerVideo {...shakaPlayerProps()} streamEnd={streamEnded} />
      )}

      <div className={`${styles.mobile_info_top}`}>
        {/* <button
          className={`${styles.detailsBack}`}
          onClick={() => router.back()}
        >
          <img
            src={`${ImageConfig?.tvShowDetails?.helpBackArrow}`}
            alt="back"
          />
        </button> */}
        <div className={` ${styles.freedomTv_bck1} `}>
          <button className={`${styles.detailsBack} `} onClick={handleBack}>
            <img
              src={`${ImageConfig?.tvShowDetails?.helpBackArrow}`}
              alt="back"
            />
            <span>{detailsObj.title}</span>
          </button>
          <div className={styles.headerright}>
            <Link href="/search" aria-label="search icon">
              <img
                className={`${styles.searchIcon}`}
                src={`${ImageConfig?.mobileHeader?.searchIcon}`}
                alt="search_icon"
              />
            </Link>
          </div>
        </div>
        <img
          className={`${styles.img_responsive} ${styles.abs_image} `}
          src={detailsObj.BgImage}
          alt=""
        />
      </div>

      <div className={`container-fluid ${styles.details}`}>
        <div className={`${styles.details_inner}`}>
          <div className={styles.partnerIconParent}>
            {detailsObj.partnerIcon && (
              <Image
                width={0}
                height={0}
                sizes="100vw"
                loader={loaderProp}
                className={`${styles.partnerIcon}`}
                src={detailsObj.partnerIcon}
                alt="image"
              />
            )}
          </div>
          <div className={` ${styles.details_left}`}>
            <div className={` ${styles.details_header}`}>
              <div className={` ${styles.details_View}`}>
                <div className={styles.partnerIconParent}>
                  {detailsObj.partnerIcon && (
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      loader={loaderProp}
                      className={`${styles.partnerIcon} ${styles.partnerIconMobile}`}
                      src={detailsObj.partnerIcon}
                      alt="image"
                    />
                  )}
                </div>
                <div className={` ${styles.titleView}`}>
                  <h1 className={`${styles.title}`}>{detailsObj.title}</h1>
                  <span className={`${styles.title_Follow}`}>
                    {detailsObj.contentFollowersCount || 0}{" "}
                    {detailsObj.contentFollowersCount == 1
                      ? TvshowDetailsconstant[localLang].Follower
                      : TvshowDetailsconstant[localLang].Followers}
                  </span>
                  {detailsObj.subscribersCount && (
                    <span
                      className={`${styles.title_Follow} ${styles.subscribers}`}
                    >
                      {detailsObj.subscribersCount || 0}{" "}
                      {detailsObj.subscribersCount == 1
                        ? TvshowDetailsconstant[localLang].Subscriber
                        : TvshowDetailsconstant[localLang].Subscribers}
                    </span>
                  )}
                </div>
              </div>
              {(detailsObj.subtitle ||
                detailsObj.pgrating ||
                detailsObj.imdb) && (
                <div className={`${styles.subtitle}`}>
                  {detailsObj.subtitle && <span>{detailsObj.subtitle}</span>}
                  {detailsObj.pgrating && (
                    <span>
                      &nbsp; | &nbsp;
                      <span className={`${styles.pgrating}`}>
                        {detailsObj.pgrating}
                      </span>
                    </span>
                  )}
                  {detailsObj.imdb && (
                    <span>
                      &nbsp; | &nbsp;
                      <span className={`${styles.imdb}`}>
                        <img
                          src={`${ImageConfig?.tvShowDetails?.imdb}`}
                          alt="IMDB"
                        />
                        {detailsObj.imdb}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {detailsObj?.buttons?.elements?.some(
                (button) => button.elementSubtype === "resume"
              ) && (
                <div className={`${styles.resume_now_mobile}`}>
                  {detailsObj?.buttons?.elements?.map(
                    (button, index) =>
                      button.elementSubtype === "resume" && (
                        <button
                          key={index} // Added key for list rendering
                          className={`btn ${styles.buttons} ${styles.resume_now} ${styles.seekBarResume} primary br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          <img
                            src={`${ImageConfig?.tvShowDetails?.playCirclebtn}`}
                            alt="resume"
                          />
                          {button.data}
                          <span className={`${styles.seek_bar}`}>
                            <span
                              className={`${styles.seek_position}`}
                              style={{ width: button.seekedValue + "%" }}
                            ></span>
                          </span>
                        </button>
                      )
                  )}
                </div>
              )}

              {/* {detailsObj?.buttons?.elements?.some((button) =>
                [
                  "trailer",
                  "signin",
                  "signup",
                  "watchnow",
                  "startover",
                  "resume",
                  "watch_latest_episode",
                  "rent",
                  "subscribe",
                ].includes(button.elementSubtype)
              ) && (
                <div className={`${styles.actions} ${styles.mobile}`}>
                  {detailsObj?.buttons?.elements?.map((button, index) => (
                    <React.Fragment key={index}>
                      {button.elementSubtype === "trailer" && (
                        <button
                          className={` ${styles.buttons} ${styles.trailer} br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          <img
                            className={`${styles.trailer_image}`}
                            src={`${ImageConfig?.tvShowDetails?.trailerIcon}`}
                            alt="trailer"
                          />
                          {button.data}
                        </button>
                      )}
                      {button.elementSubtype === "signin" && (
                        <button
                          onClick={navigateToSignIn}
                          className={` ${styles.buttons} ${styles.signin} primary br2`}
                        >
                          {button.data}
                        </button>
                      )}
                      {button.elementSubtype === "signup" && (
                        <Link href="/signup">
                          <button
                            className={`btn ${styles.buttons} ${styles.signup} primary br2`}
                          >
                            {button.data}
                          </button>
                        </Link>
                      )}
                      {button.elementSubtype === "watchnow" && (
                        <button
                          className={`btn ${styles.buttons} ${styles.watchnow} primary br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          {button.data}
                        </button>
                      )}
                      {button.elementSubtype === "startover" && (
                        <button
                          className={`${styles.buttons} ${styles.startover} br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          {button.data}
                        </button>
                      )}
                      {button.elementSubtype === "resume" && (
                        <button
                          className={`btn ${styles.buttons} ${styles.resume} ${styles.seekBarResume} primary br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          <img
                            src={`${ImageConfig?.tvShowDetails?.playCirclebtn}`}
                            alt="resume"
                          />
                          {button.data}
                          <span className={`${styles.seek_bar}`}>
                            <span
                              className={`${styles.seek_position}`}
                              style={{ width: button.seekedValue + "%" }}
                            ></span>
                          </span>
                        </button>
                      )}
                      {button.elementSubtype === "watch_latest_episode" && (
                        <Link href="/">
                          <button
                            className={`btn ${styles.buttons} ${styles.watch_latest_episode} primary br2`}
                            onClick={(e) => navigateTo(button, e)}
                          >
                            {button.data}
                          </button>
                        </Link>
                      )}
                      {button.elementSubtype === "rent" && (
                        <Link href="/">
                          <button
                            className={`btn ${styles.buttons} ${styles.rent} primary br2`}
                            onClick={(e) => navigateTo(button, e)}
                          >
                            {button.data}
                          </button>
                        </Link>
                      )}
                      {button.elementSubtype === "subscribe" && (
                        <Link href="/">
                          <button
                            className={`btn ${styles.buttons} ${styles.subscribe} primary br2`}
                            onClick={(e) => navigateTo(button, e)}
                          >
                            {button.data}
                          </button>
                        </Link>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )} */}

              {(detailsObj.showFavouriteButton ||
                PageData.shareInfo.isSharingAllowed) && (
                <div className={`${styles.mobile_share_controls}`}>
                  {detailsObj.showFavouriteButton && (
                    <button
                      key="fav-button"
                      className={` ${styles.buttons} ${styles.fav} br2`}
                      onClick={() => addToFavourite()}
                    >
                      {detailsObj.isFavourite ? (
                        <>
                          <img
                            className={`${styles.active_fav_icon}`}
                            src={`${ImageConfig?.tvShowDetails?.favoriteActive}`}
                            alt="favorite active"
                          />
                          <span className={`${styles.fav_text}`}>
                            {TvshowDetailsconstant[localLang].Favourited}
                          </span>
                        </>
                      ) : (
                        <>
                          <img
                            className={`${styles.fav_icon}`}
                            src={`${ImageConfig?.tvShowDetails?.favorite}`}
                            alt="favorite"
                          />
                          <span className={`${styles.fav_text}`}>
                            {TvshowDetailsconstant[localLang].Favourite}
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  {PageData.shareInfo.isSharingAllowed && (
                    <>
                      <span className={`${styles.line}`}></span>
                      <button
                        className={`${styles.buttons} ${styles.share} br2`}
                        onClick={() => shareDataSet()}
                      >
                        <img
                          src={`${ImageConfig?.tvShowDetails?.share}`}
                          alt="share"
                        />
                        <span
                          className={`${styles.fav_text} ${styles.fancy_tool_tip}`}
                        >
                          {TvshowDetailsconstant[localLang].Share}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {detailsObj.description && (
                <div className={`${styles.descDiv}`}>
                  {/* <Scrollbar> remove this in mobile */}
                  <p
                    className={`${styles.description}`}
                    onClick={toggleDescription}
                  >
                    {detailsObj.description}
                    {/* {showFullDescription
                      ? detailsObj.description
                      : detailsObj.description.length > 200
                        ? detailsObj.description.slice(0, 200) + "... "
                        : detailsObj.description}
                    {detailsObj.description.length > 200 && (
                      <span className={`${styles.readMore}`}>
                        {showFullDescription ? " Show Less" : " Read More"}
                      </span>
                    )} */}
                  </p>
                  {/* </Scrollbar> */}
                </div>
              )}
              <div className={`${styles.creatorBTN}`}>
                {detailsObj?.followData && (
                  <button
                    className={`${styles.btn}`}
                    onClick={(e) => navigateTo("follow", e)}
                  >
                    <img
                      src={`${follow ? ImageConfig?.card?.userUnFollow : ImageConfig?.card?.userFollow}`}
                      alt="user_follow"
                      className={`${styles.img}`}
                    />{" "}
                    {follow
                      ? TvshowDetailsconstant[localLang].Unfollow
                      : TvshowDetailsconstant[localLang].Follow}
                  </button>
                )}
                {/* {detailsObj.unsubscribe && (
                  <button
                    className={` primary ${styles.btn} ${styles.primary} ${styles.unsubscribe}`}
                    onClick={(e) => navigateTo(detailsObj.unsubscribe, e)}
                  >
                    {" "}
                    {TvshowDetailsconstant[localLang].Unsubscribe}
                  </button>
                )} */}
                {detailsObj?.buttons?.elements?.map((button, index) => {
                  return (
                    <React.Fragment key={index}>
                      {button.elementSubtype == "trailer" && (
                        <button
                          className={` ${styles.buttons} ${styles.trailer}  br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          <img
                            className={`${styles.trailer_image}`}
                            src={`${ImageConfig?.tvShowDetails?.trailerIcon}`}
                            alt="trailer"
                          />
                          {button.data}
                        </button>
                      )}
                      {button.elementSubtype == "signin" && (
                        <button
                          onClick={navigateToSignIn}
                          className={` ${styles.buttons} ${styles.signin} primary br2`}
                        >
                          {button.data}
                        </button>
                      )}
                      {button.elementSubtype == "signup" && (
                        <Link href="/signup">
                          <button
                            className={`btn ${styles.buttons} ${styles.signup} primary br2`}
                          >
                            {button.data}
                          </button>
                        </Link>
                      )}
                      {button.elementSubtype == "watchnow" && (
                        <button
                          className={`btn ${styles.buttons} ${styles.watchnow} primary br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          {button.data}
                        </button>
                      )}
                      {button.elementSubtype == "startover" && (
                        <button
                          className={`${styles.buttons} ${styles.startover} br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          {button.data}
                        </button>
                      )}
                      {button.elementSubtype == "resume" && (
                        <button
                          className={`btn ${styles.buttons} ${styles.resume} ${styles.seekBarResume} primary br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          <img
                            src={`${ImageConfig?.tvShowDetails?.playCirclebtn}`}
                            alt="resume"
                          />
                          {button.data}
                          <span className={`${styles.seek_bar} `}>
                            <span
                              className={`${styles.seek_position} `}
                              style={{ width: button.seekedValue + "%" }}
                            ></span>
                          </span>
                        </button>
                      )}
                      {button.elementSubtype == "watch_latest_episode" && (
                        <Link href="/">
                          <button
                            key={index}
                            className={`btn ${styles.buttons} ${styles.watch_latest_episode} primary br2`}
                            onClick={(e) => navigateTo(button, e)}
                          >
                            {button.data}
                          </button>
                        </Link>
                      )}
                      {button.elementSubtype == "rent" && (
                        // <Link   href='/'>
                        <button
                          key={index}
                          className={`btn ${styles.buttons} ${styles.rent} primary br2`}
                          onClick={(e) => navigateTo(button, e)}
                        >
                          {button.data}
                        </button>
                        // </Link>
                      )}
                      {button.elementSubtype == "subscribe" && (
                        <Link href="/">
                          <button
                            key={index}
                            className={`btn ${styles.btn} ${styles.subscribe} primary br2`}
                            onClick={(e) => navigateTo(button, e)}
                          >
                            {button.data}
                          </button>
                        </Link>
                      )}
                      {button.elementSubtype == "unsubscribe" && (
                        <Link href="/">
                          <button
                            key={index}
                            className={`btn ${styles.btn} ${styles.subscribe} primary br2`}
                            onClick={(e) => navigateTo(button, e)}
                          >
                            {button.data}
                          </button>
                        </Link>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* <button className={styles.btn} onClick={clickMeBtnHandler}>
                  Click me!
                </button> */}
              </div>

              <div className={`${styles.actions}`}>
                {/* {detailsObj?.buttons?.elements?.map((button, index) => {
            return (
              <React.Fragment key={index}>
                {button.elementSubtype == "trailer" && (
                  <button
                    className={` ${styles.buttons} ${styles.trailer}  br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    <img
                      className={`${styles.trailer_image}`}
                      src={`${ImageConfig?.tvShowDetails?.trailerIcon}`}
                      alt="trailer"
                    />
                    {button.data}
                  </button>
                )}
                {button.elementSubtype == "signin" && (
                  <button
                    onClick={navigateToSignIn}
                    className={` ${styles.buttons} ${styles.signin} primary br2`}
                  >
                    {button.data}
                  </button>
                )}
                {button.elementSubtype == "signup" && (
                  <Link href="/signup">
                    <button
                      className={`btn ${styles.buttons} ${styles.signup} primary br2`}
                    >
                      {button.data}
                    </button>
                  </Link>
                )}
                {button.elementSubtype == "watchnow" && (
                  <button
                    className={`btn ${styles.buttons} ${styles.watchnow} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data}
                  </button>
                )}
                {button.elementSubtype == "startover" && (
                  <button
                    className={`${styles.buttons} ${styles.startover} br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data}
                  </button>
                )}
                {button.elementSubtype == "resume" && (
                  <button
                    className={`btn ${styles.buttons} ${styles.resume} ${styles.seekBarResume} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    <img
                      src={`${ImageConfig?.tvShowDetails?.playCirclebtn}`}
                      alt="resume"
                    />
                    {button.data}
                    <span className={`${styles.seek_bar} `}>
                      <span
                        className={`${styles.seek_position} `}
                        style={{ width: button.seekedValue + "%" }}
                      ></span>
                    </span>
                  </button>
                )}
                {button.elementSubtype == "watch_latest_episode" && (
                  <Link href="/">
                    <button
                      key={index}
                      className={`btn ${styles.buttons} ${styles.watch_latest_episode} primary br2`}
                      onClick={(e) => navigateTo(button, e)}
                    >
                      {button.data}
                    </button>
                  </Link>
                )}
                {button.elementSubtype == "rent" && (
                  // <Link   href='/'>
                  <button
                    key={index}
                    className={`btn ${styles.buttons} ${styles.rent} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data}
                  </button>
                  // </Link>
                )}
                {button.elementSubtype == "subscribe" && (
                  <Link href="/">
                    <button
                      key={index}
                      className={`btn ${styles.buttons} ${styles.subscribe} primary br2`}
                      onClick={(e) => navigateTo(button, e)}
                    >
                      {button.data}
                    </button>
                  </Link>
                )}
              </React.Fragment>
            );
          })}
          {detailsObj.showFavouriteButton && (
            <button
              key="fav-button"
              className={` ${styles.buttons} ${styles.fav} br2`}
              onClick={() => addToFavourite()}
            >
              {detailsObj.isFavourite ? (
                <>
                  <img
                    className={`${styles.active_fav_icon}`}
                    src={`${ImageConfig?.tvShowDetails?.favoriteActive}`}
                    alt="favourite"
                  />
                  <span className={`${styles.fav_text}`}>
                    {TvshowDetailsconstant[localLang].Favourited}
                  </span>
                </>
              ) : (
                <>
                  <img
                    className={`${styles.fav_icon}`}
                    src={`${ImageConfig?.tvShowDetails?.favorite}`}
                    alt="favourite"
                  />
                  <span className={`${styles.fav_text}`}>
                    {TvshowDetailsconstant[localLang].Favourite}
                  </span>
                </>
              )}
            </button>
          )} */}

                {PageData.shareInfo.isSharingAllowed && (
                  <button
                    className={`${styles.buttons} ${styles.share} br2`}
                    onClick={(e) => navigateTo({ elementSubtype: "Share" }, e)}
                  >
                    <img
                      src={`${ImageConfig?.tvShowDetails?.share}`}
                      alt="share"
                    />
                    <span className={`${styles.fancy_tool_tip}`}>
                      {TvshowDetailsconstant[localLang].Share}
                    </span>
                  </button>
                )}
                {!!detailsObj.expiryInfo && (
                  <p className={`${styles.expiry_info}`}>
                    {detailsObj.expiryInfo[0]}
                    <span className={`${styles.time_stamp}`}>
                      {detailsObj.expiryInfo[1]}
                    </span>
                  </p>
                )}
              </div>
              {detailsObj.castcrew && (
                <div className={`${styles.castDiv}`}>
                  <Scrollbar>
                    {/*  remove this in mobile */}
                    <p className={`${styles.casting}`}>
                      <span className={`${styles.castTitle}`}>
                        {TvshowDetailsconstant[localLang].Cast_Crew + " :"}
                      </span>
                      {detailsObj.castcrew}
                    </p>
                  </Scrollbar>
                </div>
              )}
            </div>
          </div>
        </div>

        {!!detailsObj.rentalinfo && (
          <p className={`${styles.rent_info}`}>
            <img
              src={`${appConfig.staticImagesPath}pack-info-icon.svg`}
              alt="Rentel Info"
            />
            {detailsObj.rentalinfo}
          </p>
        )}
      </div>
      {popupData.isActive &&
        popupData.type != "favourite" &&
        popupData.type != "reportPopupModal" &&
        popupData.type != "subscriptionPopUp" && (
          <PopupModal popupData={popupData} />
        )}
      {popupData.isActive && popupData.type == "reportPopupModal" && (
        <OverlayPopupModal popupData={popupData} />
      )}
      {popupData.isActive && popupData.type === "share" && (
        <SharePopup popupData={popupData} />
      )}
      {popupData.isActive && popupData.type === "subscriptionPopUp" && (
        <OverlayPopupModal popupData={popupData} />
      )}
    </div>
  );
};

export default CreatorDetails;
