import React, { useState } from "react";
import styles from "@/components/footers/new-footer/new-footer.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import Link from "next/link";
import { useStore } from "@/store/store";

const Newfooter = () => {
  const {
    state: { SystemConfig },
  } = useStore();
  const [showAll, setShowAll] = useState(false);
  const links = [
    {
      text: "Suspended Inspector Boro",
      href: "/movie/suspended-inspector-boro",
    },
    { text: "Ronuwa", href: "/movie/ronuwa" },
    { text: "Chiyahir Rong", href: "/movie/chiyahir-rang" },
    { text: "Khyonachar", href: "/movie/khyonachar" },
    { text: "Bornodi Bhotiai", href: "/movie/bornodi-bhotiai" },
    { text: "Kaaneen", href: "/movie/kaaneen" },
    { text: "Raktabeez", href: "/movie/raktabeez" },
    { text: "Local Kung Fu 2", href: "/movie/local-kung-fu-two" },
  ];
  const ToShow = showAll ? links.length : 3;
  return (
    <div className={`${styles.app_footer}`}>
      <div className={`${styles.footer}`}>
        <div className={` container ${styles.container}`}>
          <div className={`${styles.data}`}>
            <div className={`${styles.content}`}>
              <h5>
                Watch Assamese movies, original web series, and shows - only on
                ReelDrama
              </h5>
              <p>
                ReelDrama is the place to come to if you want to watch the most
                beloved Assamese Movies, shows, and Original Web Series. An
                indigenous entertainment hub for the Assamese - by the Assamese.
                You can download the app, and enjoy ReelDrama on your laptop,
                personal computer, TV, smartphone, or any other device.
                <br />
                Pick and choose from a wide range of content - from
                Award-winning Assamese films and original web series to comedy
                movies and shows, action movies, thriller movies, horror movies
                and cartoon shows with moral and cultural awareness - something
                to enjoy for all ages!
              </p>
            </div>
            <div className={`${styles.content}`}>
              <h5>Watch best Assamese movies online</h5>
              <p>
                Stream the best Assamese movies by genre - enjoy action movies,
                comedy movies, crime drama films, award-winning drama films,
                short films, theatre productions, and much more! View and enjoy
                the best Assamese movies, all in the native Assamese flavor!
              </p>
            </div>
            <div className={`${styles.content}`}>
              <h5>Watch original web series and shows</h5>
              <p>
                In addition to Assamese films, watch original web series,
                serialized shows, poetry recitals, folk music shows, and
                devotional music shows.
                <br />
                You can also watch cooking shows featuring traditional Assamese
                recipes and stand-up comedy specials by industry veterans and
                upcoming comics!
              </p>
            </div>
            <div className={`${styles.content}`}>
              <h5>Subscribe or rent at an affordable price </h5>
              <p>
                Choose a subscription package for a quarterly plan or an annual
                plan. If you cannot subscribe, you can watch movies on rent them
                for an affordable price. Entertainment is best felt when it’s in
                your mother tongue, and it’s even better if it’s just a click
                away!
              </p>
            </div>
          </div>
          <div className={`${styles.grid}`}>
            <div className={`${styles.items}`}>
              <h5 className={`${styles.main_text}`}>Our most popular movies</h5>
              <ul>
                {links?.slice(0, ToShow)?.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} prefetch={false}>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
              {links.length > 3 && (
                <div className={`${styles.show_btn}`}>
                  <button
                    type="button"
                    className={
                      showAll ? `${styles.show_less}` : `${styles.show_more}`
                    }
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "show less" : "show more"}
                  </button>
                </div>
              )}
            </div>
            <div className={`${styles.items}`}>
              <h5 className={`${styles.main_text}`}>Our original web series</h5>
              <ul>
                <li>
                  <Link href="/series/Fisaa" prefetch={false}>
                    Fisaa
                  </Link>
                </li>
                <li>
                  <Link href="/series/tomar-opekhyat" prefetch={false}>
                    Tomar Opekhyat
                  </Link>
                </li>
                <li>
                  <Link href="/series/mrityunjoy-1" prefetch={false}>
                    Mrityunjoy
                  </Link>
                </li>
              </ul>
            </div>
            <div className={`${styles.items}`}>
              <h5 className={`${styles.main_text}`}>Our shows</h5>
              <ul>
                <li>
                  <Link href="/series/paakghar" prefetch={false}>
                    Paakghar
                  </Link>
                </li>
                <li>
                  <Link href="/series/haahit-petor-bikh" prefetch={false}>
                    Haahit Petor Bikh
                  </Link>
                </li>
                <li>
                  <Link href="/series/sur-fiesta" prefetch={false}>
                    Sur Fiesta
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className={`${styles.footer_end}`}>
            <div className={`${styles.left}`}>
              <div className={`${styles.left_item} ${styles.logo_section}`}>
                <Link href="/" prefetch={false}>
                  <img
                    alt="logo"
                    src="https://d2ivesio5kogrp.cloudfront.net/static/reeldrama/images/reeldrama-logo.png"
                  />
                </Link>
                <span className={`${styles.copy_right}`}>
                  <span>&#169;</span> 2022. www.reeldrama.com <br />
                  All rights reserved.
                </span>
              </div>
              {SystemConfig?.menus?.length > 0 && (
                <div className={`${styles.left_item} ${styles.menu}`}>
                  <h5>Menu</h5>
                  <ul className={`${styles.main_links}`}>
                    {SystemConfig.menus.map((menu) => (
                      <li key={menu.targetPath}>
                        <Link
                          href={`/${menu.targetPath}`}
                          prefetch={false}
                          target={
                            menu?.params?.targetPath == "internalbrowser"
                              ? "_blank"
                              : "_self"
                          }
                        >
                          {menu.displayText}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className={`${styles.left_item} ${styles.company}`}>
                <h5>Company</h5>
                <ul className={`${styles.main_links}`}>
                  <li>
                    <Link href="/support/about-us" prefetch={false}>
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/help-center" prefetch={false}>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/faq" prefetch={false}>
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div className={`${styles.left_item} ${styles.legal}`}>
                <h5>Legal</h5>
                <ul className={`${styles.main_links}`}>
                  <li>
                    <Link href="/support/privacy-policy" prefetch={false}>
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/terms" prefetch={false}>
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/grievance" prefetch={false}>
                      GRIEVANCE REDRESSAL
                    </Link>
                  </li>
                  <li>
                    <Link href="/support/compliance" prefetch={false}>
                      Compliance ReportL
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${styles.right}`}>
              <h5>Follow Us</h5>
              <div className={`${styles.links}`}>
                <Link
                  target="_blank"
                  href="https://www.facebook.com/OfficialReelDrama"
                  prefetch={false}
                >
                  <img
                    src={`${ImageConfig?.socialIcons?.facebook}`}
                    alt="facebook"
                  />
                </Link>
                <Link
                  target="_blank"
                  href="https://www.instagram.com/reeldrama/?igshid=YmMyMTA2M2Y%3D"
                  prefetch={false}
                >
                  <img
                    src={`${ImageConfig?.socialIcons?.instagram}`}
                    alt="instagram"
                  />
                </Link>
                <Link
                  target="_blank"
                  href="https://twitter.com/Reeldrama2"
                  prefetch={false}
                >
                  <img
                    src={`${ImageConfig?.socialIcons?.twitter}`}
                    alt="twitter"
                  />
                </Link>
                <Link
                  target="_blank"
                  href="https://www.linkedin.com/company/reeldrama"
                  prefetch={false}
                >
                  <img
                    src={`${ImageConfig?.socialIcons?.linkedin}`}
                    alt="linkedin"
                  />
                </Link>
                <Link
                  target="_blank"
                  href="https://www.youtube.com/channel/UCHfnrwDl7hLR6JAMQCvAB1w"
                  prefetch={false}
                >
                  <img
                    src={`${ImageConfig?.socialIcons?.youtube}`}
                    alt="youtube"
                  />
                </Link>
              </div>
              <div className={`${styles.right_item} ${styles.logo_section}`}>
                <Link href="/" prefetch={false}>
                  <img
                    alt="logo"
                    src="https://d2ivesio5kogrp.cloudfront.net/static/reeldrama/images/reeldrama-logo.png"
                  />
                </Link>
                <span className={`${styles.copy_right}`}>
                  <span>&#169;</span> 2022. www.reeldrama.com <br />
                  All rights reserved.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newfooter;
