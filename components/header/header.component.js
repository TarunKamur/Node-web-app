import MHeader from "./mheader.component";
import DHeader from "./dheader.component";
import styles from "@/components/header/header.module.scss";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import MobileDownloadHeader from "../mobileDownloadApp/mbDwnldHeader.component";
import useWindowScroll from "@/hooks/useWindowScroll";
import { appConfig } from "@/config/app.config";

const Header = ({ pagePath }) => {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const {
    state: { PageData, Location },
  } = useStore();
  const { scrolledToppx } = useWindowScroll();
  const hasBanners = PageData?.banners?.length > 0;
  const hasLanguages = appConfig.header.topHeader === true;
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrolledToppx !== null) {
      if (scrolledToppx < 120 || prevScrollPos > scrolledToppx) {
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
      }
      setPrevScrollPos(scrolledToppx);
    }
  }, [scrolledToppx]);

  if (!mounted) return <></>;

  return (
    <div
      id="headerHomePage"
      className={`${styles.headerHome} ${
        hasBanners ? `${styles.page_has_banners}` : `${styles.no_banners}`
      } ${
        hasLanguages ? `${styles.page_has_languages}` : `${styles.no_languages}`
      }`}
    >
      <div className={`${styles.headerDesktop}`}>
        <DHeader pagePath={pagePath}></DHeader>
      </div>
      <div
        className={`${styles.headerMobile}  ${isScrolled ? `${styles.ad_hide}` : `${styles.ad_show}`}`}
      >
        {(Location?.ipInfo?.countryCode === "IN" ||
          Location?.ipInfo?.countryCode === "US") &&
          pagePath.path !== "bookDTH" && !pagePath.path.startsWith("support") && (
            <MobileDownloadHeader pagePath={pagePath}></MobileDownloadHeader>
          )}
        <MHeader pagePath={pagePath}></MHeader>
      </div>
    </div>
  );
};

export default Header;
