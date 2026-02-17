import { useEffect, useState } from "react";
import styles from "@/components/support/support.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import { getPagePath, getPlansDetails } from "@/services/utility.service";
import { Supportconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { getItem } from "@/services/local-storage.service";
import { useStore } from "@/store/store";
import { ImageConfig } from "@/config/ImageConfig";
import Logo from "../logo/logo.component";
import PageNotFound from "../page-not-found/page-not-found.component";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { sendEvent } from "@/services/analytics.service";

const isUtUser = getItem("isUtuser");
const SupportPages = () => {
  const {
    state: { localLang, Location ,SystemConfig},
  } = useStore();
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = useState(0);
  const [allowRoute, setAllowRoute] = useState();
  // eslint-disable-next-line no-unused-vars
  const [path, setPath] = useState();
  const router = useRouter();
  const pPath = getPagePath(router.asPath);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line no-nested-ternary
  const supportPageHeading = pPath.includes("/")
    ? pPath.split("/")[1].includes("-")
      ? pPath.split("/")[1].replace("-", " ")
      : pPath.split("/")[1]
    : pPath === "support"
      ? "about us"
      : pPath;
  const [supportPageTitle, setsupportPageTitle] = useState(supportPageHeading);
  const [error, setError] = useState({
    message: "Content you are looking for is not found",
    code: "5000",
  });

  const [staticPages, setStaticPages] = useState(
    Location?.ipInfo?.countryCode === "IN" ||
      Location?.ipInfo?.countryCode === "US"
      ? appConfig?.supportConfig?.supportPages
      : appConfig?.supportConfig?.supportPagesDubai
  );
  // const staticPages =
  //   Location?.ipInfo?.countryCode === "IN"
  //     ? appConfig?.supportConfig?.supportPages
  //     : appConfig?.supportConfig?.supportPagesDubai;

  const tabSxProps = {
    "& button": { alignItems: "flex-start", color: "#858585" },
  };

  const tabIndicatorSxProps = {
    left: "0",
    backgroundColor: "$primary.color",
  };

  const handleClick = (e) => {
    if (!!e?.url && e?.target === "_self") {
      setPath(e.url);
      const urlPath = !path
        ? router.asPath.split("/")[router.asPath.split("/").length - 1]
        : path;
      if (urlPath === "support") {
        router.push(`/support/${e.url}`);
      } else {
        router.push(e.url);
      }
      setPath(e.url);
    } else if (e?.target === "_blank") {
      if (e?.displayName === "faqs") {
        sendEvent("faq", getPlansDetails());
      }
      let index = staticPages?.findIndex((tab) => tab?.url === e.url);
      setValue(index);
      window.open(e?.url);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const isRouteAvaliable = () => {
    let pathAvailable = false;
    // if (!mounted) return false;
    // eslint-disable-next-line no-nested-ternary
    const route = pPath.includes("/")
      ? pPath.split("/")[1]
      : pPath === "support"
        ? "about-us"
        : pPath;
    for (let i = 0; i < staticPages?.length; i += 1) {
      if (staticPages[i].url === route) {
        pathAvailable = true;
        setsupportPageTitle(
          Supportconstant?.[localLang]?.[staticPages[i].displayName]
        );
        break;
      }
    }
    setAllowRoute(pathAvailable);
    return pathAvailable;
  };
  useEffect(() => {
    setStaticPages(
      Location?.ipInfo?.countryCode === "IN" ||
        Location?.ipInfo?.countryCode === "US"
        ? appConfig?.supportConfig?.supportPages
        : appConfig?.supportConfig?.supportPagesDubai
    );
  }, [Location]);

  useEffect(() => {
    if (staticPages != undefined) {
      setMounted(true);
      isRouteAvaliable();
    }
  }, [router.asPath, staticPages]);
 
    useEffect(() => {
      const appPopup = document.getElementById("appDownloadPopup");
      if (appPopup) {
        appPopup.style.display = "none";
      }
      return () => {
        if (appPopup) {
          appPopup.style.display = ""; 
        }
      };
    }, []);

  // for support pages
  useEffect(() => {
    if (router.isReady) {
      if (router.asPath.includes("support")) {
        let urlPath = !path
          ? router.asPath.split("/")[router.asPath.split("/").length - 1]
          : path;
        let index = staticPages?.findIndex((tab) => tab?.url === urlPath);
        let tabName = staticPages?.find((tab) => tab?.url === urlPath);
        if (!tabName && staticPages?.length > 0) {
          tabName = {
            url: urlPath?.includes("support") && staticPages[value]?.url,
          };
          urlPath = staticPages[value].url;
          index = 0;
        }
        setValue(index);
        if (!!tabName?.url && tabName.url === urlPath) {
          setTimeout(() => {
            const staticPageElement = document.getElementById("staticPage");
            if (staticPageElement) {
              staticPageElement.innerHTML = `<iframe id="support" src="/${urlPath}.html?lang=${localLang}?countryCode=${Location?.ipInfo?.countryCode}" width="100%" height="100%"/>`;
              // fetch(`/${urlPath}.html`).then((rse) => {
              //     rse.text().then(htmlData => {
              //         document.getElementById(staticPageRenderId).innerHTML = (htmlData);
              //     })
              // })
            }
          }, 100);
        }
      }
    }
  }, [path, router.isReady, localLang, staticPages]);
  
  function onBack() {
    const fromOtherPage = document.referrer && document.referrer !== window.location.href;
    const hasHistory = window.history.length > 1;
    if (fromOtherPage || hasHistory) {
      router.back();
      setTimeout(() => {
        if (window.location.href.includes("support")) {
          window.location.href = SystemConfig.configs.siteURL;
        }
      }, 500);
    } else {
      window.location.href = SystemConfig.configs.siteURL;
    }
  }
  
  if (!mounted) return null;
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {allowRoute === true || allowRoute === undefined ? (
        <>
          <div className={`${styles.supportMain}`}>
            <div className={`sideBar ${styles.sideBar}`}>
              <div className={`${styles.sideBarLeft}`}>
                <Link href="/" className={`${styles.back_home}`}>
                  <img
                    src={`${ImageConfig?.support?.helpBackArrow}`}
                    alt="back"
                  />
                  {Supportconstant[localLang].Back}
                </Link>
                <h1>{Supportconstant[localLang].Help_Center}</h1>
              </div>
              {/* <div className={`${styles.sideBar_menus}`}> */}
              <Tabs
                orientation="vertical"
                onChange={(e) => {
                  handleChange(e);
                }}
                sx={tabSxProps}
                TabIndicatorProps={{
                  sx: tabIndicatorSxProps,
                }}
                variant="scrollable"
                value={value}
              >
                {staticPages?.length > 0 &&
                  staticPages.map((tab, index) => {
                    if (
                      tab?.url === "contact-us" &&
                      Location?.ipInfo?.countryCode !== "IN" &&
                      Location?.ipInfo?.countryCode !== "US"
                    ) {
                      return null;
                    }

                    return (
                      <Tab
                        key={tab?.url}
                        label={
                          index === value ? (
                            <h1
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: "normal",
                              }}
                            >
                              {Supportconstant?.[localLang]?.[tab.displayName]}
                            </h1>
                          ) : (
                            <>
                              <h2
                                style={{
                                  fontSize: "0.875rem",
                                  fontWeight: "normal",
                                }}
                              >
                                {
                                  Supportconstant?.[localLang]?.[
                                    tab.displayName
                                  ]
                                }
                              </h2>
                            </>
                          )
                        }
                        className="tabs_btn support"
                        onClick={() => handleClick(tab)}
                      />
                    );
                  })}
              </Tabs>
              {/* </div> */}
            </div>

            <div className={`${styles.content}`}>
              {!isUtUser && (
                <div className={`${styles.topNav}`}>
                  <h1>
                    {/* <Link > */}
                    <img
                      onClick={onBack}
                      src={`${ImageConfig?.support?.helpBackArrow}`}
                      alt="back-button"      
                    />
                    {/* </Link> */}
                    {supportPageTitle}
                  </h1>
                </div>
              )}
              <div
                id="staticPage"
                className={`${styles.staticPage} ${isUtUser ? `hideTopNav` : ""}`}
              />
            </div>
          </div>
        </>
      ) : (
        allowRoute === false && <PageNotFound detailsInfo={error} />
      )}
    </>
  );
};

export default SupportPages;
