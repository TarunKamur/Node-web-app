import React from "react";
import { useStore } from "@/store/store";
import { useEffect, useState, useRef } from "react";
import styles from "@/components/player/player.module.scss";
import PlayerSuggestions from "./playerSuggestions.component";
import PlayerDescription from "./playerDescription.component";
import JWPlayer from "./jw-player.component";
import { appConfig } from "@/config/app.config";
import { useRouter } from "next/router";
import { ImageConfig } from "@/config/ImageConfig";
import { getAbsolutePath } from "@/services/user.service";
import Image from "next/image";
import { debounceFunction } from "@/services/utility.service";
import GAdsComponent from "../Gads/GAdsComponent";
import { systemConfigs } from "@/services/user.service";
import { checkNativeAds } from "../Gads/GAdsUtils";

const Player = () => {
  const {
    state: { PageData },
  } = useStore();

  const { back } = useRouter();

  const [tabsData, setTabsData] = useState("");
  const [playerMetaData, setPlayerMetaData] = useState("");
  const [playerSuggestionsData, setPlayerSuggestionsData] = useState("");
  const [playerMobileDesign, setPlayerMobileDesign] = useState(false);
  const [showBgImage, setshowBgImage] = useState(true);
  const [videoBgImage, setVideoBgImage] = useState("");
  const playerSection = useRef(null);
  const playerDesMain = useRef(null);
  const [lefthandHeight, setLeftHandHeight] = useState(500);
  const playerContainerRef = useRef();
  const [adsSlots, setAdsSlots] = useState({});
  const [showBottomAd,setShowBottomAd]=useState(false);

  useEffect(() => {
    if (!!PageData) {
      if (PageData?.tabsInfo?.showTabs && PageData?.tabsInfo?.tabs.length > 0) {
        setTabsData(PageData?.tabsInfo);
      }
      PageData?.data?.map((data) => {
        if (data?.paneType === "content") {
          setPlayerMetaData(data);
        }
      });
      let sectionD =
        PageData.info.attributes.showOnPlayer == undefined ||
        PageData.info.attributes.showOnPlayer.length == 0
          ? []
          : PageData.info.attributes.showOnPlayer.split();
      let sections = PageData?.data?.filter((data) => {
        if (
          data?.paneType === "section" &&
          !(
            sectionD.includes(data.section.sectionInfo.code) ||
            data?.section?.sectionInfo?.dataType == "actor" ||
            (!!data.section.sectionData.params &&
              data.section.sectionData.params.showOnPlayer == "true")
          )
        ) {
          return data;
        }
      });
      setPlayerSuggestionsData([...sections]);
      mobileDesign();
      getBackgroundImage();

      let sData = PageData?.data.filter((ele) => {
        return (
          ele.paneType === "section" &&
          ((ele.section.sectionData.data.length &&
            sectionD.includes(ele.section.sectionInfo.code)) ||
            (!!ele.section.sectionData.params &&
              ele.section.sectionData.params.showOnPlayer == "true"))
        );
      });

      if(sData.length==0){
        setShowBottomAd(true);
      }

      const adsData = checkNativeAds(systemConfigs, PageData);
      if (adsData) {
        // console.log(adsData);
        setAdsSlots(adsData);
      }
    }
  }, [PageData]);

  useEffect(() => {
    const setSuggestionsHeight = (height) => {
      setLeftHandHeight(height);
    };
    let debouncFunc = debounceFunction(setSuggestionsHeight, 100);
    const resizeObserver = new ResizeObserver(() => {
      if (playerContainerRef.current)
        debouncFunc(playerContainerRef.current.clientHeight);
    });
    if (playerContainerRef.current) {
      setSuggestionsHeight(playerContainerRef.current.clientHeight);
      resizeObserver.observe(playerContainerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const mobileDesign = () => {
    if (
      (PageData?.info?.pageType === "player" ||
        PageData?.info?.pageType === "details") &&
      window.innerWidth <= 991
    ) {
      setPlayerMobileDesign(true);
    }
  };

  const getBackgroundImage = () => {
    let bgImage = "";
    PageData?.data?.map((data) => {
      if (data?.paneType === "content") {
        bgImage = getAbsolutePath(data?.content?.backgroundImage);
      }
    });
    setVideoBgImage(bgImage);
  };

  const loaderProp = ({ src }) => {
    return src;
  };

  const setVideoBgImg = () => {
    setshowBgImage(false);
  };

  return (
    <>
      <div
        className={`${styles.playerHome} ${playerMobileDesign ? styles.removeMarginTop : ""}`}
      >
        <div
          className={`${styles.playerLeft} playerLeftSec`}
          ref={playerContainerRef}
        >
          <span
            onClick={() => back()}
            className={`${styles.back_btn}`}
            id="freedomtv_ply_Bck"
          >
            <img
              src={`${appConfig.staticImagesPath}help-back-arrow.svg`}
              alt="back"
            />
          </span>
          <div
            className={`${styles.playerSection} ${playerMobileDesign ? styles.playerFixed : ""}`}
            ref={playerSection}
          >
            {showBgImage && (
              <Image
                loader={loaderProp}
                className={`${styles.bgImg}`}
                fill
                src={videoBgImage}
                alt="image"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.srcset = `${ImageConfig?.lazyimage16x9}`;
                }}
              />
            )}
            <JWPlayer
              setVideoBgImage={setVideoBgImg}
              streamPath={PageData?.info?.path}
            />
          </div>
          <div className={`${styles.playerDesMain}`} ref={playerDesMain}>
            <PlayerDescription playerMetaData={playerMetaData} />
          </div>
        </div>
        <div className={`${styles.playerRight}`}>
          <PlayerSuggestions
            lefthandHeight={lefthandHeight}
            playerSuggestionsData={playerSuggestionsData}
            tabsData={tabsData}
          />
        </div>
      </div>
      {showBottomAd && window.innerWidth > 990 && adsSlots?.bottom && (
        <GAdsComponent adData={adsSlots.bottom} />
      )}
    </>
  );
};

export default Player;
