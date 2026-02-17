import styles from "@/components/profiles/view-restrictions/view-restrictions.module.scss";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import useDebounce from "@/hooks/useDebounce";
import { jsonToQueryParams } from "@/services/utility.service";
import { appConfig } from "@/config/app.config";
import { getAbsolutePath, setUserDetails } from "@/services/user.service";
import { ViewRestrictionsconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import CloseIcon from "@mui/icons-material/Close";
function ViewRestrictionComp() {
  const [pRatings, setPRatings] = useState([]);
  const [blockedItems, setBlockedItems] = useState([]);
  const [selectProfile, setSelectedProfile] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bottomOverLay, setBottomOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const {
    state: { userDetails, profileUtil, localLang },
    dispatch,
  } = useStore();
  const {
    mutate: mutateGetData,
    data: apiGetResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const { mutate: mutategetBlockedData, data: apiGEtBloackedResponse } =
    useGetApiMutate();
  const { mutate: mutateSavePg, data: apiPostresponse } = usePostApiMutate();
  const [searchKey, setSearchKey] = useState();
  const [suggestionList, setSuggestionList] = useState([]);
  const { mutate: mutateGetSuggestions, data: apiResponse } = useGetApiMutate();
  const [DisplaySuggestions, setDisplaySuggestions] = useState(false);
  useEffect(() => {
    if (!!profileUtil) {
    } else {
      router.replace("/settings");
    }
    return () => {
      dispatch({ type: actions.profileUtil, payload: null });
    };
  }, [profileUtil]);

  useEffect(() => {
    if (router.query.slug && userDetails) {
      setSelectedProfile(
        userDetails.profileParentalDetails.find(
          (ele) => ele.profileId == router.query.slug
        )
      );
      let url =
        process.env.initJson["api"] + "/service/api/v1/get/parental/ratings";
      mutateGetData(url);
      let url1 =
        process.env.initJson["api"] +
        "/service/api/v1/get/blocked/items?profileId=" +
        router.query.slug;
      mutategetBlockedData(url1);
    }
  }, [router.query.slug]);

  useEffect(() => {
    if (!!apiGetResponse?.data) {
      if (!!apiGetResponse.data.status) {
        let data = apiGetResponse.data.response.parentalRatings.sort((a, b) => {
          return a.priority - b.priority;
        });
        setPRatings(data);
        let ind = !!selectProfile.profileRating
          ? data.findIndex((ele) => ele.name === selectProfile.profileRating)
          : data?.length - 1;
        setSelectedIndex(ind);
      }
    }
  }, [apiGetResponse]);

  useEffect(() => {
    if (!!apiGEtBloackedResponse?.data) {
      if (!!apiGEtBloackedResponse.data.status) {
        let blockeditems = apiGEtBloackedResponse.data.response.data;
        if (!!blockeditems.length) {
          let obj = [];
          for (let i = 0; i < blockeditems.length; i++) {
            if (!!Object.keys(blockeditems[i].itemsMap).length) {
              for (let key in blockeditems[i].itemsMap) {
                obj.push({
                  elemSubType: blockeditems[i].category,
                  id: key,
                  name: blockeditems[i].itemsMap[key],
                });
              }
            }
          }
          setBlockedItems(obj);
        } else {
          setBlockedItems([]);
        }
      }
    }
  }, [apiGEtBloackedResponse]);

  useEffect(() => {
    if (!!apiPostresponse) {
      if (!!apiPostresponse.data.status) {
        let index = userDetails.profileParentalDetails.findIndex(
          (ele) => ele.profileId == router.query.slug
        );
        userDetails.profileParentalDetails[index].profileRating =
          pRatings[selectedIndex].name;
        userDetails.profileParentalDetails[index].profileRatingDesc =
          pRatings[selectedIndex].description;
        userDetails.profileParentalDetails[index].profileRatingId =
          pRatings[selectedIndex].id;
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
        setUserDetails(userDetails);
        router.back();
      } else {
        setErrorMessage(apiPostresponse.data.error.message);
        clearingErrorMessage();
      }
    }
  }, [apiPostresponse]);

  const SearchR = (event) => {
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
        "/service/api/v1/search/content?" +
        jsonToQueryParams(payload);
      mutateGetSuggestions(url);
    } else {
      setDisplaySuggestions(false);
      setSuggestionList([]);
    }
  }, 1200);

  useEffect(() => {
    if (!!apiResponse?.data) {
      if (!!apiResponse?.data?.status) {
        setDisplaySuggestions(true);
        setSuggestionList(apiResponse?.data?.response.data);
      } else {
        setDisplaySuggestions(false);
        setSuggestionList([]);
      }
    } else {
    }
  }, [apiResponse]);

  const selectedRestrictedData = (data) => {
    setDisplaySuggestions(false);
    setSearchKey("");
    if (!!blockedItems.length) {
      let duplicateData = [];
      for (let obj of blockedItems) {
        if (data.id == obj.id) duplicateData.push(obj);
      }
      let add = true;
      for (let obj of duplicateData) {
        if (!!obj.elemSubType && !!data.elemSubType) {
          if (obj.elemSubType == data.elemSubType) {
            add = false;
            break;
          }
        } else if (!!obj.elemType && !!data.elemType) {
          if (obj.elemType == data.elemType) {
            add = false;
            break;
          }
        } else if (!!obj.elemSubType && !!data.elemType) {
          if (obj.elemSubType == data.elemType) {
            add = false;
            break;
          }
        } else if (!!obj.elemType && !!data.elemSubType) {
          if (obj.elemType == data.elemSubType) {
            add = false;
            break;
          }
        }
      }
      if (duplicateData.length == 0 || !!add) {
        setBlockedItems((prev) => [...prev, data]);
      }
    } else {
      setBlockedItems((prev) => [...prev, data]);
    }
  };
  const formatBlockedItems = () => {
    if (!!blockedItems.length) {
      let blockedObjectInfo = {};
      blockedItems.forEach((element) => {
        if (!!element.elemSubType) {
          blockedObjectInfo[element.elemSubType] = !!blockedObjectInfo[
            element.elemSubType
          ]
            ? blockedObjectInfo[element.elemSubType] + "," + element.id
            : element.id.toString();
        } else if (!!element.elemType) {
          blockedObjectInfo[element.elemType] = !!blockedObjectInfo[
            element.elemType
          ]
            ? blockedObjectInfo[element.elemType] + "," + element.id
            : element.id.toString();
        }
      });
      let newArr = [];
      for (let key in blockedObjectInfo) {
        newArr.push({ category: key, itemIds: blockedObjectInfo[key] });
      }
      return newArr;
    } else {
      return [];
    }
  };
  const removeItem = (index) => {
    let Items = [...blockedItems];
    Items.splice(index, 1);
    setBlockedItems(Items);
  };
  const saveDetails = () => {
    let postData = {
      ratingsId: pRatings[selectedIndex].id,
      token: profileUtil.token,
      profileId: selectProfile.profileId,
      blockedItems: formatBlockedItems(),
      context: profileUtil.context,
    };
    let url =
      process.env.initJson["api"] +
      "/service/api/auth/update/view/restrictions";
    mutateSavePg({ url, apiData: postData });
  };

  const clearingErrorMessage = () => {
    let init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 3000);
  };

  // Apply overflow hidden when modal is shown
  useEffect(() => {
    if (bottomOverLay) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [bottomOverLay]);

  return (
    <>
      <div className={`${styles.profile_lock_main}`}>
        <div className={`${styles.profile_lock}`}>
          <div className={`${styles.inner}`}>
            <img
              className={` ${styles.fixed_logo}`}
              src={appConfig?.appLogo}
              alt="Logo"
            />
            <div
              className={`${styles.mobile_back}`}
              onClick={() => router.back()}
            >
              <img
                src={`${ImageConfig?.viewRestrictions?.back}`}
                alt="back"
              ></img>
              <h3>
                {ViewRestrictionsconstant[localLang].Viewing_Restrictions}{" "}
              </h3>
            </div>
            <h3 className={`${styles.hd}`}>
              {" "}
              {ViewRestrictionsconstant[localLang].Viewing_Restrictions}{" "}
            </h3>
            <div className={`${styles.section}`}>
              <div className={`${styles.section_left}`}>
                <div className={`${styles.profile_icon}`}>
                  <img
                    src={
                      !!selectProfile?.imageUrl
                        ? getAbsolutePath(selectProfile?.imageUrl)
                        : `${appConfig.staticImagesPath}profile-pic1.svg`
                    }
                    alt={selectProfile.name}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src =
                        "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg";
                    }}
                  ></img>
                </div>
              </div>
              <div className={`${styles.section_right}`}>
                <div className={`${styles.info_inner}`}>
                  <div className={`${styles.email_msg}`}>
                    <h6 className={`${styles.main_text}`}>
                      {
                        ViewRestrictionsconstant[localLang]
                          .Profile_Maturity_Ratings_for
                      }{" "}
                      {selectProfile.name}
                    </h6>
                    <p className={`${styles.sub_text}`}>
                      {
                        ViewRestrictionsconstant[localLang]
                          .Only_show_titles_of_rated
                      }
                      <span className={`${styles.bold}`}>
                        {" "}
                        {`'${
                          selectedIndex === 0
                            ? `${pRatings[selectedIndex]?.displayCode}`
                            : `${pRatings[selectedIndex]?.displayCode} ${ViewRestrictionsconstant[localLang].And_Below}`
                        }'`}
                      </span>
                      {ViewRestrictionsconstant[localLang].for_this_profile}
                    </p>
                  </div>
                  <div
                    className={`${styles.select_pg}`}
                    onClick={() => setBottomOverlay(true)}
                  >
                    <label>
                      <span>
                        {" "}
                        {ViewRestrictionsconstant[localLang].Select_Rating}
                      </span>
                      <span>
                        {" "}
                        {
                          ViewRestrictionsconstant[localLang]
                            .ALL_MATURITY_RATINGS
                        }
                      </span>
                    </label>
                    <span className={`${styles.arrow}`}></span>
                  </div>
                  <div className={`${styles.steps}`}>
                    <ul>
                      {pRatings.map((pr, i) => (
                        <li
                          key={i}
                          onClick={() => setSelectedIndex(i)}
                          className={`${styles.list} ${i < selectedIndex && `${styles.active} ${styles.selected}`}   ${i === selectedIndex && `${styles.active} `}  `}
                        >
                          <img
                            className={`${styles.lock}`}
                            src={`${ImageConfig?.viewRestrictions?.parentalLock}`}
                            alt="parental"
                          ></img>
                          <span className={`${styles.default}`}></span>
                          <span className={`${styles.bar}`}></span>
                          <span className={`${styles.active}`}></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${styles.naming}`}>
                    <ul>
                      {pRatings.map((pr, i) => (
                        <li key={i}>
                          <span className={`${styles.name}`}>
                            {pr.displayCode}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${styles.vpin}`}>
                    <h6 className={`${styles.main_text}`}>
                      {
                        ViewRestrictionsconstant[localLang]
                          .Title_Restrictions_for
                      }{" "}
                      {selectProfile.name}
                    </h6>
                    <p className={`${styles.sub_text}`}>
                      {
                        ViewRestrictionsconstant[localLang]
                          .Dont_show_specific_titles_for_this_profile_regardless_of_Maturity_Rating
                      }
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <span className={`${styles.modal_close}`}>
                        <img
                          src={`${ImageConfig?.popup?.closeIcon}`}
                          alt="close"
                        ></img>
                      </span>
                      <span>
                        <input
                          value={searchKey}
                          type="text"
                          className={`inputfield ${styles.form_control}`}
                          placeholder={
                            ViewRestrictionsconstant[localLang]
                              .Enter_Show_or_Movie_Name
                          }
                          onChange={SearchR}
                        ></input>
                      </span>
                    </form>
                    <div className={`${styles.search_suggestions}`}>
                      <ul>
                        {DisplaySuggestions &&
                          suggestionList.map((data, i) => {
                            return (
                              <li
                                key={i}
                                onClick={() => selectedRestrictedData(data)}
                              >
                                {data.name}
                              </li>
                            );
                          })}
                      </ul>
                    </div>

                    <div>
                      <div className={`${styles.tags_container}`}>
                        <ul>
                          {!!blockedItems &&
                            blockedItems.map((item, i) => {
                              return (
                                <li>
                                  {item.name}
                                  <img
                                    src={`${ImageConfig?.mbDwnldHeader?.closeIcon}`}
                                    onClick={() => removeItem(i)}
                                    alt="close"
                                  ></img>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${styles.text_danger1}`}>
                <span>{errorMessage}</span>
              </div>
            </div>
            <div className={styles.footer_actions}>
              <button
                type="button"
                className={`grey ${styles.btns}`}
                onClick={() => router.back()}
              >
                {ViewRestrictionsconstant[localLang].Cancel}
              </button>
              <button
                type="submit"
                className={`${styles.btns} primary ${styles.disabled}`}
                onClick={saveDetails}
              >
                {ViewRestrictionsconstant[localLang].Save}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${styles.modal_dialog} ${bottomOverLay ? `${styles.show}` : `${styles.hide}`}`}
      >
        <div className={`${styles.main}`}>
          <div className={`${styles.modal_content}`}>
            <div className={`${styles.modal_list}`}>
              <CloseIcon
                className={`${styles.list_close}`}
                onClick={() => setBottomOverlay(false)}
              ></CloseIcon>
              {/* <img
                className={`${styles.list_close}`} onClick={()=>setBottomOverlay(false)}
                src={`${ImageConfig?.viewRestrictions?.closeIcon}`}
                alt="close"
              ></img> */}
              <div className={`${styles.header}`}>
                <h5 className={`${styles.main_text}`}>
                  {
                    ViewRestrictionsconstant[localLang]
                      .Profile_Maturity_Ratings_for
                  }{" "}
                  {selectProfile.name}
                </h5>
                <p className={`${styles.sub_text}`}>
                  {
                    ViewRestrictionsconstant[localLang]
                      .Only_show_titles_of_rated
                  }
                  <span className={`${styles.bold}`}>
                    {" "}
                    {pRatings[selectedIndex]?.displayCode}{" "}
                    {ViewRestrictionsconstant[localLang].And_Below}{" "}
                  </span>{" "}
                  {ViewRestrictionsconstant[localLang].for_this_profile}
                </p>
              </div>
              <label className={`${styles.bottom}`}>
                {pRatings.map((pr, i) => (
                  <div
                    key={i}
                    className={`${styles.row} ${i < selectedIndex && styles.selected} ${i === selectedIndex && styles.select}`}
                    onClick={() => setSelectedIndex(i)}
                  >
                    <div className={`${styles.disc_parent}`}>
                      <img
                        className={`${styles.lock}`}
                        src={`${ImageConfig?.viewRestrictions?.parentalLock}`}
                        alt="parental"
                      ></img>
                      <span className={`${styles.disc}`}></span>
                      <span className={`${styles.bar}`}></span>
                      <span className={`${styles.active}`}></span>
                    </div>
                    <p className={`${styles.name}`}>{pr.displayCode}</p>
                    <p className={`${styles.age}`}>{pr.name}</p>
                  </div>
                ))}
              </label>
              <button
                type="button"
                className={`${styles.btn} primary`}
                onClick={() => setBottomOverlay(false)}
              >
                {ViewRestrictionsconstant[localLang].Save}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default ViewRestrictionComp;
