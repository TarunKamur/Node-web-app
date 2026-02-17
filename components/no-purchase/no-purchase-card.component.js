import React, { useEffect, useState } from "react";
import styles from "./no-purchase-card.module.scss";
import { noPurchaseConstant } from "@/.i18n/locale";
import Link from "next/link";
import { ImageConfig } from "@/config/ImageConfig";
import { useStore } from "@/store/store";
import { useRouter } from "next/router";

const NoPurchasesCard = () => {
  const {
    state: { localLang },
  } = useStore();
  const router = useRouter();
  // const showtext =  (router.query?.content == "Channels") || (router.query?.content == "mylikedvideos")

  const [showtext, setshowtext] = useState(
    router.query?.content == "Channels" ||
      router.query?.content == "mylikedvideos"
  );

  return (
    <div className={styles.cardcontainer}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <img
            src={ImageConfig?.payments?.noPurchaseVideo}
            // src="https://i.ibb.co/WthXrJd/undraw-video-files-fu10-1.png" // Replace with your image URL
            alt="Video Icon"
          />
        </div>
        {console.log(">>>>localLang", localLang)}
        <h3>
          {showtext
            ? noPurchaseConstant[localLang]?.No_Data_Yet
            : noPurchaseConstant[localLang]?.No_Purchases_Yet}
        </h3>
        {showtext ? (
          <p>{noPurchaseConstant[localLang]?.No_data_fount_Description}</p>
        ) : (
          <p>{noPurchaseConstant[localLang]?.No_Purchase_Description}</p>
        )}
        <Link href="/">
          <button className={`${styles.button} primary`}>
            {noPurchaseConstant[localLang]?.Browse_Series}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NoPurchasesCard;
