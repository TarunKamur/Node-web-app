import React, { useEffect, useState } from "react";
import styles from "@/components/footers/vesta-footer/vesta-footer.module.scss";
import Link from "next/link";
import { FooterOneconstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";
import { useRouter } from "next/router";
import { ImageConfig } from "@/config/ImageConfig";

const VestaFooter = (props) => {
  const [duplicatemenus, setDuplicateMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("");
  const router = useRouter();
  const {
    state: { SystemConfig, userDetails, localLang },
  } = useStore();
  useEffect(() => {
    if (!!SystemConfig) {
      getMenus(props);
    }
  }, [SystemConfig]);
  const getMenus = (props) => {
    let dMenus = SystemConfig.menus;
    if (dMenus.length > 0) {
      dMenus[0].targetPath = "/";
      if (!!dMenus[0].subMenus && dMenus[0].subMenus.length > 0) {
        dMenus[0].subMenus[0].targetPath = "/";
      }
      setDuplicateMenus(dMenus);
    }
    let selected = selectedMenus(props.path);
    setSelectedMenu(selected);
  };

  const selectedMenus = (url) => {
    let Urlsplit = url.split("?")[0].split("/");
    return Urlsplit;
  };
  return (
    <div className={`${styles.app_footer}`} id="appFooter">
      <div className={`${styles.footer}`}>
        <div className={`${styles.container}`}>
          <div className={`container ${styles.footer_inner}`}>
            <div className={`${styles.footer_top}`}>
              <div className={`${styles.footer_logo}`}>
                <img
                  src="https://d2ivesio5kogrp.cloudfront.net/static/vesta/images/logo.png"
                  alt="logo"
                />
              </div>
              <p>{FooterOneconstant[localLang].Description}</p>
            </div>
            <div className={`${styles.footer_middle}`}>
              <div className={`${styles.sub}`}>
                <div className={`${styles.object} ${styles.list}`}>
                  <span className={`${styles.text} `}>
                    {FooterOneconstant[localLang].Menu}
                  </span>
                  <ul>
                    {duplicatemenus.map((obj) => {
                      return (
                        <li key={obj.code}>
                          <Link
                            target={
                              obj.params.targetPath == "internalbrowser"
                                ? "_blank"
                                : "_self"
                            }
                            href={
                              obj.subMenus.length > 0
                                ? ""
                                : obj.code == "home"
                                  ? router.asPath == obj.targetPath
                                    ? ""
                                    : obj.targetPath
                                  : router.asPath === "/" + obj.targetPath
                                    ? ""
                                    : `/${obj.targetPath}`
                            }
                            prefetch={false}
                            className={`${
                              obj.targetPath == selectedMenu ||
                              (obj.targetPath == "/" && selectedMenu == "")
                                ? styles.active
                                : ""
                            }`}
                            onClick={(e) => {
                              if (
                                router.asPath === obj.targetPath ||
                                router.asPath === "/" + obj.targetPath ||
                                obj.subMenus.length > 0
                              ) {
                                e.preventDefault();
                              }
                            }}
                          >
                            {obj.displayText}
                          </Link>
                          <div className={`${styles.tag_class}`}>
                            {!!userDetails &&
                              !!obj.params.login_and_pack_marker &&
                              !!obj.params.login_and_no_pack_marker && (
                                <span
                                  className={`${styles.tag} ${!!userDetails.packages && userDetails.packages.length > 0 ? `${styles.bp}` : ""}`}
                                >
                                  {!!userDetails.packages &&
                                  userDetails.packages.length > 0
                                    ? obj.params.login_and_pack_marker
                                    : obj.params.login_and_no_pack_marker}
                                </span>
                              )}
                            {!userDetails && !!obj.params.non_login_marker && (
                              <span className={`${styles.tag}`}>
                                {obj.params.non_login_marker}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className={`${styles.object} ${styles.tv}`}>
                  <span className={`${styles.text}`}>
                    {FooterOneconstant[localLang].TV_app}
                  </span>
                  <ul>
                    <li>
                      <Link href="/" prefetch={false} aria-label="android tv">
                        <img src={`${ImageConfig?.footer?.androidTv}`} alt="" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/" prefetch={false} aria-label="apple tv">
                        <img src={`${ImageConfig?.footer?.appleTv}`} alt="" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/" prefetch={false} aria-label="fire tv">
                        <img src={`${ImageConfig?.footer?.fireTv}`} alt="" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/" prefetch={false} aria-label="samsung tv">
                        <img src={`${ImageConfig?.footer?.samsungTv}`} alt="" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/" prefetch={false} aria-label="roku tv">
                        <img src={`${ImageConfig?.footer?.rokuTv}`} alt="" />
                      </Link>
                    </li>
                    <li>
                      <Link href="/" prefetch={false} aria-label="lg tv">
                        <img src={`${ImageConfig?.footer?.lGTv}`} alt="" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={`${styles.sub}`}>
                <div className={`${styles.object}  ${styles.mobile}`}>
                  <span className={`${styles.text}`}>
                    {FooterOneconstant[localLang].Mobile_app}
                  </span>
                  <ul>
                    <li>
                      <Link href="/" prefetch={false} aria-label="ios device">
                        <img src={`${ImageConfig?.footer?.iosDevice}`} alt="" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/"
                        prefetch={false}
                        aria-label="android device"
                      >
                        <img
                          src={`${ImageConfig?.footer?.androidDevice}`}
                          alt=""
                        />
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className={`${styles.object}  ${styles.social}`}>
                  <span className={`${styles.text}`}>
                    {FooterOneconstant[localLang].Social}
                  </span>
                  <ul>
                    <li>
                      <Link
                        href="https://twitter.com/Vestastudios"
                        target="_blank"
                        aria-label="twitter"
                        prefetch={false}
                      >
                        <img
                          src={`${ImageConfig?.socialIcons?.twitter}`}
                          alt=""
                        />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="https://www.linkedin.com/company/vesta-stream-studios/"
                        target="_blank"
                        aria-label="linkedin"
                        prefetch={false}
                      >
                        <img
                          src={`${ImageConfig?.socialIcons?.linkedin}`}
                          alt=""
                        />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="https://www.facebook.com/VestaStream/"
                        target="_blank"
                        aria-label="facebook"
                        prefetch={false}
                      >
                        <img
                          src={`${ImageConfig?.socialIcons?.facebook}`}
                          alt=""
                        />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="https://www.instagram.com/vestastreamstudios/"
                        target="_blank"
                        aria-label="instagram"
                        prefetch={false}
                      >
                        <img
                          src={`${ImageConfig?.socialIcons?.instagram}`}
                          alt=""
                        />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={`${styles.footer_bottom}`}>
              <ul>
                <li>
                  <Link href="/support/privacy-policy" prefetch={false}>
                    {FooterOneconstant[localLang].Privacy_policy}
                  </Link>
                </li>
                <li>
                  <Link href="/support/terms" prefetch={false}>
                    {FooterOneconstant[localLang].Terms_Conditions}
                  </Link>
                </li>
                <li>
                  <Link href="/support/cookie-policy" prefetch={false}>
                    {FooterOneconstant[localLang].Cookies}
                  </Link>
                </li>
                <li>
                  <Link href="/support/about-us" prefetch={false}>
                    {FooterOneconstant[localLang].About_Us}
                  </Link>
                </li>
                <li>
                  <Link href="/support/cookie-policy" prefetch={false}>
                    {FooterOneconstant[localLang].FAQ}
                  </Link>
                </li>
                <li>
                  <Link href="/support/contact-us" prefetch={false}>
                    {FooterOneconstant[localLang].Contact_Us}
                  </Link>
                </li>
              </ul>
              <span className={`${styles.copy_right}`}>
                &copy;2024 Vesta Stream Studios
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VestaFooter;
