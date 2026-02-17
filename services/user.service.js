import {
  getItem,
  setItem,
  getItemEnc,
  setItemEnc,
  setNookie,
  getNookie,
} from "@/services/local-storage.service";
import {
  getApiData,
  unAuthorisedHandler,
} from "@/services/data-manager.service";
import { appConfig } from "@/config/app.config";

export let systemConfigs = null;
export let systemFeatures = null;
export let TemplatesData = null;
export let userDetails = null;
export let isloggedin = null;
export let systemLangs = null;
export let Activepack = null;
let resourceProfiles;
let resourceProfilesStore;

export const checkSystemConfig = () => {
  if (!!systemConfigs) {
    return systemConfigs;
  } else {
    let ele = getItem("systemConfigs");
    if (!!ele) {
      systemConfigs = ele.data;
      resourceProfiles = systemConfigs.resourceProfiles;
      resourceProfilesStore = setUrlPrefix(systemConfigs.resourceProfiles);
      if (parseInt(ele.t) < new Date().getTime()) {
        getNewConfigdata();
      }
      return systemConfigs;
    } else {
      return getNewConfigdata();
    }
  }
};

const setUrlPrefix = (resProfilesObj) => {
  let resProfilesStorage = resProfilesObj || {};
  if (Object.keys(resProfilesStorage).length) {
    resProfilesStorage = resProfilesStorage.reduce((acc, item) => {
      acc[item.code] = {
        ...item,
      };
      if (item.isDefault) {
        acc["defaultResource"] = item;
      }
      return acc;
    }, {});
  }
  return resProfilesStorage;
};

const getUrlPrefix = (resource) => {
  return (
    resourceProfilesStore?.[resource]?.urlPrefix ||
    (resourceProfilesStore?.defaultResource &&
      resourceProfilesStore?.[resourceProfilesStore?.defaultResource]
        ?.urlPrefix) ||
    null
  );
};

const getProfile = (resource) => {
  if (resourceProfilesStore) {
    const prefix = getUrlPrefix(resource);
    if (prefix) {
      return prefix;
    }
  }

  if (!resourceProfiles) {
    return;
  }
  if (!!resource) {
    for (let i = 0; i < resourceProfiles.length; i++) {
      if (resource === resourceProfiles[i].code) {
        return resourceProfiles[i].urlPrefix;
      }
    }
  } else {
    for (let i = 0; i < resourceProfiles.length; i++) {
      if (resourceProfiles[i].isDefault) {
        return resourceProfiles[i].urlPrefix;
      }
    }
  }
};

export const getNetworkIcon = (code) => {
  let notworks = systemConfigs.networks;
  let icon = notworks.filter((ele) => ele.code === code);
  try {
    return !!icon[0].iconUrl ? getAbsolutePath(icon[0].iconUrl) : null;
  } catch (e) {}
};

export const getImagePath = (path) => {
  try {
    return !!path ? getAbsolutePath(path) : "";
  } catch (e) {}
};

export const getAbsolutePath = (resourcePath) => {
  if (resourcePath == undefined) {
    return resourcePath;
  }
  if (
    resourcePath.indexOf("http") == "0" ||
    resourcePath.indexOf("https") == "0"
  ) {
    return resourcePath;
  } else if (resourcePath.split(",").length > 1) {
    let arr = resourcePath.split(",");
    let profile = getProfile(arr[0]);
    return profile + arr.slice(1, arr.length).join();
  } else {
    return !!getProfile() + resourcePath;
  }
};
export const getTemplatesList = () => {
  if (!!TemplatesData) {
    return TemplatesData;
  } else {
    let ele = getItem("TemplatesData");
    if (!!ele) {
      TemplatesData = ele.data;
      if (parseInt(ele.t) < new Date().getTime()) {
        getTemplateData();
      }
      return TemplatesData;
    } else {
      return getTemplateData();
    }
  }
};

export const getTemplateData = async () => {
  let url = process.env.initJson["api"] + "/service/api/v1/templates";
  try {
    let response = await getApiData(url);
    if (!!response.data) {
      if (!!response.data.status) {
        TemplatesData = response.data.response;
        setItem("TemplatesData", {
          data: TemplatesData,
          t: new Date().getTime() + 2 * 24 * 60 * 60000,
        });
      } else {
        if (response.data.error && response.data.error.code === 401) {
          unAuthorisedHandler();
        }
        if (response?.data?.error?.code === 404) {
          setItem("TemplatesData", {
            data: null,
            t: new Date().getTime() + 60 * 60000,
          });
        }
        return null;
      }
      return TemplatesData;
    }
  } catch (error) {
    return null;
  }
};
export async function getNewConfigdata() {
  let url =
    process.env.initJson["api"] +
    `/service/api/v1/system/config${!!appConfig.configVersionApi ? "?version=v2" : ""}`;
  try {
    let response = await getApiData(url);
    if (!!response.data) {
      if (!!response.data.status) {
        systemConfigs = response.data.response;
        resourceProfiles = systemConfigs.resourceProfiles;
        resourceProfilesStore = setUrlPrefix(systemConfigs.resourceProfiles);
        setItem("systemConfigs", {
          t: new Date().getTime() + 2 * 60 * 60 * 1000,
          data: systemConfigs,
        });
      } else {
        if (response.data.error && response.data.error.code === 401) {
          unAuthorisedHandler();
        }
        return null;
      }
      return systemConfigs;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export const checkSystemFeature = () => {
  if (!!systemFeatures) {
    return systemFeatures;
  } else {
    let ele = getItem("systemFeatures");
    if (!!ele) {
      systemFeatures = ele.data;
      if (parseInt(ele.t) < new Date().getTime()) {
        getNewFeaturesdata();
      }
      return systemFeatures;
    } else {
      return getNewFeaturesdata();
    }
  }
};

export const checkSystemLanguages = () => {
  if (systemLangs) {
    return systemLangs;
  } else {
    const ele = getItem("systemConfigLangs");
    if (!!ele) {
      const currentTime = Date.now();
      // Check for validity
      if (
        ele.loadtime == undefined ||
        Date.now() - ele.loadtime > 24 * 60 * 60 * 1000
      ) {
        // For every one day, refetching data
        return getStaticlangdata();
      } else {
        systemLangs = ele;
        return systemLangs;
      }
    } else {
      return getStaticlangdata();
    }
  }
};

async function getNewFeaturesdata() {
  let url = process.env.initJson["api"] + "/service/api/v1/system/feature";
  try {
    let response = await getApiData(url);
    if (!!response.data) {
      if (!!response.data.status) {
        systemFeatures = response.data.response.systemFeatures;
        setItem("systemFeatures", {
          t: new Date().getTime() + 2 * 60 * 60 * 1000,
          data: systemFeatures,
        });
        const cUserData = getNookie("user-info") || {};
        const newUserData = {
          ...cUserData,
          hasUserProfiles:
            systemFeatures?.userprofiles?.fields.is_userprofiles_supported ==
            "true",
        };
        setNookie("user-info", newUserData);
      } else {
        if (response.data.error && response.data.error.code === 401) {
          unAuthorisedHandler();
        }
        return null;
      }
      return systemFeatures;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export const checkUserLogin = () => {
  if (!!userDetails) {
    return userDetails;
  } else {
    let ele = getItemEnc("uDetails");
    let isloggedin = getItem("isloggedin");
    if (!!ele) {
      userDetails = ele;
      return userDetails;
    } else if (isloggedin) {
      return getuserDetails();
    } else {
      return null;
    }
  }
};

export const checkActivePack = () => {
  if (!!Activepack && Activepack.length > 0) {
    return Activepack;
  } else {
    let activ = getItem("activePackagesList");
    Activepack = activ;
    if (activ) {
      return activ;
    } else {
      return { expiry: 0 };
    }
  }
};

async function getuserDetails() {
  let url = process.env.initJson["api"] + "/service/api/auth/user/info";
  try {
    let response = await getApiData(url);
    if (!!response.data) {
      if (!!response.data.status) {
        userDetails = response.data.response;
        setItemEnc("uDetails", userDetails);
        setItem("isloggedin", true);
        const cUserData = getNookie("user-info") || {};
        const newUserData = { ...cUserData, isLoggedIn: true };
        setNookie("user-info", newUserData);
      } else {
        if (response.data.error && response.data.error.code === 401) {
          unAuthorisedHandler();
        }
        return null;
      }
      return userDetails;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export const setUserDetails = (data) => {
  setItemEnc("uDetails", data);
  userDetails = data;
};

export const isloggedinCheck = () => {
  if (isloggedin != null || isloggedin != undefined) {
    return isloggedin;
  } else {
    isloggedin = getItem("isloggedin");
    return isloggedin;
  }
};

export const getStaticlangdata = async () => {
  const url = !!systemConfigs?.configs?.multiLanguageJson
    ? systemConfigs?.configs?.multiLanguageJson
    : process.env.localLangconfig;
  try {
    const res = await getApiData(url);
    if (res?.status) {
      // Add loadtime and store in local storage
      const data = {
        loadtime: Date.now(),
      };
      // Converting object keys (language codes) to lowercase
      Object.keys(res.data).forEach(
        (item) => (data[item.toLowerCase()] = res.data[item])
      );
      setItem("systemConfigLangs", data);
    }
  } catch (e) {
    return null;
  }
};
