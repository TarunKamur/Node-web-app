import { useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/tvshowtabs/tvshowtabs.module.scss";
import Grid from "../grid/grid.component";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import useGetApiMutate from "@/hooks/useGetApidata";
import { getPagePath, jsonToQueryParams } from "@/services/utility.service";
import { useRouter } from "next/router";

const Tvshowtabs = ({ channel = "" }) => {
  const {
    state: { PageData ,SystemConfig},
  } = useStore();
  const router = useRouter();
  const [tabsData, setTabsData] = useState({});
  const [sectionData, setSectionData] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [freedomChannelPageTabsTitles, setfreedomChannelPageTabsTitles] = useState('');
  const { mutate: tabSwitch, data: tabSwitchResponse } = useGetApiMutate();

  useEffect(() => {
    if (PageData) {
      prepareTabsData(PageData.tabsInfo);
      let freedomChannelPageTabsTitles =
        SystemConfig?.configs?.freedomChannelPageTabsTitles &&
        JSON.parse(SystemConfig?.configs?.freedomChannelPageTabsTitles);

    }
  }, [PageData]);

  useEffect(() => {
    if (activeSlideIndex != null && !!tabsData?.tabs) {
      if (
        !!sectionData[activeSlideIndex]?.section?.sectionControls
          ?.infiniteScroll
      ) {
        sectionData[activeSlideIndex].section.sectionControls.infiniteScroll =
          false;
        let params = {
          path: getPagePath(router.asPath),
          code: sectionData[activeSlideIndex]?.section?.sectionInfo.code,
          offset:
            sectionData[activeSlideIndex]?.section?.sectionData?.lastIndex,
        };
        let url =
          process.env.initJson.api +
          "/service/api/v1/section/data?" +
          jsonToQueryParams(params);
        try {
          tabSwitch(url);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, [activeSlideIndex]);

  useEffect(() => {
    if (!!tabSwitchResponse?.data) {
      if (
        !!tabSwitchResponse?.data?.status &&
        tabSwitchResponse?.data?.response[0]?.data
      ) {
        let deepCopysectiondata = JSON.parse(JSON.stringify(sectionData));
        deepCopysectiondata[activeSlideIndex].section.sectionData.data = [
          ...deepCopysectiondata[activeSlideIndex].section.sectionData.data,
          ...tabSwitchResponse?.data?.response[0]?.data,
        ];
        deepCopysectiondata[activeSlideIndex].section.sectionData.hasMoreData =
          tabSwitchResponse?.data?.response[0]?.hasMoreData;
        deepCopysectiondata[activeSlideIndex].section.sectionData.lastIndex =
          tabSwitchResponse?.data?.response[0]?.lastIndex;
        setSectionData(deepCopysectiondata);
      }
    } else {
    }
  }, [tabSwitchResponse]);

  const prepareTabsData = (tData) => {
    for (let i = 0; i < tData.tabs.length; i++) {
      if (tData.tabs[i].code === tData.selectedTab) {
        setActiveSlideIndex(i);
        break;
      }
    }
    setTabsData({ ...tData });
    let se = PageData.data.filter((ele) => ele.paneType === "section");
    se = se.filter((section) => section.contentCode !== "content_actors");
    setSectionData(se);
  };

  // const handleSelection = (item) => {
  //   PageData.data.map((ele) => {
  //     if (ele.paneType === "section") {
  //       if (item?.code === ele.contentCode) {
  //         setSelectedSection(ele);
  //       }
  //     }
  //   });
  // };

  const handleChange = (event, value) => {
    setActiveSlideIndex(value);
  };

  const tabSxProps = {
    padding: "0 55px",
    "& button": { alignItems: "flex-start", color: "#858585" },
    [`& .${tabsClasses.scrollButtons}`]: {
      "&.Mui-disabled": { opacity: 0.3 },
    },
    customTabsStyle: {
      "& .MuiTabScrollButton-root:first-child::before": {
        content: "'L'",
      },
      "& .MuiTabScrollButton-root:last-child::after": {
        content: "'R'",
      },
    },
  };

  const tabIndicatorSxProps = {
    left: "0",
    backgroundColor: "$primary.color",
  };
  return (
    <div className={`tabsHome ${styles.tabsHome}`}>
      {tabsData?.tabs && (
        <Tabs
          className={`${styles.tabsInner1}`}
          orientation="horizantal"
          variant="scrollable"
          onChange={handleChange}
          value={activeSlideIndex}
          sx={tabSxProps}
          TabIndicatorProps={{
            sx: tabIndicatorSxProps,
          }}
        >
          {tabsData?.tabs.map((tab, i) => {
            return (
              <Tab
                key={i}
                label={
                  activeSlideIndex == i ? (
                    <h2 style={{ fontSize: "0.875rem", fontWeight: "normal" }}>
                      {(PageData?.info?.attributes?.networkCode == "freedomtv" && freedomChannelPageTabsTitles && freedomChannelPageTabsTitles[tab.title])? freedomChannelPageTabsTitles[tab.title]: tab.title}
                    </h2>
                  ) : (
                    <>{tab.title}</>
                  )
                }
                className={`tabs_btn support`}
              />
            );
          })}
        </Tabs>
      )}

      <div>
        {/* {
          selectedSection &&  <Grid gridData={selectedSection} />
        }         */}
        {sectionData &&
          sectionData.map(
            (ele, index) =>
              activeSlideIndex == index &&
              !!sectionData[activeSlideIndex].section?.sectionData?.data
                .length > 0 && (
                <div key={index} className={`${styles.tabsInner}`}>
                  <Grid gridData={ele} channel={channel} />
                </div>
              )
          )}
      </div>
    </div>
  );
};

export default Tvshowtabs;
