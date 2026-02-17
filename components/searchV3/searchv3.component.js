/* eslint-disable jsx-a11y/no-onchange */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";
import styles from "@/components/search/search.module.scss";
import { setItem, getItem } from "@/services/local-storage.service";
import { actions, useStore } from "@/store/store";
import useDebounce from "@/hooks/useDebounce";
import {
  getPlansDetails,
  jsonToQueryParams,
  getQueryParams,
} from "@/services/utility.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { useRouter } from "next/router";
import useWindowScroll from "@/hooks/useWindowScroll";
import CloseIcon from "@mui/icons-material/Close";
import "swiper/css";
import { SearchV1constant, Searchconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import SearchGridv1 from "../searchv1-grid/searchv1-grid.component";
import Sections from "../sections/sections.component";
import PageLoader from "../loader/page-loder.component";

const SearchV3 = () => {
  const router = useRouter();
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
  const [isPaginationEnd, setIsPaginationEnd] = useState(false);
  const [pageLoading, isPageLoading] = useState(false);
  const [isDataExistInOtherSections, setIsDataExistInOtherSections] =
    useState(false);
  const { mutate: mutateGetSuggestions, data: apiResponse } = useGetApiMutate();
  const { mutate: mutateGetResults, data: resultsApiResponse } =
    useGetApiMutate();
  const { mutate: mutateGetCPath, data: CpathApiResponse } = useGetApiMutate();
  const { mutate: mutateGetpaginationData, data: apiPaginationResponse } =
    useGetApiMutate();
  const { scrolledBottompx } = useWindowScroll();
  const [displayDefaultSections, setDisplayDefaultSections] = useState(true);
  const paginationVal = useRef({ page: 0, status: true });
  const paginationRef = useRef({
    started: false,
  });

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

  useEffect(() => {
    makesearchRequest();
  }, [router.asPath]);

  useEffect(() => {
    if (
      scrolledBottompx !== null &&
      scrolledBottompx < 300 &&
      paginationVal.current.status &&
      !isPaginationEnd
    ) {
      paginationRef.current.started = true;
      if (searchKey != "" && !displaySuggestions) pagination();
    }
  }, [scrolledBottompx]);

  useEffect(() => {
    if (apiResponse?.data) {
      if (apiResponse?.data?.status) {
        setDisplaySuggestions(true);
        setSuggestionList(apiResponse?.data?.response);
      } else {
        setDisplaySuggestions(false);
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    paginationRef.current.started = false;

    if (resultsApiResponse?.data) {
      sendEvent("search", { ...getPlansDetails(), search_query: searchKey });
      setDisplayStaticMenus(true);
      paginationVal.current = { page: 0, status: true };
      if (resultsApiResponse?.data?.status) {
        setErrorMessage("");
        prepareSearchHistory(searchKey);
        setSuggestionList([]);
        setDisplaySuggestions(false);
        const rData = prepareData(resultsApiResponse?.data, true);
        setDisplaySearchsuggest(false);
        setResultsData(rData);
        setPaginationRef();
        setIsDataExistInOtherSections({ display: true, searchKey });
        isPageLoading(false);
      } else {
        if (isDataExistInOtherSections?.searchKey != searchKey) {
          setDisplayStaticMenus(false);
          setIsDataExistInOtherSections({});
        }
        setDisplaySearchsuggest(true);
        setResultsData();
        setDisplayDefaultSections(false);
        setIsPaginationEnd(true);
        setErrorMessage(resultsApiResponse?.data?.error?.message);
        isPageLoading(false);
      }
    }
  }, [resultsApiResponse]);

  useEffect(() => {
    if (CpathApiResponse?.data) {
      if (CpathApiResponse?.data?.status) {
        dispatch({
          type: actions.PageData,
          payload: CpathApiResponse?.data?.response,
        });
        setDefaultCards(true);
      } else if (
        CpathApiResponse?.data?.error &&
        CpathApiResponse?.data?.error?.code == 401
      ) {
        unAuthorisedHandler();
      }
    }
  }, [CpathApiResponse]);

  useEffect(() => {
    window.scrollBy(0, -1);
    if (apiPaginationResponse?.data?.status) {
      paginationRef.current.started = false;
      const pData = prepareData(apiPaginationResponse?.data, false);
      setPaginationRef();
      setIsPaginationEnd(
        apiPaginationResponse?.data?.response?.lastSearchOrder == "done"
      );
      setResultsData(mergeObjects(resultsData, pData));
      isPageLoading(false);
    }
  }, [apiPaginationResponse]);

  const makesearchRequest = () => {
    const params = getQueryParams(router.asPath);
    if (params) {
      setSearchKey(decodeURIComponent(params.q));
      getSearchDataApi(decodeURIComponent(params.q));
    }
    const data = getItem("searchHistory");
    if (data) setSearchHistory(data);
  };

  const searchData = (event) => {
    event.preventDefault();
    setSearchKey(event.target.value);
    if (event.target.value) {
      getSearchSuggestions(event.target.value.trim());
    } else {
      setDisplayDefaultSections(true);
      setErrorMessage("");
    }
  };

  const getSearchSuggestions = useDebounce((key) => {
    if (key.length >= 3) {
      const payload = { query: key, last_search_order: "typesense" };
      const url = `${
        process.env.initJson.search
      }/search/api/v1/search/suggestions?${jsonToQueryParams(payload)}`;
      mutateGetSuggestions(url);
      setIsPaginationEnd(false);
    } else {
      setSuggestionList([]);
    }
  }, 500);

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
    if (router.query.q !== key) {
      setDisplaySuggestions(false);
      setSearchKey(key);
      isPageLoading(true);
      setSuggestionList([]);
      router.replace({
        pathname: "/search",
        query: { q: key },
      });
    } else {
      // if you want make if query param q and input box text is also same then uncomment below lines of code
      // setDisplaySuggestions(false);
      // setSearchKey(key);
      // isPageLoading(true);
      // setSuggestionList([]);
      //makesearchRequest
    }
  };

  const getSearchDataApi = (key, tabCode) => {
    setResultsData();
    const payload = {
      query: key,
      pageSize: 36,
      last_search_order: "typesense",
      bucket: tabCode || defaultSelectionTab,
    };
    const url = `${
      process.env.initJson.search
    }/search/api/v3/get/search/query?${jsonToQueryParams(payload)}`;
    mutateGetResults(url);
  };

  const prepareData = (data, errStat) => {
    const resultData = {};
    if (searchStaticMenus?.length > 0) {
      searchStaticMenus.forEach((menuItem) => {
        const sourceType = menuItem.code;
        const matchingData =
          data?.response && data?.response.searchResults?.data;
        if (matchingData) {
          resultData[sourceType] = {
            data: matchingData,
            status: true,
          };
        } else if (errStat) {
          resultData[sourceType] = {
            data: "No Results Found",
            status: false,
          };
        }
      });
    }
    return resultData;
  };

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
    isPageLoading(true);
    if (searchKey != "") getSearchDataApi(searchKey, tabCode.code);
  };

  const getDefaultData = () => {
    const payload = { path: "search" };
    const url = `${
      process.env.initJson.api
    }/service/api/v1/page/content?${jsonToQueryParams(payload)}`;
    mutateGetCPath(url);
  };

  const clearSearchKey = () => {
    setSearchKey("");
    setSuggestionList([]);
    setDisplayDefaultSections(true);
    setErrorMessage("");
    document.getElementById("search-rs").focus();
  };

  const pagination = () => {
    if (paginationVal.current?.status) {
      const params = {
        query: searchKey,
        last_doc: paginationVal.current?.page,
        pageSize: 36,
        last_search_order: "typesense",
        bucket: defaultSelectionTab,
      };
      const url = `${
        process.env.initJson.search
      }/search/api/v3/get/search/query?${jsonToQueryParams(params)}`;
      try {
        mutateGetpaginationData(url);
        isPageLoading(true);

        paginationVal.current.status = false;
      } catch (e) {
        /* empty */
      }
    }
  };

  const mergeObjects = (obj1, obj2) => {
    const mergedObject = { ...obj1 };

    Object.keys(obj2).forEach((key) => {
      const value = obj2[key];
      if (value.status === true) {
        if (mergedObject[key]?.status === true) {
          mergedObject[key] = {
            data: [...mergedObject[key].data, ...value.data],
            status: true,
          };
        } else {
          mergedObject[key] = value;
        }
      }
    });

    return mergedObject;
  };

  const setPaginationRef = () => {
    setTimeout(() => {
      paginationVal.current = {
        page: paginationVal.current.page + 1,
        status: true,
      };
    }, 200);
  };
  return (
    <div className={`${styles.search_page}`}>
      {pageLoading && <PageLoader isBackgroundBlur />}
      <div className="container">
        <div className={`${styles.search_cont}`}>
          <form onSubmit={handleSubmit} autoComplete="off">
            <input
              type="text"
              id="search-rs"
              value={searchKey}
              spellCheck="false"
              onChange={searchData}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder={Searchconstant[localLang].Search}
            />
            <img
              className={`${styles.search_img}`}
              alt="Search Icon"
              src={`${ImageConfig?.search?.searchIcon}`}
            />

            {searchKey.trim().length > 0 && (
              <CloseIcon
                className={`${styles.clear_img}`}
                onClick={clearSearchKey}
              />
            )}
          </form>
          {!!displaySuggestions && suggestionList.length > 0 && (
            <div className={` ${styles.suggestion_list}`}>
              <ul>
                {suggestionList.map((data) => {
                  return (
                    <li key={data} onClick={() => submitSuggestion(data)}>
                      {data}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
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
          <Sections />
        )}
      </div>
      <div className={`${styles.search_results}`}>
        {resultsData &&
          resultsData[defaultSelectionTab]?.status &&
          resultsData[defaultSelectionTab]?.data && (
            <SearchGridv1
              gridData={resultsData[defaultSelectionTab].data}
              searchQuery={"searchPage"}
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
                        <li key={`${key + i}`}>
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

export default SearchV3;
