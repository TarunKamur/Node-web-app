import styles from "@/components/profiles/profile-lock/profile-lock.module.scss";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import OtpInput from "react-otp-input";
import { getAbsolutePath, setUserDetails } from "@/services/user.service";
import { appConfig } from "@/config/app.config";
import { ProfileLockconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";

function ProfileLockComp() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectProfile, setSelectedProfile] = useState({});
  const {
    state: { userDetails, profileUtil, localLang, ThemeColor },
    dispatch,
  } = useStore();
  const {
    mutate: mutatepin,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();

  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  const handleInputChange = (type) => {
    if (type == "isProfileLockActive") {
      selectProfile.isProfileLockActive = !selectProfile.isProfileLockActive;
    } else if (type === "addProfilePinEnable") {
      selectProfile.addProfilePinEnable = !selectProfile.addProfilePinEnable;
    } else if (type === "isParentalControlEnabled") {
      selectProfile.isParentalControlEnabled =
        !selectProfile.isParentalControlEnabled;
    }
    setSelectedProfile({ ...selectProfile });
  };

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
    }
  }, [router.query.slug]);

  useEffect(() => {
    if (!!apiResponse) {
      if (!!apiResponse.data.status) {
        let index = userDetails.profileParentalDetails.findIndex(
          (ele) => ele.profileId == router.query.slug
        );
        userDetails.profileParentalDetails[index] = selectProfile;
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message: apiResponse.data.response.message,
            duration: 1500,
          },
        });
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
        setUserDetails(userDetails);
        router.back();
      } else {
        setErrorMessage(apiResponse.data.error.message);
        clearingErrorMessage();
      }
    }
  }, [apiResponse]);

  const validatePassword = () => {
    if (otp == undefined || otp == "") {
      setErrorMessage(ProfileLockconstant[localLang].PIN_Required);
      clearingErrorMessage();
      return false;
    } else if (otp.length < 4) {
      setErrorMessage(ProfileLockconstant[localLang].Plese_Enter_Valid_PIN);
      clearingErrorMessage();
      return false;
    } else {
      setErrorMessage("");
      clearingErrorMessage();
      return true;
    }
  };

  const clearingErrorMessage = () => {
    let init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 3000);
  };

  const submitform = (e) => {
    e.preventDefault();
    let valid = validatePassword();
    setTimeout(() => {
      if (valid) {
        let url =
          process.env.initJson["api"] +
          "/service/api/auth/update/user/profile/lock";
        let apiData = {
          profileId: selectProfile.profileId,
          pin: "" + otp,
          isProfileLockActive: selectProfile.isProfileLockActive,
          isParentalControlEnable: selectProfile.isParentalControlEnabled,
          addProfilePinEnable: selectProfile.addProfilePinEnable,
          token: profileUtil.token,
          context: "user_profiles",
        };
        mutatepin({ url, apiData });
      }
    }, 500);
  };

  const handleClick = () => {
    router.push("/");
  };

  return (
    <>
      <div className={`${styles.profile_lock_main}`}>
        <div className={`${styles.profile_lock}`}>
          <div className={`${styles.inner}`}>
            <img
              className={` ${styles.fixed_logo}`}
              src={appConfig?.appLogo}
              onClick={handleClick}
              alt="Logo"
            />
            <div
              className={`${styles.mobile_back}`}
              onClick={() => router.back()}
            >
              <img src={`${ImageConfig?.profile?.back}`} alt="back"></img>
              <h3>{ProfileLockconstant[localLang].Profile_Lock}</h3>
            </div>
            <h3 className={`${styles.hd}`}>
              {ProfileLockconstant[localLang].Profile_Lock}
            </h3>
            <div className={`${styles.edit_profile}`}>
              <div className={`${styles.profile_icon}`}>
                <img
                  src={
                    !!selectProfile?.imageUrl
                      ? getAbsolutePath(selectProfile?.imageUrl)
                      : "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg"
                  }
                  alt=""
                />
              </div>
              <div className={`${styles.profile_info}`}>
                <div className={`${styles.info_inner}`}>
                  <div className={`${styles.email_msg}`}>
                    <div className={`${styles.email_left}`}>
                      <span className={`${styles.text}`}>
                        {ProfileLockconstant[localLang].Require_a_PIN_to_access}{" "}
                        {selectProfile?.name}'s{" "}
                        {ProfileLockconstant[localLang].profile}
                      </span>
                    </div>
                    <div className={`${styles.email_right}`}>
                      <label className={`${styles.toggle}`}>
                        <input
                          type="radio"
                          name="on"
                          checked={selectProfile?.isProfileLockActive}
                          onChange={() =>
                            handleInputChange("isProfileLockActive")
                          }
                        ></input>
                        <span className={`${styles.value}`}>
                          {ProfileLockconstant[localLang].ON}
                        </span>
                        <span className={`${styles.indicator}`}></span>
                      </label>
                      <label className={`${styles.toggle}`}>
                        <input
                          type="radio"
                          name="off"
                          checked={!selectProfile?.isProfileLockActive}
                          onChange={() =>
                            handleInputChange("isProfileLockActive")
                          }
                        ></input>
                        <span className={`${styles.value}`}>
                          {ProfileLockconstant[localLang].OFF}
                        </span>
                        <span className={`${styles.indicator}`}></span>
                      </label>
                    </div>
                  </div>
                  <div className={`${styles.otp_input}`}>
                    <OtpInput
                      value={otp}
                      onChange={handleChange}
                      numInputs={4}
                      inputType="number"
                      renderInput={(props) => <input {...props} />}
                      inputStyle={{
                        background: ThemeColor === "white" ? "#fff" : "inherit",
                      }}
                    />
                  </div>
                  <div className={`${styles.autoplay_radio}`}>
                    {!!selectProfile.isMasterProfile && (
                      <div className={`${styles.check_block}`}>
                        <div className={`${styles.child_control}`}>
                          <label>
                            <input
                              type="checkbox"
                              checked={selectProfile.addProfilePinEnable}
                              onChange={() =>
                                handleInputChange("addProfilePinEnable")
                              }
                            ></input>
                            <div
                              className={`${styles.checkbox_indicator}`}
                            ></div>
                            <div className={`${styles.right_block}`}>
                              <span className={`${styles.text}`}>
                                {ProfileLockconstant[localLang].Require}{" "}
                                {selectProfile.name}'s{" "}
                                {
                                  ProfileLockconstant[localLang]
                                    .PIN_to_add_new_profiles
                                }
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                    <div className={`${styles.check_block}`}>
                      <div className={`${styles.child_control}`}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectProfile.isParentalControlEnabled}
                            onChange={() =>
                              handleInputChange("isParentalControlEnabled")
                            }
                          ></input>
                          <div className={`${styles.checkbox_indicator}`}></div>
                          <div className={`${styles.right_block}`}>
                            <span className={`${styles.text}`}>
                              {ProfileLockconstant[localLang].Require}{" "}
                              {`${selectProfile.name}'s `}
                              {
                                ProfileLockconstant[localLang]
                                  .PIN_to_watch_16_18_videos_from_this_profile_regardless_of_maturity_rating
                              }
                            </span>
                          </div>
                        </label>
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
                {ProfileLockconstant[localLang].Cancel}
              </button>
              <button
                type="submit"
                onClick={submitform}
                className={`primary ${styles.btns}`}
              >
                {ProfileLockconstant[localLang].Save}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default ProfileLockComp;
