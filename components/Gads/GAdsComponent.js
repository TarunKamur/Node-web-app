/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import style from "./GAds.module.scss";

const GAdsComponent = ({ adData }) => {
  const googletag = window?.googletag;

  useEffect(() => {
    let adDimensions;
    if (!adData?.unitId) {
      return;
    }

    if (adData?.size == "S") {
      adDimensions = [[300, 250]];
    } else if (matchMedia("(max-width: 768px)").matches) {
      adDimensions = [[320, 50]];
    } else {
      adDimensions = [
        [1003, 90],
        [970, 250],
        [728, 90],
        [468, 60],
      ];
    }
    if (adData) {
      const gptId = adData?.unitId.toString();
      initGpt(gptId, adData?.uniqueId, adDimensions);
    }
    // console.log(adData)
  }, [adData]);

  useEffect(() => {
    return () => onDestroy();
  }, []);

  const initGpt = (gptId, uniqueId, adDimensions) => {
    setTimeout(() => {
      if (typeof googletag !== "undefined") {
        googletag.cmd.push(() => {
          googletag
            .defineSlot(gptId, adDimensions, uniqueId)
            .addService(googletag.pubads());
          googletag.pubads().collapseEmptyDivs();
          googletag.pubads().enableSingleRequest();
          googletag.enableServices();
        });
        displayAds(uniqueId);
      }
    }, 1000);
  };

  const displayAds = (uniqueId) => {
    googletag.cmd.push(() => {
      console.log(googletag.cmd);
      googletag.display(uniqueId);
    });
  };

  const onDestroy = () => {
    if (typeof googletag !== "undefined") {
      try {
        googletag.destroySlots();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  };

  if (!adData?.uniqueId) {
    return null;
  }
  return (
    <div>
      {/* {process?.env?.environment == "beta" && (
        <p className={style.adText}>Advertisement</p>
      )} */}
      <div id={adData?.uniqueId} className={style.AdElement} />
    </div>
  );
};

export default GAdsComponent;
