import React, { useEffect, useRef, useState } from "react";
import styles from "./cptabs.module.scss";
import useWindowScroll from "@/hooks/useWindowScroll";
import { useStore } from "@/store/store";
import useGetApiMutate from "@/hooks/useGetApidata";
import { useRouter } from "next/router";
import { ImageConfig } from "@/config/ImageConfig";

const Cptabs = ({ cpSubMenuData }) => {
  const {
    state: { PageData },
  } = useStore();
  const router = useRouter();
  const { mutate: getSubMenus, data: subMenuData } = useGetApiMutate();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrolledToppx } = useWindowScroll();
  const [subMenus, setSubMenus] = useState(cpSubMenuData);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSubMenu, setActiveSubMenu] = useState("");

  const cpTabsMobile = useRef();

  useEffect(() => {
    const appDownloadPopup = document.getElementById("appDownloadPopup");

    // setTimeout(() => {
    if (!!appDownloadPopup) {
      cpTabsMobile.current.style.top = "200px";
    } else {
      cpTabsMobile.current.style.top = "80px";
    }
    // }, 1000);
    const closeIcon = document.getElementById("closeIconAppDownloadPopup");
    if (!!closeIcon && typeof closeIcon.addEventListener == "function") {
      closeIcon.addEventListener("click", () => {
        cpTabsMobile.current.style.top = "80px";
        // console.log("123456");
      });
    }

    // console.log(closeIcon);
  }, []);

  useEffect(() => {
    if (scrolledToppx !== null) {
      setIsScrolled(scrolledToppx >= 10);
      // console.log("3456", scrolledToppx, `${200 - scrolledToppx}px`);
      const appDownloadPopup = document.getElementById("appDownloadPopup");
      if (!!appDownloadPopup) {
        const topHeight = `${200 - scrolledToppx}px`;
        if (scrolledToppx < 130) {
          cpTabsMobile.current.style.top = topHeight;
        } else if (scrolledToppx > 200) {
          cpTabsMobile.current.style.top = "40px";
          // cpTabsMobile.current.style.transition = "top 0.3s ease-in";
        }
      } else {
        if (scrolledToppx > 200) {
          cpTabsMobile.current.style.top = "40px";
        } else {
          cpTabsMobile.current.style.top = "80px";
        }
        cpTabsMobile.current.style.transition = "top 0.3s ease-in";
      }
      // cpTabsMobile.current.style.tr
    }
  }, [scrolledToppx]);
  // get page url on mount
  useEffect(() => {
    const pPath = router.asPath;
    const target1 = pPath.split("?")[1];
    const finalTarget = target1?.split("=")[1];
    // console.log(router.asPath?.split("?")[0],"<<<<<<<<<<pPath.split()");
    setActiveSubMenu(decodeURIComponent(finalTarget));
  }, [router.asPath]);

  const listRedirection = (content) => {
    router.push({
      pathname: router.asPath?.split("?")[0],
      query: { cpcontent: content },
    });
  };

  // Handle button click
  const handleButtonClick = (index, content) => {
    setActiveIndex(index);
    listRedirection(content);
  };

  // Render buttons
  const renderButtons = (className, activeClassName) => {
    return subMenus.map((item, index) => (
      <button
        key={index}
        type="button"
        className={`${className} ${item.targetPath?.toUpperCase() === activeSubMenu?.toUpperCase() ? activeClassName : ""}`}
        onClick={(e) => {
          const content = item?.targetPath;
          handleButtonClick(index, content);
        }}
      >
        {item?.params?.diamondIcon == "true" && (
          <img
            src={`${ImageConfig?.profile?.premiumDiamond}`}
            alt={item.text}
            className={styles.img}
          />
        )}
        <span>{item?.displayText}</span>
      </button>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.cptabs} ${isScrolled ? styles.movetop : ""}`}>
        {renderButtons(styles.cptab, styles.active)}
      </div>
      <div
        id="cptabsM_sub"
        className={`${styles.cptabsM} ${isScrolled ? styles.movetopM : ""}`}
        ref={cpTabsMobile}
      >
        {renderButtons(styles.cptabM, styles.activeM)}
      </div>
    </div>
  );
};

export default Cptabs;
