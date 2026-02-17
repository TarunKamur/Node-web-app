import React from "react";
import styles from "@/components/cards/card.module.scss";

const TagPoster = ({ cardType, cardData, openProgInfoPopUp, BadgeText }) => {
  return (
    <div
      className={`${styles.tagPoster} ${
        cardData?.display.partnerIcon ? "with_icon" : ""
      } `}
      onClick={() => openProgInfoPopUp(cardData)}
    >
      <h3 className={` ${styles.main_title} tagPosterGrid`}>
        {cardData?.display.title}{" "}
      </h3>
    </div>
  );
};

export default TagPoster;
