import PreferredGenre from "@/components/lang-and-genre/preferedGenre.component";
import PreferredLanguage from "@/components/lang-and-genre/preferedLang.component";
import React, { useEffect, useState } from "react";
import styles from "./popup.module.scss";
import ContentRating from "../content-rating/content-rating.component";
import Loader from "@/components/loader/loader.component";
import DishDeleteProfile from "../dish-DeleteProfile/dish1-delete-profile.component";
import usePostApiMutate from "@/hooks/usePostApidata";
import {actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import AgeGender from "../age-gender/age-gender.component";
import CityData from "../city-data/city-data.component";
import KidData from "../kid-data/kid-data.component";

const PopUpComponent = (props) => {
  if (!props?.currentScreen) return;
  const [currentScreen, setCurrentScreen] = useState(null);
  const [disabledBtn, setDisableBtn] = useState(null);
  const { dispatch } = useStore();
  const router = useRouter();

  useEffect(() => {
    // console.log(props);
    setCurrentScreen(props?.currentScreen || null);
    if (currentScreen == "rating") {
      setDisableBtn(false);
    }
  }, [props]);

 const {
    mutate: mutateDelete,
    data: apiResponse,
  } = usePostApiMutate();

 const handleClose = () => {
    if (typeof closeTarget === 'function') {
      closeTarget();
    }
  };

 useEffect(() => {
    if (apiResponse?.data) {
      if (apiResponse?.data?.status) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: apiResponse?.data?.response?.message, icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/login_success_icon.svg" },
        });
        handleClose();
        // router.back();
        router.push("/profiles/manage-user-profile");
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    const isPopupOpen =
      currentScreen === "rating" ||
      currentScreen === "langs" ||
      currentScreen === "genre" ||
      currentScreen === "deleteProfile";
      currentScreen == "rating" ||
      currentScreen == "langs" ||
      currentScreen == "genre" ||
      currentScreen == "age" ||
      currentScreen == "city" ||
      currentScreen == "kid";

    if (isPopupOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingBottom = "0px";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingBottom = "60px";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingBottom = "60px";
    };
  }, [currentScreen]);

  const closeHandler = () => {
    setCurrentScreen(null);
    setDisableBtn(true);
    props?.closePopup();
  };
 
  const deleteNow = () => {
   let url = process.env.initJson["api"] + "/service/api/auth/delete/user/profile";
      let apiData = { profileId:  Number(props?.profileId) }
      mutateDelete({ url, apiData });
     console.log("url",props )
  }; 
  return (
    <>
      <div
        className={styles.blurContainer}
        style={{
          minHeight:
            currentScreen === "age" || currentScreen === "kid" ? "65vh" : "",
        }}
        onClick={closeHandler}
      />

      <div
        className={`${styles.mainContainer} ${currentScreen === "city" ? styles.city : ""}  ${currentScreen === "deleteProfile" ? styles.delete : " "}
         ${currentScreen === "rating" ? styles.rating : ""}
        `}
        style={{
          maxHeight:
            currentScreen === "age" || currentScreen === "kid" ? "42vh" : "",
        }}
      >
        <div className={styles.stroke} onClick={closeHandler}>
          <span></span>
        </div>
        <div className={styles.content}>
          {currentScreen === "langs" && (
            <PreferredLanguage
              profileId={props?.profileId}
              selectedLangs={props?.selectedLangs}
              setSelectedLangs={props?.setSelectedLangs}
              setDisableBtn={setDisableBtn}
            />
          )}
          {currentScreen === "genre" && (
            <PreferredGenre
              profileId={props?.profileId}
              setSelectedGenre={props?.setSelectedGenre}
              selectedGenre={props?.selectedGenre}
              setDisableBtn={setDisableBtn}
            />
          )}
          {currentScreen === "rating" && (
            <ContentRating
              userID={props?.profileId}
              setSelectedRating={props?.setSelectedRating}
              isMobile={true}
              userinfo={props.userinfo}
            />
          )}
          {currentScreen === "age" && (
            <AgeGender
              userID={props?.profileId}
              setSelectedAge={props?.setSelectedAge}
              selectedAge={props?.selectedAge}
              setSelectedGender={props?.setSelectedGender}
              selectedGender={props?.selectedGender}
              isMobile={true}
              setDisableBtn={setDisableBtn}
              saveBtn={props?.saveBtn}
            />
          )}
          {currentScreen === "city" && (
            <CityData
              userID={props?.profileId}
              setSelectedCity={props?.setSelectedCity}
              selectedCity={props?.selectedCity}
              isMobile={true}
              setDisableBtn={setDisableBtn}
              saveBtn={props?.saveBtn}
            />
          )}
          {currentScreen === "kid" && (
            <KidData
              userID={props?.profileId}
              setSelectedAgeGroup={props?.setSelectedAgeGroup}
              selectedAgeGroup={props?.selectedAgeGroup}
              isMobile={true}
              saveBtn={props?.saveBtn}
            />
          )}
          {currentScreen === "deleteProfile" && (
            <DishDeleteProfile
              isInPopup={true}
              popupData={{
                isActive: true,
                closeTarget: closeHandler,
                currentSelected: {
                  profileId: props?.profileId,
                  name: props?.profileName || "Profile",
                  imageUrl: props?.profileImage || null
                },
                noButtonType: "",
                yesButtonType: "",
                onDelete: deleteNow,
                
              }}
            />
          )}
        </div>
      </div>
      
      {/* Hide save button for delete profile screen */}
      {currentScreen !== "deleteProfile" && (
        <div className={`${styles.saveBtn} ${disabledBtn && styles.disable}`}>
          <button
            onClick={() => props?.saveBtn(currentScreen)}
            disabled={disabledBtn}
          >
            {!!props?.loader ? (
              <Loader type="button" />
            ) : (
              `Save ${
                currentScreen === "langs" || currentScreen === "lang"
                  ? "Languages"
                  : currentScreen === "genre"
                  ? "Preferences"
                  : ""
              }`
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default PopUpComponent;