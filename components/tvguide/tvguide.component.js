/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-empty */
import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/tvguide/tvguide.module.scss";
import {
  getTimeMenuList,
  jsonToQueryParams,
  newTimeList,
} from "@/services/utility.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { getAbsolutePath, getTemplatesList } from "@/services/user.service";
import dynamic from "next/dynamic";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import { Tvguideconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import { appConfig } from "@/config/app.config";
import Skeleton from "../skeleton/skeleton.component";
import ProgramTab from "./ProgramTab/ProgramTab.component";
import useWindowScroll from "@/hooks/useWindowScroll";

const BottomLayout = dynamic(
  () => import("../bottomLayout/bottomLayout.component")
);
const TvGuideFilterModal = dynamic(
  () => import("../popups/tvguidefiters/tvguidefiters.component")
);

let timer;

function enhanceChanneldata(data, channelStartTime, channelEndTime) {
  for (let i = 0; i < data.length; i++) {
    const programs = [];
    for (let j = 0; j < data[i].programs.length; j++) {
      const dummy_program = getDummyProgram(); // dummy_program
      // first_program
      if (j == 0) {
        // check first program is start from start Time
        const curr_pgm_start_time = Number(
          data[i].programs[j].display.markers?.startTime?.value
        );
        if (channelStartTime && curr_pgm_start_time > channelStartTime) {
          if (dummy_program.display.markers?.startTime) {
            dummy_program.display.markers.startTime.value =
              channelStartTime.toString();
          }
          if (dummy_program.display.markers?.endTime) {
            dummy_program.display.markers.endTime.value =
              curr_pgm_start_time.toString();
          }
          programs.push(dummy_program);
        }
        // check first program is startTime
        else if (
          !appConfig?.tvGuide?.dates &&
          channelStartTime &&
          curr_pgm_start_time < channelStartTime
        ) {
          data[i].programs[j].display.markers.startTime.value =
            channelStartTime.toString();
        }
        programs.push(data[i].programs[j]);
      }
      // last_program
      else if (j == data[i].programs.length - 1) {
        // check before empty
        const prev_pgm_start_time = Number(
          data[i].programs[j - 1].display.markers?.startTime?.value
        );
        const prev_pgm_end_time = Number(
          data[i].programs[j - 1].display.markers?.endTime?.value
        );
        const curr_pgm_start_time = Number(
          data[i].programs[j].display.markers?.startTime?.value
        );
        if (curr_pgm_start_time - prev_pgm_end_time > 1000) {
          if (dummy_program.display.markers?.startTime) {
            dummy_program.display.markers.startTime.value =
              prev_pgm_end_time.toString();
          }
          if (dummy_program.display.markers?.endTime) {
            dummy_program.display.markers.endTime.value =
              curr_pgm_start_time.toString();
          }
          programs.push(dummy_program);
        }

        // push current program
        if (prev_pgm_start_time !== curr_pgm_start_time) {
          programs.push(data[i].programs[j]);
        }

        // check laste program is ending at endTime
        const curr_pgm_end_time = Number(
          data[i].programs[j].display.markers?.endTime?.value
        );
        if (channelEndTime && curr_pgm_end_time < channelEndTime) {
          if (dummy_program.display.markers?.startTime) {
            dummy_program.display.markers.startTime.value =
              curr_pgm_end_time.toString();
          }
          if (dummy_program.display.markers?.endTime) {
            dummy_program.display.markers.endTime.value =
              channelEndTime.toString();
          }
          programs.push(dummy_program);
        }
      }
      // middle_programs
      else {
        const prev_pgm_start_time = Number(
          data[i].programs[j - 1].display.markers?.startTime?.value
        );
        const prev_pgm_end_time = Number(
          data[i].programs[j - 1].display.markers?.endTime?.value
        );
        const curr_pgm_start_time = Number(
          data[i].programs[j].display.markers?.startTime?.value
        );
        // program gap not more than 1 sec if there then add the dummy data
        if (curr_pgm_start_time - prev_pgm_end_time > 2000) {
          if (dummy_program.display.markers?.startTime) {
            dummy_program.display.markers.startTime.value =
              prev_pgm_end_time.toString();
          }
          if (dummy_program.display.markers?.endTime) {
            dummy_program.display.markers.endTime.value =
              curr_pgm_start_time.toString();
          }
          programs.push(dummy_program);
        }
        if (prev_pgm_start_time !== curr_pgm_start_time) {
          programs.push(data[i].programs[j]);
        }
      }
    }
    if (data[i].programs.length === 0) {
      if (appConfig?.tvGuide?.dates) {
        const dummy_program = getDummyProgram();
        if (dummy_program.display.markers?.startTime) {
          dummy_program.display.markers.startTime.value =
            channelStartTime?.toString();
        }
        if (dummy_program.display.markers?.endTime) {
          dummy_program.display.markers.endTime.value =
            channelEndTime?.toString();
        }
        programs.push(dummy_program);
      } else {
        // for (let k = 0; k < 48; k++) {
        //   const dummy_program = getDummyProgram();
        //   if (k === 0) {
        //     if (dummy_program.display.markers?.startTime) {
        //       dummy_program.display.markers.startTime.value =
        //         channelStartTime?.toString();
        //     }
        //   } else if (dummy_program.display.markers?.startTime) {
        //     dummy_program.display.markers.startTime.value = Number(
        //       programs[k - 1].display.markers.endTime.value
        //     )?.toString();
        //   }
        //   if (dummy_program.display.markers?.endTime) {
        //     dummy_program.display.markers.endTime.value = (
        //       Number(dummy_program.display.markers.startTime.value) +
        //       30 * 60000
        //     )?.toString();
        //   }
        //   programs.push(dummy_program);
        // }
        const dummy_program = getDummyProgram();
        if (dummy_program.display.markers?.startTime) {
          dummy_program.display.markers.startTime.value =
            channelStartTime?.toString();
        }
        if (dummy_program.display.markers?.endTime) {
          dummy_program.display.markers.endTime.value =
            channelEndTime?.toString();
        }
        programs.push(dummy_program);
      }
    }
    data[i].programs = programs;
  }
  return data;
}
function getDummyProgram() {
  const dummy_program = {
    display: {
      markers: {
        startTime: {
          value: "",
        },
        endTime: {
          value: "",
        },
      },
      title: "Program info is not available",
    },
    id: -1,
    metadata: {},
    target: {
      path: "",
    },
  };
  return dummy_program;
}

const DateTab = (props) => {
  const {
    isSelectedTab,
    tab,
    datesScrollTo,
    tabsLeft,
    setDateListeners,
    tabsRight,
    handleTabClick,
    id,
  } = props;
  const tabRef = useRef(null);
  useEffect(() => {
    if (isSelectedTab) {
      if (tabRef.current) {
        datesScrollTo(
          tabRef.current.getBoundingClientRect().right,
          tabRef.current.getBoundingClientRect().right +
            tabRef.current.clientWidth * 2,
          id
        );
      }
    }
    if (setDateListeners) {
      setDateListeners(tabsScrollTo);
    }
  }, [tabsLeft, tabsRight, isSelectedTab]);

  const tabsScrollTo = (type, cb) => {
    if (tabRef.current) {
      if (
        type === "prev" &&
        tabRef.current.getBoundingClientRect().right > tabsLeft
      ) {
        cb(type, tabRef.current.clientWidth);
        return true;
      }
      if (
        type === "next" &&
        tabRef.current.getBoundingClientRect().right < tabsRight
      ) {
        cb(type, tabRef.current.clientWidth);
        return true;
      }
    }
    return false;
  };

  return (
    <div
      className={`${styles.tab}`}
      ref={tabRef}
      id={id}
      onClick={() =>
        handleTabClick(
          tab,
          tabRef.current.getBoundingClientRect().left,
          tabRef.current.getBoundingClientRect().right
        )
      }
    >
      <span
        className={
          `${styles.tab_title}` +
          ` ${isSelectedTab ? styles.active_tab_title : ""}`
        }
      >
        {tab.title === "Today" ? tab.title : `${tab.title},${tab.subtitle}`}
      </span>
    </div>
  );
};

let paddingListeners = [];
let datesListeners = [];
const Tvguide = () => {
  const time_List = appConfig?.tvGuide?.dates
    ? getTimeMenuList()
    : newTimeList();
  const { mutate: mutateGetChannelIds, data: channnelIdsapiResponse } =
    useGetApiMutate();

  const {
    mutate: contentPathApi,

    data: contentPathResponse,
  } = useGetApiMutate();

  const {
    mutate: mutateGetChannelData,
    data: channelDataapiResponse,
    isLoading: channelDataisLoading,
  } = useGetApiMutate();
  const {
    dispatch,
    state: { Session, localLang, SystemConfig },
  } = useStore();
  const router = useRouter();
  const [programWidth, setProgramWidth] = useState(0);
  const [selectedTab, setSelectedTab] = useState(undefined);
  const [paginationchannelIds, setPaginationchannelIds] = useState([]);
  const [channelIds, setChannelIds] = useState([]);
  const [channelsData, setChannelData] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [page, setPage] = useState(0);
  const [tabswitched, setTabswitched] = useState(false);
  const [isinLive, setInsinLive] = useState(false);
  const [isBottomLayoutOpen, setIsBottomLayoutOpen] = useState(false);
  const [templateData, setTemplateData] = useState({});
  const [filtersData, setFiltersData] = useState([]);
  const [filterActiveClass, setFilterActiveClass] = useState("");
  const [currentProgTime, setCurrentProgTime] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [showFilterModal, setshowFilterModal] = useState(false);
  const minScroll = window.innerWidth <= 991 ? 0.1 : 0.15;
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrolledToppx } = useWindowScroll();
  const [timeDirectionsClicked, setTimeDirectionsClicked] = useState(false);

  const programsRef = useRef(null);
  const livebarRef = useRef(null);
  const livetextRef = useRef(null);
  const liveProgressRef = useRef();
  const tvguidePaginationRef = useRef({
    paginationStarted: false,
    isempty: false,
  });
  const tabsRef = useRef(null);
  const mtabsRef = useRef(null);
  const timetabsRef = useRef(null);
  const mtimetabsRef = useRef(null);
  const [LeftArrowHide, setLeftArrowHide] = useState(false);
  const [RightArrowHide, setRightArrowHide] = useState(false);
  const [sliceCount] = useState(
    !!window && window?.innerHeight > 760
      ? Math.floor(window?.innerHeight / 60)
      : 12
  );

  const fetchChannelIds = () => {
    let fd;
    if (router.asPath.includes("?")) {
      fd =
        !!router?.asPath.split("?") &&
        router?.asPath.split("?")[1].includes("=") &&
        `${router?.asPath.split("?")[1].split("=")[0]}=${router?.asPath.split("?")[1].split("=")[1]}`;
      setFilterActiveClass(router?.asPath.split("?")[1].split("=")[1]);
    } else setFilterActiveClass("");
    const url = fd
      ? `${process.env.initJson.api}/service/api/v1/tvguide/channels?${fd}`
      : `${process.env.initJson.api}/service/api/v1/tvguide/channels`;
    try {
      setChannelIds([]);
      setChannelData([]);
      if (!appConfig?.tvGuide?.dates) {
        if (livebarRef.current) {
          livebarRef.current.style.marginLeft = `0px`;
          livebarRef.current.style.display = "none";
        }
        if (livetextRef.current) {
          livetextRef.current.style.marginLeft = `0px`;
          livetextRef.current.style.display = "none";
        }
      }
      tvguidePaginationRef.current.paginationStarted = false;
      tvguidePaginationRef.current.isempty = false;
      mutateGetChannelIds(url);
    } catch (e) {}
  };

  const fetchChannelData = (params) => {
    const url = `${
      process.env.initJson.api
    }/service/api/v1/static/tvguide?${jsonToQueryParams(params)}`;
    try {
      mutateGetChannelData(url);
    } catch (e) {}
  };

  const handleVisibilityChange = (event) => {
    if (document.visibilityState == "visible") {
      // console. log("tab is active");
      gotoLive();
    } else {
      //  console. log("tab is inactive")
    }
  };

  useEffect(() => {
    if (SystemConfig) {
      checkFn();
      getFilterData();
    }
    const portrait = window.matchMedia("(orientation: portrait)");
    portrait.addEventListener("change", handlePotraitChange);
    return () => {
      paddingListeners = [];
      datesListeners = [];
      portrait.removeEventListener("change", handlePotraitChange);
    };
  }, [SystemConfig]);

  useEffect(() => {
    if (scrolledToppx !== null) {
      if (scrolledToppx >= 200) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
  }, [scrolledToppx]);

  useEffect(() => {
    if (!appConfig?.tvGuide?.dates) {
      gotoLive();
    }
  }, [currentProgTime, router.asPath]);

  useEffect(() => {
    if (SystemConfig) {
      fetchChannelIds();
    }
  }, [SystemConfig, router.asPath]);

  function handlePotraitChange() {
    if (programsRef.current && livebarRef.current) {
      programsRef.current.scrollLeft = 0;
      livebarRef.current.style.left = "0px";
      if (livetextRef.current) livetextRef.current.style.left = "0px";
    }
  }

  function checkFn() {
    if (window.innerWidth <= 991) {
      setProgramWidth(180);
    } else {
      setProgramWidth(270);
    }
  }

  useEffect(() => {
    setProgramPadding();
    window.addEventListener("resize", checkFn);

    programsRef.current?.addEventListener("scroll", handleProgramsScroll);
    return () => {
      window.removeEventListener("resize", checkFn);
      programsRef.current?.removeEventListener("scroll", handleProgramsScroll);
    };
  }, [programWidth]);

  useEffect(() => {
    programsRef?.current?.addEventListener("scroll", verticalScroll);
    dispatch({ type: actions.PageData, payload: {} });
    return () => {
      programsRef?.current?.removeEventListener("scroll", verticalScroll);
    };
  }, []);

  // vertical scroll for mobile web
  const verticalScroll = () => {
    let diff = 0;
    const scrollMinLength = window.innerWidth <= 767 ? 180 : 540;
    if (window.innerWidth <= 1024) {
      diff = Math.abs(
        Math.abs(parseInt(livebarRef?.current?.style?.marginLeft)) -
          programsRef?.current?.scrollLeft
      );
      !!diff && (diff <= 0 || diff > scrollMinLength)
        ? setInsinLive(false)
        : setInsinLive(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollfunc);
    // if (channelDataisLoading === false) setProgramPadding();
    return () => {
      window.removeEventListener("scroll", scrollfunc);
    };
  }, [channelIds, channelsData, paginationchannelIds]);

  useEffect(() => {
    if (channelDataisLoading === false) setProgramPadding();
  }, [channelDataisLoading, channelsData, channelIds]);

  useEffect(() => {
    if (appConfig?.tvGuide?.dates && selectedTab?.title == "Today") {
      !timeDirectionsClicked && gotoLive();
    }
    liveProgressRef.current = setInterval(() => {
      liveProgress(selectedTab);
    }, 1000);
    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (liveProgressRef.current) {
        clearInterval(liveProgressRef.current);
        liveProgressRef.current = undefined;
      }
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabs, channelsData, currentProgTime]);

  useEffect(() => {
    if (Session) {
      if (
        contentPathResponse &&
        contentPathResponse.data &&
        contentPathResponse.data.status === true
      ) {
        setFiltersData(contentPathResponse?.data?.response?.filters);
      } else {
        tvguidePaginationRef.current.paginationStarted = true;
        if (contentPathResponse?.data?.status === false) {
          if (contentPathResponse?.data?.error?.code === 401) {
            unAuthorisedHandler();
          }
        }
      }
    }
  }, [contentPathResponse, Session]);

  useEffect(() => {
    if (!Session) return;
    if (
      channnelIdsapiResponse &&
      channnelIdsapiResponse.data &&
      channnelIdsapiResponse.data.status === true
    ) {
      setErrMsg("");
      const channelIds_info = channnelIdsapiResponse.data.response.data.slice(
        0,
        sliceCount
      );
      const ids = channelIds_info.map((channel) => channel.id);
      setPaginationchannelIds(channnelIdsapiResponse.data.response.data);
      setTabs(channnelIdsapiResponse.data.response.tabs);
      const lselectedTab = channnelIdsapiResponse.data.response.tabs?.filter(
        (tab) => tab.isSelected
      )[0];
      if (appConfig?.tvGuide?.dates) {
        setSelectedTab(lselectedTab);
        fetchChannelData({
          start_time: lselectedTab.startTime,
          end_time: lselectedTab.endTime,
          page: 0,
          channel_ids: ids.join(","),
        });
      } else {
        // const currentTime =
        //   appConfig?.tvGuide?.time == "24"
        //     ? new Date().setMinutes(0, 0, 0)
        //     : new Date().setHours(0, 0, 0, 0);
        // const endTime =
        //   appConfig?.tvGuide?.time == "24"
        //     ? new Date(
        //         new Date(currentTime).getTime() + 60 * 60 * 24 * 1000
        //       ).getTime()
        //     : new Date().setHours(23, 59, 59);

        // lselectedTab.startTime = currentTime;
        // lselectedTab.endTime = endTime;

        let das = new Date();
        let d =
          das.getMonth() +
          1 +
          "/" +
          das.getDate() +
          "/" +
          das.getFullYear() +
          " " +
          das.getHours() +
          ":" +
          (das.getMinutes() > 30 ? "30" : "00") +
          ":00";
        d = new Date(d);
        const currentTime = d.getTime();
        const endTime = new Date(
          new Date(d.getTime()).getTime() + 60 * 60 * 24 * 1000
        ).getTime();
        lselectedTab.startTime = d.getTime();
        lselectedTab.endTime = endTime;
        setSelectedTab(lselectedTab);
        fetchChannelData({
          start_time: currentTime,
          end_time: endTime,
          page: 0,
          channel_ids: ids.join(","),
        });
      }
      tvguidePaginationRef.current.paginationStarted = true;
      tvguidePaginationRef.current.isempty = false;
    } else {
      tvguidePaginationRef.current.paginationStarted = false;
      tvguidePaginationRef.current.isempty = true;
      setErrMsg(channnelIdsapiResponse?.data?.error?.message);
    }
    // else if (channnelIdsapiResponse?.data?.error && channnelIdsapiResponse?.data?.error?.code === 401) {
    //   unAuthorisedHandler();
    // }
  }, [channnelIdsapiResponse, Session]);

  useEffect(() => {
    if (!Session) return;
    if (
      channelDataapiResponse &&
      channelDataapiResponse.data &&
      channelDataapiResponse.data.status === true
    ) {
      setChannelIds([
        ...channelIds,
        ...paginationchannelIds.slice(0, sliceCount),
      ]);

      if (!appConfig?.tvGuide?.dates) {
        let time_out = setTimeout(() => {
          if (livebarRef.current) livebarRef.current.style.display = "block";
          if (livetextRef.current) livetextRef.current.style.display = "block";
          clearTimeout(time_out);
          time_out = undefined;
        }, 1000);
      }

      setPaginationchannelIds([
        ...paginationchannelIds.slice(sliceCount, paginationchannelIds.length),
      ]);
      if (channelDataapiResponse.data.response.data) {
        const enhanced_channel_data = enhanceChanneldata(
          channelDataapiResponse.data.response.data,
          selectedTab.startTime,
          selectedTab.endTime
        );
        if (!appConfig?.tvGuide?.dates) {
          setCurrentProgTime(
            parseInt(
              enhanced_channel_data[0]?.programs[0]?.display?.markers?.startTime
                ?.value
            )
          );
        }
        setChannelData([...channelsData, ...enhanced_channel_data]);
      }
      setPage(page + 1);
    } else if (
      channelDataapiResponse?.data?.error &&
      channelDataapiResponse?.data?.error?.code === 401
    ) {
      unAuthorisedHandler();
    }
    tvguidePaginationRef.current.paginationStarted = false;
  }, [channelDataapiResponse]);

  useEffect(() => {
    if (timer != undefined) {
      clearTimeout(timer);
      timer = undefined;
      tvguidePaginationRef.current.paginationStarted = false;
    }
  }, [paginationchannelIds]);

  useEffect(() => {
    if (!Session) return;
    if (selectedTab) {
      getChannelsData();
    }
  }, [tabswitched]);

  const setPaddingfromGuide = (cb) => {
    paddingListeners.push(cb);
  };

  function addDatesListeners(cb) {
    datesListeners.push(cb);
  }

  function handleProgramsScroll() {
    if (programsRef.current && livebarRef.current) {
      livebarRef.current.style.left = `${-programsRef.current.scrollLeft}px`;
      setProgramPadding();
    }
    if (programsRef.current && !!livetextRef.current) {
      livetextRef.current.style.left = `${-programsRef.current.scrollLeft}px`;
    }
  }

  function scrollfunc() {
    if (
      document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY <
        400 &&
      tvguidePaginationRef.current.paginationStarted === false &&
      tvguidePaginationRef.current.isempty === false
    ) {
      if (paginationchannelIds.length > 0) {
        tvguidePaginationRef.current.paginationStarted = true;
        if (
          paginationchannelIds.slice(sliceCount, paginationchannelIds.length)
            .length === 0
        ) {
          tvguidePaginationRef.current.isempty = true;
        }
        // setChannelDataisLoading(true);
        if (timer === undefined) {
          timer = setTimeout(() => {
            getChannelsData();
          }, 300);
        }
      }
    }
  }

  function getprogramWidth(startTime, endTime) {
    if (startTime && endTime) {
      if (appConfig?.tvGuide?.dates) {
        if (
          selectedTab.endTime &&
          Number(endTime) > Number(selectedTab.endTime)
        ) {
          endTime = selectedTab.endTime.toString();
        }
        if (
          selectedTab.startTime &&
          Number(startTime) < Number(selectedTab.startTime)
        ) {
          startTime = selectedTab.startTime.toString();
        }
      }
      let updatedEndTime = endTime;
      let maxEndTime = selectedTab.endTime;
      if (!appConfig?.tvGuide?.dates) {
        maxEndTime =
          appConfig?.tvGuide?.time == "24"
            ? new Date(
                new Date().setMinutes(0, 0, 0) + 60 * 60 * 24 * 1000
              ).getTime()
            : new Date().setHours(23, 59, 59);
      }
      if (endTime > maxEndTime) {
        updatedEndTime = maxEndTime;
      }
      const duration = Number(updatedEndTime) - Number(startTime);
      const duration_in_mins = duration / 1000 / 60;
      const width = (duration_in_mins * programWidth) / 30;
      return width;
    }
    return 0;
  }

  function getChannelsData() {
    if (appConfig?.tvGuide?.dates) {
      const channelIds_info = paginationchannelIds.slice(0, sliceCount);
      const ids = channelIds_info.map((channel) => channel.id);
      fetchChannelData({
        start_time: selectedTab.startTime,
        end_time: selectedTab.endTime,
        page,
        channel_ids: ids.join(","),
      });
    } else {
      const ids = [];
      paginationchannelIds.slice(0, sliceCount).map((res) => {
        return ids.push(res.id);
      });
      const currentTime =
        appConfig?.tvGuide?.time == "24"
          ? new Date().setMinutes(0, 0, 0)
          : new Date().setHours(0, 0, 0, 0);

      const endTime =
        appConfig?.tvGuide?.time == "24"
          ? new Date(
              new Date(currentTime).getTime() + 60 * 60 * 24 * 1000
            ).getTime()
          : new Date().setHours(23, 59, 59);
      !!paginationchannelIds.length > 0 &&
        fetchChannelData({
          start_time: currentTime,
          end_time: endTime,
          page,
          channel_ids: ids.join(","),
        });
    }
  }

  function setProgramPadding() {
    paddingListeners.forEach((listener) => {
      listener();
    });
  }

  function handleScrollLeft() {
    if (appConfig?.tvGuide?.dates) {
      setTimeDirectionsClicked(true);
    }
    if (programsRef.current) {
      if (
        programsRef.current.scrollWidth - programsRef.current.scrollLeft !==
        programsRef.current.clientWidth
      ) {
        programsRef.current.scrollLeft += programWidth * 2;
        setInsinLive(false);
      }
    }
    if (LeftArrowHide === true) {
      setLeftArrowHide(false);
    }
    if (timetabsRef.current) {
      if (
        timetabsRef.current.scrollWidth - timetabsRef.current.scrollLeft !==
        timetabsRef.current.clientWidth
      ) {
        timetabsRef.current.scrollLeft += programWidth * 2;
        setInsinLive(false);
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message: Tvguideconstant[localLang].Sorry_You_reached_day_end_time,
          },
        });
        if (RightArrowHide === false) {
          setRightArrowHide(true);
        }
      }
    }
    verticalScroll();
  }

  function handleScrollRight() {
    if (appConfig?.tvGuide?.dates) {
      setTimeDirectionsClicked(true);
    }
    if (programsRef.current) {
      if (programsRef.current.scrollLeft !== 0) {
        programsRef.current.scrollLeft -= programWidth * 2;
        setInsinLive(false);
      }
      if (RightArrowHide === true) {
        setRightArrowHide(false);
      }
    }
    if (timetabsRef.current && selectedTab.startTime < new Date().getTime()) {
      if (timetabsRef.current.scrollLeft !== 0) {
        timetabsRef.current.scrollLeft -= programWidth * 2;
        setInsinLive(false);
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              Tvguideconstant[localLang].Sorry_You_reached_day_start_time,
          },
        });
        if (LeftArrowHide === false) {
          setLeftArrowHide(true);
        }
      }
    }
    verticalScroll();
  }

  function liveProgress(lselectedTab) {
    if (appConfig?.tvGuide?.dates) {
      const currentTime = new Date().getTime();
      if (livebarRef.current && lselectedTab?.startTime) {
        const margin_left_min =
          (currentTime - lselectedTab?.startTime) / 1000 / 60;
        const margin_left_px = (margin_left_min * programWidth) / 30;
        livebarRef.current.style.marginLeft = `${margin_left_px}px`;
        livetextRef.current.style.marginLeft = `${margin_left_px}px`;
      }
    } else {
      const liveBarMargin =
        (parseInt(new Date().getTime() - currentProgTime) / 1000) * minScroll;
      if (livebarRef.current) {
        livebarRef.current.style.marginLeft = `${liveBarMargin}px`;
      }
      if (livetextRef.current) {
        livetextRef.current.style.marginLeft = `${liveBarMargin}px`;
      }
    }
  }

  function gotoLive() {
    if (!appConfig?.tvGuide?.dates) {
      if (currentProgTime) {
        const currentTime = new Date().getTime();
        // console.log((currentTime - currentProgTime))
        let left_min = (currentTime - currentProgTime) / 1000 / 60;
        // console.log(left_min)
        const extra_left_min = left_min % 30;
        // console.log(extra_left_min)
        left_min -= extra_left_min;
        // console.log(left_min)
        // console.log(programWidth,'---',left_min)
        if (programsRef.current) {
          programsRef.current.scrollLeft = (left_min * programWidth) / 30;
        }
        if (timetabsRef.current) {
          timetabsRef.current.scrollLeft = (left_min * programWidth) / 30;
        }
        setInsinLive(true);
        setLeftArrowHide(false);
        setRightArrowHide(false);
      }
    } else if (selectedTab?.title === "Today") {
      const currentTime = new Date().getTime();
      let left_min = (currentTime - selectedTab?.startTime) / 1000 / 60;
      const extra_left_min = left_min % 30;
      left_min -= extra_left_min;
      if (programsRef.current) {
        programsRef.current.scrollLeft = (left_min * programWidth) / 30;
        setInsinLive(true);
      }
      if (timetabsRef.current) {
        timetabsRef.current.scrollLeft = (left_min * programWidth) / 30;
      }
    } else if (tabs?.length > 0) {
      const sTab = tabs.filter((tab) => tab.isSelected)[0];
      setSelectedTab(sTab);
      setPaginationchannelIds([...channelIds.concat(paginationchannelIds)]);
      setChannelIds([]);
      setChannelData([]);
      setTabswitched(!tabswitched);
      tvguidePaginationRef.current.paginationStarted = false;
      tvguidePaginationRef.current.isempty = true;
      if (sTab.title === "Today") {
        const currentTime = new Date().getTime();
        let left_min = (currentTime - sTab?.startTime) / 1000 / 60;
        const extra_left_min = left_min % 30;
        left_min -= extra_left_min;
        if (programsRef.current) {
          programsRef.current.scrollLeft = (left_min * programWidth) / 30;
          setInsinLive(false);
        }
        if (!liveProgressRef.current) {
          livebarRef.current.style.display = "block";
          liveProgressRef.current = setInterval(() => {
            liveProgress(sTab);
          }, 1000);
        }
      } else {
      }
    }
  }

  function handleDatesScroll(type, width) {
    if (type === "next") {
      if (tabsRef.current) {
        tabsRef.current.scrollLeft += width * 3;
      }
    }
    if (type === "prev") {
      if (tabsRef.current) {
        tabsRef.current.scrollLeft -= width * 3;
      }
    }
  }

  function handleDatesInitalScroll(date_right, dates_scrollTo, id) {
    document.getElementById(id)?.scrollIntoView();
    window.scroll(0, -50);
    if (tabsRef.current) {
      if (date_right > tabsRef.current.getBoundingClientRect().right) {
        tabsRef.current.scrollLeft = dates_scrollTo;
      }
    }
    if (mtabsRef.current) {
      if (date_right > mtabsRef.current.getBoundingClientRect().right) {
        mtabsRef.current.scrollLeft = dates_scrollTo;
      } else {
        mtabsRef.current.scrollLeft =
          mtabsRef.current.getBoundingClientRect().right * 6;
      }
    }
  }

  function handleDatesNavigation(type) {
    for (let i = 0; i < datesListeners.length; i++) {
      const isStop = datesListeners[i](type, handleDatesScroll);
      if (isStop) break;
    }
  }

  function handleTabClick(tabdata, tab_left, tab_right) {
    window.scrollTo(0, 0);
    setSelectedTab(tabdata);
    setTimeDirectionsClicked(false);
    setPaginationchannelIds([...channelIds.concat(paginationchannelIds)]);
    setChannelIds([]);
    setChannelData([]);
    setTabswitched(!tabswitched);
    tvguidePaginationRef.current.paginationStarted = false;
    tvguidePaginationRef.current.isempty = false;
    if (tabdata.title === "Today") {
      livebarRef.current.style.display = "block";
      livetextRef.current.style.display = "block";
      if (!liveProgressRef.current) {
        setInsinLive(true);
        liveProgressRef.current = setInterval(() => {
          liveProgress(tabdata);
        }, 1000);
      }
    } else {
      setInsinLive(false);
      if (liveProgressRef.current) {
        livebarRef.current.style.display = "block";
        livetextRef.current.style.display = "block";
        clearInterval(liveProgressRef.current);
        liveProgressRef.current = undefined;
      }
    }
    const tab_width = Math.abs(tab_right) - Math.abs(tab_left);
    if (tab_left < tabsRef.current?.getBoundingClientRect().left) {
      tabsRef.current.scrollLeft = tab_right + tab_width * 2;
    } else if (tab_right > tabsRef.current?.getBoundingClientRect().right) {
      tabsRef.current.scrollLeft = tab_left - tab_width * 2;
    }
  }

  const openProgInfoPopUp = (data) => {
    if (data.template) {
      const tempData = {};
      tempData.target_path = data.target.path;
      const templatesList = getTemplatesList();
      if (templatesList.length > 0) {
        templatesList.map((template) => {
          if (data.template === template.code) {
            const assignedTemplate = template;
            tempData.assignedTemplate = assignedTemplate;
            setTemplateData(tempData);
            setIsBottomLayoutOpen(true);
          }
        });
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message: Tvguideconstant[localLang].Sorry_template_not_found,
          },
        });
      }
    } else {
      dispatch({
        type: actions.NotificationBar,
        payload: {
          message:
            Tvguideconstant[localLang].Sorry_Program_Information_Not_Avaliable,
        },
      });
      // router.push(data?.target?.path);
    }
  };

  const getFilterData = () => {
    const url = `${process.env.initJson.api}/service/api/v1/page/content?path=tvguide&count=30`;
    try {
      contentPathApi(url);
    } catch (e) {}
  };

  const closeFilterModal = () => {
    setshowFilterModal(false);
  };

  const openFilterModal = () => {
    setshowFilterModal(true);
  };

  return (
    <div
      className={`${styles.tvguide_container} ${appConfig.tvGuide.filter ? styles.filtersActive : ""} ${!appConfig.tvGuide.dates ? styles.onlyTime : ""}`}
    >
      {appConfig.tvGuide.filter && (
        <div className={`${styles.tvgudie_header}`}>
          <h1 className={`${styles.title}`}>
            {Tvguideconstant[localLang].tv_guide}
          </h1>
          <button
            className={`${styles.filterbtn}`}
            type="button"
            onClick={openFilterModal}
          >
            {Tvguideconstant[localLang].apply_filters} &nbsp;
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="6"
              viewBox="0 0 10 6"
            >
              <path
                id="Path_2983"
                data-name="Path 2983"
                d="M0,8.825,3.709,5,0,1.175,1.142,0,6,5,1.142,10Z"
                transform="translate(10) rotate(90)"
                fill="#fff"
                opacity="0.85"
              />
            </svg>
          </button>
        </div>
      )}

      {appConfig?.tvGuide?.dates && (
        <div
          className={`${styles.tabs_inner} ${styles.tabs_inner_mobileweb}`}
          ref={mtabsRef}
        >
          {tabs.length > 0 &&
            tabs.map((tab, index) => {
              return (
                <DateTab
                  key={`id-${index}`}
                  id={`id-${index}`}
                  isSelectedTab={selectedTab.subtitle === tab.subtitle}
                  tab={tab}
                  datesScrollTo={handleDatesInitalScroll}
                  tabsLeft={mtabsRef.current?.getBoundingClientRect().left}
                  setDateListeners={addDatesListeners}
                  tabsRight={mtabsRef.current?.getBoundingClientRect().right}
                  handleTabClick={handleTabClick}
                />
              );
            })}
        </div>
      )}

      {((appConfig?.tvGuide?.dates && tabs.length > 0) ||
        (channelsData.length > 0 && tabs.length > 0)) && (
        <div
          className={`${styles.tabs_container}  ${
            isScrolled ? `${styles.tabs_container_fixed}` : ""
          }`}
        >
          {appConfig?.tvGuide?.dates && (
            <div className={`${styles.tabs_top_container}`}>
              <div
                className={`${styles.tabs_prev}`}
                onClick={() => handleDatesNavigation("prev")}
              >
                <img
                  alt="right_arrow"
                  src={`${ImageConfig?.tvGuide?.rightArrow}`}
                />
              </div>
              <div
                className={`${styles.tabs_next}`}
                onClick={() => handleDatesNavigation("next")}
              >
                <img
                  alt="left_arrow"
                  src={`${ImageConfig?.tvGuide?.rightArrow}`}
                />
              </div>
              <div className={`${styles.tabs_inner}`} ref={tabsRef}>
                {tabs.length > 0 &&
                  tabs.map((tab, index) => {
                    return (
                      <DateTab
                        key={`id-${index}`}
                        id={`id-${index}`}
                        isSelectedTab={selectedTab.subtitle === tab.subtitle}
                        tab={tab}
                        datesScrollTo={handleDatesInitalScroll}
                        tabsLeft={tabsRef.current?.getBoundingClientRect().left}
                        setDateListeners={addDatesListeners}
                        tabsRight={
                          tabsRef.current?.getBoundingClientRect().right
                        }
                        handleTabClick={handleTabClick}
                      />
                    );
                  })}
              </div>
            </div>
          )}
          <div className={`${styles.tabs_bottom_container}`}>
            <div className={`${styles.guide_left_top}`}>
              <div
                className={`${styles.go_live_div}`}
                onClick={() => gotoLive()}
              >
                <div
                  className={`${styles.go_live}${
                    isinLive !== true ? ` ${styles.active}` : ""
                  }`}
                >
                  <span className={`${styles.go_live_circle}`}>&nbsp;</span>
                  {Tvguideconstant[localLang].Go_Live}
                </div>
              </div>
            </div>
            <div className={`${styles.times}`}>
              <div className={`${styles.times_inner}`} ref={timetabsRef}>
                <span className={`${styles.live_text}`} ref={livetextRef}>
                  {Tvguideconstant[localLang].Live}
                </span>
                {time_List.map((time, index) => (
                  <div key={index} className={`${styles.time}`}>
                    {time}
                  </div>
                ))}
              </div>
              <div className={`${styles.guide_arrows_container}`}>
                <div
                  className={`${styles.arrow} ${styles.left_arrow} ${LeftArrowHide ? styles.hide : ""}`}
                  onClick={handleScrollRight}
                />
                <div
                  className={`${styles.arrow} ${styles.right_arrow} ${RightArrowHide ? styles.hide : ""}`}
                  onClick={handleScrollLeft}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.guide_container}`}>
        <div className={`${styles.guide_left}`}>
          <div className={`${styles.guide_left_top}`} />
          <div className={`${styles.guide_left_bottom}`}>
            {((!appConfig?.tvGuide?.dates && channelsData.length > 0) ||
              appConfig?.tvGuide?.dates) && (
              <div
                className={`${styles.go_live_div}`}
                onClick={() => gotoLive()}
              >
                <div
                  className={`${styles.go_live}${
                    isinLive !== true ? ` ${styles.active}` : ""
                  }`}
                >
                  <span className={`${styles.go_live_circle}`}>&nbsp;</span>
                  {Tvguideconstant[localLang].Go_Live}
                </div>
              </div>
            )}
            <div className={`${styles.channels_container}`}>
              {channelIds.map((channel, index) => {
                return (
                  <div
                    key={index}
                    className={`${styles.channel}`}
                    // style={{position:"relative"}}
                  >
                    {/* <span style={{position:"absolute"}}>{index}" "{channel.id}</span> */}
                    <img
                      src={`${getAbsolutePath(channel.display.imageUrl)}`}
                      alt=""
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.srcset = `${ImageConfig?.logo}`;
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={`${styles.guide_right}`}>
          <div className={`${styles.guide_programs_wrapper}`}>
            <div
              className={`${styles.guide_programs_container}`}
              ref={programsRef}
            >
              {((!appConfig?.tvGuide?.dates && channelsData.length > 0) ||
                appConfig?.tvGuide?.dates) && (
                <div className={`${styles.times}`}>
                  <div className={`${styles.times_inner}`} ref={mtimetabsRef}>
                    {time_List?.map((time, index) => (
                      <div key={index} className={`${styles.time}`}>
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`${styles.programs_data_container}`}>
                {channelsData.map((channel, index) => {
                  return (
                    <div
                      key={index}
                      className={`${styles.programs_inner_container}`}
                    >
                      {channel.programs.map((program, ind) => {
                        return (
                          <div
                            key={ind}
                            className={`${styles.program} ${parseInt(program?.display?.markers?.startTime?.value) < new Date().getTime() && parseInt(program?.display?.markers?.endTime?.value) > new Date().getTime() ? `${styles.active_program}` : ""}`}
                            style={{
                              width: `${getprogramWidth(
                                program.display.markers?.startTime?.value,
                                program.display.markers?.endTime?.value
                              )}px`,
                            }}
                          >
                            <ProgramTab
                              program={program}
                              openProgram={openProgInfoPopUp}
                              channel_left={
                                programsRef.current?.getBoundingClientRect()
                                  .left
                              }
                              setPaddingfromGuide={setPaddingfromGuide}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            {appConfig?.tvGuide?.dates && (
              <div className={`${styles.guide_arrows_container}`}>
                <div
                  className={`${styles.arrow} ${styles.left_arrow}`}
                  onClick={handleScrollRight}
                />
                <div
                  className={`${styles.arrow} ${styles.right_arrow}`}
                  onClick={handleScrollLeft}
                />
              </div>
            )}
            <div className={`${styles.live_bar}`} ref={livebarRef}>
              <div className={`${styles.live_bar_inner}`}>
                <span className={`${styles.live_text}`}>
                  {Tvguideconstant[localLang].Live}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {channelsData.length <= 0 && !!errMsg && (
        <h3 className={styles.errMsg}>{errMsg}</h3>
      )}
      {channelDataisLoading && <Skeleton pagePath="tvguide" />}
      {isBottomLayoutOpen && (
        <BottomLayout
          open={isBottomLayoutOpen}
          onClose={() => setIsBottomLayoutOpen(false)}
          templateData={templateData}
        />
      )}
      {showFilterModal && (
        <TvGuideFilterModal
          tvguidefilters={filtersData}
          closeFilterModal={closeFilterModal}
        />
      )}
    </div>
  );
};

export default Tvguide;
