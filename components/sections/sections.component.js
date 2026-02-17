import { actions, useStore } from "@/store/store";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "@/components/sections/sections.module.scss";
import Curosal from "./curosal.component";
import Link from "next/link";
import useWindowScroll from "@/hooks/useWindowScroll";
import useGetApiMutate from "@/hooks/useGetApidata";
import { useRouter } from "next/router";
import {
  getPagePath,
  getSelectedMenu,
  jsonToQueryParams,
} from "@/services/utility.service";
import Skeleton from "../skeleton/skeleton.component";
import { getItem } from "@/services/local-storage.service";

import { NoOfCardsToRender } from "@/services/cards.service";
import CardpreviewContextProvider from "./previewContext";
import { Sectionsconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import SectionsContextProvider from "./sectionsContext";
import GAdsComponent from "../Gads/GAdsComponent";
import { checkNativeAds } from "../Gads/GAdsUtils";
import { systemConfigs } from "@/services/user.service";

const Sections = () => {
  const {
    state: { PageData, SystemConfig, navigateFrom, SystemLanguages, localLang },
    dispatch,
  } = useStore();
  const {
    mutate: mutateGetpaginationData,
    data: apiPaginationResponse,
    isLoading: isPaginationLoading,
    isPaginationError,
    Paginationerror,
    Paginationrefetch,
  } = useGetApiMutate();
  const router = useRouter();
  const [sectionData, setSectionData] = useState([]);
  const [paginationData, setpaginationData] = useState([]);
  const [sectionCode, setSectionCode] = useState([]);
  const [marginTop, setMarginTop] = useState("");
  const [allowSlideNext, setAllowSlideNext] = useState([]);
  const paginationRef = useRef({
    started: false,
  });
  const [hasDynamicName, sethasDynamicName] = useState([]);
  const isUtUser = getItem("isUtuser");
  const [adsSlots, setAdsSlots] = useState({});
  const [hasNoMoreData, setHasNoMoreData] = useState(false);
  const [fetchedSections, setfetchedSections] = useState([]);

  useEffect(() => {
    if (Object.keys(PageData).length) {
      let DynamicName = [];
      PageData.data.map((secData) => {
        if (secData?.section?.sectionInfo?.params?.hasDynamicName == "true") {
          DynamicName = [...DynamicName, secData?.contentCode];
        }
      });
      sethasDynamicName(DynamicName);
      prepareSections(PageData.data);
    }
    if (PageData) {
      const adsData = checkNativeAds(systemConfigs, PageData);
      setAdsSlots(adsData);
    }
    router?.asPath === "/favorites" &&
      window.innerWidth < 767 &&
      setMarginTop(98);
  }, [PageData]);

  const windowWidth = window.innerWidth;

  useEffect(() => {
    if (apiPaginationResponse) {
      const updatedPaginationData = [...paginationData];
      apiPaginationResponse.data.response.forEach((resp) => {
        if (resp.paneType === "section") {
          PageData.data = PageData?.data?.map((section) =>
            section.contentCode === resp.contentCode ? resp : section
          );
        } else {
          const index = updatedPaginationData.findIndex(
            (p) => p?.contentCode === resp?.section
          );
          if (index > -1) {
            paginationData[index].section.sectionData = resp;
          }
        }
      });

      // setpaginationData(updatedPaginationData);
      prepareSections(PageData?.data);

      setTimeout(() => {
        paginationRef.current.started = false;
      }, 200);
    }
  }, [apiPaginationResponse]);

  const prepareSections = (data) => {
    if (PageData?.info?.pageType === "player") {
      let sectionD =
        PageData.info.attributes.showOnPlayer == undefined ||
        PageData.info.attributes.showOnPlayer.length == 0
          ? []
          : PageData.info.attributes.showOnPlayer.split();
      let sData = data.filter((ele) => {
        let cardPerResolution = {
          ...NoOfCardsToRender(ele?.section?.sectionData?.data[0]?.cardType),
        };
        let resolution = Object.keys(cardPerResolution)
          .sort((a, b) => b - a)
          ?.find((item) => item <= windowWidth);
        let cardCount = NoOfCardsToRender(
          ele?.section?.sectionData?.data[0]?.cardType
        )[resolution]?.slidesPerView;
        if (
          ele?.section?.sectionData?.data?.length > cardCount &&
          ele?.section.sectionControls.showViewAll
        ) {
          // working on this need to make dynamic
          ele.section.sectionControls.showView = true;
        }
        return (
          ele.paneType === "section" &&
          ((ele.section.sectionData.data.length &&
            sectionD.includes(ele.section.sectionInfo.code)) ||
            (!!ele.section.sectionData.params &&
              ele.section.sectionData.params.showOnPlayer == "true"))
        );
      });

      // Section title localization
      // sData = sData.map((sectionEl) => {
      //   sectionEl?.section?.sectionInfo?.name && (sectionEl.section.sectionInfo.name = getSectionName(sectionEl));
      //   return sectionEl;
      // });
      setSectionData([...sData]);
      setpaginationData([]);
    } else {
      let sData = data?.filter((ele) => {
        let cardPerResolution = {
          ...NoOfCardsToRender(ele?.section?.sectionData?.data?.[0]?.cardType),
        };
        let resolution = Object.keys(cardPerResolution)
          .sort((a, b) => b - a)
          ?.find((item) => item <= windowWidth);
        let cardCount = NoOfCardsToRender(
          ele?.section?.sectionData?.data?.[0]?.cardType
        )[resolution]?.slidesPerView;
        if (
          ele?.section?.sectionData?.data?.length > cardCount &&
          ele?.section.sectionControls.showViewAll
        ) {
          // working on this need to make dynamic
          ele.section.sectionControls.showView = true;
        }
        return (
          ele?.paneType === "section" &&
          ele?.section.sectionData.data?.length &&
          ele?.section.sectionInfo.dataType != "actor"
        );
      });
      let pData = data?.filter((ele) => {
        return (
          ele?.paneType === "section" &&
          ele?.section.sectionData.data?.length == 0 &&
          ele?.section.sectionData.hasMoreData
        );
      });
      let sectCodes = [];
      data?.forEach((ele) => {
        const sectionCode = ele?.section?.sectionData?.section;
        if (
          ele?.paneType === "section" &&
          ele?.section?.sectionData?.lastIndex < 0 &&
          sectionCode &&
          !fetchedSections?.includes(sectionCode)
        ) {
          sectCodes.push(sectionCode);
        }
      });

      setSectionCode([...sectCodes]);
      setSectionData([...sData]);
      setpaginationData([...pData]);
    }
  };

  const pagination = useCallback(() => {
    let filteredArray = hasDynamicName.filter((value) =>
      sectionCode.slice(0, 4).includes(value)
    );
    let hasName = filteredArray?.length > 0 ? true : false;

    if (sectionCode.length > 0) {
      let sectionCodes = sectionCode.slice(0, 4);
      setfetchedSections((prev) => [...prev, ...sectionCodes]);
      let path = getPagePath(router.asPath);
      let params = {
        path: path == "/" || path == "" || !path ? "home" : path,
        count: 24,
        code: sectionCodes,
        hasDynamicExpression: hasName,
        offset: -1,
      };
      let url =
        process.env.initJson["api"] +
        "/service/api/v1/section/data?" +
        jsonToQueryParams(params);
      try {
        mutateGetpaginationData(url);
      } catch (e) {}
    } else {
      setHasNoMoreData(true);
    }
  }, [mutateGetpaginationData, router.asPath, sectionCode, hasDynamicName]);

  useEffect(() => {
    const scrollHandler = () => {
      const scrolledBottompx =
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY;
      const scrolledToppx = window.scrollY;

      // const threshold =
      //   document.getElementById("appFooter").scrollHeight - 60 ||
      //   (window.innerWidth < 767 ? 800 : 500);

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
    return () => {
      document.removeEventListener("scroll", scrollHandler);
    };
  }, [pagination]);

  if (sectionData && sectionData.length == 0) {
    return <></>;
  }

  const onBack = () => {
    if (isUtUser) {
      window.location.href = SystemConfig.configs.siteURL;
    } else {
      if (!!navigateFrom) {
        dispatch({ type: actions.navigateFrom, payload: null });
        router.push(navigateFrom);
      } else {
        router.push("/");
      }
    }
  };

  // Returns localized section name
  // function getSectionName(sEle) {
  //   const pageInfo = PageData?.info || {};
  //   const contentType = PageData?.info?.attributes?.contentType || '';

  //   let sectionName;

  //   if (pageInfo?.pageType == "details") {
  //     if (contentType === 'movie' && SystemLanguages?.[localLang]?.movieDetailRecommendationText) {
  //       sectionName = SystemLanguages[localLang].movieDetailRecommendationText
  //     }
  //     if (contentType === 'tvshowdetails' && SystemLanguages?.[localLang]?.tvshowDetailsRecommendationText) {
  //       sectionName = SystemLanguages[localLang].tvshowDetailsRecommendationText
  //     }
  //   } else if (pageInfo.pageType == "player") {

  //     if (contentType === 'movie' && SystemLanguages?.[localLang]?.moviePlayerRecommendationText) {
  //       sectionName = SystemLanguages[localLang].moviePlayerRecommendationText
  //     }

  //     if (contentType === 'tvshowdetails' && SystemLanguages?.[localLang]?.tvshowPlayerRecommendationText) {
  //       sectionName = SystemLanguages[localLang].tvshowPlayerRecommendationText
  //     }

  //     if (contentType === 'epg' && SystemLanguages?.[localLang]?.channelRecommendationText) {
  //       sectionName = SystemLanguages[localLang].channelRecommendationText
  //     }
  //   }
  //   return sectionName || sEle.section.sectionInfo.name
  // }

  // removing section from dom if data is empty
  const removeSection = (sectionCode) => {
    if (sectionCode.cType == "tag_poster") {
      if (sectionCode.nextnav.allowSlideNext) {
        let dup = allowSlideNext;
        dup.push(sectionCode.index);
        setAllowSlideNext([...new Set(dup)]);
      }
    } else {
      const updatedData = {
        ...PageData,
        data: PageData.data.filter(
          (value) => value?.contentCode !== sectionCode
        ),
      };
      dispatch({ type: actions.PageData, payload: updatedData });
    }
  };

  return (
    <CardpreviewContextProvider>
      <SectionsContextProvider>
        {router.asPath === "/favorites" && (
          <span className={` ${styles.mobileBack}`} onClick={onBack}>
            <img
              alt="back"
              className={` ${styles.back}`}
              src={`${ImageConfig?.sections?.back}`}
            />
            {Sectionsconstant[localLang]?.Favourites}
          </span>
        )}
        {adsSlots?.top && window.innerWidth < 990 && (
          <GAdsComponent adData={adsSlots.top} />
        )}
        <div
          className={`${styles.sectionsHome} ${PageData?.banners?.length > 0 || PageData?.info?.code === "search" ? `${styles.banners}` : `${styles.no_banners}`} ${(PageData?.info?.pageType == "details" || PageData?.info?.pageType == "player") && `${styles.tvshow_details}`} ${PageData?.info?.attributes?.networkCode == "freedomtv" && styles.freedomtv}`}
          style={{ marginTop: marginTop }}
        >
          {sectionData?.map((sEle, i) => (
            <>
              <div
                className={`${styles.section_wrap}`}
                key={sEle.section.sectionInfo.code}
              >
                <div className={`${styles.section_top}`}>
                  <Link
                    href={sEle.section.sectionControls.viewAllTargetPath}
                    className={`${styles.section_viewall}`}
                    onClick={() => {
                      sendEvent("rail_view_all", {
                        rail_name: sEle.section.sectionInfo.name,
                        header_button: getSelectedMenu(router.asPath),
                      });
                      // for MyReco
                      sessionStorage.setItem("carouselPosition", i);
                    }}
                  >
                    <h2 className={`${styles.section_title}`}>
                      {sEle.section.sectionInfo.name}
                      {(!!sEle?.section?.sectionControls?.showView ||
                        (sEle?.section?.sectionData?.data[0]?.cardType ==
                          "tag_poster" &&
                          allowSlideNext.includes(i))) && (
                        <>
                          <span className={`${styles.viewAll}`}>
                            {Sectionsconstant[localLang]?.View_All}
                          </span>
                          <span className={`${styles.viewAll_arrow}`}></span>
                        </>
                      )}
                    </h2>
                    {/* sEle?.section?.sectionControls?.showViewAll */}
                  </Link>
                </div>
                <Curosal
                  curosalData={sEle.section}
                  PageData={PageData}
                  rowIndex={i}
                  localLang={localLang}
                  removeSection={removeSection}
                >
                  {" "}
                </Curosal>
              </div>
              {adsSlots?.[i + 1] && PageData?.info?.pageType != "player" && (
                <GAdsComponent adData={adsSlots[i + 1]} />
              )}
            </>
          ))}
        </div>

        {isPaginationLoading && (
          <div>
            <Skeleton custom={true} type={["section"]} />
          </div>
        )}
        {hasNoMoreData && adsSlots?.bottom && (
          <GAdsComponent adData={adsSlots.bottom} />
        )}
      </SectionsContextProvider>
    </CardpreviewContextProvider>
  );
};

export default Sections;
