import React, { useRef } from "react";
import Card from "@/components/cards/card.component";
import { useCallback, useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import styles from "@/components/grid/grid.module.scss";
import {
  NoOfCardsToRender,
  cardsRatio,
  getAvaliableCardTypes,
} from "@/services/cards.service";
import { useRouter } from "next/router";
import useGetApiMutate from "@/hooks/useGetApidata";
import { getPagePath, jsonToQueryParams } from "@/services/utility.service";
import Skeleton from "../skeleton/skeleton.component";
import CardpreviewContextProvider from "../sections/previewContext";
import usePostApiMutate from "@/hooks/usePostApidata";
import GAdsComponent from "../Gads/GAdsComponent";
import { checkNativeAds } from "../Gads/GAdsUtils";
import { systemConfigs } from "@/services/user.service";

const Grid = ({ gridData, channel = false }) => {
  const {
    state: { PageData },
    dispatch,
  } = useStore();
  const [adsSlots, setAdsSlots] = useState({});
  const router = useRouter();
  const [listData, setSectionData] = useState({});
  const [cPad, setCPad] = useState(0);
  const [cMargin, setCMargin] = useState(0);
  const [cType, setCType] = useState(
    !!gridData?.section?.sectionData?.data[0]?.cardType
      ? gridData?.section?.sectionData?.data[0]?.cardType
      : "sheet_poster"
  );
  const {
    mutate: mutateGetpaginationData,
    data: apiPaginationResponse,
    isLoading: isPaginationLoading,
    isPaginationError,
    Paginationerror,
    Paginationrefetch,
  } = useGetApiMutate();

  const [hasDynamicName, sethasDynamicName] = useState([]);
  const [hasMoreDataScroll, setHasMoreDataScroll] = useState(
    gridData?.section?.sectionData?.hasMoreData
  );
  const [deleteCardIndex, setDeleteCardIndex] = useState(null);
  const { mutate: deleteCard, data: deleteCardResponse } = usePostApiMutate();
  const paginationRef = useRef({
    started: false,
  });
  const [noOfCards, setNoOfCards] = useState();
  const cardAllType = getAvaliableCardTypes();
  const lastElement = useRef();
  const initialLoad = useRef({
    initialState: true,
  });

  useEffect(() => {
    if (!lastElement.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // console.log(":1234567")
          if (
            entry.isIntersecting &&
            listData.hasMoreData &&
            initialLoad.current.initialState
          ) {
            pagination();
            // console.log("09876543");
          }
        });
      },
      {
        root: null, // viewport as the root
        rootMargin: "0px", // no margin
        threshold: 0.5, // 50% of the element must be visible to trigger the callback
      }
    );

    setTimeout(() => {
      if (lastElement.current) observer.observe(lastElement.current);
    }, 500);

    return () => {
      if (lastElement.current) observer.unobserve(lastElement.current); // Cleanup
      observer.disconnect();
    };
  }, [listData]);

  useEffect(() => {
    if (!!gridData) {
      if (gridData?.section?.sectionInfo?.params?.hasDynamicName === "true") {
        sethasDynamicName([gridData?.contentCode]);
      }

      prepareSections(gridData);
    }
  }, [gridData, cType]);

  useEffect(() => {
    if (
      !!apiPaginationResponse?.data?.response &&
      apiPaginationResponse?.data?.response[0]?.data &&
      apiPaginationResponse?.data?.response[0]?.data.length > 0
    ) {
      listData.section.sectionData.data = [
        ...listData.section?.sectionData?.data,
        ...apiPaginationResponse?.data?.response[0]?.data,
      ];
      listData.hasMoreData =
        apiPaginationResponse?.data?.response[0].hasMoreData;
      listData.offset = apiPaginationResponse?.data?.response[0].lastIndex;
    } else if (
      !!apiPaginationResponse?.data?.response &&
      apiPaginationResponse?.data?.response[0]?.paneType === "section" &&
      apiPaginationResponse?.data?.response[0]?.section?.sectionData?.data
        ?.length > 0
    ) {
      listData.section.sectionData.data = [
        ...listData.section?.sectionData?.data,
        ...apiPaginationResponse?.data?.response[0]?.section?.sectionData?.data,
      ];
      listData.hasMoreData =
        apiPaginationResponse?.data?.response[0].section?.sectionData?.hasMoreData;
      listData.offset =
        apiPaginationResponse?.data?.response[0].section?.sectionData?.lastIndex;
    } else {
      listData.hasMoreData = false;
    }
    if (!!apiPaginationResponse) {
      initialLoad.current.initialState = false;
      setSectionData(listData);
      setTimeout(() => {
        paginationRef.current.started = false;
      }, 200);
    }
    setHasMoreDataScroll(apiPaginationResponse?.data?.response[0]?.hasMoreData);
  }, [apiPaginationResponse]);

  useEffect(() => {
    if (deleteCardResponse?.data?.status) {
      setSectionData((prevData) => {
        // Removing the item from the data array
        const updatedData = prevData.section.sectionData.data.filter(
          (value, index) => {
            return index !== deleteCardIndex;
          }
        );
        if (updatedData.length === 0) {
          router.back();
        }
        return {
          ...prevData,
          section: {
            ...prevData.section,
            sectionData: {
              ...prevData.section.sectionData,
              data: updatedData, // Updating the data array in the state
            },
          },
        };
      });
      dispatch({
        type: actions.NotificationBar,
        payload: { message: deleteCardResponse?.data?.response?.message },
      });
    } else {
    }
  }, [deleteCardResponse]);
  const isTopOrBottomAd = (index) => {
    return (
      !adsSlots?.adDataArray?.[(index + 1) / noOfCards?.cardsToShow - 1]
        ?.bottom &&
      !adsSlots?.adDataArray?.[(index + 1) / noOfCards.cardsToShow - 1]?.top
    );
  };
  useEffect(() => {
    const adsData = checkNativeAds(systemConfigs, PageData);
    // forming array to loop on grid
    const adDataArray =
      adsData &&
      Object.entries(adsData).map(([key, value], index) => ({
        index: index + 1, // Adding 1 to make index start from 1 instead of 0
        indexV: parseInt(key),
        ...value,
      }));
    console.log({ adsData, adDataArray });
    // console.log(adDataArray);
    setAdsSlots({ adDataArray, adsData });
  }, [PageData, noOfCards]);

  const noOfCardsInRow = (cardSize = "") => {
    let windowWidth = window.innerWidth;
    let cardPerResolution = { ...NoOfCardsToRender(cType, cardSize) };
    let lessThanGivenValue = Object.keys(cardPerResolution).filter(
      (item) => item <= windowWidth
    );
    if (!!lessThanGivenValue) {
      let sorted = lessThanGivenValue.sort((a, b) => b - a);
      setCPad(cardPerResolution[sorted[0]]?.gridPadding);
      setCMargin(cardPerResolution[sorted[0]]?.cardPaddingGrid);
      return {
        cardsToShow: cardPerResolution[sorted[0]].cardsPerGridRow,
        cardPadding: cardPerResolution[sorted[0]].cardPaddingGrid,
        gridPadding: cardPerResolution[sorted[0]].gridPadding,
      };
    } else {
      let sorted = Object.keys(cardPerResolution).sort((a, b) => a - b);
      setCPad(cardPerResolution[sorted[0]]?.gridPadding);
      setCMargin(cardPerResolution[sorted[0]]?.cardPaddingGrid);
      return {
        cardsToShow: cardPerResolution[sorted[0]].cardsPerGridRow,
        cardPadding: cardPerResolution[sorted[0]].cardPaddingGrid,
        gridPadding: cardPerResolution[sorted[0]].gridPadding,
      };
    }
  };

  const prepareSections = (data) => {
    let cardT =
      data?.section?.sectionData?.data[0]?.cardType ||
      data?.searchResults?.data[0]?.cardType;
    let cardSize =
      data?.section?.sectionData.data[0]?.metadata?.size?.key == "size"
        ? data?.section?.sectionData.data[0]?.metadata?.size?.value
        : undefined;
    let cardR = cardsRatio(cType);
    setNoOfCards(noOfCardsInRow());
    let totalPageCount =
      (document.body.clientWidth -
        2 * noOfCardsInRow(cardSize)?.gridPadding -
        noOfCardsInRow(cardSize)?.cardsToShow *
          (2 * noOfCardsInRow(cardSize)?.cardPadding)) /
      noOfCardsInRow(cardSize)?.cardsToShow;
    let cardWidth = totalPageCount;
    data.width = cardWidth;
    data.height = cardWidth * cardR;
    if (data?.section?.sectionData?.hasMoreData == true) {
      data.hasMoreData = true;
      data.offset = data?.section?.sectionData?.lastIndex;
    } else {
      data.hasMoreData = false;
      data.offset = data?.section?.sectionData?.lastIndex;
    }
    setCType(cardAllType.includes(cardT) ? cardT : "sheet_poster");
    setSectionData(data);
  };

  const pagination = useCallback(() => {
    if (
      gridData &&
      !!listData.hasMoreData &&
      (gridData.hasMoreData || !!hasMoreDataScroll)
    ) {
      let filteredArray = hasDynamicName.filter((value) =>
        listData.contentCode.includes(value)
      );
      let hasName = filteredArray?.length > 0 ? true : false;
      let params = {
        path: getPagePath(router.asPath),
        count: 24,
        code: listData.contentCode,
        hasDynamicExpression: hasName,
        offset: listData.offset,
      };
      let url =
        process.env.initJson.api +
        "/service/api/v1/section/data?" +
        jsonToQueryParams(params);
      try {
        mutateGetpaginationData(url);
      } catch (e) {}
    }
  }, [
    gridData,
    listData.contentCode,
    listData.offset,
    mutateGetpaginationData,
    router.asPath,
  ]);

  useEffect(() => {
    const scrollHandler = () => {
      const scrolledBottompx =
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY;
      const scrolledToppx = window.scrollY;
      initialLoad.current.initialState = false;
      // const threshold =
      //   document.getElementById("appFooter").scrollHeight - 60 ||
      //   (window.innerWidth < 767 ? 640 : 300);

      if (
        scrolledBottompx !== null &&
        scrolledBottompx < window.innerHeight &&
        scrolledToppx > 150
      ) {
        if (paginationRef.current.started === false) {
          paginationRef.current.started = true;
          pagination();
          // console.log("234567");
        }
      }
    };

    document.addEventListener("scroll", scrollHandler);
    return () => {
      document.removeEventListener("scroll", scrollHandler);
    };
  }, [pagination]);

  const removedCard = (event, item, indexToRemove) => {
    event.preventDefault();
    setDeleteCardIndex(indexToRemove);
    const apiData = {
      viewType: "continue_watching",
      pagePath: item.target.path,
    };
    const url =
      process.env.initJson["api"] + "/service/api/v1/delete/view/archive";
    deleteCard({ url, apiData });
  };

  return (
    <CardpreviewContextProvider>
      <div className={`${styles.listHome} listHome`}>
        {PageData.info.pageType != "details" && (
          <div
            className={`${styles.listTitle}`}
            style={{ padding: `0 ${cPad + cMargin}px` }}
          >
            <h1>{listData.section?.sectionInfo?.name}</h1>
          </div>
        )}
        {/* {console.log(adsSlots?.adsData)} */}
        {adsSlots.adsData?.top?.top && window.innerWidth < 990 && (
          <GAdsComponent adData={adsSlots.adsData.top} />
        )}
        <div
          className={`${styles.listItems}`}
          style={{ padding: `0 ${cPad}px` }}
        >
          {listData &&
            listData?.section?.sectionData?.data.map((item, index) => {
              const adsPerRowMap = adsSlots?.adsData || {};
              const cardsPerRow = noOfCards.cardsToShow;
              const rowNumber = Math.floor(index / cardsPerRow) + 1;
              const isLastCardInRow = (index + 1) % cardsPerRow === 0;
              const adDataForRow = adsPerRowMap[rowNumber];

              return (
                <React.Fragment key={item.target.path}>
                  <div
                    className={`${styles.cardItem}`}
                    style={{ margin: `${cMargin}px` }}
                    ref={
                      index == listData?.section?.sectionData?.data.length - 1
                        ? lastElement
                        : null
                    }
                  >
                    <Card
                      removeCard={removedCard}
                      sectionInfo={{ sectionData: listData.section, index }}
                      key={item.target.path}
                      pagedata={PageData}
                      item={item}
                      cardType={cType}
                      cWidth={listData.width}
                      CHeight={listData.height}
                      sectionData={gridData.section}
                      eleIndex={index}
                      originMedium={"C"}
                      isGirdPage={true}
                      isChannelContent={channel}
                    ></Card>
                  </div>
                  {isLastCardInRow && adDataForRow && (
                    <div style={{ width: "100%" }}>
                      {/* <h1>Hello</h1> */}
                      <GAdsComponent adData={adDataForRow} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          {listData &&
            listData.searchResults?.data.map((item, index) => {
              const adsPerRowMap = adsSlots?.adsData || {};
              const cardsPerRow = noOfCards.cardsToShow;
              const rowNumber = Math.floor(index / cardsPerRow) + 1;
              const isLastCardInRow = (index + 1) % cardsPerRow === 0;
              const adDataForRow = adsPerRowMap[rowNumber];
              return (
                <React.Fragment key={index}>
                  <div
                    className={`${styles.cardItem}`}
                    style={{ margin: `${cMargin}px` }}
                  >
                    <Card
                      key={index}
                      pagedata={PageData}
                      item={item}
                      cardType={cType}
                      cWidth={listData.width}
                      CHeight={listData.height}
                      sectionData={gridData.section}
                      eleIndex={index}
                      originMedium={"C"}
                    ></Card>
                  </div>
                  {isLastCardInRow && adDataForRow && (
                    <div style={{ width: "100%" }}>
                      {/* <h1>Hello</h1> */}
                      <GAdsComponent adData={adDataForRow} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
        </div>
        {isPaginationLoading && (
          <div>
            <Skeleton custom={true} type={["list"]} />
          </div>
        )}
        {adsSlots.adsData?.bottom?.bottom && !listData.hasMoreData && (
          <GAdsComponent adData={adsSlots.adsData.bottom} />
        )}
      </div>
    </CardpreviewContextProvider>
  );
};

export default Grid;
