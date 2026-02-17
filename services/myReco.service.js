/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import {
  getDeviceSubTypeInfo,
  postApiData,
} from "@/services/data-manager.service";
import { getItem } from "@/services/local-storage.service";
import { checkUserLogin } from "@/services/user.service";

export const getMandatoryPayload = (addtionalPayload) => {
  let payload = {
    eventType: "Playback",
    eventName: "Played",
    originSource: "AppOpen",
    userAgent: getDeviceSubTypeInfo() || "",
    network: "",
    sdkVersion: "",
    appVersion: "",
    tabName: sessionStorage.getItem("TabName")?.toUpperCase() || "DETAILS",
  };
  if (Object.entries(addtionalPayload).length > 0) {
    payload = { ...payload, ...addtionalPayload };
  }
  return payload;
};

export const analyticsForMyReco = (cardData, sectionType) => {
  const localStorageItem = JSON.parse(sessionStorage.getItem("anaReco")) || {};

  const origins = {
    C: "Carousel",
    S: "Search",
    F: "Filter",
  };
  cardData.originMedium = origins[cardData?.originMedium] || origins.C;
  if (cardData?.originMedium != "Search") {
    cardData.originName =
      sectionType.dataType == "entity" &&
      sectionType?.pagePath.includes("tvshow")
        ? localStorageItem?.originName
        : cardData?.originName || "";
  }
  const myRecoData = getMandatoryPayload({ ...cardData });
  sessionStorage.setItem("anaReco", JSON.stringify(myRecoData));
  return myRecoData;
};

export const postRecoData = async (recoData) => {
  const systemConfigs = getItem("systemConfigs") || {};
  try {
    let myrecoData = JSON.parse(sessionStorage.getItem("anaReco")) || {};
    if (!Object.entries(myrecoData)?.length) {
      // if user lands directly video with url page without any navigation
      const cardDummyData = {
        contentPosition: "",
        carouselPosition: "",
        contentPath: recoData.path,
        trackingId: "",
        originMedium: "Carousel",
      };
      myrecoData = analyticsForMyReco(cardDummyData, {});
    }
    if (systemConfigs?.data?.configs?.supportMyreco === "true") {
      const userDetails = checkUserLogin();
      myrecoData.userId = userDetails
        ? `${userDetails?.userId}_${userDetails?.profileId}`
        : "-1";
      myrecoData.value = recoData.onWatchTimer;
      // for view all rail carouselPosition click storing into session
      const carouselPosition = sessionStorage.getItem("carouselPosition");
      if (carouselPosition) {
        myrecoData.carouselPosition = carouselPosition;
      }
      // for deeplinks
      if (recoData?.contentPath) {
        myrecoData.contentPath = recoData?.contentPath;
        if (myrecoData.contentPath[0] === "/") {
          myrecoData.contentPath[0] === myrecoData.contentPath[0].slice(1);
        }
      }

      try {
        const res = await postApiData(
          `${process.env.initJson.api}/service/api/v1/send/myreco/events`,
          myrecoData
        );
        // Handle response if needed
        // console.log("Response:", res);
      } catch (error) {
        console.error("Error posting reco data:", error);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

export const setTabName = (tabName) => {
  // add search fav and remove not requried tabs
  const tabsNotRequired = ["plans/list", "swag", "games"];
  if (tabsNotRequired.includes(tabName)) {
    tabName = "HOME";
  }
  sessionStorage.setItem("TabName", tabName || "HOME");
  clearRecoStorage();
};

export const clearRecoStorage = () => {
  setTimeout(() => {
    sessionStorage.setItem("anaReco", JSON.stringify({}));
    sessionStorage.removeItem("carouselPosition");
  }, 2000);
};

export const updateContentPosition = (contentPosition) => {
  const localStorageItem = JSON.parse(sessionStorage.getItem("anaReco")) || {};
  localStorageItem.contentPosition = contentPosition.toString();
  localStorageItem.tabName = "DETAILS";
  sessionStorage.setItem("anaReco", JSON.stringify(localStorageItem));
};
