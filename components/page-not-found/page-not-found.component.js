import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "@/components/page-not-found/page-not-found.module.scss";
import { getItem } from "@/services/local-storage.service";
import { useStore, actions } from "@/store/store";
import { getPagePath, jsonToQueryParams } from "@/services/utility.service";
import { appConfig } from "@/config/app.config";
import { PageNotFoundconstant, signinconstant } from "@/.i18n/locale";
import useGetApiMutate from "@/hooks/useGetApidata";
import Link from "next/link";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import Sections from "../sections/sections.component";

const PageNotFound = ({ detailsInfo }) => {
  const {
    state: { SystemConfig, navigateFrom, localLang },
    dispatch,
  } = useStore();
  const [displayDefaultRail, setDisplayDefaultRail] = useState(false);
  const [defaultRailData, setDefaultRailData] = useState([]);
  const {
    mutate: mutateGetData,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const isUtUser = getItem("isUtuser");
  const isloggedin = getItem("isloggedin");
  const router = useRouter();
  const pagePath = getPagePath(router?.asPath);
  const goToHomePage = () => {
    router.push("/");
  };

  useEffect(() => {
    if (
      !!detailsInfo.code &&
      detailsInfo.code !== "-2022" &&
      detailsInfo.code !== "-16" &&
      appConfig?.pageNotFoundPage?.show404Data &&
      detailsInfo.code !== "ERR_NETWORK"
    ) {
      getPageData();
    }
  }, [detailsInfo]);

  const onBack = () => {
    if (isUtUser) {
      window.location.href = SystemConfig.configs.siteURL;
    } else {
      if (!!navigateFrom) {
        dispatch({ type: actions.navigateFrom, payload: null });
        router.push(navigateFrom);
      } else {
        router.push("/");
      }
    }
  };

  const getPageData = async () => {
    const params = {
      path: "404",
    };
    const url =
      process.env.initJson["api"] +
      "/service/api/v1/page/content?" +
      jsonToQueryParams(params);
    try {
      mutateGetData(url);
    } catch (e) {}
  };

  useEffect(() => {
    if (apiResponse?.data?.status) {
      setDefaultRailData(apiResponse?.data?.response?.data);
      const defaultSections = apiResponse?.data?.response?.data;
      const dd = defaultSections.filter(
        (item) =>
          !!item?.section?.sectionInfo?.params?.showIn404 &&
          !!(item?.section?.sectionInfo?.params?.showIn404 == "true")
      );
      apiResponse.data.response.data = dd;
      dispatch({ type: actions.PageData, payload: apiResponse?.data.response });
      setDisplayDefaultRail(true);
      sendEvent("404_event", {});
    }
  }, [apiResponse]);

  const containerClass = displayDefaultRail ? "displayRails" : "";

  const handleRetry = () => {
    if (window.navigator.onLine) {
      router.reload();
    }
  };

  return (
    <>
      {detailsInfo.code === "ERR_NETWORK" ? (
        <div className={`${styles.error_page}  ${containerClass}`}>
          <div className={`${styles.container_fluid}`}>
            <h3 className={`${styles.no_internt_h3}`}>
              No Internet Connection
            </h3>
            <h5 className={`${styles.no_internt_h5}`}>
              please check your internet
            </h5>
            <button
              className={`${styles.no_internt_retry}`}
              onClick={handleRetry}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {pagePath === "favorites" && (
            <span className={` ${styles.mobileBack}`} onClick={onBack}>
              <img
                alt="back"
                className={` ${styles.back}`}
                src={`${ImageConfig?.pageNotFound?.back}`}
              />
              {PageNotFoundconstant[localLang].Favourites}
            </span>
          )}
          {detailsInfo.code === "-2022" && (
            <div className={`${styles.error_page}  ${containerClass}`}>
              <div
                className={`${styles.container_fluid} ${styles.no_favourites}`}
              >
                <img
                  alt="watchlist"
                  src={`${ImageConfig?.pageNotFound?.noFavourites}`}
                />
                <h2>
                  {
                    PageNotFoundconstant[localLang]
                      .Looks_like_you_dont_have_any_Watchlist_yet
                  }
                </h2>
                <h3>
                  {
                    PageNotFoundconstant[localLang]
                      .Your_Watchlist_Content_will_be_listed_here
                  }
                </h3>
              </div>
            </div>
          )}

          {detailsInfo.code === "-16" && (
            <div className={`${styles.error_page}  ${containerClass}`}>
              <div className={`${styles.container_fluid}`}>
                <p>
                  {detailsInfo.message ? detailsInfo.message : "Outof Region"}
                </p>
              </div>
            </div>
          )}

          {detailsInfo.code === "-2040" && (
            <div className={`${styles.error_page}  ${containerClass}`}>
              <div className={`${styles.container_fluid}`}>
                <h2>{PageNotFoundconstant[localLang].Page_not_found}</h2>
                <div className={`${styles_error_image}`}>
                  <img
                    alt="watchlist"
                    src={`${ImageConfig?.pageNotFound?.errorImage}`}
                  />
                </div>
                <p>
                  {
                    PageNotFoundconstant[localLang]
                      .Content_not_available_in_your_Country
                  }
                </p>
              </div>
            </div>
          )}

          {detailsInfo.code === "-113" && (
            <div className={`${styles.error_page}  ${containerClass}`}>
              <div className={`${styles.container_fluid}`}>
                <p>{detailsInfo.message}.</p>
                <div className={`${styles.btn_wrap}`}>
                  <button
                    onClick={goToHomePage}
                    className={`${styles.btn} ${styles.btn_primary} ${styles.btn_lg}`}
                  >
                    {PageNotFoundconstant[localLang].Back_to_Home}
                  </button>
                </div>
              </div>
            </div>
          )}

          {detailsInfo.code === "-1" && (
            <div className={`${styles.error_page}  ${containerClass}`}>
              <div
                className={`${styles.container_fluid} ${styles.coming_soon}`}
              >
                <h3> {PageNotFoundconstant[localLang].CONTENT_NOT_FOUND}</h3>
                <div className={`${styles.error_img}`}>
                  <img
                    alt="content-not-found"
                    src={`${ImageConfig?.pageNotFound?.contentnotFound}`}
                  />
                </div>
                <h5>{PageNotFoundconstant[localLang].content_not_found_msg}</h5>
                <div className={`${styles.btn_wrap}`}>
                  <button
                    onClick={goToHomePage}
                    className={`${styles.btn} ${styles.btn_primary} ${styles.btn_lg}`}
                  >
                    {PageNotFoundconstant[localLang].Back_to_Home}
                  </button>
                </div>
              </div>
            </div>
          )}

          {detailsInfo.code !== "-16" &&
            detailsInfo.code !== "-1" &&
            detailsInfo.code !== "-113" &&
            detailsInfo.code !== "-2022" &&
            detailsInfo.code !== "-2023" &&
            detailsInfo.code !== "-2040" && (
              <div className={`${styles.error_page}  ${containerClass}`}>
                <div className={`${styles.container_fluid}`}>
                  <div className={`${styles.error_image}`}>
                    <img
                      alt="watchlist"
                      src={`${ImageConfig?.pageNotFound?.errorImage}`}
                    />
                  </div>
                  <h3 className={`${styles.errorMsg}`}>
                    {detailsInfo.message}
                  </h3>
                  <br />
                  <button
                    onClick={goToHomePage}
                    className={`${styles.btn} primary ${styles.btn_lg} ${styles.btn_primary} ${styles.is_load}`}
                  >
                    <span className={`${styles.main_title} primary`}>
                      {PageNotFoundconstant[localLang].Back_to_Home}
                    </span>
                  </button>
                </div>
              </div>
            )}

          {/* my purchase page fall back  */}
          {detailsInfo.code == "-2023" && (
            <div>
              <span className={` ${styles.mobileBack}`} onClick={onBack}>
                <img
                  alt="back"
                  className={` ${styles.back}`}
                  src={`${ImageConfig?.packages?.back}`}
                />
                {PageNotFoundconstant[localLang].My_Purchases}
              </span>
              <div className={`${styles.error_page} ${styles.purchasePage}`}>
                <div
                  className={`${styles.container_fluid} ${styles.no_favourites}`}
                >
                  {isloggedin ? (
                    <>
                      <h1 className={styles.noPurchases}>
                        {PageNotFoundconstant[localLang]?.OPPS_NO_PURCHASES_YET}
                      </h1>
                      <img
                        alt="no-purchases"
                        className={styles.noPurchseImage}
                        src={`${ImageConfig?.pageNotFound?.emptyCart}`}
                      />
                      <p className={styles.noPurchasesCap}>
                        {
                          PageNotFoundconstant[localLang]
                            ?.Looks_like_you_dont_have_any_Purchases_yet
                        }{" "}
                        {
                          PageNotFoundconstant[localLang]
                            ?.Your_Purchases_Content_will_be_listed_here
                        }
                      </p>
                      <button
                        className={`${styles.btn} ${styles.btn_primary} ${styles.btn_lg}`}
                        onClick={() => router.back()}
                      >
                        {PageNotFoundconstant[localLang]?.Back}
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className={styles.noPurchases}>
                        {PageNotFoundconstant[localLang]?.Sign_In_Required}
                      </h1>
                      <img
                        alt="no-purchases"
                        className={styles.noPurchseImage}
                        src={`${ImageConfig?.pageNotFound?.emptyCart}`}
                      />
                      <p className={styles.noPurchasesCap}>
                        {
                          PageNotFoundconstant[localLang]
                            ?.Please_Login_To_View_Your_Purchases
                        }
                      </p>
                      <div className={styles.preLoginBtnDiv}>
                        <button
                          className={`${styles.btn} ${styles.btn_primary} ${styles.btn_lg}`}
                          onClick={() => router.push("/signin")}
                        >
                          {signinconstant[localLang]?.Sign_In}
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btn_lg} ${styles.nobg}`}
                          onClick={() => router.back()}
                        >
                          {PageNotFoundconstant[localLang]?.Back}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {!!displayDefaultRail && (
            <>
              <div className={` ${styles.more_cont}`}>
                {/* <h2>No Worries! Discover from the following categories</h2> */}
                <div className={` ${styles.more_cont_inner}`}>
                  {defaultRailData.length > 0 &&
                    defaultRailData.map((data, i) => (
                      <>
                        {data?.section?.sectionInfo?.params?.showIn404 !=
                          "true" && (
                          <ul key={i}>
                            <li>
                              <Link
                                href={
                                  "section/" + data?.section?.sectionInfo?.code
                                }
                              >
                                {data?.section?.sectionInfo?.name}
                              </Link>
                            </li>
                          </ul>
                        )}
                      </>
                    ))}
                </div>
              </div>
              <Sections></Sections>
            </>
          )}
        </>
      )}
    </>
  );
};

export default PageNotFound;
