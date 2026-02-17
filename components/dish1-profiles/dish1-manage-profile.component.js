import styles from "@/components/dish1-profiles/dish1-manage-profile.module.scss";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { appConfig } from "@/config/app.config";
import { actions, useStore } from "@/store/store";
import { getAbsolutePath, setUserDetails } from "@/services/user.service";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";

import { UpdateuserProfileconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import ContentRating from "./content-rating/content-rating.component";
import PreferredLanguage from "../lang-and-genre/preferedLang.component";
import PreferredGenre from "../lang-and-genre/preferedGenre.component";
import PopUpComponent from "./popup/popup.component";
import Loader from "../loader/loader.component";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { setItemEnc } from "@/services/local-storage.service";
import DishDeleteProfile from "./dish-DeleteProfile/dish1-delete-profile.component";
import AgeGender from "./age-gender/age-gender.component";
import CityData from "./city-data/city-data.component";
import KidData from "./kid-data/kid-data.component";

function Dish1userupdateProfile() {
  const router = useRouter();
  const [popupData, setPopUpData] = useState({});
  const [profileData, setProfileData] = useState({});
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [emojiList, SetEmojiList] = useState([]);
  const nameRef = useRef("");
  const [nameV, setNameV] = useState({ valid: true, error: "" });
  const [profilename, setProfileName] = useState("");
  const { mutate: mutateGetData, data: apiResponse } = useGetApiMutate();
  const { mutate: mutateGetprofileData, data: profileapiResponse } =
    useGetApiMutate();
  const [Pending, setPending] = useState(true);
  // const{profilepercentage,setprofilepercentage} =

  const [profilepercentage, setprofilepercentage] = useState(0);
  const {
    mutate: mutatePostData,
    data: apiPostResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();
  const [remainCount, setremainCount] = useState("");
  const [showLangs, SetshowLangs] = useState();
  const [ProfileLockActive, setProfileLockActive] = useState(false);
  const [leftMenuArray, setleftMenuArray] = useState([]);
  const [activatedMenu, setactivatedMenu] = useState(
    router?.query?.section || "rating"
  );
  const [SelectedRating, setSelectedRating] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [currentScreen, setCurrentScreen] = useState(null);
  const [selectedLangs, setSelectedLangs] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isBtnLoading, setIsBtnLoading] = useState({
    lang: false,
    genre: false,
    age: false,
    city: false,
    kid: false,
  });
  const [isWeb, setIsWeb] = useState(null);
  const [loader, setIsLoader] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsWeb(true);
    } else {
      setIsWeb(false);
    }
    if (router.query.slug) {
      getUserProfiles();
    }
  }, [router.query]);

  useEffect(() => {
    if (!!profileapiResponse) {
      if (profileapiResponse?.data?.status) {
        let tempuserData = profileapiResponse.data.response;
        let eProfile = tempuserData?.profileParentalDetails?.filter(
          (ele) => ele?.profileId == router?.query?.slug
        );
        if (!!eProfile && !!eProfile[0]) {
          setProfileData(eProfile[0]);
          setProfileName(eProfile[0]?.name);
          setleftMenuArray(appConfig.leftMenuArray);
          setProfileLockActive(eProfile[0]?.isProfileLockActive || false);
          if (eProfile[0]?.percentage) {
            setprofilepercentage(eProfile[0]?.percentage);
          }
          setSelectedAge(eProfile[0]?.age || null);
          setSelectedGender(eProfile[0]?.gender || null);
          setSelectedCity(eProfile[0]?.city || null);
          setSelectedAgeGroup(eProfile[0]?.ageGroup || null);
          const shouldShowDeleteBtn = 
          !eProfile[0]?.isMasterProfile && 
          eProfile[0]?.profileId != tempuserData?.profileId; 
          setShowDeleteBtn(shouldShowDeleteBtn);
          }
        dispatch({ type: actions.userDetails, payload: { ...tempuserData } });
        setUserDetails(tempuserData);
        setTimeout(() => {
          setPending(false);
        }, 300);
      } else if (profileapiResponse?.data?.status === false) {
        if (
          profileapiResponse?.data?.error &&
          profileapiResponse?.data?.error?.code === 401
        ) {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: "Session expired!" },
          });
          unAuthorisedHandler();
        }
      }
    }
  }, [profileapiResponse]);

    useEffect(() => {
      if (profileapiResponse?.data?.status && profileData && userDetails) {
        const shouldShowDeleteBtn = 
          !profileData?.isMasterProfile && 
          profileData?.profileId != userDetails?.profileId;
        
        setShowDeleteBtn(shouldShowDeleteBtn);
      }
    }, [profileData, userDetails]);

  const getUserProfiles = () => {
    let url = process.env.initJson["api"] + "/service/api/auth/user/info";
    mutateGetprofileData(url);
  };

  useEffect(() => {
    if (!!apiResponse) {
      if (apiResponse.data.status) {
        SetEmojiList(apiResponse.data?.response?.userEmojis);
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    if (!!apiPostResponse?.data) {
      if (!!apiPostResponse.data.status) {
        // sendEvent("profile_update", {
        //   ...getPlansDetails(true),
        //   user_name: nameRef.current.value,
        //   //TODO other params , etc
        // });
        // router.back();
        setIsLoader(false);
        console.log(apiPostResponse?.data?.response?.message);
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              apiPostResponse?.data?.response?.message || "Changes Saved",
            icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/login_success_icon.svg",
          },
        });
        closePopup();
      } else if (
        apiPostResponse.data.status === false &&
        apiPostResponse.data.error?.code === -4
      ) {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              apiPostResponse?.data?.error?.message || "Something went wrong",
          },
        });
        setIsLoader(false);
        closePopup();
      }
    }
  }, [apiPostResponse]);

  useEffect(() => {
    if (profileData?.langs?.length > 3) {
      let Lang = profileData?.langs.split(",").slice(0, 3);
      let count = profileData?.langs.split(",").length - 3;
      SetshowLangs(Lang);
      setremainCount(count);
    } else {
      let Lang = profileData?.langs;
      SetshowLangs(Lang);
      setremainCount("");
    }
  }, [profileData?.langs]);

  const handleClose = () => {
    setPopUpData({});
  };

  const validateName = () => {
    // let result = validateN(
    //   nameRef.current.value,
    //   appConfig.namePattern,
    //   "Profile Name"
    // );
    // setNameV(result);

    if (nameRef.current?.value?.length === 0) {
      setNameV({
        valid: false,
        error: UpdateuserProfileconstant[localLang].name_is_required,
      });
    } else {
      setNameV({ valid: true, error: "" });
    }
  };

  const toggleLanguageModal = (e) => {
    setIsLanguageModalOpen(!isLanguageModalOpen);
  };
  
  const deleteProfile = () => {
  if (window.innerWidth > 720) {
    setPopUpData({
      isActive: true,
      type: "deleteProfile",
      closeTarget: handleClose,
      currentSelected: profileData, 
      noButtonType: "",
      yesButtonType: ""
    });
  } else {
   
    setCurrentScreen("deleteProfile");
  }
};

  const selectedLang = (data) => {
    profileData.langs = data;
    setProfileData({ ...profileData });
    toggleLanguageModal();
  };

  const handleCardClick = (sectionTitle, cardLabel, sectionPath) => {
    const currentSection = router.query.section;
    const newSection = sectionPath;

    if (
      (currentSection === newSection ||
        (!currentSection && newSection === "rating")) &&
      isWeb
    ) {
      return;
    }
    if (!isWeb) {
      setCurrentScreen(newSection);
    }
    setactivatedMenu(newSection);
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        section: newSection,
      },
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 767) {
      setCurrentScreen(router.query.section);
    }
  }, [router.asPath]);

  const closePopup = () => {
    setCurrentScreen(null);
  };

  const navTo = (nav) => {
    switch (nav) {
      case "imageEdit": {
        router.push(`/profiles/image-upload/${router.query.slug}`);
      }
    }
  };

  const backHandler = () => {
    router.push("/profiles/manage-user-profile");
  };

  const saveBtn = (category) => {
    setIsBtnLoading((prev) => {
      return { ...prev, [category]: true };
    });

    // console.log(typeof router?.query?.slug);
    setIsLoader(true);
    let profileId = router?.query?.slug
      ? Number(router?.query?.slug)
      : userDetails?.profileParentalDetails?.find(
          (value) => value.isMasterProfile
        )?.profileId;
    let url;
    let payload = {
      profileId: profileId,
    };
    const baseUrl = process.env.initJson["api"];

    if (category === "genre") {
      url = `${baseUrl}/service/api/auth/update/user/profile`;
      payload.genres = selectedGenre?.join(",");
    } else if (category === "lang" || category === "langs") {
      url = `${baseUrl}/service/api/auth/update/user/profile`;
      payload.langs = selectedLangs?.join(",");
    } else if (category === "rating") {
      url = `${baseUrl}/service/api/auth/update/view/restrictions`;
      payload.ratingsId = SelectedRating;
      payload.blockedItems = []; // formatBlockedItems() if needed
    } else if (category === "age") {
      if (!selectedAge || !selectedGender) {
        setIsBtnLoading((prev) => ({ ...prev, age: false }));
        setIsLoader(false);
        dispatch({
          type: actions.NotificationBar,
          payload: { message: "Please select both age and gender" },
        });
        return;
      }
      url = `${baseUrl}/service/api/auth/update/user/profile`;
      payload.age = selectedAge;
      payload.gender = selectedGender;
    } else if (category === "city") {
      if (!selectedCity) {
        setIsBtnLoading((prev) => ({ ...prev, city: false }));
        setIsLoader(false);
        dispatch({
          type: actions.NotificationBar,
          payload: { message: "Please select a city" },
        });
        return;
      }
      url = `${baseUrl}/service/api/auth/update/user/profile`;
      payload.city = selectedCity;
    } else if (category === "kid") {
      if (!selectedAgeGroup) {
        setIsBtnLoading((prev) => ({ ...prev, kid: false }));
        setIsLoader(false);
        dispatch({
          type: actions.NotificationBar,
          payload: { message: "Please select an age group" },
        });
        return;
      }
      url = `${baseUrl}/service/api/auth/update/user/profile`;
      payload.ageGroup = selectedAgeGroup;
    }

    // closePopup();

    mutatePostData(
      { url, apiData: payload },
      {
        onError: (err) => {
          setIsBtnLoading((prev) => {
            return { ...prev, [category]: false };
          });
          dispatch({
            type: actions.NotificationBar,
            payload: {
              message:
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong",
            },
          });
          setIsLoader(false);
          closePopup();
        },
        onSuccess: () => {
          setIsBtnLoading((prev) => {
            return { ...prev, [category]: false };
          });
          getUserProfiles();
          // dispatch({
          //   type: actions.NotificationBar,
          //   payload: {
          //     message: "Changes Saved",
          //     icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/login_success_icon.svg",
          //   },
          // });
          // if (typeof window !== "undefined" && window.innerWidth <= 767) {
          //   closePopup();
          // }
        },
      }
    );
  };

  const progressColor =
    profilepercentage === 100
      ? "#0C9D61"
      : profilepercentage > 50
        ? "#E17D18"
        : "#FDBB35";

  return (
    <>
      <div className={styles.container}>
        <span className={styles.completeProfile}>
          <img src={ImageConfig?.bookd2h?.back} onClick={backHandler} />
          Complete Your Profile
        </span>
        <div className={styles.gridContainer}>
          <div className={styles.leftContainer}>
            <div className={`${styles.profile_preferences}`}>
              <div className={`${styles.profile_card}`}>
                <div className={`${styles.avatar_section}`}>
                  <div
                    className={`${styles.progress_ring}`}
                    style={{
                      background: profileData?.imageUrl
                        ? `conic-gradient(from -180deg, ${progressColor} 0% ${profilepercentage}%, #D9D9D9 ${profilepercentage}% 100%)`
                        : "#1e1e1e",
                    }}
                  >
                    <div className={`${styles.avatar_img}`}>
                      <img
                        className={`${styles.profile_icon}`}
                        src={
                          profileData?.imageUrl
                            ? getAbsolutePath(profileData.imageUrl)
                            : appConfig.staticImagesPath +
                              "dummy-profile-img.png"
                        }
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src =
                            appConfig.staticImagesPath +
                            "dummy-profile-img.png";
                        }}
                        alt={profileData?.name}
                      ></img>
                      {!router?.query?.slug && !profileData?.imageUrl && (
                        <img
                          className={`${styles.profile_icon}`}
                          src={
                            appConfig.staticImagesPath + "defualt_avatar.jpeg"
                          }
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src =
                              appConfig.staticImagesPath +
                              "defualt_avatar.jpeg";
                          }}
                          alt={profileData.name}
                        ></img>
                      )}
                      {profilepercentage !== 100 && (
                        <div
                          className={`${styles.progress_badge}`}
                          style={{
                            backgroundColor: progressColor,
                          }}
                        >
                          {profilepercentage} %
                        </div>
                      )}
                    </div>
                  </div>
                  <p className={`${styles.username}`}>{profileData.name}</p>
                  {profileData?.isChildren && (
                    <p className={`${styles.kids_tag}`}>Kids</p>
                  )}
                </div>
                <img
                  onClick={() => navTo("imageEdit")}
                  className={`${styles.profile_edit}`}
                  src={appConfig.staticImagesPath + "tabler_edit.png"}
                ></img>
              </div>
              {profileData &&
                leftMenuArray?.map((section, i) => (
                  <div key={i} className={styles.section}>
                    <p className={styles.section_title}>{section.title}</p>
                    <p className={styles.section_subtitle}>
                      {section.subtitle}
                    </p>

                    <div className={styles.card_list}>
                      {section.cards.map((card, j) => {
                        if (profileData.isChildren) {
                          return card.path !== "genre" &&
                            card.path !== "age" &&
                            card.path !== "city" ? (
                            <div
                              key={j}
                              className={`${styles.card_item} ${activatedMenu === card.path ? styles.active : ""}`}
                              onClick={() =>
                                handleCardClick(
                                  section.title,
                                  card.label,
                                  card.path
                                )
                              }
                            >
                              <img
                                className={styles.icon}
                                src={
                                  activatedMenu === card.path && isWeb
                                    ? card.activ_icon
                                    : card.icon
                                }
                                alt={card.label}
                              />

                              <span className={styles.lable_Text}>
                                {card.label}
                              </span>

                              <img
                                className={styles.arrow}
                                src={
                                  activatedMenu === card.path && isWeb
                                    ? `${appConfig.staticImagesPath}weui_arrow-outlined.svg`
                                    : `${appConfig.staticImagesPath}profile_card_arrow.png`
                                }
                                alt="arrow"
                              />
                            </div>
                          ) : null;
                        } else {
                          return card.path !== "kid" ? (
                            <div
                              key={j}
                              className={`${styles.card_item} ${activatedMenu === card.path ? styles.active : ""}`}
                              onClick={() =>
                                handleCardClick(
                                  section.title,
                                  card.label,
                                  card.path
                                )
                              }
                            >
                              <img
                                className={styles.icon}
                                src={
                                  activatedMenu === card.path && isWeb
                                    ? card.activ_icon
                                    : card.icon
                                }
                                alt={card.label}
                              />

                              <span className={styles.lable_Text}>
                                {card.label}
                              </span>

                              <img
                                className={styles.arrow}
                                src={
                                  activatedMenu === card.path && isWeb
                                    ? `${appConfig.staticImagesPath}weui_arrow-outlined.svg`
                                    : `${appConfig.staticImagesPath}profile_card_arrow.png`
                                }
                                alt="arrow"
                              />
                            </div>
                          ) : null;
                        }
                      })}
                    </div>
                  </div>
                ))}
                
                {showDeleteBtn && (
                 <div className={`${styles.deleteBtn}`}>
                  <button onClick={deleteProfile}>
                  <img src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/delete_icon.svg"/>
                    Delete Profile
                   </button>
                 </div>
                )}
            </div>
          </div>
           {popupData.isActive && !currentScreen && popupData.type === "deleteProfile" && window.innerWidth > 720 && (
              <DishDeleteProfile 
                popupData={{
                  ...popupData,
                  currentSelected: profileData
                }} 
                isInPopup={false}
              />
            )}
          <div className={styles.rightContainer}>
            {(!activatedMenu || activatedMenu === "rating") && (
              <div className={styles.contentRating}>
                <ContentRating userID={router.query.slug} userinfo={Pending} />
              </div>
            )}
            {activatedMenu === "langs" && (
              <div>
                <div className={styles.contentLang}>
                  <PreferredLanguage
                    profileId={router.query.slug}
                    setSelectedLangs={setSelectedLangs}
                  />
                </div>
                <div className={styles.saveBtn}>
                  <button
                    onClick={() => saveBtn("lang")}
                    disabled={selectedLangs?.length < 2 || isBtnLoading.lang}
                    className={selectedLangs?.length < 2 && styles.disabled}
                  >
                    {isBtnLoading.lang ? <Loader type="button" /> : "Save"}
                  </button>
                </div>
              </div>
            )}
            {activatedMenu === "genre" && (
              <div>
                <div className={styles.contentGenre}>
                  <PreferredGenre
                    setSelectedGenre={setSelectedGenre}
                    profileId={router.query.slug}
                  />
                </div>
                <div className={styles.saveBtn}>
                  <button
                    onClick={() => saveBtn("genre")}
                    disabled={selectedGenre?.length < 3 || isBtnLoading.genre}
                    className={selectedGenre?.length < 3 && styles.disabled}
                  >
                    {isBtnLoading.genre ? <Loader type="button" /> : "Save"}
                  </button>
                </div>
              </div>
            )}
            {activatedMenu === "age" && (
              <div className={styles.contentRating}>
                <AgeGender
                  userID={router.query.slug}
                  setSelectedAge={setSelectedAge}
                  selectedAge={selectedAge}
                  setSelectedGender={setSelectedGender}
                  selectedGender={selectedGender}
                  saveBtn={saveBtn}
                />
              </div>
            )}
            {activatedMenu === "city" && (
              <div className={styles.contentRating}>
                <CityData
                  userID={router.query.slug}
                  setSelectedCity={setSelectedCity}
                  selectedCity={selectedCity}
                  saveBtn={saveBtn}
                />
              </div>
            )}
            {profileData.isChildren && activatedMenu === "kid" && (
              <div className={styles.contentRating}>
                <KidData
                  userID={router.query.slug}
                  setSelectedAgeGroup={setSelectedAgeGroup}
                  selectedAgeGroup={selectedAgeGroup}
                  saveBtn={saveBtn}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {!!currentScreen && (
        <PopUpComponent
          currentScreen={currentScreen}
          closePopup={closePopup}
          setSelectedGenre={setSelectedGenre}
          selectedGenre={selectedGenre}
          popupData={popupData}
          selectedLangs={selectedLangs}
          selectedAge={selectedAge}
          selectedCity={selectedCity}
          selectedGender={selectedGender}
          selectedAgeGroup={selectedAgeGroup}
          profileId={router.query.slug}
          profileName={profileData?.name}
          profileImage={profileData?.imageUrl}
          setSelectedLangs={setSelectedLangs}
          setSelectedRating={setSelectedRating}
          setSelectedAge={setSelectedAge}
          setSelectedCity={setSelectedCity}
          setSelectedGender={setSelectedGender}
          setSelectedAgeGroup={setSelectedAgeGroup}
          saveBtn={saveBtn}
          loader={loader}
          userinfo={Pending}
        />
      )}

      {/* <div className={`${styles.container}`}>
          <h1> Complete Your Profile</h1>
          <div className={`${styles.parent}`}>
            <div className={`${styles.left_section}`}>
             
            </div>
            <div className={`${styles.right_section}`}>
              <h2>right_section section</h2>
            </div>
          </div>
        </div> */}
    </>
  );
}

export default Dish1userupdateProfile;
