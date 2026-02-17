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

const SearchGridv1 = ({ gridData, searchQuery }) => {
  const {
    state: { PageData },
  } = useStore();
  const [cPad, setCPad] = useState(0);
  const [cMargin, setCMargin] = useState(0);
  const [listData, setSectionData] = useState({});
  const [cType, setCType] = useState(!!gridData[0]?.cardType ? gridData[0]?.cardType : "sheet_poster");
 
  const paginationRef = useRef({
    started:false
  })

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
    let gData = {"gData":data}
    let cardT = data[0]?.cardType;
    let cardR = cardsRatio(cType);
    let totalPageCount = (document.body.clientWidth - (2*noOfCardsInRow()?.gridPadding) - noOfCardsInRow()?.cardsToShow * (2 * noOfCardsInRow()?.cardPadding)) / noOfCardsInRow()?.cardsToShow;
    let cardWidth = totalPageCount;
    gData.width = cardWidth;
    gData.height = cardWidth * cardR;
    if(data?.section?.sectionData?.hasMoreData == true ){
      gData.hasMoreData = true
      gData.offset = data?.section?.sectionData?.lastIndex
    }else{
      gData.hasMoreData = false
      gData.offset = data?.section?.sectionData?.lastIndex
    }
    setCType(cardT);

    setSectionData(gData);   
  };

  return (
    <div className={`${styles.listHome} listHome`}>
      {PageData?.info?.pageType != 'details' && <div className={`${styles.listTitle}`}  style={{padding : `0 ${cPad + cMargin}px`}}>
        {listData.section?.sectionInfo?.name}
      </div>}
      <div className={`${styles.listItems}`} style={{padding : `0 ${cPad}px`}}>          
           {listData && listData.gData && 
          listData.gData.map((item, index) => (
            <div key={index} className={`${styles.cardItem}`} style={{margin : `${cMargin}px`}}>
              <Card
                key={Math.random()}
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
          ))
          }
      </div>
    </div>
  );
};

export default SearchGridv1;
