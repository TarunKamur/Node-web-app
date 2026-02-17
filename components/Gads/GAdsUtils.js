/* eslint-disable no-bitwise */
const generateUUID = () => {
  const r = (Math.random() * 0x100000000) | 0;
  return `div-gpt-ad-${r.toString(16).padStart(8, "0")}-0`;
};

export const checkNativeAds = (systemConfigs, pageData) => {
  console.log(systemConfigs, pageData);
  // if (systemConfigs.configs.supportNativeAds !== "true") {
  //   return null;
  // }
  const nativeAds = pageData?.adUrlResponse?.adUrlTypes.find(
    (ele) => ele.urlType === "native"
  );

  // {
  //   "urlType": "native",
  //   "url": "Mobile Banner Ad tags",
  //   "attributes": {
  //     "adTag": " "
  //   },
  //   "position": {
  //     "adSlot": " 1-R,2-R,5-R,7-R,20-R,24-R,28-R,32-R,36-R,40-R,44-R,48-R,52-R,56-R,60-R,64-R,68-R,72-R,76-R,80-R,84-R,88-R,92-R,96-R,100-R",
  //     "bottom":"true",
  //     'bottomAdStlye':"R",
  //     'top':"true",
  //     'topAdStlye': "R"
  //   },
  //   "adUnitId": "/23279243396/watcho_web/watcho_btf_1_728x90"
  // }
  if (!nativeAds) {
    return null;
  }

  // ads in b/w rails
  const info = {};
  if (nativeAds) {
    if (nativeAds.position?.adSlot) {
      nativeAds?.position?.adSlot.split(",").forEach((ele) => {
        const uniqueId = generateUUID();
        const [key, size] = ele.split("-");
        info[key] = { size, unitId: nativeAds?.adUnitId, uniqueId };
      });
    }

    if (nativeAds?.position?.bottom) {
      const uniqueId = generateUUID();
      info.bottom = {
        bottom: true,
        unitId: nativeAds?.adUnitId,
        uniqueId,
        size: nativeAds?.position?.bottomAdStlye,
      };
    }

    // top ads are for mobile view only
    if (nativeAds?.position?.top) {
      const uniqueId = generateUUID();
      info.top = {
        top: true,
        unitId: nativeAds?.adUnitId,
        uniqueId,
        size: nativeAds?.position?.topAdStlye,
      };
    }
    console.log(info);
    return info;
  }

  // ads as per interval with maxcount
  if (nativeAds?.position?.interval && nativeAds?.position?.maxCount) {
    if (pageData?.pageInfo?.attributes?.contentType == "network") {
      const infoObj = {};
      const interval = parseInt(nativeAds.position.interval);
      const maxCount = parseInt(nativeAds.position.maxCount);
      let intervalCount = 1;
      for (let i = 0; i < pageData.data.length; i += interval) {
        if (intervalCount <= maxCount) {
          intervalCount += 1;
          const uniqueId = generateUUID();
          infoObj[i] = { size: "", unitId: nativeAds?.adUnitId, uniqueId };
        }
      }
      return infoObj;
    }
  }
};
