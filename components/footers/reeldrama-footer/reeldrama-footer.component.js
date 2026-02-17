import React from "react";
import styles from "@/components/footers/reeldrama-footer/reeldrama-footer.module.scss";
import Link from "next/link";
import { Footerconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import { useStore } from "@/store/store";
import Newfooter from "../new-footer/new-footer.component";

const ReeldramaFooter = () => {
  const {
    state: { localLang },
  } = useStore();
  return (
    <div className={`${styles.app_footer}`}>
      <div className={`${styles.footer}`}>
        <div className={` container ${styles.container}`}>
          <div className={`${styles.footer_inner}`}>
            <div className={`${styles.footer_left}`}>
              <img
                src="https://d2ivesio5kogrp.cloudfront.net/static/reeldrama/images/RD_Footer_image.png"
                alt="footer_Image"
              />
            </div>
            <div className={`${styles.footer_right}`}>
              <div className={`${styles.right_info}`}>
                <h1>
                  {Footerconstant[localLang].Watch_brand_name_anywhere_anytime}
                </h1>
                <p>
                  {
                    Footerconstant[localLang]
                      .Download_our_top_rated_app_made_just_for_you
                  }
                  <br />
                  {Footerconstant[localLang].Its_free_easy_and_smart}
                </p>
              </div>
              <div className={`${styles.sub_apps}`}>
                <span className={`${styles.apps}`}>
                  {Footerconstant[localLang].TV_app}
                </span>
                <ul>
                  <li>
                    <Link
                      target="_blank"
                      href="https://apps.apple.com/us/app/reeldrama/id1545887975"
                      prefetch={false}
                    >
                      <img
                        src={`${ImageConfig?.footer?.appleTv}`}
                        alt="apple"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      target="_blank"
                      href="https://play.google.com/store/apps/details?id=com.tvapp.reeldrama"
                      prefetch={false}
                    >
                      <img
                        src={`${ImageConfig?.footer?.androidTv}`}
                        alt="androidtv"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      target="_blank"
                      href="https://www.amazon.com/gp/product/B08S48C29R"
                      prefetch={false}
                    >
                      <img
                        src={`${ImageConfig?.footer?.fireTv}`}
                        alt="firetvstick"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      target="_blank"
                      href="https://channelstore.roku.com/en-gb/details/e36b0dcf5dbce00fc42c1ba677730cf4/reeldrama"
                      prefetch={false}
                    >
                      <img src={`${ImageConfig?.footer?.roku}`} alt="roku-tv" />
                    </Link>
                  </li>
                </ul>
              </div>
              <div className={`${styles.sub_apps}`}>
                <span className={`${styles.apps}`}>
                  {Footerconstant[localLang].Mobile_app}
                </span>
                <ul>
                  <li>
                    <Link
                      target="_blank"
                      href="https://apps.apple.com/us/app/reeldrama/id1545887975"
                      prefetch={false}
                    >
                      <img
                        src={`${ImageConfig?.footer?.iosDevice}`}
                        alt="iOSApp"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      target="_blank"
                      href="https://play.google.com/store/apps/details?id=com.ott.reeldrama"
                      prefetch={false}
                    >
                      <img
                        src={`${ImageConfig?.footer?.androidDevice}`}
                        alt="android-mobile"
                      />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Newfooter />
    </div>
  );
};

export default ReeldramaFooter;
