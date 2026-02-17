import React, { useEffect, useState } from "react";
import styles from "./preferedLang.module.scss";
import { useRouter } from "next/router";
import { actions, useStore } from "@/store/store";
import { getImagePath } from "@/services/user.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { ImageConfig } from "@/config/ImageConfig";
import Skeleton from "../skeleton/skeleton.component";
// import { navigateFrom } from "@/store/actions";

const PreferredLanguage = (props) => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [systemLang, setSystemLang] = useState(null);
  const { mutate: mutatePostData, data: apiResponse } = usePostApiMutate();
  const [screen, setScreen] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const {
    state: { SystemConfig, Location, userDetails, navigateFrom },
    dispatch,
  } = useStore();
  const router = useRouter();

  // useEffect(() => {
  //   let toastMsg = window.sessionStorage.getItem("isSignup") || false;
  //   if (!!toastMsg) {
  //     setShowToast(true);
  //     setTimeout(() => {
  //       setShowToast(false);
  //     }, 3000);
  //   }
  //   window.sessionStorage.removeItem("isSignup");
  // }, []);
  useEffect(() => {
    if (router.asPath.includes("/profiles")) {
      setScreen("profiles");
    }
    if (selectedLangs.length >= 2) {
      setIsDisabled(false);
      if (!!props?.setDisableBtn) {
        props?.setDisableBtn(false);
      }
    } else {
      setIsDisabled(true);
      if (!!props?.setDisableBtn) {
        props?.setDisableBtn(true);
      }
    }
  }, [selectedLangs]);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      SystemConfig?.contentLanguages &&
      userDetails
    ) {
      let defaultSelected = JSON.parse(
        SystemConfig?.configs?.defaultUserPreferences || "{}"
      );
      let userState = Location?.ipInfo?.region;
      let langs;
      if (!!props?.profileId) {
        let currentProfile = userDetails?.profileParentalDetails?.find(
          (e) => e.profileId == props?.profileId
        );
        if (!!currentProfile?.langs && currentProfile.langs != "") {
          langs = currentProfile?.langs?.toUpperCase().split(",");
        } else {
          if (!!defaultSelected?.languages?.[userState]) {
            langs = defaultSelected?.languages?.[userState]
              .toUpperCase()
              .split(",");
          } else {
            langs = defaultSelected?.languages?.default
              .toUpperCase()
              .split(",");
          }
        }
      } else {
        if (!!defaultSelected?.languages?.[userState]) {
          langs = defaultSelected?.languages?.[userState]
            .toUpperCase()
            .split(",");
        } else {
          langs = defaultSelected?.languages?.default.toUpperCase().split(",");
        }
      }
      // setSelectedLangs(langs);
      let temp = SystemConfig.contentLanguages;
      let preSelected = [];
      let remaining = [];
      temp.map((ele) => {
        if (langs?.includes(ele.code)) {
          preSelected.push(ele);
        } else {
          remaining.push(ele);
        }
      });
      let included = temp.filter((e) => langs?.includes(e.code));
      // console.log(included);
      let final = included.map((e) => e.code);
      // console.log(final);
      setSelectedLangs(final);
      if (typeof props?.setSelectedLangs == "function") {
        props?.setSelectedLangs(final);
      }
      // console.log(temp);
      temp = [...preSelected, ...remaining];

      setSystemLang(temp);
    }
  }, [SystemConfig, userDetails]);

  const handleClick = () => {
    // console.log(userDetails.profileParentalDetails.filter(value.isMasterProfile)    )
    let profileId = props.profileId
      ? props.profileId
      : userDetails?.profileParentalDetails?.find(
          (value) => value.isMasterProfile
        )?.profileId;
    let url =
      process.env.initJson["api"] + "/service/api/auth/update/user/profile";
    let payload = {
      langs: selectedLangs.map((e) => e).join(","),
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
          // console.log("Sucess")
        },
      }
    );
    router.push("/genre");
  };

  const checkSelected = (each) => {
    // each = each.toLowerCase();
    let temp = selectedLangs || [];
    if (selectedLangs.includes(each)) {
      temp = temp.filter((e) => each !== e);
    } else {
      temp = [...temp, each];
    }
    setSelectedLangs(temp);
    if (typeof props?.setSelectedLangs == "function") {
      props?.setSelectedLangs(temp);
    }
  };

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  if (!systemLang && screen !== "profiles") {
    return (
      <div>
        <Skeleton custom={true} type={["language"]} />
      </div>
    );
  }

  return (
    <div
      className={`${styles.languageContainer} ${screen == "profiles" && styles.langContPro}`}
    >
      {showToast && (
        <div className={styles.toastMsg}>
          <img src={ImageConfig?.subscriptionModal?.paymentFailure} /> Logged in
          Successfully
        </div>
      )}
      <img
        src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg"
        className={`${screen == "profiles" ? styles.hidden : styles.logoImg}`}
      />
      <h4 className={styles.selectLang}>
        {screen === "profiles"
          ? "Choose languages you watch in"
          : "Select Your Preferred Languages"}
      </h4>
      <p className={styles.TellUs}>
        {screen == "profiles"
          ? "Tell us what you love! Pick at least 2 languages."
          : "Tell Us What You Love! Pick At Least 2 Languages."}
      </p>

      <div
        className={`${styles.gridContainer} ${screen == "profiles" && styles.profileGridCon}`}
      >
        {systemLang?.length > 0 &&
          systemLang?.map((each) => {
            const { imageUrl, code, displayText, id, description, name } = each;
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
                      <h1 className={styles.displayTxt}>{displayText}</h1>
                      <h1 className={styles.engTxt}>{name ?? description}</h1>
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
          onClick={handleClick}
          disabled={isDisabled}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PreferredLanguage;
