import React, { useEffect, useState } from "react";
import styles from "./preferedGenre.module.scss";
import { useRouter } from "next/router";
import { useStore, actions } from "@/store/store";
import { getImagePath } from "@/services/user.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import Skeleton from "../skeleton/skeleton.component";

const PreferredGenre = (props) => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [systemLang, setSystemLang] = useState(null);
  const [profileData, setProfileData] = useState({});
  const { mutate: mutatePostData, data: apiResponse } = usePostApiMutate();
  const {
    state: { SystemConfig, userDetails, SystemFeature, navigateFrom },
    dispatch,
  } = useStore();
  const [screen, setScreen] = useState(null);
  const router = useRouter();
  const [loadedImages, setLoadedImages] = useState({});
  useEffect(() => {
    if (router.asPath.includes("/profiles")) {
      setScreen("profiles");
    }
    if (selectedLangs.length >= 3) {
      if (!!props?.setDisableBtn) {
        props?.setDisableBtn(false);
      }
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
      if (!!props?.setDisableBtn) {
        props?.setDisableBtn(true);
      }
    }
  }, [selectedLangs]);

  useEffect(() => {
    // Intercept back/forward navigation
    if (screen != "profiles") {
      router.beforePopState(() => {
        // Redirect to home instead of going back
        router.replace("/");
        return false; // Prevent default back behavior
      });
    }
    // Clean up on unmount
    return () => {
      router.beforePopState(() => true); // Restore default behavior
    };
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined" && SystemConfig?.configs?.contentGenres) {
      let defaultSelected = JSON.parse(
        SystemConfig?.configs?.defaultUserPreferences || "{}"
      );
      let defaultGenres;
      if (!!props?.profileId) {
        let currentProfile = userDetails?.profileParentalDetails?.find(
          (e) => e.profileId == props?.profileId
        );
        defaultGenres = currentProfile?.genres?.split(",");
      } else {
        defaultGenres = defaultSelected?.genres?.default.split(",");
      }
      // defaultGenres = defaultSelected?.genres?.default.split(",");
      let preSelected = [];
      let remaining = [];
      let temp = JSON.parse(SystemConfig?.configs?.contentGenres || "{}");
      // console.log(temp);

      temp.map((ele) => {
        if (defaultGenres?.includes(ele.code)) {
          preSelected.push(ele);
        } else {
          remaining.push(ele);
        }
      });
      let included = [];
      temp.map((e) => {
        if (defaultGenres?.includes(e.code)) {
          included.push(e.code);
        }
      });
      setSelectedLangs(included);
      if (typeof props?.setSelectedGenre == "function") {
        props?.setSelectedGenre(included);
      }
      // if (included.length == 0) {
      //   let final = temp.map((e) => e.code);
      //   // console.log(final);
      //   setSelectedLangs(final);
      // }
      temp = [...preSelected, ...remaining];
      setSystemLang(temp);
    }
  }, [SystemConfig]);

  const saveData = () => {
    let profileId = props.profileId
      ? props.profileId
      : userDetails?.profileParentalDetails?.find(
          (value) => value.isMasterProfile
        )?.profileId;
    let url =
      process.env.initJson["api"] + "/service/api/auth/update/user/profile";
    let payload = {
      genres: selectedLangs.map((e) => e).join(","),
      profileId: profileId,
    };
    mutatePostData(
      { url, apiData: payload },
      {
        onError: (err) => {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: err || "Something went wrong" },
          });
        },
        onSuccess: () => {
          setTimeout(() => {
            console.log(navigateFrom);
            if (!!navigateFrom && navigateFrom !== "navigateFrom") {
              console.log(navigateFrom);
              dispatch({ type: actions.navigateFrom, payload: null });
              router.push(navigateFrom);
            } else {
              router.push("/home");
            }
          }, 300);
        },
      }
    );
  };

  const checkSelected = (each) => {
    let temp = selectedLangs || [];
    if (selectedLangs?.includes(each)) {
      temp = temp.filter((e) => each !== e);
    } else {
      temp = [...temp, each];
    }
    setSelectedLangs(temp);
    // props?.setSelectedGenre(temp);
    if (typeof props?.setSelectedGenre == "function") {
      props?.setSelectedGenre(temp);
    }
  };
  // useEffect(()=>{
  //   // console.log(selectedLangs);
  // },[selectedLangs])

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };
  if (!systemLang && screen !== "profiles") {
    return (
      <div>
        <Skeleton custom={true} type={["genre"]} />
      </div>
    );
  }

  return (
    <div
      className={`${styles.languageContainer} ${screen == "profiles" && styles.langContPro}`}
    >
      <img
        src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg"
        className={`${screen == "profiles" ? styles.hidden : styles.logoImg}`}
      />
      <h4 className={styles.selectLang}>
        {screen == "profiles"
          ? "Choose genre preferences"
          : "Choose Category Preferences"}
      </h4>
      <p className={styles.TellUs}>
        {screen == "profiles"
          ? "Tell us what you love! Pick at least 3 content types."
          : "Tell Us What You Love! Pick At Least 3 Content Types."}
      </p>

      <div
        className={`${styles.gridContainer} ${screen == "profiles" && styles.profileGridCon}`}
      >
        {systemLang?.length > 0 &&
          systemLang?.map((each) => {
            const { imageUrl, code, id, name } = each;
            let imgPath =
              getImagePath(imageUrl) ||
              "https://d2k02uhj7uybok.cloudfront.net/content/common/common/images/isnwqe.png";
            return (
              <div
                key={id}
                className={styles.gridComponent}
                onClick={(e) => checkSelected(each.code)}
              >
                <img src={imgPath} onLoad={() => handleImageLoad(id)} />
                {loadedImages[id] && (
                  <>
                    <div className={styles.detailContainer}>
                      {!selectedLangs.includes(each.code) ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          className={styles.unchecked}
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                            fill="transparent"
                            stroke="white"
                            strokeWidth="2"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          className={styles.checked}
                        >
                          <path
                            fill="white"
                            d="M19,3H5c-1.1,0 -2,0.9 -2,2v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2V5c0,-1.1 -0.9,-2 -2,-2zM10,17L5,12l1.41,-1.41L10,14.17l7.59,-7.59L19,8l-9,9z"
                          />
                        </svg>
                      )}
                      <h1 className={styles.displayTxt}>{name ?? code}</h1>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
      <div
        className={`${screen == "profiles" ? styles.hidden : styles.conBtn}`}
      >
        <button
          className={`${styles.continueBtn} ${isDisabled && styles.continueBtnDisable}`}
          onClick={() => saveData()}
          disabled={isDisabled}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PreferredGenre;
