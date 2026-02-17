import React, { useRef } from "react";
import styles from "@/components/search/search.module.scss";
import { useEffect, useState } from "react";
import { setItem, getItem } from "@/services/local-storage.service";
import { actions, useStore } from "@/store/store";
import useDebounce from "@/hooks/useDebounce";
import { getPlansDetails, jsonToQueryParams } from "@/services/utility.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { useRouter } from "next/router";
import { getQueryParams } from "@/services/utility.service";
import Sections from "../sections/sections.component";
import SearchGridv1 from "../searchv1-grid/searchv1-grid.component";
import useWindowScroll from "@/hooks/useWindowScroll";
import CloseIcon from "@mui/icons-material/Close";
import "swiper/css";
import { SearchV1constant, Searchconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
const Search1 = () => {
  const router = useRouter();
  const { query } = router;

  const [paramSearch, setParamSearch] = useState(query.search || "");
  const [searchKey, setSearchKey] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchStaticMenus, setSearchStaticMenus] = useState([]);
  const [suggestionList, setSuggestionList] = useState([]);
  const [displaySuggestions, setDisplaySuggestions] = useState(true);
  const [resultsData, setResultsData] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [defaultSelectionTab, setDefaultSelectionTab] = useState("all");
  const [defaultCards, setDefaultCards] = useState(false);
  const [displayStaticMenus, setDisplayStaticMenus] = useState(false);
  const [displaySearchsuggest, setDisplaySearchsuggest] = useState(false);
  const {
    mutate: mutateGetSuggestions,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const {
    mutate: mutateGetResults,
    data: resultsApiResponse,
    resultsIsLoading,
    resultsIsError,
    resultsError,
    resultsRefetch,
  } = useGetApiMutate();
  const {
    mutate: mutateGetCPath,
    data: CpathApiResponse,
    CpathIsLoading,
    CpathIsError,
    CpathError,
    CpathRefetch,
  } = useGetApiMutate();
  const {
    mutate: mutateGetpaginationData,
    data: apiPaginationResponse,
    isPaginationLoading,
    isPaginationError,
    Paginationerror,
    Paginationrefetch,
  } = useGetApiMutate();
  const { scrolledBottompx, scrolledToppx } = useWindowScroll();
  const [displayDefaultSections, setDisplayDefaultSections] = useState(true);
  // const [paginationVal,setPaginationVal] = useState({ "page":0,"status":true})
  const paginationVal = useRef({ page: 0, status: true });
  const paginationRef = useRef({
    started: false,
  });

  useEffect(() => {
    let params = getQueryParams(router.asPath);
    if (!!params) {
      setSearchKey(params.search);
      getSearchResults(params.search);
    }
    let data = getItem("searchHistory");
    !!data && setSearchHistory(data);
  }, [router.asPath]);

  useEffect(() => {
    if (paramSearch != undefined && paramSearch != searchKey) {
      setSearchKey(paramSearch);
      getSearchDataApi(paramSearch);
    }
  }, [paramSearch]);

  const searchData = (event) => {
    event.preventDefault();
    setSearchKey(event.target.value);
    if (!!event.target.value) {
      getSearchSuggestions(event.target.value.trim());
    } else {
      setDisplayDefaultSections(true);
      setErrorMessage("");
    }
  };

  const getSearchSuggestions = useDebounce((key) => {
    if (key.length >= 3) {
      let payload = { query: key, last_search_order: "typesense" };
      let url =
        process.env.initJson["search"] +
        "/service/api/v1/search/suggestions?" +
        jsonToQueryParams(payload);
      mutateGetSuggestions(url);
    } else {
      setSuggestionList([]);
    }
  }, 500);

  useEffect(() => {
    if (!!apiResponse?.data) {
      if (!!apiResponse?.data?.status) {
        setDisplaySuggestions(true);
        setSuggestionList(apiResponse?.data?.response);
      } else {
        // setSuggestionList([]);
        setDisplaySuggestions(false);
      }
    } else {
    }
  }, [apiResponse]);

  const {
    state: { SystemConfig, localLang, SystemLanguages },
    dispatch,
  } = useStore();

  useEffect(() => {
    if (SystemConfig) {
      dispatch({ type: actions.PageData, payload: {} });
      getDefaultData();
    }
  }, [SystemConfig]);

  useEffect(() => {
    if (SystemLanguages?.[localLang]?.searchStaticMenus) {
      getStaticMenus(SystemLanguages[localLang].searchStaticMenus);
    } else if (SystemConfig?.configs?.searchStaticMenus) {
      getStaticMenus(SystemConfig.configs.searchStaticMenus);
    }
  }, [SystemLanguages, localLang, SystemConfig]);

  const getStaticMenus = (menuList) => {
    const staticMenu = JSON.parse(menuList);
    setSearchStaticMenus(staticMenu);
    setDefaultSelectionTab(staticMenu[0].code);
  };

  const clearHistory = () => {
    setItem("searchHistory", []);
    setSearchHistory([]);
  };

  const getSearchResults = (key) => {
    setDisplaySuggestions(false);
    setSearchKey(key);
    setSuggestionList([]);
    getSearchDataApi(key);
    router.replace({
      pathname: "/search",
      query: { search: key },
    });
  };

  const getSearchDataApi = (key, tabCode = defaultSelectionTab) => {
    setResultsData();
    // paginationVal.current["status"]
    let payload = { query: key, page: 0, pageSize: 36 };
    let url =
      process.env.initJson["search"] +
      "/service/api/v1/get/search/query?" +
      jsonToQueryParams(payload);
    mutateGetResults(url);
  };

  const prepareData = (data, errStat) => {
    const resultsData = {};
    if (searchStaticMenus?.length > 0) {
      searchStaticMenus.forEach((menuItem) => {
        const sourceType = menuItem.code;
        const matchingData = data?.response.find(
          (item) => item.sourceType === sourceType
        );
        if (matchingData) {
          resultsData[sourceType] = {
            data: matchingData.data,
            status: true,
          };
        } else if (errStat) {
          resultsData[sourceType] = {
            data: "No Results Found",
            status: false,
          };
        }
      });
      return resultsData;
    }
  };

  useEffect(() => {
    paginationRef.current.started = false;

    if (!!resultsApiResponse?.data) {
      sendEvent("search", { ...getPlansDetails(), search_query: searchKey });
      setDisplayStaticMenus(true);
      paginationVal.current = { page: 0, status: true };
      if (!!resultsApiResponse?.data?.status) {
        setErrorMessage("");
        prepareSearchHistory(searchKey);
        setSuggestionList([]);
        setDisplaySuggestions(false);
        let rData = prepareData(resultsApiResponse?.data, true);
        setDisplaySearchsuggest(false);
        setResultsData(rData);
        // setPaginationVal({"page":paginationVal.page + 1, "status":true})
        paginationVal.current = {
          page: paginationVal.current?.page + 1,
          status: true,
        };
      } else {
        setDisplayStaticMenus(false);
        setDisplaySearchsuggest(true);
        setResultsData();
        setDisplayDefaultSections(false);
        // setPaginationVal({"page":paginationVal.page + 1, "status":false})
        paginationVal.current = {
          page: paginationVal.current.page + 1,
          status: false,
        };
        setErrorMessage(resultsApiResponse?.data?.error?.message);
      }
    } else {
    }
  }, [resultsApiResponse]);

  const submitSuggestion = (key) => {
    setDefaultSelectionTab(searchStaticMenus[0]?.code);
    paginationVal.current = { page: 0, status: true };
    setSearchKey(key);
    getSearchResults(key);
  };

  const prepareSearchHistory = (searchKeyVal) => {
    const tempSearchHistory = [...searchHistory];
    if (searchHistory.includes(searchKeyVal)) {
      const keyIndex = tempSearchHistory.indexOf(searchKeyVal);
      tempSearchHistory.splice(keyIndex, 1);
    }
    if (tempSearchHistory.length > 4) {
      tempSearchHistory.pop();
    }
    tempSearchHistory.unshift(searchKeyVal);
    setSearchHistory(tempSearchHistory);
    setItem("searchHistory", tempSearchHistory);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setDisplaySuggestions(false);
    if (searchKey.trim().length >= 3) {
      setDefaultSelectionTab(searchStaticMenus[0]?.code);
      setTimeout(() => {
        getSearchResults(searchKey);
      }, 550);
    }
  };

  const handleTabsClick = (tabCode) => {
    setDefaultSelectionTab(tabCode.code);
  };

  const getDefaultData = () => {
    let payload = { path: "search" };
    let url =
      process.env.initJson["api"] +
      "/service/api/v1/page/content?" +
      jsonToQueryParams(payload);
    mutateGetCPath(url);
  };

  useEffect(() => {
    if (!!CpathApiResponse?.data) {
      if (!!CpathApiResponse?.data?.status) {
        dispatch({
          type: actions.PageData,
          payload: CpathApiResponse?.data?.response,
        });
        setDefaultCards(true);
      } else {
        if (
          CpathApiResponse?.data?.error &&
          CpathApiResponse?.data?.error?.code == 401
        ) {
          unAuthorisedHandler();
          // getNewSession();
        }
      }
    } else {
    }
  }, [CpathApiResponse]);

  const clearSearchKey = () => {
    setSearchKey("");
    setSuggestionList([]);
    setDisplayDefaultSections(true);
    setErrorMessage("");
    document.getElementById("search-rs").focus();
  };

  const pagination = () => {
    if (paginationVal.current?.status) {
      let params = {
        query: searchKey,
        page: paginationVal.current?.page,
        pageSize: 36,
      };
      let url =
        process.env.initJson["search"] +
        "/service/api/v1/get/search/query?" +
        jsonToQueryParams(params);
      try {
        mutateGetpaginationData(url);
      } catch (e) {}
    }
  };
  if (
    scrolledBottompx !== null &&
    scrolledBottompx < window.innerHeight &&
    scrolledToppx > 150 &&
    !!resultsData
  ) {
    if (
      paginationRef.current.started === false &&
      resultsData[defaultSelectionTab]?.status
    ) {
      paginationRef.current.started = true;
      pagination();
    }
  }

  useEffect(() => {}, [resultsData]);

  const mergeObjects = (obj1, obj2) => {
    let mergedObject = {};

    for (let key in obj1) {
      if (obj1[key].status == true) {
        if (obj2.hasOwnProperty(key)) {
          mergedObject[key] = { data: [...obj1[key].data, ...obj2[key].data] };
          mergedObject[key].status = true;
        } else {
          mergedObject[key] = obj1[key];
        }
      } else {
        mergedObject[key] = obj1[key];
      }
    }
    for (let key in obj2) {
      if (obj2[key].status == true) {
        if (!obj1.hasOwnProperty(key)) {
          mergedObject[key] = obj2[key];
        }
      }
    }
    return mergedObject;
  };

  useEffect(() => {
    window.scrollBy(0, -1);
    if (apiPaginationResponse?.data?.status) {
      paginationRef.current.started = false;
      let pData = prepareData(apiPaginationResponse?.data, false);
      paginationVal.current = {
        page: paginationVal.current?.page + 1,
        status: true,
      };
      setResultsData(mergeObjects(resultsData, pData));
    }
  }, [apiPaginationResponse]);

  return (
    <div className={`${styles.search_page}`}>
      <div className="container">
        <div className={`${styles.search_cont}`}>
          <form onSubmit={handleSubmit} autoComplete="off">
            <input
              type="text"
              id="search-rs"
              value={searchKey}
              spellCheck="false"
              onChange={searchData}
              autoFocus
              placeholder={Searchconstant[localLang].Search}
            />
            <img
              className={`${styles.search_img}`}
              alt="Search Icon"
              src={`${ImageConfig?.search?.searchIcon}`}
            />

            {searchKey.trim().length > 0 && (
              <>
                <CloseIcon
                  className={`${styles.clear_img}`}
                  onClick={clearSearchKey}
                ></CloseIcon>
              </>
            )}
          </form>
          <div className={` ${styles.suggestion_list}`}>
            <ul>
              {!!displaySuggestions &&
                suggestionList.map((data) => {
                  return (
                    <li key={data} onClick={() => submitSuggestion(data)}>
                      {data}
                    </li>
                  );
                })}
            </ul>
          </div>
          {searchStaticMenus && !!displayStaticMenus && (
            <div className={` ${styles.search_tabs}`}>
              <ul>
                {searchStaticMenus.map((tab) => {
                  return (
                    <li
                      onClick={() => handleTabsClick(tab)}
                      className={`${
                        tab.code == defaultSelectionTab ? styles.active : ""
                      }`}
                      key={tab.displayName}
                    >
                      {tab.displayName}
                    </li>
                  );
                })}
              </ul>

              {searchStaticMenus?.length > 0 && (
                <div className={`${styles.search_results_mobile}`}>
                  <select
                    onChange={(e) =>
                      handleTabsClick(
                        searchStaticMenus.find(
                          (tab) => tab.displayName === e.target.value
                        )
                      )
                    }
                  >
                    {searchStaticMenus.map((tab) => (
                      <option key={tab.displayName}>{tab.displayName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={`${styles.page_curosal}`}>
        {displayDefaultSections && defaultCards && !displayStaticMenus && (
          <Sections></Sections>
        )}
      </div>
      <div className={`${styles.search_results}`}>
        {resultsData &&
          resultsData[defaultSelectionTab]?.status &&
          resultsData[defaultSelectionTab]?.data && (
            <SearchGridv1
              gridData={resultsData[defaultSelectionTab].data}
              searchQuery={searchKey}
            />
          )}
        {!!resultsData && resultsData[defaultSelectionTab]?.status == false && (
          <div className={`${styles.error_message}`}>
            {resultsData[defaultSelectionTab].data}
          </div>
        )}
        {!resultsData && errorMessage && (
          <div className={`${styles.error_message}`}> {errorMessage}</div>
        )}
      </div>

      <div className="container">
        {!!searchHistory &&
          searchHistory.length > 0 &&
          !displayStaticMenus &&
          !displaySearchsuggest && (
            <div className={`${styles.search_cont}`}>
              <div className={`${styles.recent_search}`}>
                <div className={` ${styles.recent_header}`}>
                  <span className={` ${styles.main_label}`}>
                    {SearchV1constant[localLang].Recent_Searches}
                  </span>
                  <span
                    className={` ${styles.clear_history}`}
                    onClick={clearHistory}
                  >
                    {SearchV1constant[localLang].Clear_History}
                  </span>
                </div>
                <div className={`${styles.hist_list}`}>
                  <ul>
                    {searchHistory?.map((key, i) => {
                      return (
                        <li key={i}>
                          <span onClick={() => getSearchResults(key)}>
                            {key}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Search1;
