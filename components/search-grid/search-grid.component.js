import React, { useRef } from "react";
import Card from "@/components/cards/card.component";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import styles from "@/components/search-grid/search-grid.module.scss";
import { NoOfCardsToRender, cardsRatio } from "@/services/cards.service";
import { useRouter } from "next/router";
import useWindowScroll from "@/hooks/useWindowScroll";
import useGetApiMutate from "@/hooks/useGetApidata";
import { getPagePath, jsonToQueryParams } from "@/services/utility.service";
import { checkNativeAds } from "../Gads/GAdsUtils";
import GAdsComponent from "../Gads/GAdsComponent";

const SearchGrid = ({ gridData, searchQuery }) => {
  const {
    state: { PageData },
  } = useStore();
  const [cPad, setCPad] = useState(0);
  const [cMargin, setCMargin] = useState(0);
  const [listData, setSectionData] = useState({});
  const [cType, setCType] = useState(!!gridData?.searchResults?.data[0]?.cardType ? gridData?.searchResults?.data[0]?.cardType : "sheet_poster");
 
  const paginationRef = useRef({
    started:false
  })
  const [adsSlots, setAdsSlots] = useState({});
  const [noOfCards, setNoOfCards] = useState();
  useEffect(() => {
    if (!!gridData) {
      prepareSections(gridData);  
    }
  }, [gridData, cType]);

 

  const noOfCardsInRow = () => {
    let windowWidth = window.innerWidth;
    let cardPerResolution = { ...NoOfCardsToRender(cType) };
    let  lessThanGivenValue = Object.keys(cardPerResolution).filter(item => item <= windowWidth);
    if(!!lessThanGivenValue){
      let sorted = lessThanGivenValue.sort((a, b) => b - a);
      setCPad(cardPerResolution[sorted[0]]?.gridPadding);
      setCMargin(cardPerResolution[sorted[0]]?.cardPaddingGrid);
      return {cardsToShow:cardPerResolution[sorted[0]].cardsPerGridRow, cardPadding:cardPerResolution[sorted[0]].cardPaddingGrid, gridPadding : cardPerResolution[sorted[0]].gridPadding};
    }else{
      let sorted = Object.keys(cardPerResolution).sort((a, b) => a - b);
      setCPad(cardPerResolution[sorted[0]]?.gridPadding);
      setCMargin(cardPerResolution[sorted[0]]?.cardPaddingGrid);
      return {cardsToShow:cardPerResolution[sorted[0]].cardsPerGridRow, cardPadding:cardPerResolution[sorted[0]].cardPaddingGrid, gridPadding : cardPerResolution[sorted[0]].gridPadding};
    }      
  };

  const prepareSections = (data) => {  
    let cardT = data?.searchResults?.data[0]?.cardType;
    let cardR = cardsRatio(cType);
    setNoOfCards(noOfCardsInRow());

    let totalPageCount = (document.body.clientWidth - (2*noOfCardsInRow()?.gridPadding) - noOfCardsInRow()?.cardsToShow * (2 * noOfCardsInRow()?.cardPadding)) / noOfCardsInRow()?.cardsToShow;
    let cardWidth = totalPageCount;
    data.width = cardWidth;
    data.height = cardWidth * cardR;
    if(data?.section?.sectionData?.hasMoreData == true ){
      data.hasMoreData = true
      data.offset = data?.section?.sectionData?.lastIndex
    }else{
      data.hasMoreData = false
      data.offset = data?.section?.sectionData?.lastIndex
    }
    setCType(cardT);
    setSectionData(data);   
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
    // setAdsSlots({adDataArray,adsData});
  }, [PageData, noOfCards]);

  const isTopOrBottomAd = (index) => {
    return (
      !adsSlots?.adDataArray?.[(index + 1) / noOfCards?.cardsToShow - 1]
        ?.bottom &&
      !adsSlots?.adDataArray?.[(index + 1) / noOfCards.cardsToShow - 1]?.top
    );
  };

  return (
    <div className={`${styles.listHome} listHome`}>  
      {PageData?.info?.pageType != 'details' && <div className={`${styles.listTitle}`}  style={{padding : `0 ${cPad + cMargin}px`}}>
        {listData.section?.sectionInfo?.name}
      </div>}
      <div className={`${styles.listItems}`} style={{padding : `0 ${cPad}px`}}>          
           {listData &&
          listData.searchResults?.data.map((item, index) => (
            <>
            <div key={index} className={`${styles.cardItem}`} style={{margin : `${cMargin}px`}}>
              <Card
                key={index}
                pagedata={PageData}
                item={item}
                cardType={cType}
                cWidth={listData.width}
                CHeight={listData.height}
                originMedium={'S'}
                searchQuery={searchQuery}
                eleIndex={index}
              ></Card>
            </div>
             {(index + 1) % noOfCards.cardsToShow === 0 && adsSlots && (
              <div style={{ width: "100%" }}>
                {isTopOrBottomAd(index) && (
                  <GAdsComponent
                    adData={
                      adsSlots?.adDataArray?.[
                        (index + 1) / noOfCards?.cardsToShow - 1
                      ]
                    }
                  />
                )}
              </div>
            )}
            </>
          ))}
      </div>
    </div>
  );
};

export default SearchGrid;
