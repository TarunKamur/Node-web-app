/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import styles from "@/components/dishFooter/dishFooter.module.scss";
import Link from "next/link";
import { FooterOneconstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";
import { ImageConfig } from "@/config/ImageConfig";
import { appConfig } from "@/config/app.config";
import useGetApiMutate from "@/hooks/useGetApidata";

const DishFooter = () => {
  const {
    state: { localLang, Location },
  } = useStore();
  const { mutate: getFooterData, data: footerDataResponse } = useGetApiMutate();
  const [footerContent, setFooterContent] = useState(null);

  // Fetch footer data on mount
  useEffect(() => {
    const url = `${appConfig.statisFilesPath}footerData.json`;
    try {
      // getFooterData(url); // Disabled quick links section for now
    } catch (e) {
      console.log(e);
    }
  }, [getFooterData]);

  // Handle footer response
  useEffect(() => {
    if (footerDataResponse?.data?.footerContent) {
      setFooterContent(footerDataResponse?.data?.footerContent);
    }
  }, [footerDataResponse]);

  return (
    <>
      {footerContent && (
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
      )}

      <div className={styles.app_footer}>
        <div className={`${styles.footer}`}>
          <div className={` container ${styles.container}`}>
            <div className={`${styles.footer_inner}`}>
              <div className={`${styles.footer_left}`}>
                <div className={`${styles.left_info}`}>
                  {FooterOneconstant[localLang]
                    ?.Watch_brand_name_anywhere_anytime && (
                    <h1 suppressHydrationWarning>
                      {
                        FooterOneconstant[localLang]
                          ?.Watch_brand_name_anywhere_anytime
                      }
                    </h1>
                  )}

                  <p suppressHydrationWarning>
                    {FooterOneconstant[localLang]?.Description}
                  </p>
                </div>
              </div>

              {(Location?.ipInfo?.countryCode === "IN" ||
                Location?.ipInfo?.countryCode === "US") && (
                <div className={`${styles.footer_right}`}>
                  <div className={`${styles.sub_apps}`}>
                    <span className={`${styles.apps}`} suppressHydrationWarning>
                      {FooterOneconstant[localLang]?.TV_app}
                    </span>
                    <ul>
                      <li>
                        <Link
                          href={appConfig?.footer?.androidTVLink}
                          aria-label="android tv"
                        >
                          <img
                            src={ImageConfig?.footer?.androidTv}
                            alt="androidtv"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={appConfig?.footer?.fireTVLink}
                          aria-label="fire tv"
                        >
                          <img
                            src={`${ImageConfig?.footer?.fireTv}`}
                            alt="firetvstick"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={appConfig?.footer?.appleTVLink}
                          aria-label="apple tv"
                        >
                          <img
                            src={`${ImageConfig?.footer?.appleTv}`}
                            alt="apple"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={appConfig?.footer?.samsungAppLink}
                          aria-label="samsung tv"
                        >
                          <img
                            src={`${ImageConfig?.footer?.tizen}`}
                            alt="samsung"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={appConfig?.footer?.samsungAppLink}
                          aria-label="samsung tv"
                        >
                          <img
                            src={`${ImageConfig?.footer?.webOS}`}
                            alt="lgtv"
                          />
                        </Link>
                      </li>
                      {/* <li><Link href=""><img src={`${ImageConfig?.footer?.lGTv}`} alt=""></img></Link></li> */}
                    </ul>
                  </div>
                  <div className={`${styles.sub_apps}`}>
                    <span className={`${styles.apps}`}>
                      {FooterOneconstant[localLang]?.Mobile_app}
                    </span>
                    <ul>
                      <li>
                        <Link
                          href={appConfig?.footer?.iOSAppLink}
                          aria-label="ios mobile"
                        >
                          <img
                            src={`${ImageConfig?.footer?.iosDevice}`}
                            alt="iosapp"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={appConfig?.footer?.androidAppLink}
                          aria-label="android mobile"
                        >
                          <img
                            src={`${ImageConfig?.footer?.androidDevice}`}
                            alt="android-mobile"
                          />
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className={`${styles.sub_apps}`}>
                    <span className={`${styles.apps}`}>
                      {FooterOneconstant[localLang]?.STB_app}
                    </span>
                    <ul>
                      <li>
                        <a aria-label="dish tv">
                          <img src={ImageConfig?.footer?.dishtv} alt="dishtv" />
                        </a>
                      </li>
                      <li>
                        <a aria-label="dth">
                          <img src={ImageConfig?.footer?.dth} alt="dth" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.bottom_links}`}>
          <div className={` container ${styles.container}`}>
            <div className={`${styles.bottom_links_inner}`}>
              <div className={`${styles.bottom_left}`}>
                <ul>
                  <li>
                    <Link href="/support/privacy-policy">
                      {FooterOneconstant[localLang]?.Privacy_policy}
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/terms">
                      {FooterOneconstant[localLang]?.Terms_Conditions}
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/cookie-policy">
                      {FooterOneconstant[localLang]?.Cookies}
                    </Link>
                  </li>
                  {(Location?.ipInfo?.countryCode === "IN" ||
                    Location?.ipInfo?.countryCode === "US") && (
                    <li>
                      <Link href="/support/contact-us">
                        {FooterOneconstant[localLang]?.Contact_Us}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/support/faq">
                      {FooterOneconstant[localLang]?.FAQ}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className={`${styles.bottom_right}`}>
                <span className={`${styles.connect}`}>
                  {`${FooterOneconstant[localLang]?.Connect_with_us} :`}
                </span>
                <ul>
                  <li>
                    <Link
                      href={appConfig?.footer?.fb_link}
                      aria-label="facebook"
                    >
                      <img
                        src={ImageConfig?.socialIcons?.facebook}
                        alt="facebook"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={appConfig?.footer?.instagram_link}
                      aria-label="instagram"
                    >
                      <img
                        src={ImageConfig?.socialIcons?.instagram}
                        alt="instagram"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={appConfig?.footer?.twitter_link}
                      aria-label="twitter"
                    >
                      <img
                        src={ImageConfig?.socialIcons?.twitter}
                        alt="twitter"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={appConfig?.footer?.youtube_link}
                      aria-label="youtube"
                    >
                      <img
                        src={ImageConfig?.socialIcons?.youtube}
                        alt="youtube"
                      />
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

export default DishFooter;

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
