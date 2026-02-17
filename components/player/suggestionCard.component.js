import styles from "@/components/player/player.module.scss";
import { getAbsolutePath, getTemplatesList } from "@/services/user.service";
import { useRouter } from "next/router";
import useGetApiMutate from "@/hooks/useGetApidata";
import { getPagePath } from "@/services/utility.service";
import { getDeeplinkData, jsonToQueryParams } from "@/services/utility.service";
import { useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import { PlayerSuggestionconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import { updateContentPosition } from "@/services/myReco.service";
import { browserName } from "react-device-detect";
import { cpAnalyticsAPI } from "@/services/analytics.service";
import { analyticsForMyReco, postRecoData } from "@/services/myReco.service";
import GAdsComponent from "../Gads/GAdsComponent";

import dynamic from "next/dynamic";
import styles1 from "@/components/cards/card.module.scss";
const CustomPoster = dynamic(
  () => import("@/components/cards/cardTypes/customPoster.component")
);

const SuggestionCard = ({ suggestionCardData, cHeight, eleIndex, adData }) => {
  const {
    state: { NotificationBar, localLang },
    dispatch,
  } = useStore();
  const router = useRouter();
  const { mutate: mutateDeeplinkAPi, data: deepLinkData } = useGetApiMutate();
  let currentPagePath = getPagePath(router.asPath);
  const [suggestionsCardDetails, setSuggestionsCardDetails] =
    useState(suggestionCardData);

  useEffect(() => {
    // console.log(">>suggestionCardData", suggestionCardData);
    if (!!deepLinkData?.data?.response) {
      if (deepLinkData.data?.status) {
        let dL = getDeeplinkData(deepLinkData?.data?.response);
        if (browserName.includes("Safari")) {
          window.location.href = dL;
        } else {
          window.open(dL);
        }
      }
    }
  }, [deepLinkData]);

  const onCardClick = () => {
    if (suggestionsCardDetails.target.pageAttributes?.isDeeplinking == "true") {
      getDeeplinkInfo(suggestionsCardDetails.target.path);
    } else openProgInfoPopUp();
    myRecoAnalytics();
  };

  const myRecoAnalytics = (data = suggestionsCardDetails) => {
    let carouselPosition;
    let contentPosition;
    let sectionData = {};

    carouselPosition = "";
    contentPosition = "";
    let localStorageItem = {};
    try {
      localStorageItem = JSON.parse(sessionStorage.getItem("anaReco")) || {};
    } catch (error) {}
    // console.log(">>>>>localStorageItem>",localStorageItem)
    const myRecoAnalyticsData = {
      contentPath: data?.targetPath?.includes("play")
        ? data.targetPath
        : data.target.path,
      carouselPosition,
      contentPosition,
      trackingId: localStorageItem?.trackingId || "",
      originMedium: "C",
    };
    myRecoAnalyticsData.originName = data?.display?.title;
    const pagePath = {
      dataType: sectionData?.sectionInfo?.dataType,
      pagePath: router.asPath,
    };
    analyticsForMyReco(myRecoAnalyticsData, pagePath);
  };

  const openProgInfoPopUp = () => {
    setTimeout(() => {
      updateContentPosition(eleIndex);
    }, 1000);
    sessionStorage.setItem("isInternalNaviagtion", true);
    if (!!suggestionsCardDetails.template) {
      let tempData = {};
      tempData["target_path"] = suggestionsCardDetails.target.path;
      let templatesList = getTemplatesList();
      if (templatesList.length > 0) {
        templatesList.map((template) => {
          if (suggestionsCardDetails.template === template.code) {
            let assignedTemplate = template;
            tempData["assignedTemplate"] = assignedTemplate;
            // setTemplateData(tempData)
            // setIsBottomLayoutOpen(true);
            router.push(tempData.target_path);
          }
        });
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: "Sorry template not found." },
        });
      }
    } else if (
      suggestionsCardDetails?.target?.pageAttributes?.isDeeplinking == "true"
    ) {
      getDeeplinkInfo(suggestionsCardDetails.target.path);
    } else {
      router.push(suggestionsCardDetails?.target?.path);
    }
  };

  const getDeeplinkInfo = (tPath) => {
    cpAnalyticsAPI(tPath);
    let params = { path: tPath };
    let url =
      process.env.initJson["api"] +
      "/service/api/v1/page/deeplink?" +
      jsonToQueryParams(params);
    try {
      mutateDeeplinkAPi(url);
    } catch (e) {}
  };

  const BadgeText = ({ badgeMarker }) => {
    return (
      <span
        className={styles.rent}
        style={{
          backgroundColor: "#" + badgeMarker?.bgColor,
          color: "#" + badgeMarker?.textColor,
        }}
      >
        {badgeMarker?.value}
      </span>
    );
  };
  return (
    <>
      {suggestionCardData?.cardType == "custom_poster" ? (
        <>
          <div className={`${styles1.cardsHome} cardsHome`}>
            <CustomPoster
              BadgeText={BadgeText}
              cardType={suggestionCardData?.cardType}
              cardData={suggestionCardData}
              cWidth={900}
              CHeight={cHeight}
              loaderProp={({ src }) => {
                return src;
              }}
              openProgInfoPopUp={openProgInfoPopUp}
              sectionInfo={{}}
              suggestionCardData="suggestionCardData"
              // removeCard={() => console.log("Card Removed")}
              // item={{ id: 1, name: "Sample Item" }}
            />
          </div>
        </>
      ) : (
        <div
          className={`${styles.card_row} ${
            currentPagePath === suggestionsCardDetails.target?.path
              ? `${styles.active}`
              : ""
          }`}
        >
          <div
            className={`${styles.overlay_poster_mobile_grid}`}
            onClick={onCardClick}
          >
            <div className={`${styles.overlay_poster_left}`}>
              <img
                src={getAbsolutePath(suggestionsCardDetails?.display?.imageUrl)}
                alt="video"
                height={cHeight}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = `${ImageConfig?.defaultdetails}`;
                }}
              />
            </div>
            <div className={`${styles.overlay_poster_right}`}>
              <div className={`${styles.card_info}`}>
                {currentPagePath === suggestionsCardDetails.target?.path && (
                  <p className={`${styles.live_marker}`}>
                    {PlayerSuggestionconstant[localLang].Watching_Now}
                  </p>
                )}
                <h3 className={`${styles.title}`}>
                  {suggestionsCardDetails?.display.title}
                </h3>
                <span className={`${styles.subTitle}`}>
                  {suggestionsCardDetails?.display?.subtitle1}
                </span>
              </div>
            </div>
            {/* <div className={`${styles.parent_Icon}`}>
          {!!suggestionsCardDetails?.display?.parentIcon && (
            <img
              src={getAbsolutePath(suggestionsCardDetails?.display?.parentIcon)}
              alt="partner icon"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.srcset = `${ImageConfig?.defaultdetails}`;
              }}
            />
          )}
        </div> */}
          </div>
          {!!adData && <GAdsComponent adData={adData} />}
        </div>
      )}
    </>
  );
};

export default SuggestionCard;
