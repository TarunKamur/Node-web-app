import React, { useRef } from "react";
import styles from "@/components/search/search.module.scss";
import { useEffect, useState } from "react";
import { setItem, getItem } from "@/services/local-storage.service";
import { actions, useStore } from "@/store/store";
import useDebounce from "@/hooks/useDebounce";
import { jsonToQueryParams } from "@/services/utility.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { useRouter } from "next/router";
import { getQueryParams } from "@/services/utility.service";
import Sections from "../sections/sections.component";
import SearchGrid from "../search-grid/search-grid.component";
import useWindowScroll from "@/hooks/useWindowScroll";
import CloseIcon from "@mui/icons-material/Close";
import { Searchconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { ImageConfig } from "@/config/ImageConfig";
const Search = () => {
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
  const [paginationVal, setPaginationVal] = useState({});
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
  }, []);

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
    }
  };

  const getSearchSuggestions = useDebounce((key) => {
    if (key.length >= 3) {
      let payload = { query: key };
      let url =
        process.env.initJson["search"] +
        "/search/api/v1/search/suggestions?" +
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
    state: { SystemConfig, localLang },
    dispatch,
  } = useStore();

  useEffect(() => {
    if (SystemConfig) {
      getDefaultData();
      getStaticMenus(SystemConfig);
    }
  }, [SystemConfig]);

  const getStaticMenus = (SystemConfig) => {
    if (SystemConfig?.configs?.searchStaticMenus) {
      const staticMenu = JSON.parse(SystemConfig?.configs?.searchStaticMenus);
      setSearchStaticMenus(staticMenu);
    }
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
    setPaginationVal({});
    let payload = { query: key, page: 0, pageSize: 36, bucket: tabCode };
    let url =
      process.env.initJson["search"] +
      "/search/api/v3/get/search/query?" +
      jsonToQueryParams(payload);
    mutateGetResults(url);
  };

  useEffect(() => {
    paginationRef.current.started = false;
    if (!!resultsApiResponse?.data) {
      setDisplayStaticMenus(true);

      if (!!resultsApiResponse?.data?.status) {
        setErrorMessage("");
        prepareSearchHistory(searchKey);
        setSuggestionList([]);
        setDisplaySuggestions(false);
        setResultsData(resultsApiResponse?.data);

        let pgData = {
          lastSearchOrder: resultsApiResponse?.data?.response?.lastSearchOrder,
          lastDoc: resultsApiResponse?.data?.response?.lastDoc,
        };
        setPaginationVal(pgData);
      } else {
        setResultsData();
        setErrorMessage(resultsApiResponse?.data?.error?.message);
      }
    } else {
    }
  }, [resultsApiResponse]);

  const submitSuggestion = (key) => {
    setDefaultSelectionTab("all");
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
    if (searchKey.trim().length > 3) {
      setDefaultSelectionTab("all");
      getSearchResults(searchKey);
    }
  };

  const handleTabsClick = (tabCode) => {
    setResultsData();

    setDefaultSelectionTab(tabCode.code);
    if (!!searchKey) {
      setResultsData({});
      getSearchDataApi(searchKey, tabCode.code);
    }
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
    document.getElementById("search-rs").focus();
  };

  const pagination = () => {
    if (
      paginationVal?.lastSearchOrder &&
      paginationVal?.lastSearchOrder != "done"
    ) {
      let params = {
        query: searchKey,
        last_search_order: paginationVal?.lastSearchOrder,
        page_size: 36,
        last_doc: paginationVal?.lastDoc,
        bucket: defaultSelectionTab,
      };
      let url =
        process.env.initJson["search"] +
        "/search/api/v3/get/search/query?" +
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
    if (paginationRef.current.started === false) {
      paginationRef.current.started = true;
      pagination();
    }
  }

  useEffect(() => {
    window.scrollBy(0, -1);
    if (apiPaginationResponse?.data?.status) {
      resultsData.response.searchResults.data = [
        ...resultsData.response.searchResults.data,
        ...apiPaginationResponse?.data?.response?.searchResults?.data,
      ];
      let pgData = {
        lastSearchOrder: apiPaginationResponse?.data?.response?.lastSearchOrder,
        lastDoc: apiPaginationResponse?.data?.response?.lastDoc,
      };
      if (!!apiPaginationResponse) {
      }
      setPaginationVal(pgData);
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
          {searchStaticMenus &&
            !!displayStaticMenus &&
            !(errorMessage != "" && defaultSelectionTab == "all") && (
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
              </div>
            )}
        </div>
      </div>
      <div className={`${styles.page_curosal}`}>
        {defaultCards && !displayStaticMenus && <Sections></Sections>}
      </div>
      <div className={`${styles.search_results}`}>
        {resultsData && (
          <SearchGrid gridData={resultsData.response} searchQuery={searchKey} />
        )}
        {!resultsData && errorMessage && (
          <div className={`${styles.error_message}`}> {errorMessage}</div>
        )}
      </div>

      <div className="container">
        {!!searchHistory && searchHistory.length > 0 && !displayStaticMenus && (
          <div className={`${styles.search_cont}`}>
            <div className={`${styles.recent_search}`}>
              <div className={` ${styles.recent_header}`}>
                <span className={` ${styles.main_label}`}>
                  {Searchconstant[localLang].Recent_Searches}
                </span>
                <span
                  className={` ${styles.clear_history}`}
                  onClick={clearHistory}
                >
                  {Searchconstant[localLang].Clear_History}
                </span>
              </div>
              <div className={`${styles.hist_list}`}>
                <ul>
                  {searchHistory?.map((key, i) => {
                    return (
                      <li key={i}>
                        <span onClick={() => getSearchResults(key)}>{key}</span>
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

export default Search;
