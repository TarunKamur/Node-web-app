import { appConfig as config } from "@/config/app.config";
import { clientEventMappings } from "@/config/analyticsConfig";
import { getDeviceId, postApiData } from "./data-manager.service";
import { getUserType, recoverDeID } from "./utility.service";
import { checkUserLogin } from "./user.service";
import { getItem, setItem } from "./local-storage.service";
import { firebaseAppGlobal } from "@/components/analyticsScripts/firebaseSDK";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from "firebase/analytics";
import { PushnotificationConstant } from "@/.i18n/locale";
const appConfig = config;
export let isCTap = false;
export let isGTM = false;
export let isFB = false;
export let isFirebase = false;
export let firebaseAnalytics = null;
export let isBranch = false;

export const initializeAnalytics = () => {
  // Initialization for analytics services
  if (appConfig && appConfig?.analyticsConfig?.cleverTap) {
    isCTap = true;
  }
  if (appConfig && appConfig?.analyticsConfig?.GTM) {
    isGTM = true;
  }
  if (appConfig && appConfig?.analyticsConfig?.facebook) {
    isFB = true;
  }
  if (appConfig && appConfig?.analyticsConfig?.firebase) {
    isFirebase = true;
    if (firebaseAppGlobal != null) {
      firebaseAnalytics = getAnalytics(firebaseAppGlobal);

      // Firebase push notifications
      appConfig?.analyticsConfig?.firebaseSW && initFCM(firebaseAnalytics);
    }
  }
  if (appConfig && appConfig?.analyticsConfig.branchio) {
    isBranch = true;
  }
};

async function getFCMToken() {
  try {
    const messaging = getMessaging();
    const tokenInLocalStorage = getItem("fcm_token");

    // Return the token if it is alredy in our local storage
    if (tokenInLocalStorage && tokenInLocalStorage !== null) {
      return tokenInLocalStorage;
    }

    // Request the push notification permission from browser
    const status = await Notification.requestPermission();
    if (status && status === "granted") {
      // Get new token from Firebase
      const fcm_token = await getToken(messaging, {
        vapidKey: process.env.vapidKey,
      });

      // TODO: Need to store fcm_token in our DB
      // Set token in our local storage
      if (fcm_token) {
        setItem("fcm_token", fcm_token);
        return fcm_token;
      }
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function initFCM(firebase) {
  const fcm_tokem = await getFCMToken();
  const messaging = getMessaging();

  onMessage(messaging, (payload) => {
    const notificationTitle =
      payload?.notification?.title || payload?.data?.payload;
    /**
     * Custom key-value pairs that are in use are listed below
     * payload -  Title
     * message -  Message text
     * imageurl - Url of the image to show
     * launchurl - Target path of the page to redirect (target path can be taken from website urls)
     * iconurl - Url of the icon to show on Notification
     */
    const notificationOptions = {
      body: payload?.notification?.body || payload?.data?.message,
      icon: payload?.notification?.image || payload?.data?.iconurl,
    };
    const notification = new Notification(
      notificationTitle,
      notificationOptions
    );

    // Redirection handling
    notification.onclick = (ev) => {
      ev.preventDefault();
      if (payload?.data?.launchurl) {
        // Redirect to provided url here
        window.location.replace(payload?.data?.launchurl);
      }
    };
  });
}

export const setFirebaseUserId = (userId) => {
  if (firebaseAnalytics) {
    setUserId(firebaseAnalytics, userId);
  }
};

const sendCleverTapEvent = (eventName, eventData) => {
  // if (!!appConfig?.ctSDK_android && window[appConfig?.ctSDK_android]) {
  //   try {
  //     window[appConfig?.ctSDK_android]?.pushEvent(eventName, eventData);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // } else if (
  //   !!appConfig?.ctSDK_IOS &&
  //   window?.webkit &&
  //   window?.webkit?.messageHandlers &&
  //   window?.webkit?.messageHandlers?.[appConfig?.ctSDK_IOS]
  // ) {
  //   eventData = { ...eventData, action: eventName };
  //   try {
  //     window?.webkit?.messageHandlers?.[appConfig?.ctSDK_IOS]?.postMessage(
  //       eventData
  //     );
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  if (window.yvsdishenveu) {
    // Call Android interface
    window.yvsdishenveu.pushEvent(eventName, JSON.stringify(eventData));
  } else if (
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.yvsdishenveu
  ) {
    var message = {
      action: "recordEventWithProps",
      event: eventName,
      properties: eventData,
    };
    // Call iOS interface
    window.webkit.messageHandlers.yvsdishenveu.postMessage(message);
  } else {
    try {
      // console.log("eventName ",window?.clevertap?.event);
      if(window?.clevertap?.event === undefined || window?.clevertap?.event === null){
        setTimeout(()=>{
          window?.clevertap?.event?.push(eventName, eventData);
        },1000);
      }else{
        window?.clevertap?.event?.push(eventName, eventData);
      }
    } catch (e) {
      console.log(e);
    }
  }
};

// Branch.io

const sendBranchEvent = (eventname, eventData) => {
  if (isBranch) {
    if (eventData["search_query"]) {
      eventData.Search_Query = eventData.search_query;
      delete eventData["search_query"];
    }
    if (eventData["mobile_number"]) {
      delete eventData["mobile_number"];
    }
    try {
      window?.branch?.logEvent(eventname, eventData);
    } catch (e) {
      console.log(e);
    }
  }
};

// GTM
const sendGTMEvent = (eventName, eventData) => {
  eventData["event"] = eventName;
  if (isGTM) {
    try {
      window?.dataLayer.push(eventData);
    } catch (e) {
      console.log(e);
    }
  }
};

// Meta pixel
const sendFBEvent = (eventName, eventData, analyticsSpecificData) => {
  if (isFB) {
    try {
      if (analyticsSpecificData?.eventType == "trackCustom") {
        eventData = {
          ...eventData,
          ...analyticsSpecificData?.fbPixelId,
        };
        fbq(analyticsSpecificData?.eventType, eventName, eventData);
      } else {
        fbq(eventName, eventData);
      }
    } catch (e) {
      console.log(e);
    }
  }
};

// firebase
const triggerFirebaseEvent = (eventName, eventData) => {
  try {
    logEvent(firebaseAnalytics, eventName, eventData);
  } catch (e) {
    console.log(e);
  }
};

export const sendEvent = (eventName, eventData, analyticsSpecificData) => {
  // Dish tv specific
  // console.log(eventName, eventData);
  try {
    eventData["platform"] = recoverDeID(getDeviceId());

    if (getItem("isloggedin") && isTenentSpecific()) {
      const userDetails = checkUserLogin();
      // console.log("1234567890", userDetails);
      if (userDetails.userId) {
        eventData["ott_sms_id"] = userDetails.externalUserId
          ? userDetails.externalUserId.toString()
          : "-1";
        eventData["user_type"] = getUserType(userDetails?.userCategory);
        if (eventData.cpCode == "freedom") {
          // console.log(">>>userDetails",userDetails);
          eventData["subscription_type"] = userDetails?.packages?.length ? "Paid" : "Free"; 
          eventData["mobile_number"] = userDetails?.phoneNumber || "-1";
          eventData["profile_name"] =
            userDetails?.profileParentalDetails[0]?.name || "-1";

          if (
            userDetails?.packages[0] &&
            userDetails?.packages[0]?.recurrenceStatus === "A"
          ) {
            // console.log(">>>>",userDetails?.packages[0])

            eventData["ar_status"] =
              userDetails?.packages[0]?.recurrenceStatus === "A";
          }else{
            eventData["ar_status"] = false;
          }
        }
      } else {
        eventData["user_type"] = "Anonymous User";
        eventData["ott_sms_id"] = "-1";
        // eventData["mobile_number"] = "-1";
        // eventData["profile_name"] = "-1";
        // eventData["ar_status"] = "-1";
      }
    } else {
      eventData["user_type"] = "Anonymous User";
      eventData["ott_sms_id"] = "-1";
      // eventData["mobile_number"] = "-1";
      // eventData["profile_name"] = "-1";
      // eventData["ar_status"] = "-1";
    }
    if (!!eventData.cpCode) {
      delete eventData.cpCode;
    }
    // console.log("34567","userDetails")
    const dataLayerJson = JSON.parse(JSON.stringify(eventData));
    // branch
    if (
      appConfig &&
      appConfig?.analyticsConfig?.branchio &&
      clientEventMappings?.[eventName]?.branch
    ) {
      let brancheventData = JSON.parse(JSON.stringify(eventData));
      sendBranchEvent(clientEventMappings?.[eventName].branch, brancheventData);
    }
    if (
      dataLayerJson["redirection_link"] &&
      eventName == "rail_banner_clicked"
    ) {
      delete eventData["redirection_link"];
    }
    // clevertap
    if (
      appConfig &&
      appConfig?.analyticsConfig?.cleverTap &&
      clientEventMappings?.[eventName]?.cleverTap
    ) {
      sendCleverTapEvent(
        clientEventMappings?.[eventName].cleverTap,
        dataLayerJson
      );
    }

    // GTM
    if (
      appConfig &&
      appConfig?.analyticsConfig?.GTM &&
      clientEventMappings?.[eventName]?.gtm
    ) {
      sendGTMEvent(clientEventMappings?.[eventName]?.gtm, dataLayerJson);
    }

    //Fb pixel
    if (
      appConfig &&
      appConfig?.analyticsConfig?.facebook &&
      clientEventMappings?.[eventName]?.facebook
    ) {
      sendFBEvent(
        clientEventMappings?.[eventName]?.facebook,
        eventData,
        analyticsSpecificData
      );
    }

    // firebase
    if (
      appConfig &&
      appConfig?.analyticsConfig?.firebase &&
      clientEventMappings?.[eventName]?.firebase
    ) {
      // TODO Firebase event triggering function
      triggerFirebaseEvent(
        clientEventMappings?.[eventName]?.firebase,
        dataLayerJson
      );
    }
  } catch (error) {
    console.log(">>>error", error);
  }
};

function setFirebaseProperties(userDetails) {
  const userData = {
    Name: userDetails?.firstName,
    Identity: userDetails?.userId || userDetails?.externalUserId,
    Phone: `+${userDetails?.phoneNumber.replace("-", "")}`,
    platform: "web",
  };
  let subscription_status = userDetails?.packages?.length ? "true" : "false";
  userData["subscription_status"] = subscription_status;

  if (firebaseAnalytics) {
    setUserProperties(firebaseAnalytics, userData);
  }
}

export const setUserSession = (userDetails) => {
  if (isCTap) {
    const userData = {
      Name: userDetails?.firstName,
      user_name: userDetails?.firstName,
      Identity: userDetails?.externalUserId,
      Phone: `+${userDetails?.phoneNumber?.replace("-", "")}`,
      mobile_number: "+" + userDetails?.phoneNumber?.replace("-", ""),
      "MSG-whatsapp": true,
      platform: "web",
    };

    if (userDetails?.gender) userData["Gender"] = userDetails.gender;
    if (userDetails?.age) userData["Age"] = `${userDetails.age}`;
    let ar_status =
      userDetails?.packages && userDetails?.packages[0]?.recurrenceStatus == "A"
        ? "true"
        : "false";
    let subscription_status = userDetails?.packages?.length ? "true" : "false";
    userData["ar_status"] = ar_status;
    userData["subscription_status"] = subscription_status;
    try {
      clevertap?.onUserLogin.push({ Site: userData });
    } catch (e) {
      console.error("Error pushing data to CleverTap:", e);
    }
  }
};

export const updateUserSession = (data, type) => {
  if (type == "clevertap" && isCTap) {
    try {
      // console.log(data,"updateUser")
      clevertap?.profile.push({ Site: data });
    } catch (e) {
      console.log(e);
    }
  }
};

export const AnalyticsnotificationSetup = () => {
  if (isCTap) {
    notificationPush();
  }
};

const notificationPush = () => {
  let localLang = !!getItem("userLanguage") ? getItem("userLanguage") : "eng";
  try {
    window?.clevertap?.notifications?.push({
      titleText:
        PushnotificationConstant[localLang]?.Would_you_like_to_receive_Push,
      bodyText:
        PushnotificationConstant[localLang]
          ?.We_promise_to_only_send_you_relevant,
      okButtonText: PushnotificationConstant[localLang]?.yes,
      rejectButtonText: PushnotificationConstant[localLang]?.No_thanks,
      okButtonColor: "#E7195A",
      askAgainTimeInSeconds: 7 * 60 * 60 * 24,
    });
  } catch (error) {}
};
export const sendProfileAnalyticsEvent = (userData, analyticsType) => {
  if (userData?.profileId) {
    const selectedProfile = userData?.profileParentalDetails?.find(
      (profile) => profile?.profileId === userData?.profileId
    );

    if (selectedProfile) {
      const {
        name: profileName,
        isChildren: isChildrenProfile,
        langs: profileLanguage,
      } = selectedProfile;

      sendEvent("select_profile", {
        profile_name: profileName,
        profile_children: isChildrenProfile ? "TRUE" : "FALSE",
        profile_language: profileLanguage,
      });

      const analyticsData = {
        ar_status: (
          userData?.packages?.[0]?.recurrenceStatus === "A"
        ).toString(),
        subscription_status: (userData?.packages?.length > 0).toString(),
        profile_name: profileName,
      };

      updateUserSession(analyticsData, analyticsType);
    }
  }
};

const isTenentSpecific = () => {
  // can add new tentents if they need additional data
  let tenentsSupported = ["dishtv"];
  return tenentsSupported.includes(process?.env?.initJson?.tenantCode);
};

export const distroAnalyicsEventCall = (obj, error_message = "") => {
  if (
    appConfig &&
    appConfig?.distroPixelUrlAnalytics?.isdistroAnalyticsEnebled
  ) {
    // "https://i.jsrdn.com/i/1.gif?dpname=<partner_name>&r=<random>&e=<event_name>&u=<advertising_id>&i=<playback_id>&v=<playback_id>&m=<partner_name>&p=<content_provider_id>&show=<show_id>&ep<episode_id>&dv=<device_category>&f=<encoded_video_url>"

    let eventUrl = getItem("systemConfigs")?.data?.configs?.distroPixelUrl;
    Object.entries(obj).forEach(([key, value]) => {
      let placeholder = `<${key}>`;
      eventUrl = eventUrl.replace(placeholder, value);
    });
    eventUrl = eventUrl.replace(`<playback_id>`, obj.playback_id);
    eventUrl = eventUrl.replace(`<partner_name>`, obj.partner_name);

    if (!!error_message) {
      eventUrl = eventUrl + "&msg=" + error_message;
    }

    return eventUrl;
  }
};

// CP click analytics

export const cpAnalyticsAPI = async (path) => {
  console.log(path);
  let postData = new FormData();
  postData.append("content_path", path);
  try {
    const res = await postApiData(
      `${process.env.initJson.api}/service/click/analytics/v1/send/data`,
      postData
    );
    // Handle response if needed
    // console.log("Response:", res);
  } catch (error) {
    console.error("Error posting reco data:", error);
  }
};
