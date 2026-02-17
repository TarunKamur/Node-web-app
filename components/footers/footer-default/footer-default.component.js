import styles from "@/components/footers/footer-default/footer-default.module.scss";
import Link from "next/link";
import { FooterDefaultConstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";
import footerData from "@/config/footerData";

const FooterDefault = () => {
  const {
    state: { localLang },
  } = useStore();

  return (
    <div className={`${styles.app_footer}`} id="appFooter">
      <div className={styles.footer}>
        <div className={`container  ${styles.container}`}>
          <div className={styles.footer_inner}>
            <div className={styles.footer_left}>
              {footerData?.topLeft?.image && (
                <img
                  src={footerData?.topLeft?.image}
                  loading="lazy"
                  className={styles.left_info}
                  alt="footer-banner"
                />
              )}
              {(footerData?.topLeft?.title ||
                footerData?.topLeft?.description) && (
                <div className={styles.left_info}>
                  {/* Display only if top left heading and description present in jsonData */}
                  {footerData?.topLeft?.title && (
                    <h1 suppressHydrationWarning>
                      {
                        FooterDefaultConstant[localLang]?.[
                          footerData.topLeft.title
                        ]
                      }
                    </h1>
                  )}
                  {footerData?.topLeft?.description && (
                    <p
                      suppressHydrationWarning
                      dangerouslySetInnerHTML={{
                        __html:
                          FooterDefaultConstant[localLang]?.[
                            footerData.topLeft.description
                          ],
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <div className={styles.footer_right}>
              {/* Title and description start */}
              {(footerData?.topRight?.title ||
                footerData?.topRight?.description) && (
                <div className={styles.right_info}>
                  {/* Display only if top left heading and description present in jsonData */}
                  {footerData?.topRight?.title && (
                    <h1 suppressHydrationWarning>
                      {
                        FooterDefaultConstant[localLang]?.[
                          footerData.topRight.title
                        ]
                      }
                    </h1>
                  )}
                  {footerData?.topRight?.description && (
                    <p
                      suppressHydrationWarning
                      dangerouslySetInnerHTML={{
                        __html:
                          FooterDefaultConstant[localLang]?.[
                            footerData.topRight.description
                          ],
                      }}
                    />
                  )}
                </div>
              )}
              {/* Title and description end */}

              {/* Devices start */}
              {footerData?.devicesLinks?.length > 0 &&
                footerData.devicesLinks.map((section, index) => (
                  <div className={styles.sub_apps} key={index}>
                    <span className={styles.apps}>
                      {FooterDefaultConstant?.[localLang]?.[section.title]}
                    </span>
                    <ul>
                      {section.list?.map((device, index) => (
                        <li key={index}>
                          {device.targetPath ? (
                            <Link
                              target={device.targetType}
                              href={device.targetPath}
                              prefetch={false}
                              aria-label={device.altText}
                            >
                              <img src={device.image} alt={device.altText} />
                            </Link>
                          ) : (
                            <a aria-label={device.altText}>
                              <img src={device.image} alt={device.altText} style={{cursor:"pointer"}}/>
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              {/* Devices end */}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom_links}>
        <div className={`container ${styles.container}`}>
          <div className={styles.bottom_links_inner}>
            <div className={styles.bottom_left}>
              {/* Support urls start */}
              {footerData?.supportLinks?.length > 0 && (
                <ul>
                  {footerData?.supportLinks.map((supportItem, index) => (
                    <li key={index}>
                      {supportItem?.targetType !== "method" && (
                        <Link
                          href={supportItem.targetPath}
                          prefetch={false}
                          target={supportItem.targetType}
                        >
                          {
                            FooterDefaultConstant[localLang]?.[
                              supportItem?.title
                            ]
                          }
                        </Link>
                      )}
                      {supportItem?.targetType === "method" && (
                        <a onClick={() => {}}>
                          {
                            FooterDefaultConstant[localLang]?.[
                              supportItem?.title
                            ]
                          }
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {/* Support urls end */}
            </div>

            {/* Social links start */}
            {footerData?.socialLinks?.list?.length > 0 && (
              <div className={`${styles.bottom_right}`}>
                <span className={`${styles.connect}`}>
                  {`${FooterDefaultConstant?.[localLang]?.[footerData?.socialLinks?.title]} :`}
                </span>
                <ul>
                  {footerData.socialLinks.list?.map((socialItem, index) => (
                    <li key={index}>
                      <Link
                        href={socialItem.targetPath}
                        prefetch={false}
                        target={socialItem.targetType}
                        aria-label={socialItem.altText}
                      >
                        <img src={socialItem.image} alt={socialItem.altText} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Social links end */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterDefault;
