import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./activityList.module.scss";
import styless from "@/components/cards/card.module.scss";
import dynamic from "next/dynamic";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import { ImageConfig } from "@/config/ImageConfig";
import Link from "next/link";
import useGetApiMutate from "@/hooks/useGetApidata";
import Loader from "@/components/loader/loader.component";
import { actuvityList } from "@/.i18n/locale";
import { sendEvent } from "@/services/analytics.service";
import { jsonToQueryParams } from "@/services/utility.service";

const PurchasePoster = dynamic(
  () => import("@/components/cards/cardTypes/PurchasePoster.component"),
  { ssr: false }
);

const NoPurchasesCard = dynamic(
  () => import("@/components/no-purchase/no-purchase-card.component")
);

const FollowerPoster = dynamic(
  () => import("@/components/cards/cardTypes/FollowerPoster.component")
);
export default function ActivityList(props) {
  const {
    state: {
      SystemConfig,
      userDetails,
      NotificationBar,
      localLang,
      PageRefresh,
    },
    dispatch,
  } = useStore();

  const [cardType, setcardType] = useState("");
  const [btnClick, setbtnClick] = useState("");
  const [firstApihit, setApihit] = useState(true);
  const [headingName, setHeadingName] = useState("Channels");

  const [cardDataAll, setcardData] = useState([]);

  const [buttonData, setbuttonData] = useState([]);
  const [offsetCount, setOffsetCount] = useState(24);
  const [loader, setLoader] = useState(true);
  const router = useRouter();
  const { back } = useRouter();
  const [followstateUpdate, setfollowstateUpdate] = useState(false);
  const [followPageData, setfollowPageData] = useState([]);
  const [purchasedcontentState, setpurchasedcontent] = useState(false);
  const { content } = router.query;
  const paginationRef = useRef({
    started: false,
  });
  const [codeParam,setCodeParam] = useState("");
  const [codeOffset,setCodeOffset] = useState(0);
  const [hasDynamicName, sethasDynamicName] = useState([]);

  const hasmoreData = useRef(false);
  const width =
    typeof window !== "undefined" && window.innerWidth <= 767
      ? buttonData.length === 2
        ? "50%"
        : buttonData.length === 3
          ? "33.33%"
          : ""
      : "";

  const { mutate: mutateGetChannelData, data: getChannelData } =
    useGetApiMutate();
  const { mutate: mutateGetsubMenu, data: getSubMenu } = useGetApiMutate();

  useEffect(() => {
    setcardType("");
    setbtnClick("");
    setcardData([]);
    setLoader(true);
    let headerId = "headerHomePage",
      footerId = "app_footer_id",
      breakpoint = 991;
    // useMobileHideHeaderFooter();
    const windowWidth = window.innerWidth;
    let headerElement = null;
    let footerElement = null;
    setTimeout(() => {
      if (windowWidth <= breakpoint) {
        setTimeout(() => {
          headerElement = document.getElementById(headerId);
          footerElement = document.getElementById(footerId);

          if (headerElement) headerElement.style.display = "none";
          if (footerElement) footerElement.style.display = "none";
        }, 1);
      }
    }, 10);

    const scrollHandler = () => {
      const scrolledBottompx =
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY;
      const scrolledToppx = window.scrollY;

      if (
        scrolledBottompx !== null &&
        scrolledBottompx < window.innerHeight &&
        scrolledToppx > 150
      ) {
        if (paginationRef.current.started === false) {
          paginationRef.current.started = true;
          pagination();
        }
      }
    };
    document.addEventListener("scroll", scrollHandler);
    apiHitsGetData();
    return () => {
      document.removeEventListener("scroll", scrollHandler);
      if (headerElement) headerElement.style.display = "inline";
      if (footerElement) footerElement.style.display = "block";
    };
  }, [router.asPath, userDetails, router.query, SystemConfig]);

  const hasRunOnce = useRef(false);
  useEffect(() => {
    if (!!cardType) {
      if (router.query?.content != "purchasedcontent") {
        const { api } = process.env.initJson;
        let url = `${api}/service/api/v1/page/content?path=${btnClick?.targetPath}&count=${offsetCount}`;

        if (cardType == "mylikedvideos" & firstApihit) {
          url = `${api}/service/api/v1/page/content?path=${"section/user_liked_content"}&count=${offsetCount}`;
        }else if(cardType == "mylikedvideos" && !firstApihit){
          let filteredArray = hasDynamicName.filter((value) =>
            sectionCode.slice(0, 4).includes(value)
          );
          let params = {
            path: "section/user_liked_content",
            count: 24,
            code: codeParam,
            hasDynamicExpression: filteredArray?.length > 0 ? true : false,
            offset: codeOffset,
          }
          url = `${api}/service/api/v1/section/data?` + jsonToQueryParams(params);
        }
        if (btnClick?.code == "followed" && followPageData.length > 0) {
          setcardData(followPageData);
        } else {
          getpageData(url);
        }
      } else if (router.query?.content == "purchasedcontent") {
        if (cardType != "" && !hasRunOnce.current) {
          hasRunOnce.current = true;
          // purchasedcontentApi();
          setpurchasedcontent(true);
        }
      }
    }
  }, [cardType, offsetCount]);

  useEffect(() => {
    if (followstateUpdate) {
      apiHitsGetData(followstateUpdate);
      setfollowstateUpdate(false);
    }
  }, [followstateUpdate]);

  useEffect(() => {
    if (purchasedcontentState) {
      purchasedcontentApi();
      setpurchasedcontent(false);
    }
  }, [purchasedcontentState]);

  const apiHitsGetData = (follow = false) => {
    console.log(SystemConfig?.configs, "===>");

    // useMobileHideHeaderFooter();
    if (SystemConfig?.configs) {
      let freedomSettingsMenu =
        SystemConfig?.configs?.freedomSettingsMenuV2 &&
        JSON.parse(SystemConfig?.configs?.freedomSettingsMenuV2);
      if (router.query?.content == "Channels") {
        chennelSubMenuBtn(follow);

        setHeadingName(actuvityList[localLang]?.Channels);
      } else if (router.query?.content == "mylikedvideos") {
        setcardType("mylikedvideos");
        setHeadingName(actuvityList[localLang]?.My_Liked_Videos);
        setfollowPageData([]);
      } else if (router.query?.content == "purchasedcontent") {
        setbtnClick(freedomSettingsMenu?.purchasedContentMenu[0]);
        setbuttonData(freedomSettingsMenu?.purchasedContentMenu);
        setHeadingName(actuvityList[localLang]?.SWAG_Purchased_Content);
        setcardType("channel_poster");
        setfollowPageData([]);
        setpurchasedcontent(true);
        // purchasedcontentApi();
      }
      // myCallback();
    }
  };

  const chennelSubMenuBtn = (follow = false) => {
    const { api } = process.env.initJson;
    let url = `${api}/service/api/v1/get/subscribed/followed/data`;
    mutateGetsubMenu(url, {
      onSuccess: (response) => {
        console.log(response, "<<<<<<<<<<response");
        if (response?.data?.status) {
          setbuttonData(response?.data?.response);
          console.log(cardType, ">btnClick>>>", btnClick);
          if (btnClick?.code != "followed") {
            setbtnClick(response?.data?.response[0]);
          }
          if (
            response?.data?.response[0].code == "followed" ||
            btnClick?.code == "followed"
          ) {
            if (!follow) {
              setcardType("followerPoster");
              if (btnClick?.code == "followed") {
                const { api } = process.env.initJson;
                let url = `${api}/service/api/v1/page/content?path=${btnClick?.targetPath}&count=${offsetCount}`;
                getpageData(url);
              }
            }
          } else {
            setcardType("channel_poster");
          }
        } else {
          // setbuttonData(  [
          //   {
          //   "name":"Subscribed(1)",
          //   "code":"subscribe",
          //   "count":"1",
          //   "targetPath":"section/followed-channels"
          //   },
          //   {
          //   "name":"Followed(1)",
          //   "code":"followed",
          //   "count":"1",
          //   "targetPath":"section/purchased-svod-channel"
          //   }
          //   ]);
        }
      },
    });
  };
  const getpageData = (url) => {
    setLoader(true);
    mutateGetChannelData(url, {
      onSuccess: (response) => {
        if (response?.data?.status) {
          let collectData = [];
          if(firstApihit && cardType=="mylikedvideos"){
            collectData = [
              ...cardDataAll,
              ...response?.data?.response?.data[0]?.section?.sectionData?.data,
            ];
            setCodeParam(response?.data?.response?.data[0]?.section?.sectionData?.section);
          setCodeOffset(response?.data?.response?.data[0]?.section?.sectionData?.lastIndex);
          let DynamicName = [];
          if (response?.data?.response?.data[0]?.section?.sectionInfo?.params?.hasDynamicName == "true") {
            DynamicName = [...DynamicName, secData?.contentCode];
          }
          sethasDynamicName(DynamicName);
          hasmoreData.current =
            response?.data?.response?.data[0]?.section?.sectionData?.hasMoreData;
          }else if(!firstApihit && cardType=="mylikedvideos"){
            collectData = [
              ...cardDataAll,
              ...response?.data?.response[0]?.data,
            ];
            hasmoreData.current =
            response?.data?.response[0]?.hasMoreData;
          }else{
            collectData = [
              ...cardDataAll,
              ...response?.data?.response?.data[0]?.section?.sectionData?.data,
            ];
            hasmoreData.current =
            response?.data?.response?.data[0]?.section?.sectionData?.hasMoreData;
          }
          
          setcardData(collectData);
          if (btnClick?.code == "followed") {
            setfollowPageData(collectData);
          }

          
          paginationRef.current.started = false;
        } else{
        }
        setLoader(false);
      },
      onError:(err)=>{
        console.log("err",err);
      }
    });
  };

  const purchasedcontentApi = () => {
    const { api } = process.env.initJson;
    if (btnClick != "") {
      let url = `${api}/service/api/v1/page/content?path=${btnClick?.targetPath}&count=${offsetCount}`;
      getpageData(url);
    }
  };

  const pagination = useCallback(() => {
    setApihit(false);
    if (hasmoreData.current) {
      setOffsetCount(offsetCount + 24);
    }
  }, [cardDataAll, router.asPath]);

  const handleBack = () => {
    back();
  };
  useEffect(() => {
    console.log(">>>>> setcardData([]);", btnClick);
    if (btnClick?.code == "followed") {
      setcardType("followerPoster");
    } else if (btnClick?.code == "subscribed") {
      setcardType("channel_poster");
    } else if (
      btnClick?.code == "videos" ||
      btnClick?.code == "series" ||
      btnClick?.code == "liveevents" ||
      btnClick?.code == "movies"
    ) {
      setcardType("purchasePoster");
    } else if (btnClick?.code == "channel") {
      setcardType("channel_poster");
    }
  }, [btnClick]);

  const dataMap = (data) => {
    hasRunOnce.current = false;
    if (btnClick.code == data.code) {
      return null;
    }
    if (data.code == "subscribed" || data.name == "Subscribed") {
      sendEvent("subscribed_channel_list", {
        subscribe_channel_count: data.count || "-1",
        cpCode: "freedom",
      });
    }
    if (data.code == "followed" || data.name == "Followed") {
      sendEvent("followed_channel_list", {
        followed_channel_count: data.count || "-1",
        cpCode: "freedom",
      });
    }
    setcardType("");
    setcardData([]);
    setbtnClick(data);
  };
  const UnfollowApiHit = (status) => {
    if (status) {
      // setcardData([]);
      // setLoader(true);
      setTimeout(() => {
        // setfollowstateUpdate(true);
        setfollowPageData(cardDataAll);
      }, 500);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerdiv}>
        <span className={styles.headerleft}>
          {" "}
          <img
            alt="back"
            onClick={handleBack}
            className={` ${styles.back}`}
            src={`${ImageConfig?.settings?.back}`}
          />
          <h2 className={styles.heading}>{headingName}</h2>
        </span>
        <span className={styles.headerright}>
          <Link href="/search" aria-label="search icon">
            <img
              className={`${styles.searchIcon}   ${styless.sstext}`}
              src={`${ImageConfig?.mobileHeader?.searchIcon}`}
              alt="search_icon"
            />
          </Link>
        </span>
      </div>

      {/* Tabs */}
      {router.query?.content != "mylikedvideos" && (
        <div
          className={`${styles.tabs} ${buttonData?.length === 2 ? styles.btnWidth : ""} `}
        >
          {buttonData?.length > 0 &&
            buttonData?.map((btnData, index) => (
              <button
                style={{ width }}
                key={`${index}_${btnData.code}`}
                className={btnClick?.code == btnData.code ? styles.active : ""}
                onClick={(e) => {
                  e.preventDefault();
                  dataMap(btnData);
                }}
              >
                {actuvityList[localLang][btnData?.code] || btnData.name}{" "}
                {!!btnData?.count && `(${btnData?.count})`}
              </button>
            ))}
        </div>
      )}
      {/* {console.log(">>>>cardType", cardType)} */}
      {cardType != "mylikedvideos" && cardType != "followerPoster" && (
        <div className={styles.likedVideoList} key={cardType+'string'}>
          <PurchasePoster cardData={cardDataAll} cardType={cardType} />
        </div>
      )}
      {cardType == "followerPoster" && cardDataAll.length > 0 && (
        <div className={styles.likedVideoList} key={cardType+"_followerPoster"}>
          <FollowerPoster
            cardData={cardDataAll}
            cardType={cardType}
            UnfollowApiHit={UnfollowApiHit}
          />
        </div>
      )}

      {cardType == "mylikedvideos" && (
        <>
          <div
            className={styles.likedVideoList}
            key={`${cardType}_${"cardDataMap.date"}`}
          >
            {/* <span> {cardDataMap.date}</span> */}
            <PurchasePoster cardData={cardDataAll} cardType={cardType} />
          </div>
          {/* {cardDataAll.map((cardDataMap, index) => {
            return (
              <>
              </>
            );
          })} */}
        </>
      )}
      {/* if there is no content or no purchase this below component will render */}
      {loader && (
        <div className={styles.loader}>
          <Loader type="button" />
        </div>
      )}
      {cardDataAll?.length === 0 && !loader && (
        <NoPurchasesCard showTitle={btnClick} />
      )}
    </div>
  );
}
