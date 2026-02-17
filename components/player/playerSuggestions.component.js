import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/components/player/player.module.scss";
import Tab from "@mui/material/Tab";
import { getPagePath, jsonToQueryParams } from "@/services/utility.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import { useRouter } from "next/router";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import SuggestionCard from "./suggestionCard.component";
import { checkNativeAds } from "../Gads/GAdsUtils";
import { actions, useStore } from "@/store/store";
import GAdsComponent from "../Gads/GAdsComponent";
import { systemConfigs } from "@/services/user.service";

import $ from "jquery";
import "malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css";
import "malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js";

const PlayerSuggestions = ({
  playerSuggestionsData,
  tabsData,
  lefthandHeight,
}) => {
  const [suggestionData, setSuggestionsData] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [scrollHeightC, setScrollHeight] = useState(0);
  const router = useRouter();
  const {
    state: { PageData },
  } = useStore();
  const { mutate: mutateGetRecommandationData, data: recommendationsData } =
    useGetApiMutate();
  const { mutate: mutatePaginationData, data: paginationData } =
    useGetApiMutate();

  const [tabChange, setTabChange] = useState(false);
  const paginationRef = useRef({ started: false });
  const suggestionDataRef = useRef({ suggestionData: [] });
  const tabsRef = useRef(null);
  const tabsScrollContainerRef = useRef();
  let currentPagePath = getPagePath(router.asPath);
  const [adsSlots, setAdsSlots] = useState({});

  const pagination = () => {
    if (
      suggestionDataRef.current.suggestionData[selectedTab]?.section
        ?.sectionData.hasMoreData === true &&
      !paginationRef.current.started
    ) {
      const path = getPagePath(router.asPath);
      const params = {
        path: path === "/" || path === "" || !path ? "home" : path,
        code: suggestionDataRef.current.suggestionData[selectedTab]
          ?.contentCode,
        offset:
          suggestionDataRef.current.suggestionData[selectedTab]?.section
            ?.sectionData?.lastIndex,
      };
      const PaginationsectionData =
        suggestionDataRef.current.suggestionData[selectedTab]?.section
          ?.sectionData;
      if (PaginationsectionData?.hasMoreData === true) {
        const url = `${
          process.env.initJson.api
        }/service/api/v1/section/data?${jsonToQueryParams(params)}`;
        try {
          paginationRef.current.started = true;
          mutatePaginationData(url);
        } catch (e) {
          // on err
        }
      }
    }
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      pagination();
    }
  };

  useEffect(() => {
    if (tabChange) {
      paginationRef.current.started = false;
      setTabChange(false);
    }
  }, [tabChange]);

  useEffect(() => {
    setScrollHeight("100%");
  }, []);

  const perpareSelectedSections = () => {
    for (let i = 0; i < playerSuggestionsData.length; i += 1) {
      if (playerSuggestionsData[i].contentCode === tabsData.selectedTab) {
        setSelectedTab(i);
        break;
      }
    }
  };
  useEffect(() => {
    if (playerSuggestionsData) {
      setSuggestionsData(playerSuggestionsData);
      suggestionDataRef.current.suggestionData = playerSuggestionsData;
      perpareSelectedSections();
    }
  }, [playerSuggestionsData]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     try {
  //       $("#contentLeft")?.mCustomScrollbar("destroy");
  //       var width = window.innerWidth;
  //       if (width >= 768) {
  //         $(() => {
  //           $("#contentLeft").css("height", lefthandHeight + "px");
  //           $("#contentLeft").mCustomScrollbar({
  //             theme: "dark-2",
  //             scrollInertia: 1000,
  //             scrollEasing: "linear",
  //             scrollbarPosition: "inside",
  //             mouseWheel: { scrollAmount: 200 },
  //             callbacks: {
  //               onScroll: () => {
  //                 window.scrollBy(0, 5);
  //                 window.scrollBy(0, -5);
  //               },
  //               onInit: () => {
  //                 setTimeout(() => {
  //                   let idset9 = document.getElementById("liveCard_scroll");
  //                   $("#contentLeft").mCustomScrollbar("scrollTo", idset9);
  //                 }, 300);
  //               },

  //               onTotalScroll: (e) => {
  //                 console.log(
  //                   suggestionDataRef.current.suggestionData,
  //                   ">>>>paginationRef.current",
  //                   paginationRef.current
  //                 );
  //                 pagination();
  //               },
  //               onTotalScrollOffset: 100,
  //             },
  //           });
  //         });
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }, 50);

  //   return () => {
  //     try {
  //       $("#contentLeft")?.mCustomScrollbar("destroy");
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };
  // }, [playerSuggestionsData, tabChange]);

  useEffect(() => {
    if (tabsScrollContainerRef.current) {
      let width = window.innerWidth;
      if (width >= 768) {
        let siblingHeight = 0;
        if (tabsScrollContainerRef.current.previousSibling) {
          siblingHeight =
            tabsScrollContainerRef.current.previousSibling.clientHeight;
        }
        tabsScrollContainerRef.current.style.height = `${lefthandHeight - siblingHeight}px`;
        // $(tabsScrollContainerRef.current).mCustomScrollbar({
        //   theme: "dark-2",
        //   scrollInertia: 1000,
        //   scrollEasing: "linear",
        //   scrollbarPosition: "inside",
        //   mouseWheel: { scrollAmount: 200 },
        //   callbacks: {
        //     onScroll: function () {
        //       window.scrollBy(0, 5);
        //       window.scrollBy(0, -5);
        //     },
        //     onInit: function () {
        //       if (!document.getElementById("liveCard_scroll")) return;
        //       $(this).mCustomScrollbar("scrollTo", $("#liveCard_scroll"));
        //     },
        //     onTotalScroll: function () {
        //       pagination();
        //     },
        //     onTotalScrollOffset: 100,
        //   },
        // });
      }
    }
    return () => {
      if (tabsScrollContainerRef.current) {
        $(tabsScrollContainerRef.current).mCustomScrollbar("destroy");
      }
    };
  }, [playerSuggestionsData, tabChange, lefthandHeight]);

  useEffect(() => {
    const container = tabsScrollContainerRef.current;
    const liveCard = container?.querySelector("#liveCard_scroll");

    if (container && liveCard) {
      const containerTop = container.getBoundingClientRect().top;
      const cardTop = liveCard.getBoundingClientRect().top;

      const scrollOffset = cardTop - containerTop;
      container.scrollTo({
        top: container.scrollTop + scrollOffset,
        behavior: "smooth",
      });
    }
  }, [suggestionData, tabChange]);

  useEffect(() => {
    const path = getPagePath(router.asPath);
    const params = {
      path: path === "/" || path === "" || !path ? "home" : path,
      code: suggestionData[selectedTab]?.contentCode,
    };
    const sectionData = suggestionData[selectedTab]?.section?.sectionData;
    if (
      sectionData?.hasMoreData === true &&
      sectionData?.data.length === 0 &&
      sectionData?.lastIndex === -1
    ) {
      const url = `${
        process.env.initJson.api
      }/service/api/v1/section/data?${jsonToQueryParams(params)}`;
      try {
        mutateGetRecommandationData(url);
      } catch (e) {
        // on err
      }
    }
  }, [selectedTab, suggestionData, mutateGetRecommandationData, router.asPath]);

  useEffect(() => {
    if (recommendationsData) {
      const updatedSuggestionData = [...suggestionData];
      if (updatedSuggestionData[selectedTab]?.section) {
        updatedSuggestionData[selectedTab].section.sectionData =
          recommendationsData?.data?.response[0];
        setSuggestionsData(updatedSuggestionData);
        suggestionDataRef.current.suggestionData = updatedSuggestionData;
      }
    }
  }, [recommendationsData]);

  useEffect(() => {
    paginationRef.current.started = false;
    if (paginationData) {
      if (suggestionData[selectedTab]?.section) {
        const res = paginationData?.data?.response[0] || { data: [] };
        res.data = [
          ...suggestionData[selectedTab].section.sectionData.data,
          ...res.data,
        ];
        suggestionData[selectedTab].section.sectionData = res;
        setSuggestionsData([...suggestionData]);
        suggestionDataRef.current.suggestionData = [...suggestionData];
      }
    }
  }, [paginationData]);

  const tabSxProps = {
    "& button": { alignItems: "flex-start", color: "#858585" },
    [`& .${tabsClasses.scrollButtons}`]: {
      "&.Mui-disabled": { opacity: 0.3 },
    },
    "& .MuiTab-root.Mui-selected": {
      background: "hsla(0,0%,100%,.06)",
    },
  };

  const tabIndicatorSxProps = {
    left: "0",
    display: "none",
  };

  const handleChange = useCallback(
    (event, newValue) => {
      setSelectedTab(newValue);
      setTabChange(true);
      if (tabsScrollContainerRef.current) {
        $(tabsScrollContainerRef.current).mCustomScrollbar("destroy");
      }
    },
    [selectedTab, tabChange, lefthandHeight]
  );

  useEffect(() => {
    // Scroll selected tab into view
    if (tabsRef.current) {
      const currTab = tabsRef.current.querySelector(`[tabindex="0"]`);
      if (currTab) {
        setTimeout(() => {
          currTab.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "center",
          });
          window.scrollTo(0, 0);
        }, 400);
      }
    }
  }, [selectedTab]);

  useEffect(() => {
    const adsData = checkNativeAds(systemConfigs, PageData);
    if (adsData) {
      // const updatedAdsData = Object.fromEntries(
      //   Object.entries(adsData).map(([key, value]) => {
      //     return [key, { ...value, size: "R" }];
      //   })
      // );
      setAdsSlots(adsData);
    }
  }, [PageData]);

  return (
    <div className={`${styles.playerSuggestionsMain}`}>
      {adsSlots?.top && window.innerWidth < 990 && (
        <GAdsComponent adData={adsSlots.top} />
      )}
      <div className={`${styles.tabs}`}>
        {suggestionData.length > 0 && (
          <Tabs
            orientation="horizontal"
            variant="scrollable"
            ref={tabsRef}
            onChange={handleChange}
            value={selectedTab}
            sx={tabSxProps}
            TabIndicatorProps={{
              sx: tabIndicatorSxProps,
            }}
          >
            {suggestionData?.map((tab) => (
              <Tab
                key={tab?.contentCode}
                label={tab?.section?.sectionInfo?.name}
                className="tabs_btn support"
              />
            ))}
          </Tabs>
        )}
      </div>
      <div
        className={`${styles.tabsData} mCustomScrollbar ${styles.scroller}`}
        ref={tabsScrollContainerRef}
      >
        {suggestionData?.map((sd, i) => (
          <div
            key={sd?.contentCode + selectedTab}
            className={`${selectedTab === i ? `${styles.active}` : `${styles.inactive}`}`}
          >
            <div style={{ height: scrollHeightC }}>
              <div className={`${styles.content} `} onScroll={handleScroll}>
                {sd?.section?.sectionData?.data.length > 0 &&
                  sd?.section?.sectionData?.data.map(
                    (suggestionCardData, index) => (
                      <>
                        <div
                          className={currentPagePath}
                          id={`${currentPagePath === suggestionCardData.target?.path ? "liveCard_scroll" : ""}`}
                        >
                          <SuggestionCard
                            suggestionCardData={suggestionCardData}
                            key={suggestionCardData?.target?.path}
                            eleIndex={index}
                            adData={adsSlots?.[index + 1]}
                          />
                        </div>
                        {/* {
                           adsSlots?.[index + 1] &&<div  >
                            <GAdsComponent adData={adsSlots?.[index + 1]} />
                           </div>
                        } */}
                      </>
                    )
                  )}
                {adsSlots?.bottom && window.innerWidth < 990 && (
                  <div>
                    <GAdsComponent adData={adsSlots.bottom} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerSuggestions;
