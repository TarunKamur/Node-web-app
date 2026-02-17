import { useStore } from "@/store/store";
import styles from "./bookd2h.module.scss";
import { useRouter } from "next/router";
import { ImageConfig } from "@/config/ImageConfig";
import { useEffect, useState } from "react";
import { getItem } from "@/services/local-storage.service";
import Link from "next/link";
import { sendEvent } from "@/services/analytics.service";

function BookD2h() {
  const {
    state: { SystemLanguages, localLang, SystemConfig },
  } = useStore();
  const router = useRouter();

  const [dthData, setdthData] = useState([]);
  const [text, setText] = useState("");
  const [utUser, setUtUser] = useState(getItem("isUtuser"));

  useEffect(() => {
    let Data = SystemLanguages?.[localLang]?.bookDthPage
      ? JSON.parse(SystemLanguages[localLang].bookDthPage)
      : JSON.parse(SystemConfig?.configs?.bookDthPage || "{}");

    setText(Data.text);
    setUtUser(getItem("isUtuser"));
    const isUtUser = getItem("isUtuser");

    const headerElement = document.getElementById("mobile_header");

    if (Data.items && Data.items.length > 0) {
      Data = Data.items.map((item) => {
        if (isUtUser) {
          item.target = `${SystemConfig.configs.siteURL}openlink?redirect=${item.target}`;
        }
        item.targetType = "self";
        return item;
      });
      setdthData(Data);
    }

    let windowWidth = window.innerWidth;
    if (windowWidth <= 991) {
      if (headerElement) {
        headerElement.style.display = "none";
      }
    }
    return () => {
      if (headerElement) {
        headerElement.style.display = "inline";
      }
    };
  }, [SystemConfig, SystemLanguages, localLang]);

  const sendAnalytics = (item) => {
    sendEvent("bookdth_thumbnail_clicked", {
      banner_title: item,
    });
  };

  return (
    <div className={` ${styles.book_dth} `}>
      {utUser ? (
        <></>
      ) : (
        <div className={` ${styles.go_back} `}>
          <a className={` ${styles.back_home} `} onClick={() => router.back()}>
            <h1>
              <img alt="back" src={`${ImageConfig?.bookd2h?.back}`} /> Book D2H
            </h1>
          </a>
        </div>
      )}
      {dthData.length > 0 && (
        <div className={` ${styles.img_container} `}>
          <div className={` ${styles.left_section} `}>
            <span className={` ${styles.btn_loader} `}></span>
            <Link
              href={dthData[0]?.target}
              target={dthData[0]?.targetType}
              onClick={() => {
                sendAnalytics("distv.in");
              }}
            >
              {dthData[0]?.image && <img src={dthData[0]?.image} alt="dth" />}
              {/* <img src={`${ImageConfig?.bookd2h?.reactangle}`} alt="dth" /> */}
            </Link>
          </div>
          <div className={` ${styles.right_section} `}>
            <span className={` ${styles.btn_loader} `}></span>
            <Link
              href={dthData[1]?.target}
              target={dthData[1]?.targetType}
              onClick={() => {
                sendAnalytics("d2h.com");
              }}
            >
              {dthData[1]?.image && <img src={dthData[1]?.image} alt="dth" />}
              {/* <img src={`${ImageConfig?.bookd2h?.reactangle}`} alt="dth" /> */}
            </Link>
          </div>
        </div>
      )}
      <div className={` ${styles.btm_section} `}>
        <h2>{text}</h2>
      </div>
    </div>
  );
}

export default BookD2h;
