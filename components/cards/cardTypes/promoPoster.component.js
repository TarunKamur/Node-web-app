import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/components/cards/card.module.scss";
import { getImagePath } from "@/services/user.service";

const PromoPoster = ({ BadgeText, cardData }) => {
  return (
    <div className={styles.promo_poster}>
      <Link
        href={cardData?.target?.path}
        prefetch={false}
        target={cardData.display.subtitle5 == "external" ? "_black" : "_self"}
      >
        <Image
          className={styles.main_img}
          src={getImagePath(cardData?.display.imageUrl)}
          fill
          alt="promo"
        />
        {!!cardData?.display?.badgeMarker && (
          <BadgeText badgeMarker={cardData.display.badgeMarker} />
        )}
      </Link>
    </div>
  );
};

export default PromoPoster;
