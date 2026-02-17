import styles from "@/components/profiles/parental-controls/parental-controls.module.scss";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import { appConfig } from "@/config/app.config";
import { getAbsolutePath, setUserDetails } from "@/services/user.service";
import { ViewRestrictionsconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
function ParentalControls() {
  const [pRatings, setPRatings] = useState([]);
  const [selectProfile, setSelectedProfile] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bottomOverLay, setBottomOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const {
    state: { userDetails, profileUtil, SystemConfig, localLang },
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
  const { mutate: mutategetBlockedData, data: apiUserResponse } =
    useGetApiMutate();
  const { mutate: mutateSavePg, data: apiPostresponse } = usePostApiMutate();
  const [videoPin, setVideoPin] = useState();
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
    if (userDetails) {
      setSelectedProfile(userDetails);
      let url =
        process.env.initJson["api"] + "/service/api/v1/get/parental/ratings";
      mutateGetData(url);
      let url1 =
        process.env.initJson["api"] +
        "/service/api/v1/get/user/parental/rating";
      mutategetBlockedData(url1);
    }
  }, []);

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
    if (!!apiUserResponse?.data?.status && pRatings?.length) {
      let ind = pRatings?.findIndex(
        (ele) => ele.id === apiUserResponse?.data?.response?.id
      );
      if (typeof ind == "undefined") {
        ind = pRatings.length - 1;
      }
      setSelectedIndex(ind);
    }
  }, [pRatings, apiUserResponse]);

  useEffect(() => {
    if (!!apiPostresponse) {
      if (!!apiPostresponse.data.status) {
        let index = 0;
        userDetails.profileParentalDetails = [{}];
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

  const handlePin = (event) => {
    event.preventDefault();
    let pinRegex = new RegExp(
      `^\\d{0,${SystemConfig?.configs?.parentalControlPinLength}}$`
    );
    if (pinRegex.test(event.target.value)) {
      setVideoPin(event.target.value);
    }
  };

  const saveDetails = () => {
    if (
      !apiUserResponse?.data?.response?.isPinAvailable &&
      videoPin?.length != 4
    ) {
      setErrorMessage("Please Set the PIN");
      clearingErrorMessage();
      return;
    }
    let postData = {
      parentalRatingId: pRatings[selectedIndex].id,
      token: profileUtil.token,
      context: profileUtil.context,
      pin: videoPin,
    };
    let url =
      process.env.initJson["api"] + "/service/api/auth/parental/control/action";
    mutateSavePg({ url, apiData: postData });
  };

  const clearingErrorMessage = () => {
    let init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 3000);
  };

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
                      }
                    </h6>
                    <p className={`${styles.sub_text}`}>
                      {pRatings[selectedIndex]?.description}
                      {pRatings[selectedIndex]?.pinRequiredRatings && (
                        <span className={`${styles.bold}`}>
                          {" "}
                          : {pRatings[selectedIndex]?.pinRequiredRatings}
                        </span>
                      )}
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
                        {pRatings[selectedIndex]?.pinRequiredRatings ||
                          ViewRestrictionsconstant[localLang]
                            .ALL_MATURITY_RATINGS}
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
                          className={`${styles.list} ${i < selectedIndex && `${styles.active} ${styles.selected}`}   ${
                            i === selectedIndex && `${styles.active}`
                          }  `}
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
                      }
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
                          value={videoPin}
                          type="password"
                          className={`${styles.form_control}`}
                          placeholder="* * * *"
                          onChange={handlePin}
                        ></input>
                      </span>
                    </form>

                    <div></div>
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
                className={`${styles.btns}`}
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
              <img
                className={`${styles.list_close}`}
                onClick={() => setBottomOverlay(false)}
                src={`${ImageConfig?.viewRestrictions?.closeIcon}`}
                alt="close"
              ></img>
              <div className={`${styles.header}`}>
                <h5 className={`${styles.main_text}`}>
                  {
                    ViewRestrictionsconstant[localLang]
                      .Profile_Maturity_Ratings_for
                  }
                </h5>
                <p className={`${styles.sub_text}`}>
                  {pRatings[selectedIndex]?.description}
                  {pRatings[selectedIndex]?.pinRequiredRatings && (
                    <span className={`${styles.bold}`}>
                      {" "}
                      : {pRatings[selectedIndex]?.pinRequiredRatings}
                    </span>
                  )}
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
export default ParentalControls;
