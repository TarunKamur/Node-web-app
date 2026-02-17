import React from "react";
import styles from "@/components/footers/watcho-footer/watcho-footer.module.scss";
import Link from "next/link";
import { useStore } from "@/store/store";
import { FooterOneconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { useEffect, useState, useRef } from "react";
import { ImageConfig } from "@/config/ImageConfig";
import useGetApiMutate from "@/hooks/useGetApidata";
import { sendEvent } from "@/services/analytics.service";
import { getPlansDetails } from "@/services/utility.service";

const WatchoFooter = () => {
  const {
    state: { Location, localLang },
  } = useStore();
  // const [localLang, setlocalLang] = useState(appConfig?.appDefaultLanguage);

  const { mutate: getFooterData, data: footerDataResponse } = useGetApiMutate();
  const [footerContent, setFooterContent] = useState(null);

  useEffect(() => {
    const url = `${appConfig.statisFilesPath}footerData.json`;
    try {
      getFooterData(url); // Disabled quick links section for now
    } catch (e) {
      console.log(e);
    }
  }, [getFooterData]);
  useEffect(() => {
    if (footerDataResponse?.data?.footerContent) {
      setFooterContent(footerDataResponse?.data?.footerContent);
    }
  }, [footerDataResponse]);
  const senDevent = () => {
    sendEvent("faq", getPlansDetails());
  };
  return (
    <>
      {/* {footerContent && (
        <div className={styles.footer_ends}>
          <div className={styles.grid}>
            {footerContent?.staticLink?.map((staticLink) => (
              <FooterStaticLinksSection
                staticLink={staticLink}
                footerBottom={footerContent?.footerBottom}
              />
            ))}
          </div>
        </div>
      )} */}
      <div className={`${styles.app_footer}`} id="app_footer_id">
        <div className={`${styles.footer}`}>
          <div className={`container ${styles.container}`}>
            <div className={`${styles.footer_inner}`}>
              <div className={`${styles.footer_info}`}>
                <div className={`${styles.left_info}`}>
                  {/* <h1>{FooterOneconstant[localLang].Watch_brand_name_anywhere_anytime}</h1> */}
                  <p>{FooterOneconstant[localLang].Description}</p>
                </div>
              </div>
              {(Location?.ipInfo?.countryCode === "IN" ||
                Location?.ipInfo?.countryCode === "US") && (
                <div className={`${styles.footer_info}`}>
                  <div className={`${styles.sub_apps} ${styles.tv_apps}`}>
                    <span className={`${styles.apps}`}>
                      {FooterOneconstant[localLang].TV_app}
                    </span>
                    <ul>
                      <li>
                        <Link
                          href="https://play.google.com/store/apps/details?id=com.watcho_multi"
                          target="_blank"
                        >
                          <img
                            src={`${ImageConfig?.footer?.androidTv}`}
                            alt="androidtv"
                          ></img>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="https://www.amazon.in/Watcho-Original-Spotlight-Exclusive-Shows/dp/B07XPG5FW5"
                          target="_blank"
                        >
                          <img
                            src={`${ImageConfig?.footer?.fireTv}`}
                            alt="firetvstick"
                          ></img>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="https://apps.apple.com/in/app/watcho-new-web-series-livetv/id1440733653?platform=appleTV"
                          target="_blank"
                        >
                          <img
                            src={`${ImageConfig?.footer?.appleTv}`}
                            alt="apple"
                          ></img>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="https://www.samsung.com/levant/tvs/smart-tv/smart-hub-and-apps/"
                          target="_blank"
                        >
                          <img
                            src={`${ImageConfig?.footer?.tizen}`}
                            alt="samsung"
                          ></img>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="https://in.lgappstv.com/main/tvapp/detail?appId=1227441"
                          target="_blank"
                        >
                          <img
                            src={`${ImageConfig?.footer?.webOS}`}
                            alt="lgtv"
                          ></img>
                        </Link>
                      </li>
                      {/* <li><Link href=""><img src={"https://d2ivesio5kogrp.cloudfront.net/static/aastha/images/multi-device-lg.png"} alt=""></img></Link></li> */}
                      {/* <li><Link href=""><img src={`${ImageConfig?.footer?.samsungTv}`} alt=""></img></Link></li> */}
                    </ul>
                  </div>
                  <div className={`${styles.sub_apps} ${styles.mobile_apps}`}>
                    <span className={`${styles.apps}`}>
                      {FooterOneconstant[localLang].Mobile_app}
                    </span>
                    <ul>
                      <li>
                        <Link
                          href="https://apps.apple.com/in/app/watcho-new-web-series-livetv/id1440733653?platform=iphone"
                          target="_blank"
                        >
                          <img
                            src={`${ImageConfig?.footer?.iosDevice}`}
                            alt="iosapp"
                          ></img>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="https://play.google.com/store/apps/details?id=com.watcho"
                          target="_blank"
                        >
                          <img
                            src={`${ImageConfig?.footer?.androidDevice}`}
                            alt="android-mobile"
                          ></img>
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className={`${styles.sub_apps} ${styles.stb_apps}`}>
                    <span className={`${styles.apps}`}>
                      {FooterOneconstant[localLang].STB_app}
                    </span>
                    <ul>
                      <li>
                        <Link
                          href="/"
                          target="_blank"
                          onClick={(e) => e.preventDefault()}
                        >
                          <img
                            src={`${ImageConfig?.footer?.dishtv}`}
                            alt="dishtv"
                          ></img>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/"
                          target="_blank"
                          onClick={(e) => e.preventDefault()}
                        >
                          <img
                            src={`${ImageConfig?.footer?.dth}`}
                            alt="dth"
                          ></img>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`${styles.bottom_links}`}>
          <div className={`container ${styles.container}`}>
            <div className={`${styles.bottom_links_inner}`}>
              <div className={`${styles.bottom_left}`}>
                <ul>
                  <li>
                    <Link href="/support/privacy-policy">
                      {FooterOneconstant[localLang].Privacy_policy}
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/terms">
                      {FooterOneconstant[localLang].Terms_Conditions}
                    </Link>
                  </li>
                  {/* {(Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") && (
                    <li>
                      <Link href="/support/content-guidelines">
                        {FooterOneconstant[localLang].content_guidelines}
                      </Link>
                    </li>
                  )} */}
                  {/* {Location?.ipInfo?.countryCode === "IN" && (
                  <li>
                    <Link href="/support/swag-terms">
                      {FooterOneconstant[localLang].Swag_terms}
                    </Link>
                  </li>
                )} */}
                  {(Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") && (
                    <li>
                      <Link href="/support/grievance">
                        {FooterOneconstant[localLang].Grievance}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/support/cookie-policy">
                      {FooterOneconstant[localLang].Cookies}
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/about-us">
                      {FooterOneconstant[localLang].About_Us}
                    </Link>
                  </li>
                  {(Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") && (
                    <li>
                      <Link
                        onClick={senDevent}
                        target="_blank"
                        href="https://faq.watcho.com/"
                      >
                        {FooterOneconstant[localLang].FAQ}
                      </Link>
                    </li>
                  )}
                  {(Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") && (
                    <li>
                      <Link
                        target="_blank"
                        href="https://ancillary.watcho.com/BecomeOurPartner"
                      >
                        {FooterOneconstant[localLang].Become_Our_Partner}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
              <div className={`${styles.bottom_right}`}>
                <span className={`${styles.connect}`}>
                  {FooterOneconstant[localLang].Connect_with_us + " :"}
                </span>
                <ul>
                  <li>
                    <Link
                      href="https://www.facebook.com/LetsWatcho/"
                      target="_blank"
                    >
                      <img
                        src={
                          "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/ott-facebook-follow.svg"
                        }
                        alt="facebook"
                      ></img>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.instagram.com/watchoapp/"
                      target="_blank"
                    >
                      <img
                        src={
                          "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/ott-instagram-follow.svg"
                        }
                        alt="instagram"
                      ></img>
                    </Link>
                  </li>
                  <li>
                    <Link href="https://x.com/watchoapp" target="_blank">
                      <img
                        src={
                          "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/twitter-x-icon.png"
                        }
                        alt="twitter"
                      ></img>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.youtube.com/channel/UCs_VbCkjjq5x5yGFgY6tAPg"
                      target="_blank"
                    >
                      <img
                        src={
                          "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/ott-youtube-follow.svg"
                        }
                        alt="youtube"
                      ></img>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WatchoFooter;

function FooterStaticLinksSection({ staticLink, footerBottom }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleShowMore = () => {
    setIsExpanded(!isExpanded);
  };

  const modifiedDataLinks = isExpanded
    ? staticLink?.datalink
    : staticLink?.datalink?.slice(0, 3);
  return (
    <div className={styles.item}>
      <h5>{staticLink.title}</h5>
      <ul>
        {modifiedDataLinks?.map((dataLink) => (
          <li key={dataLink?.target}>
            <Link href={dataLink?.target}>{dataLink?.title}</Link>
          </li>
        ))}
        {staticLink?.datalink?.length > 3 && (
          <span className={styles.show_more} onClick={toggleShowMore}>
            {isExpanded ? footerBottom?.showLess : footerBottom?.showMore}
          </span>
        )}
      </ul>
    </div>
  );
}
