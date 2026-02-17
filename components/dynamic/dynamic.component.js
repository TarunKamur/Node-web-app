import { useEffect, useState, useRef } from "react";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import {
  getPagePath,
  getQueryParams,
  jsonToQueryParams,
} from "@/services/utility.service";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import useGetApiMutate from "@/hooks/useGetApidata";

import Banners from "@/components/bannersV2/SlickBanners.component";
import Sections from "@/components/sections/sections.component";
import Grid from "@/components/grid/grid.component";
import Player from "@/components/player/player.component";
import TvshowDetails from "@/components/tvshowDetails/tvshowDetails.component";
import Tvshowtabs from "@/components/tvshowtabs/tvshowtabs.component";
import styles from "./dynamic.module.scss";
import Skeleton from "../skeleton/skeleton.component";
import { getItem ,setItem} from "@/services/local-storage.service";
import NetworkDetails from "../network-details/networkDetails.component";
import PageNotFound from "../page-not-found/page-not-found.component";
import Promotional_popup from "@/components/promotional-popup/promotional-popup.component";
import { appConfig } from "@/config/app.config";
import { DHeaderconstant } from "@/.i18n/locale";
import CreatorDetails from "../creatorDetails/creatorDetails.component";
import Cptabs from "../cptabs/cptabs.component";
import getApiStaticData from "@/hooks/useGetApidata";
import {
  sendEvent,
  distroAnalyicsEventCall,
} from "@/services/analytics.service";

const Dynamic = (props) => {
  const {
    state: { SystemFeature, SystemConfig, PageRefresh, userDetails, localLang },
    dispatch,
  } = useStore();
  const [pagePath, setPagePath] = useState({});
  const [apiData, setApiData] = useState({});
  const [gridData, setGridData] = useState({});
  const [errorData, setErrorData] = useState(null);
  const [sectionData, setSectionData] = useState({});

  const [cpSubMenus, setCpSubMenus] = useState([]);
  const {
    mutate: getSubMenuApi,
    data: cpSubMenuDataApi,
    isLoading: isCpSubmenuLoading,
    isError: isCpSubmenuError,
  } = getApiStaticData();

  const {
    mutate: mutateGetData,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const {
    mutate: mutateGetFavData,
    data: apiFavResponse,
    isLoading: isFavLoading,
  } = useGetApiMutate();
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const router = useRouter();
  let currentPagePath = router.asPath.replace("/", "");
  const { mutate: mutateGetStreamDatas, data: streamDataResponses } =
    getApiStaticData();
  const distroFFApihit = useRef(false);
  useEffect( () => {
    let pPath = router.asPath;
    setPagePath({
      path: getPagePath(pPath),
      query: getQueryParams(pPath),
    });
    if (router.asPath.includes("cpcontent")) {
      checkCpMenu(pPath)
    } else {
      getPageData(getPagePath(pPath));
    }
    openSocialPopup();
    if (
      getPagePath(pPath) == "partner/distro" &&
      !distroFFApihit.current &&
      appConfig?.distroPixelUrlAnalytics?.isdistroAnalyticsEnebled
    ) {
      distroFFApihit.current = true;
      let obj = {
        partner_name: "dishtv",
        random: new Date().getTime(),
        event_name: "ff",
        advertising_id: getItem("boxId"),
        playback_id: getItem("sessionId"),
        content_provider_id: "",
        show_id: "",
        episode_id: "",
        device_category: "web",
        encoded_video_url: encodeURIComponent(window.location.href),
      };
      let path = distroAnalyicsEventCall(obj);
      try {
        mutateGetStreamDatas(path);
      } catch (error) {}
    } else if (getPagePath(pPath) != "partner/distro") {
      distroFFApihit.current = false;
    }
    // ((!!SystemFeature && !!SystemFeature.userprofiles && (SystemFeature.userprofiles.fields.is_userprofiles_supported == 'true')) && !!userDetails) && validateProfileExpiry()
    return () => {
      dispatch({ type: actions.packageUtil, payload: null });
      setApiData({});
      dispatch({ type: actions.PageData, payload: {} });
    };
  }, [router.asPath, SystemConfig, SystemFeature]);

  const checkCpMenu = async(pPath)=>{
    let cpMenuAry=  await getItem("cpMenuAry");
    let  item =  '';
    if(JSON.parse(cpMenuAry))item = await JSON.parse(cpMenuAry);
     const now = new Date().getTime();
 
    //  console.log(item,">>>now >>>",!item?.menu);
     if (now >= item?.expiry ||  item =='' || !item?.menu || item?.menu.length ==0) {
       const url =
         process.env.initJson.api + `/service/api/v1/get/menus?parent_code=swag`;
       getSubMenuApi(url, {
         onSuccess: async(menures) => {
           let menuData =menures?.data?.response;
           let menudata ={
             menu:menuData,
             expiry: new Date().getTime() + 3600 * 1000 
            }
           await setItem("cpMenuAry", JSON.stringify(menudata));
           setTimeout(()=>{

             cpMenuFuntion(menuData,pPath);
           },1000)
          
         },
       });
     }else {
       cpMenuFuntion(item.menu,pPath);
     }
  }
  const cpMenuFuntion =(menuData,pPath)=>{
    setCpSubMenus(menuData);
    if (menuData?.length > 0) {
      let tg;
      
      if (pPath.includes("cpcontent=all")) {
        tg = menuData[0].targetPath;
        setTimeout(()=>{
          router.replace({
            pathname: router.asPath?.split("?")[0],
            query: { cpcontent: tg },
          });
        },10)
          return;
      } else {
        const target1 = pPath.split("?")[1];
        const finalTarget = target1.split("=")[1];
        // const newData = menures?.data?.response?.filter(
        //   (each) => each.displayText === finalTarget.toUpperCase()
        // );
        //console.log(newData[0].targetPath);
        //console.log(finalTarget);
        // console.log(">>>>>target",finalTarget,decodeURIComponent (finalTarget))
        tg = decodeURIComponent(finalTarget);
      }

      getPageData(getPagePath(pPath), tg);
    } else {
      getPageData(getPagePath(pPath));
    }
  }
  useEffect(() => {
    if (PageRefresh == true) {
      getPageData(getPagePath(router.asPath));
      dispatch({ type: actions.PageRefresh, payload: false });
    }
  }, [PageRefresh]);

  useEffect(() => {
    if (!!apiResponse?.data) {
      dispatch({ type: actions.packageUtil, payload: null });
      if (!!apiResponse?.data?.status) {
        if (
          apiResponse?.data?.response?.errorResponse?.code === 404 ||
          apiResponse?.data?.response?.errorResponse?.code === -4 ||
          apiResponse?.data?.response?.errorResponse?.code === -113
        ) {
          setApiData({});
          dispatch({ type: actions.PageData, payload: {} });
          if (apiResponse?.data?.response?.errorResponse) {
            if (currentPagePath == SystemConfig.configs.favouritesTargetPath) {
              setErrorData({ message: "", code: "-2022" });
            } else if (apiResponse?.data?.response?.data.length === 0) {
              setErrorData({ message: "", code: "-1" });
            } else if (
              currentPagePath == SystemConfig?.configs?.myPurchasesTargetPathWeb
            ) {
              setErrorData({ message: "", code: "-2023" });
            } else {
              setErrorData({
                message: apiResponse?.data?.response?.errorResponse.message,
                code: "" + apiResponse?.data?.response?.errorResponse.code,
              });
            }
          }
        } else {
          setApiData({ ...apiResponse?.data?.response });
          dispatch({
            type: actions.PageData,
            payload: apiResponse?.data?.response,
          });
          if (apiResponse?.data?.response?.info?.pageType == "list") {
            let sData = apiResponse?.data?.response?.data.filter((ele) => {
              return (
                ele.paneType === "section" &&
                ele.section.sectionData.data.length
              );
            });
            setGridData(sData[0]);
          }
          if (apiResponse?.data?.response?.tabsInfo?.showTabs == true) {
            let Section = apiResponse?.data?.response?.data.filter((ele) => {
              return ele.paneType === "section" && ele.contentCode;
            });
            setSectionData(Section[0]);
          }
          if (apiResponse?.data?.response?.data.length === 0) {
            setErrorData({ message: "", code: "-1" });
          }
        }
      } else {
        setApiData({});
        dispatch({ type: actions.PageData, payload: {} });
        if (
          apiResponse?.data?.error &&
          apiResponse?.data?.error?.code === 401
        ) {
          unAuthorisedHandler();
        } else {
          setErrorData({
            message: apiResponse?.data?.error?.message,
            code: "" + apiResponse?.data?.error?.code,
          });
        }
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    if (apiFavResponse?.data) {
      dispatch({ type: actions.packageUtil, payload: null });
      if (apiFavResponse?.data?.status) {
        if (
          apiFavResponse?.data?.response?.errorResponse?.code === 404 ||
          apiFavResponse?.data?.response?.errorResponse?.code === -4 ||
          apiFavResponse?.data?.response?.[0]?.data.length == 0
        ) {
          setApiData({});
          dispatch({ type: actions.PageData, payload: {} });
          setErrorData({ message: "", code: "-2022" });
        } else {
          const apiFavData = {
            data: [
              {
                paneType: "section",
                section: {
                  sectionData: apiFavResponse?.data?.response[0],
                  sectionInfo: {
                    name: DHeaderconstant[localLang]?.My_Watchlist,
                  },
                },
              },
            ],
            info: { pageType: "list" },
          };
          setApiData(apiFavData);
          dispatch({ type: actions.PageData, payload: apiFavData });
          if (apiFavData?.info?.pageType == "list") {
            setGridData(apiFavData?.data[0]);
          }
        }
      } else {
        setApiData({});
        dispatch({ type: actions.PageData, payload: {} });
        if (
          apiFavResponse?.data?.error &&
          apiFavResponse?.data?.error?.code === 401
        ) {
          unAuthorisedHandler();
        } else {
          setErrorData({
            message: apiFavResponse?.data?.error?.message,
            code: "" + apiFavResponse?.data?.error?.code,
          });
        }
      }
    }
  }, [apiFavResponse]);

  useEffect(() => {
    if (isError == true) {
      setApiData({});
      dispatch({ type: actions.PageData, payload: {} });
      if (error?.response?.status === 403) {
        setErrorData({
          message: error?.response?.data?.error?.message,
          code: "-16",
        });
      } else if (error.code === "ERR_NETWORK") {
        setErrorData({
          message: "Something went wrong, Please check the network connection",
          code: "ERR_NETWORK",
        });
      } else {
        setErrorData({
          message: "Something went wrong, Please check the network connection",
          code: "5000",
        });
      }
    }
  }, [error, isError]);

  const getPageData = async (path, subPath = "") => {
    if (!SystemConfig || path.includes("[...")) {
      return;
    }
    setApiData({});
    setErrorData(null);
    if (
      appConfig?.isOldFavourite &&
      SystemConfig?.configs?.favouritesTargetPath == path
    ) {
      mutateGetFavData(
        `${process.env.initJson["api"]}/service/api/auth/user/favourites/list`
      );
      return;
    }
    let params = {
      path: path == "/" || path == "" || !path ? "home" : path,
      count: 25,
    };
    if (subPath != "") {
      params.path = subPath;
      // console.log(params);
    }
    let url =
      process.env.initJson["api"] +
      "/service/api/v1/page/content?" +
      jsonToQueryParams(params);
    try {
      // console.log(url);
      mutateGetData(url);
    } catch (e) {}
  };

  const validateProfileExpiry = () => {
    let t = getItem("profile-expiry-time");
    if (!t || t < new Date().getTime()) {
      router.push("/profiles/select-user-profile");
    }
  };

  const openSocialPopup = () => {
    if (!!SystemConfig?.configs?.interstitialStaticPopup) {
      let isExpired = getItem("socialpop");
      isExpired = parseInt(isExpired, 10);
      let currentTime = Math.floor(Date.now() / 1000);
      if (
        (pagePath.path == "" || pagePath.path == "home") &&
        (!getItem("socialpop") || isExpired < currentTime)
      ) {
        setShowPromoPopup(true);
      }
    }
  };
  const togglePromotionalModal = () => {
    setShowPromoPopup(false);
  };

  if (isLoading || isFavLoading) {
    return (
      <div>
        <Skeleton pagePath={pagePath.path}></Skeleton>
      </div>
    );
  }

  if (!!errorData) {
    return <PageNotFound detailsInfo={errorData}></PageNotFound>;
  }

  return (
    <div
      className={`${styles.dynamicMain}  ${apiData?.info?.code == "freedom-tv" && styles.freedomtvDynamic} `}
    >
      {apiData?.info?.pageType === "content" && (
        <div>
          {cpSubMenus?.length > 0 && router.asPath.includes("cpcontent") && (
            <Cptabs cpSubMenuData={cpSubMenus} />
          )}{" "}
          {/* apiData?.info?.path.includes("freedom-tv") &&*/}
          <Banners
            bannerslist={apiData?.banners}
            bannerCode={apiData?.info?.code}
          ></Banners>
          <div
            className={`${cpSubMenus?.length > 0 && router.asPath.includes("cpcontent") ? styles.movedown : ""}`}
          >
            <Sections></Sections>
          </div>
        </div>
      )}

      {apiData?.info?.pageType === "list" && (
        <div>
          <Banners bannerslist={apiData?.banners}></Banners>
          <div className={`${styles.listGrid}`}>
            <Grid gridData={gridData}></Grid>
          </div>
        </div>
      )}
      {apiData?.info?.pageType === "player" && (
        <div>
          <Banners bannerslist={apiData?.banners}></Banners>
          <Player></Player>
          <div className={`${styles.playerBottomSections}`}>
            <Sections></Sections>
          </div>
        </div>
      )}
      {apiData?.info?.pageType === "details" && (
        <div>
          <Banners bannerslist={apiData?.banners}></Banners>
          {apiData?.info?.attributes?.contentType == "network" ? (
            <NetworkDetails />
          ) : apiData?.info?.attributes?.contentType === "contentchannel" ? (
            <CreatorDetails />
          ) : (
            <TvshowDetails />
          )}
          {apiData?.tabsInfo?.showTabs == true ? (
            <Tvshowtabs channel={true}></Tvshowtabs>
          ) : (
            <Sections></Sections>
          )}
        </div>
      )}
      {showPromoPopup && (
        <Promotional_popup
          onClose={() => togglePromotionalModal()}
        ></Promotional_popup>
      )}
    </div>
  );
};

export default Dynamic;
