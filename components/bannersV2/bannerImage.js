import React from "react";
import styles from "./SlickBanners.module.scss";
import Image from "next/image";
import { appConfig } from "@/config/app.config";

export const BannerImage = ({ item, bannerCode }) => {
  const loaderProp = ({ src }) => {
    return src;
  };
  return (
    <div
      className={`${styles.imgContainer} ${styles[item.customClass]}  ${styles[bannerCode]}`}
    >
      <Image
        fill
        sizes="100vw"
        loader={loaderProp}
        // handling empty images urls
        src={
          item.imageUrl !== ""
            ? item.imageUrl
            : `${appConfig.staticImagesPath}default-banner.png`
        }
        id={`img_bannerImg_${item.id}`}
        className={`${styles.img_responsive}`}
        alt={`Banner ${item.id}`}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.srcset = `${appConfig.staticImagesPath}default-banner.png`;
        }}
      />
    </div>
  );
};
