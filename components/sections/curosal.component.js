import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState, useRef } from "react";
import { Navigation, FreeMode, Grid } from "swiper/modules";
import styles from "@/components/sections/sections.module.scss";
import Skeleton from "../skeleton/skeleton.component";

import Card from "@/components/cards/card.component";
import {
  NoOfCardsToRender,
  cardsRatio,
  getAvaliableCardTypes,
} from "@/services/cards.service";
import { debounceFunction } from "@/services/utility.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { actions, useStore } from "@/store/store";

function Curosal({
  curosalData,
  PageData,
  rowIndex,
  removeSection,
  localLang,
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [sData, setSectionData] = useState(null);
  const [cType, setCType] = useState("sheet_poster");
  // const [swiperRef, setSwiperRef] = useState(null);
  const swiperRef = useRef(null);
  const [breakpoints, setBreakpoints] = useState(null);
  const [nofcardsperSlide, setNumberofcardsperSlide] = useState(0);
  const carouselRef = useRef();
  const [deleteCardIndex, setDeleteCardIndex] = useState(null);
  const { mutate: deleteCard, data: deleteCardResponse } = usePostApiMutate();
  const [rows, setRows] = useState(1);
  const [rowheight, setRowHeight] = useState("");
  const {
    state: { NotificationBar },
    dispatch,
  } = useStore();

  useEffect(() => {
    let cardAllType = getAvaliableCardTypes();

    setCType(
      cardAllType.includes(curosalData.sectionData.data[0].cardType)
        ? curosalData.sectionData.data[0].cardType
        : "sheet_poster"
    );
    let cardSize =
      curosalData.sectionData.data[0]?.metadata?.size?.key == "size"
        ? curosalData.sectionData.data[0]?.metadata?.size?.value
        : undefined;
    let no_of_cards_render = NoOfCardsToRender(
      curosalData.sectionData.data[0].cardType,
      cardSize
    );
    setBreakpoints(no_of_cards_render);
    setSectionData({ ...curosalData });
    setRows(Number(curosalData?.sectionData?.params?.multiSectionRows || "1"));
    let debouncFunc = debounceFunction(set_hover_class_data, 500);
    const resizeObserver = new ResizeObserver(() => {
      debouncFunc(no_of_cards_render);
    });
    if (carouselRef.current) resizeObserver.observe(carouselRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [curosalData]);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      let activeSlideIndex = swiperRef.current.swiper.activeIndex;
      let activeSlideElement =
        swiperRef.current.swiper.slides[activeSlideIndex];
      let cardWidth = activeSlideElement?.clientWidth;
      calculateHeight(cardWidth);
    }
  }, [localLang]);

  useEffect(() => {
    if (!!deleteCardResponse?.data) {
      if (deleteCardResponse?.data?.status) {
        setSectionData((prevData) => {
          const updatedData = prevData.sectionData.data.filter(
            (value, index) => {
              return index !== deleteCardIndex;
            }
          );
          return {
            ...prevData,
            sectionData: {
              ...prevData.sectionData,
              data: updatedData,
            },
          };
        });
        console.log(
          "deleteCardResponse?.data?.message",
          deleteCardResponse?.data?.response?.message
        );
        dispatch({
          type: actions.NotificationBar,
          payload: { message: deleteCardResponse?.data?.response?.message },
        });
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              deleteCardResponse?.data?.error?.message ||
              "Some thing went wrong",
          },
        });
      }
    }
  }, [deleteCardResponse]);

  // callback to remove section from dom
  useEffect(() => {
    if (sData?.sectionData?.data.length == 0) {
      removeSection(sData?.sectionInfo?.code);
    }
  }, [sData?.sectionData?.data]);

  const calculateHeight = (cWidth) => {
    let cardR = cardsRatio(cType);
    let cHeight = cWidth * cardR;
    if (cType === "horizontal_poster") {
      cHeight = cWidth * 0.28125; // 32:9
    }
    sData.width = cWidth;
    sData.height = cHeight;
    let rows = Number(
      curosalData?.sectionData?.params?.multiSectionRows || "1"
    );
    if (rows > 1 && rowheight === "") {
      setRowHeight(cHeight * rows);
    }
    setSectionData({ ...sData });
  };

  const eleHandle = (swiper) => {
    if (cType == "tag_poster") {
      setTimeout(() => {
        removeSection({ cType: cType, nextnav: swiper, index: rowIndex });
      }, 1000);
    }
    swiper.params.navigation.prevEl = prevRef.current;
    swiper.params.navigation.nextEl = nextRef.current;
    swiper.navigation.init();
    swiper.navigation.update();
    // Get the width of the active slide (card)
    let activeSlideIndex = swiper.activeIndex;
    let activeSlideElement = swiper.slides[activeSlideIndex];
    let cardWidth = activeSlideElement?.clientWidth;
    calculateHeight(cardWidth);
  };

  const set_hover_class_data = (no_of_cards_render) => {
    if (!carouselRef.current) return;
    const breakpoints = Object.keys(no_of_cards_render).map((breakpoint) =>
      Number(breakpoint)
    );
    breakpoints.sort((a, b) => b - a); //increasing order
    let breakpoint;
    for (let i = 0; i < breakpoints.length; i++) {
      if (breakpoints[i] <= carouselRef.current.clientWidth) {
        breakpoint = breakpoints[i];
        break;
      }
    }
    if (no_of_cards_render[breakpoint]?.slidesPerView !== undefined)
      setNumberofcardsperSlide(no_of_cards_render[breakpoint].slidesPerView);
  };

  const removedCard = (event, item, indexToRemove) => {
    event.preventDefault();
    setDeleteCardIndex(indexToRemove);
    const apiData = {
      viewType: "continue_watching",
      pagePath: item.target.path,
    };
    let url =
      process.env.initJson["api"] + "/service/api/v1/delete/view/archive";
    deleteCard({ url, apiData });
  };

  return (
    <div
      className={`${styles.swiperClass} swiperClass ${rows > 1 && styles.grid}`}
      ref={carouselRef}
      style={rows > 1 ? { height: `${rowheight}px` } : {}}
    >
      {sData && (
        <Swiper
          ref={swiperRef}
          spaceBetween={rows <= 1 ? (window.innerWidth < 767 ? 8 : 14) : 0}
          speed={500}
          breakpoints={breakpoints}
          autoplay={false}
          freeMode={window.innerWidth < 767 ? true : false}
          // preventInteractionOnTransition = {window.innerWidth < 767 ? false : true}
          modules={[Navigation, FreeMode, Grid]}
          scrollbar={{
            el: ".swiper-scrollbar",
            draggable: window.innerWidth < 767 ? true : false,
          }}
          mousewheel={window.innerWidth < 767 ? true : false}
          className={`${styles.cardSwiper}`}
          navigation={{
            disabledClass: `${styles.disable_arrow}`,
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onInit={(swiper) => eleHandle(swiper)}
          onUpdate={(swiper) => eleHandle(swiper)}
          grid={{ rows: rows }}
          style={rows > 1 ? { height: `100%` } : {}}
        >
          {sData.sectionData?.data.map((item, index) => (
            <SwiperSlide
              key={`row-${rowIndex}-item-${index}-${item.target.path}`}
              className={`${styles.CustomSwiperSlide} ${styles[cType]} ${rows > 1 && styles.grid}`}
              data-test-slide={`slide-${rowIndex}-${index}`}
              style={
                rows > 1 ? { height: `${100 / rows}%`, overflow: "hidden" } : {}
              }
            >
              <Card
                key={item.target.path}
                pagedata={PageData}
                sectionInfo={{ sectionData: curosalData, index }}
                item={item}
                cardType={cType}
                cWidth={sData.width}
                CHeight={sData.height}
                eleIndex={[rowIndex, index]}
                noofCards={sData.sectionData?.data.length}
                nofcardsperSlide={nofcardsperSlide}
                sectionData={curosalData}
                removeCard={removedCard}
                originMedium={"C"}
              ></Card>
            </SwiperSlide>
          ))}
          <div className={`${styles.prev}`} ref={prevRef}></div>
          <div className={`${styles.next}`} ref={nextRef}></div>
        </Swiper>
      )}
      {!sData && (
        <div>
          <Skeleton custom={true} type={["section"]} />
        </div>
      )}
    </div>
  );
}

export default Curosal;
