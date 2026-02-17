import styles from "@/components/dish1-profiles/profiles-list.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import {
  getAbsolutePath,
  systemConfigs,
  systemFeatures,
} from "@/services/user.service";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import useGetApiMutate from "@/hooks/useGetApidata";
import { useState, useEffect, useRef } from "react";
import { actions, useStore } from "@/store/store";
import { Swiper, SwiperSlide } from "swiper/react";
import usePostApiMutate from "@/hooks/usePostApidata";
import { CreateuserProfileconstant } from "@/.i18n/locale";
import { fromStyle, validateN } from "@/services/utility.service";
import { appConfig } from "@/config/app.config";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import Loader from "../loader/loader.component";
import { deleteItem, getItem } from "@/services/local-storage.service";
import PinProfile from "../popups/profile/pin-profile-popup/pin-profile-popup.component";

function AddNewProfile() {
  const router = useRouter();
  const [popupData, setPopUpData] = useState({});
  const [profileName, setProfileName] = useState("");
  const [selected, setSelected] = useState(1);
  const [emojiList, SetEmojiList] = useState([]);
  const [dupemojiList, setdupemojiList] = useState([]);
  const [ismaster, setismaster] = useState(false);
  const [masterProfileData, setMasterProfileData] = useState([]);
  const [slidesPerView, setslidesPerView] = useState(7);
  const [initialIndex, setinitalindex] = useState();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const swiperRef = useRef(null);
  const [currentEmoji, setCurrentEmoji] = useState("");
  const [profileData, setProfileData] = useState({});
  const inputRef = useRef(null);
  const [pinProfileResponse, setPinProfileResponse] = useState(false);
  const [pagetype, setpagetype] = useState("edit");
  const isUtUser = getItem("isUtuser");
  const {
    mutate: mutatePostData,
    data: apiPostResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();
  const { mutate: mutateGetprofileData, data: profileapiResponse } =
    useGetApiMutate();
  const [nameV, setNameV] = useState({ valid: false, error: "" });
  const nameRef = useRef("");
  const [profileSubType, setprofileSubType] = useState({});
  const { mutate: mutateGetData, data: apiResponse } = useGetApiMutate();
  const {
    state: {
      userDetails,
      SystemConfig,
      localLang,
      SystemFeature,
      navigateFrom,
    },
    dispatch,
  } = useStore();
  const [placeholderTxt, setPlaceHolderTxt] = useState("Profile name");

  // profileSubType
  useEffect(() => {
    if (systemConfigs?.configs?.profileSubTypeNames) {
      setprofileSubType(
        JSON.parse(systemConfigs?.configs?.profileSubTypeNames) || "{}"
      );
      // console.log(
      //   JSON.parse(systemConfigs?.configs?.profileSubTypeNames || "{}")
      // );
    }
  }, [SystemConfig]);

  // after create or image and name update
  useEffect(() => {
    if (!!apiPostResponse?.data) {
      setPinProfileResponse(apiPostResponse?.data);
      if (apiPostResponse?.data?.status) {
        dispatch({ type: actions.navigateFrom, payload: null });
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              apiPostResponse?.data?.response?.message || "Changes Saved",
            icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/login_success_icon.svg",
          },
        });
        let profileID = profileData?.profileId
          ? profileData?.profileId
          : apiPostResponse?.data?.response?.profileId;
        router.push(`/profiles/update-user-profile/${profileID}`);
      } else if (apiPostResponse?.data?.error?.code == -4) {
        if (
          apiPostResponse?.data?.error &&
          apiPostResponse?.data?.error?.code === 401
        ) {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: "Session expired!" },
          });
          unAuthorisedHandler();
        }
        masterProfileData[0]?.addProfilePinEnable === false &&
          dispatch({
            type: actions.NotificationBar,
            payload: {
              message:
                apiPostResponse?.data?.error?.message || "somthing went wrong",
              // icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/login_success_icon.svg",
            },
          });

        // please enable this toast for api failure case
      }
    }
  }, [apiPostResponse]);

  //for swiper defualt scroll
  useEffect(() => {
    if (swiperRef?.current && swiperRef?.current?.slideToLoop) {
      swiperRef.current.slideToLoop(initialIndex, 0);
    }
  }, [dupemojiList.length, initialIndex]);

  //for swiper defualt scroll length set
  useEffect(() => {
    const minLength = slidesPerView * 2;

    if (emojiList.length > 0 && emojiList.length < minLength) {
      const repeatCount = Math.ceil(minLength / emojiList.length);
      let extended = [];
      for (let i = 0; i < repeatCount; i++) {
        extended = [...extended, ...emojiList];
      }
      setdupemojiList(extended);
    } else {
      setdupemojiList(emojiList);
    }
  }, [emojiList, slidesPerView]);

  useEffect(() => {
    if (userDetails) {
      let masterProfileData = userDetails?.profileParentalDetails?.filter(
        (profile) => !!profile.isMasterProfile
      );
      setMasterProfileData(masterProfileData);
    }
  }, [userDetails]);

  const handleClose = () => {
    setPopUpData({});
  };

  useEffect(() => {
    if (!!profileapiResponse) {
      if (profileapiResponse?.data?.status) {
        userDetails.profileParentalDetails = profileapiResponse?.data?.response;
        let eProfile = userDetails?.profileParentalDetails?.filter(
          (ele) => ele?.profileId == router.query.slug
        );
        // console.log(userDetails,'//////////////////////////////////////////////')
        if (!!eProfile && !!eProfile[0]) {
          setProfileData(eProfile[0]);
          setProfileName(eProfile[0].name);
        }
        eProfile[0]?.profileSubType && setSelected(eProfile[0]?.profileSubType);
        // let masterProfiledata = userDetails?.profileParentalDetails?.filter(
        //   (profile) => !!profile.isMasterProfile
        // );
        eProfile[0]?.isMasterProfile === true
          ? setismaster(false)
          : setismaster(true);
        // setMasterProfileData(masterProfiledata);
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
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

  const getUserProfiles = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/list/user/profile";
    mutateGetprofileData(url);
  };

  useEffect(() => {
    if (router.query.slug && !userDetails?.profileParentalDetails) {
      getUserProfiles();
    } else if (!!router.query.slug && userDetails?.profileParentalDetails) {
      let eProfile = userDetails?.profileParentalDetails?.filter(
        (ele) => ele.profileId == router.query.slug
      );
      if (!!eProfile && !!eProfile[0]) {
        console.log(userDetails, "");
        setProfileData(eProfile[0]);
        setProfileName(eProfile[0].name);
        eProfile[0].profileSubType && setSelected(eProfile[0].profileSubType);
      } else {
        getUserProfiles();
      }
      eProfile[0]?.isMasterProfile === true
        ? setismaster(false)
        : setismaster(true);
    } else {
      setpagetype("add");
      setismaster(true);
      setMasterProfileData;
    }
    let url = process.env.initJson["api"] + "/service/api/auth/get/user/emojis";
    mutateGetData(url);
  }, []);

  useEffect(() => {
    if (pagetype == "edit" && !!profileData) {
      const matchIndex = emojiList.findIndex(
        (ele) => ele.imageUrl === profileData?.imageUrl
      );
      if (matchIndex !== -1) {
        // console.log(matchIndex);
        setCurrentEmoji(emojiList[matchIndex]?.imageUrl);
        setinitalindex(matchIndex);
      }
    } else {
      if (
        systemFeatures?.userprofiles?.fields?.default_image_id &&
        !router.query.slug
      ) {
        const matchIndex = emojiList.findIndex(
          (ele) =>
            ele.id == systemFeatures?.userprofiles?.fields?.default_image_id
        );
        // console.log(matchIndex);
        if (matchIndex !== -1) {
          setCurrentEmoji(emojiList[matchIndex].imageUrl);
          setinitalindex(matchIndex);
        }
      } else {
        // setinitalindex(1); // defual selecting the 1st index
      }
    }
  }, [emojiList, profileData]);

  // useEffect(() => {
  //   if (!!userDetails) {
  //     let url =
  //       process.env.initJson["api"] + "/service/api/auth/get/user/emojis";
  //     mutateGetData(url);
  //   }
  // }, [userDetails]);
  useEffect(() => {
    if (!!apiResponse) {
      if (
        apiResponse.data.status &&
        apiResponse.data.response?.userEmojis?.length
      ) {
        SetEmojiList(apiResponse.data.response.userEmojis);
        setdupemojiList(apiResponse.data.response.userEmojis);
        // console.log(profileData);
        // profileData.imageUrl = apiResponse.data.response.userEmojis[0].imageUrl;
        // setProfileData({ ...profileData });
      }
    }
  }, [apiResponse]);
  const validateName = () => {
    let result = validateN(
      nameRef.current.value,
      appConfig?.namePattern,
      CreateuserProfileconstant[localLang]?.profile_name,
      localLang
    );

    setNameV(result);
  };

  useEffect(() => {
    const isprofileUpload = router.asPath.startsWith("/profiles");
    if (isprofileUpload) {
      if (window.innerWidth <= 720) {
        document.body.style.paddingBottom = "0px";
      }
    } else {
      if (window.innerWidth <= 720) {
        document.body.style.paddingBottom = "60px";
      }
    }
    return () => {
      if (window.innerWidth <= 720) {
        document.body.style.paddingBottom = "60px";
      }
    };
  }, [router.asPath]);

  const completeProfile = (pin = 0) => {
    let postData;
    let url;
    const trimmedProfileName = nameRef.current.value.trim();
    if (pagetype === "edit") {
      url =
        process.env.initJson["api"] + "/service/api/auth/update/user/profile";
      postData = {
        profileId: profileData?.profileId,
        profileName: trimmedProfileName,
        profileSubType: selected,
        isChildren: selected === 2 ? true : false,
        image: dupemojiList[activeIndex]?.imageUrl,
        // isProfileLockActive:false
      };
      // let eProfile = userDetails?.profileParentalDetails?.find(
      //   (e) => e.profileId == router.query.slug
      // );
      // eProfile.name = trimmedProfileName;
      // eProfile.profileSubType = selected;
      // eProfile.isChildren = selected === 2 ? true : false;
      // eProfile.imageUrl = dupemojiList[activeIndex]?.imageUrl;
      // console.log(userDetails);
      // dispatch({ type: actions.userDetails, payload: { ...userDetails } });
      // let eProfile = userDetails?.profileParentalDetails?.find(
      //   (e) => e.profileId == router.query.slug
      // );
    } else if (pagetype === "add") {
      url =
        process.env.initJson["api"] + "/service/api/auth/create/user/profile";
      postData = {
        passCode: masterProfileData[0]?.addProfilePinEnable ? pin : undefined,
        profiles: [
          {
            name: trimmedProfileName,
            profileSubType: selected,
            isMasterProfile: false,
            image: dupemojiList[activeIndex]?.imageUrl,
            isChildren: selected === 2,
          },
        ],
      };
    }
    mutatePostData({ url, apiData: postData });
  };
  const saveData = () => {
    // console.log(masterProfileData[0]?.addProfilePinEnable);
    if (masterProfileData[0]?.addProfilePinEnable && pagetype === "add") {
      setPopUpData({
        type: "pinprofile",
        subtype: "add",
        isActive: true,
        userProfiles: masterProfileData[0],
        closeTarget: closeTarget,
        validated: addPinvalidate,
      });
    } else {
      completeProfile();
    }
  };

  const addPinvalidate = (data) => {
    if (data.subtype == "add") {
      closeTarget();
    }
  };

  const closeTarget = () => {
    setPopUpData({});
    setPinProfileResponse({});
  };
  const validatePincodeCallBack = (e) => {
    completeProfile(`${e}`);
  };
  const navigatefrom = (navigatTo) => {
    switch (navigatTo) {
      case "profileworks": {
        dispatch({ type: actions.navigateFrom, payload: router.asPath });

        router.push("/profiles/how-profile-works");
      }
    }
  };

  const backHandler = () => {
    const id = profileData?.profileId;
    if (isUtUser && !getItem("redirection")) {
      deleteItem("redirection");
      window.location.href = SystemConfig?.configs?.siteURL;
    } else if (
      !!id &&
      profileData?.isMasterProfile &&
      profileData?.name.toLowerCase() == "you"
    ) {
      router.push("/profiles/manage-user-profile");
    } else if (!!id) {
      router.push(`/profiles/update-user-profile/${id}`);
    } else if (navigateFrom) {
      dispatch({ type: actions.navigateFrom, payload: null });
      // console.log(navigateFrom)
      router.push(navigateFrom);
    } else if (!!isUtUser) {
      router.push("/profiles/manage-user-profile");
    } else {
      router.push("/profiles/select-user-profile");
    }
  };

  return (
    <>
      <div className={`${styles.addNew_profile}`}>
        <div className={`${styles.header}`}>
          <img
            alt="back"
            className={` ${styles.back}`}
            src={`${ImageConfig.changePassword.arrowBack}`}
            onClick={backHandler}
          />
          <h2>
            {pagetype == "edit" ? "Complete Your Profile" : "Add New Profile"}
          </h2>
        </div>
        <div className={`${styles.add_profiles}`}>
          <div className={`${styles.add_profiles_inner}`}>
            <div className={`${styles.profile_img_container}`}>
              <p>Choose a Profile Image</p>
              <div className={`AvatarRow ${styles.AvatarRow}`}>
                <Swiper
                  slidesPerView={slidesPerView}
                  breakpoints={{
                    0: {
                      slidesPerView: 4,
                    },
                    375: {
                      slidesPerView: 4.5,
                    },
                    412: {
                      slidesPerView: 5.2,
                    },
                    425: {
                      slidesPerView: 5.2,
                    },
                    510: {
                      slidesPerView: 5.2,
                    },
                    768: {
                      slidesPerView: 7,
                    },
                  }}
                  centeredSlides={true}
                  loop={true}
                  loopAdditionalSlides={dupemojiList.length}
                  slideToClickedSlide={true}
                  speed={600}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  onSlideChange={(swiper) => {
                    const newIndex = swiper.realIndex;
                    setActiveIndex(newIndex);
                    // console.log("Selected Image:", dupemojiList[newIndex]);
                  }}
                  className={styles.mySwiper}
                >
                  {dupemojiList.length &&
                    dupemojiList.map((url, index) => (
                      <SwiperSlide
                        key={`slide-${index}`}
                        virtualIndex={index}
                        className={`${styles.inactivate_slide} ${activeIndex !== index ? styles.inactivate_slider : ""}`}
                      >
                        {/* {console.log(activeIndex)} */}
                        <div
                          className={`avatar ${styles.avatar} ${activeIndex === index ? styles.center_avatar : ""}`}
                        >
                          <img
                            src={getAbsolutePath(url?.imageUrl)}
                            alt={`avatar${index}`}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              </div>
              <div className={`${styles.input_box}`}>
                <label className={`${styles.profileName}`}>
                  Give this profile a name
                </label>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  // autoFocus
                  variant="standard"
                  inputRef={nameRef}
                  onBlur={() => {
                    // validateName;
                    setPlaceHolderTxt("Profile name");
                  }}
                  // onChange={(e) => {
                  //   let input = e.target.value;
                  //   input = input.replace(/[^A-Za-z0-9]/g, "");
                  //   input = input.replace(/^\s+/, "");
                  //   input = input.slice(0, 15);
                  //   // console.log("3");
                  //   setProfileName(input);
                  // }}
                  onChange={(e) => {
                    let input = e.target.value;
                    input = input.replace(/[^A-Za-z0-9 ]/g, "");
                    input = input.replace(/\s+/g, " ");
                    input = input.slice(0, 15);
                    setProfileName(input);
                  }}
                  onFocus={() => {
                    setNameV({ valid: true, error: "" });
                    setPlaceHolderTxt("");
                  }}
                  inputProps={{ maxLength: 15, placeholder: placeholderTxt }}
                  value={profileName}
                  key="Name"
                  sx={{
                    "& .MuiInputBase-root": {
                      borderBottom: "rgba(255, 255, 255, 0.2);",
                      "&:before, &:after": {
                        borderBottom: "none",
                      },
                      "&:hover:not(.Mui-disabled):before": {
                        borderBottom: "none",
                      },
                    },
                    "& .MuiInputBase-input": {
                      background: "none",
                      outline: "none",
                      border: "none",
                      fontSize: "24px",
                      color: "#fff",
                      textAlign: "center",
                      fontFamily: "'Poppins', sans-serif",
                      paddingBottom: "10px",

                      "&::placeholder": {
                        color: "#ffffff88",
                        opacity: 1,
                      },

                      "@media (max-width: 1024px)": {
                        fontSize: "20px",
                        paddingBottom: "8px",
                      },
                      "@media (max-width: 600px)": {
                        width: "100%",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.addNew_profile_bottom}`}>
          {/* {console.log(profileSubType)} */}
          {profileSubType?.length > 0 && ismaster && (
            <>
              <p>Who will be watching on this profile</p>
              <div className={styles.audience_options}>
                {profileSubType.map((valu) => (
                  <label
                    key={valu.id}
                    className={`${styles.audience_card} ${selected === valu.id ? styles.active : ""}`}
                  >
                    <input
                      type="radio"
                      name="audience"
                      value={valu.id}
                      checked={selected === valu.id}
                      onChange={() => setSelected(valu.id)}
                    />
                    <div className={styles.indicator}></div>

                    <div className={styles.container}>
                      {/* Replace this with dynamic icon if needed */}
                      {valu.id == 1 && (
                        <span className={styles.icon}>
                          <img
                            src={
                              appConfig.staticImagesPath + "just_me_icon.png"
                            }
                          />
                        </span>
                      )}
                      {valu.id == 2 && (
                        <span className={styles.icon}>
                          <img
                            src={appConfig.staticImagesPath + "kids_icon.png"}
                          />
                        </span>
                      )}
                      {valu.id == 3 && (
                        <span className={styles.icon}>
                          <img
                            src={appConfig.staticImagesPath + "couple_icon.png"}
                          />
                        </span>
                      )}
                      {valu.id == 4 && (
                        <span className={styles.icon}>
                          <img
                            src={appConfig.staticImagesPath + "senior_icon.png"}
                          />
                        </span>
                      )}

                      <span className={styles.label}>{valu.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
          <div className={`${styles.actions}`}>
            <button
              className={`${styles.btn} primary ${profileName.trim().length < 2 ? styles.disabled : ""}`}
              type="button"
              onClick={saveData}
              disabled={profileName.trim().length < 2}
            >
              {isLoading &&
              !popupData?.isActive &&
              popupData?.type !== "pinprofile" ? (
                <Loader type="button" />
              ) : (
                `${pagetype === "edit" ? "Save" : "Create Profile"}`
              )}
            </button>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigatefrom("profileworks");
              }}
            >
              <p>How Profile Works ?</p>{" "}
            </a>
          </div>
        </div>
      </div>
      {/* {console.log(popupData)} */}
      {popupData?.isActive && popupData?.type === "pinprofile" && (
        <PinProfile
          pinProfileResponse={pinProfileResponse}
          popupdata={popupData}
          validatePincodeCallBack={validatePincodeCallBack}
        ></PinProfile>
      )}
    </>
  );
}

export default AddNewProfile;
