import axios from "axios";
import { isMobile, isTablet } from "react-device-detect";
import {
  getItem,
  setItem,
  clearStorage,
  setNookie,
} from "@/services/local-storage.service";
import Router from "next/router";

export const auth = {
  boxId: null,
  sessionId: null,
};

export const staticInitData = null;
export let LocationData = null;

export const getStaticheader = () => {
  return {
    "Session-Id": auth.sessionId,
    "Box-Id": auth.boxId,
    "Tenant-Code": process.env.initJson.tenantCode,
  };
};

export const getStaticFromheader = () => {
  return {
    "Session-Id": auth.sessionId,
    "Box-Id": auth.boxId,
    "Tenant-Code": process.env.initJson.tenantCode,
    "Content-Type": "multipart/form-data",
  };
};

export const postApiData = (url, apiData) => {
  return axios.post(url, apiData, { headers: getStaticheader() });
};

export const fromApiData = (url, apiData) => {
  return axios.post(url, apiData, { headers: getStaticFromheader() });
};

export const getApiStaticData = (url) => {
  return axios.get(url);
};

function getDeviceType() {
  return "web";
}

async function getNewLocationData() {
  try {
    const response = await getApiStaticData(
      process.env.initJson.location +
        "/service/location/api/v1/locationinfo?tenant_code=" +
        process.env.initJson.tenantCode +
        "&product=" +
        process.env.initJson.product +
        "&client=" +
        getDeviceType()
    );
    if (response.data) {
      LocationData = response.data;
      setItem("LocationData", {
        t: new Date().getTime() + 10 * 24 * 60 * 60000,
        data: LocationData,
      });
      return LocationData;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export const getApiData = (url) => {
  return axios.get(url, { headers: getStaticheader() });
};
export const getSessionId = () => {
  return auth.sessionId;
};

export const checkLocation = () => {
  const ele = getItem("LocationData");
  if (!!ele) {
    LocationData = ele.data;
    if (parseInt(ele.t) < new Date().getTime()) {
      getNewLocationData();
    }
    return LocationData;
  }
  return getNewLocationData();
};

function generateGUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  let box_ID =
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4();
  return box_ID;
}

export const getBoxId = () => {
  if (auth.boxId) {
    return auth.boxId;
  }
  auth.boxId = generateGUID();
  setItem("boxId", auth.boxId);
  setNookie("boxId", auth.boxId);
  return auth.boxId;
};

export const setNewSessionId = (data) => {
  auth.sessionId = data;
};

export const setnewBoxId = (data) => {
  auth.boxId = data;
};

export const validateSession = () => {
  auth.sessionId = getItem("sessionId");
  auth.boxId = getItem("boxId");
  if (!auth.boxId || !auth.sessionId) {
    return null;
  }
  return {
    sessionId: auth.sessionId,
    boxId: auth.boxId,
  };
};

export const getDeviceId = () => {
  if (isMobile == true && isTablet != true) {
    setItem("clientId", "61");
    return "61";
  }
  setItem("clientId", "5");
  return "5";
};

export const getDeviceSubTypeInfo = () => {
  // const objappVersion = navigator.appVersion;
  const objAgent = navigator.userAgent;
  let objbrowserName = navigator.appName;
  let objfullVersion = "" + parseFloat(navigator.appVersion);
  let objOffsetName;
  let objOffsetVersion;
  let ix;
  // In Chrome
  if ((objOffsetVersion = objAgent.indexOf("Edg")) != -1) {
    //  "chromium based edge";
    objbrowserName = "Edge";
    objfullVersion = objAgent.substring(objOffsetVersion + 4);
  } else if ((objOffsetVersion = objAgent.indexOf("Edge")) != -1) {
    objbrowserName = "Edge";
    objfullVersion = objAgent.substring(objOffsetVersion + 5);
  } else if ((objOffsetVersion = objAgent.indexOf("OPR/")) != -1) {
    objbrowserName = "Opera";
    objfullVersion = objAgent.substring(objOffsetVersion + 4);
  } else if ((objOffsetVersion = objAgent.indexOf("Chrome")) != -1) {
    objbrowserName = "Chrome";
    objfullVersion = objAgent.substring(objOffsetVersion + 7);
  } // In Microsoft internet explorer
  else if ((objOffsetVersion = objAgent.indexOf("MSIE")) != -1) {
    objbrowserName = "Microsoft Internet Explorer";
    objfullVersion = objAgent.substring(objOffsetVersion + 5);
  } // In Firefox
  else if ((objOffsetVersion = objAgent.indexOf("Firefox")) != -1) {
    objbrowserName = "Firefox";
  } // In Safari
  else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
    objbrowserName = "Safari";
    objfullVersion = objAgent.substring(objOffsetVersion + 7);
    if ((objOffsetVersion = objAgent.indexOf("Version")) != -1)
      objfullVersion = objAgent.substring(objOffsetVersion + 8);
  } // For other browser "name/version" is at the end of userAgent
  else if (
    (objOffsetName = objAgent.lastIndexOf(" ") + 1) <
    (objOffsetVersion = objAgent.lastIndexOf("/"))
  ) {
    objbrowserName = objAgent.substring(objOffsetName, objOffsetVersion);
    objfullVersion = objAgent.substring(objOffsetVersion + 1);
    if (objbrowserName.toLowerCase() == objbrowserName.toUpperCase()) {
      objbrowserName = navigator.appName;
    }
  } // trimming the fullVersion string at semicolon/space if present
  if ((ix = objfullVersion.indexOf(";")) != -1)
    objfullVersion = objfullVersion.substring(0, ix);
  if ((ix = objfullVersion.indexOf(" ")) != -1)
    objfullVersion = objfullVersion.substring(0, ix);

  // getting browser versions.
  let curOS = "";
  if (navigator.appVersion.indexOf("Win") != -1) curOS = "Windows";
  if (navigator.appVersion.indexOf("Mac") != -1) curOS = "MacOS";
  if (navigator.appVersion.indexOf("X11") != -1) curOS = "UNIX";
  if (navigator.appVersion.indexOf("Linux") != -1) curOS = "Linux";

  return objbrowserName + "," + objfullVersion + "," + curOS;
};

export async function getNewSession() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const deviceId = getDeviceId();
  const boxid = getBoxId();
  const url =
    process.env.initJson["api"] +
    "/service/api/v1/get/token?tenant_code=" +
    process.env.initJson["tenantCode"] +
    "&box_id=" +
    boxid +
    "&product=" +
    process.env.initJson["product"] +
    "&device_id=" +
    deviceId +
    "&display_lang_code=" +
    process.env.appDefaultLanguage +
    "&device_sub_type=" +
    getDeviceSubTypeInfo() +
    "&timezone=" +
    timezone;

  try {
    const response = await getApiStaticData(url);
    if (response.data) {
      if (response.data.status) {
        auth.sessionId = response.data.response.sessionId;
        setItem("sessionId", auth.sessionId);
        setNookie("sessionId", auth.sessionId);
        setNookie("boxId", auth.boxId);
        return {
          sessionId: auth.sessionId,
          boxId: auth.boxId,
        };
      }
      return null;
    }
  } catch (e) {
    return null;
  }
}

export const unAuthorisedHandler = () => {
  clearStorage();
  setTimeout(() => {
    Router.reload();
  }, 1000);
};

// Logging out for now
export const handleTokenError = async () => {
  // postApiData(`${process.env.initJson["api"] }/service/api/auth/signout`,'').then(res=>{})
  clearStorage();
  setTimeout(() => {
    Router.reload();
  }, 1000);
};

export const signoutTheApp = () => {
  postApiData(process.env.initJson["api"] + "/service/api/auth/signout", "");
  clearStorage();
  setTimeout(() => {
    Router.replace("/").then(() => Router.reload());
  }, 2000);
};
