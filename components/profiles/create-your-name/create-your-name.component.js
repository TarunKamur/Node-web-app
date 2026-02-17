import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/profiles/create-your-name/create-your-name.module.scss";
import { appConfig } from "@/config/app.config";
import { actions, useStore } from "@/store/store";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useRouter } from "next/router";
import TextField from "@mui/material/TextField";
import { fromStyle } from "@/services/utility.service";
import { CreateYourNameconstant } from "@/.i18n/locale";
import { getQueryParams } from "@/services/utility.service";
const CreateYourName = () => {
  const {
    state: { SystemConfig, userDetails, localLang },
    dispatch,
  } = useStore();
  const router = useRouter();
  const nameRef = useRef("");
  const [lang, setLang] = useState("");
  const { mutate: mutatePostData, data: apiPostResponse } = usePostApiMutate();
  const [nameV, setNameV] = useState({ valid: false, error: "" });
  const [inputValue, setInputValue] = useState("");
  const [masterProfile, setMasterProfile] = useState({});
  const [nameValue, setNameValue] = useState("");

  useEffect(() => {
    let localLang = SystemConfig?.contentLanguages?.reduce((acc, v) => {
      return `${acc},${v.code}`;
    }, "");
    setLang(localLang?.slice(1));
  }, [SystemConfig]);

  useEffect(() => {
    if (!!userDetails) {
      setMasterProfile(
        userDetails?.profileParentalDetails?.filter(
          (profile) => !!profile.isMasterProfile
        )
      );
    }
  }, [userDetails]);

  useEffect(() => {
    if (!!apiPostResponse?.data) {
      if (!!apiPostResponse.data.status) {
        masterProfile.name = nameRef.current.value;
        userDetails?.profileParentalDetails?.forEach((profile) => {
          if (!!profile.isMasterProfile) {
            profile = masterProfile;
          }
        });
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
        let pageQuery = getQueryParams(router.asPath);
        let routeTO = "/profiles/select-user-profile";
        if (pageQuery && pageQuery?.referer) {
          routeTO = routeTO + "?referer=" + pageQuery?.referer;
        }
        router.push(routeTO);
      } else {
      }
    }
  }, [apiPostResponse]);

  const addProfileName = (event) => {
    event.preventDefault();
    nameV.valid && addProfile(nameRef.current.value);
  };

  const addProfile = (profileName) => {
    if (nameRef.current.value == undefined || nameRef.current.value == "") {
      setNameV({ valid: false, error: "Name is Required" });
    } else {
      const data = {
        profileName: profileName,
        profileId: masterProfile[0]?.profileId,
        isChildren: masterProfile[0]?.isChildren,
        isProfileLockActive: masterProfile[0]?.isProfileLockActive,
        langs: lang,
      };
      let url =
        process.env.initJson["api"] + "/service/api/auth/update/user/profile";
      try {
        mutatePostData({ url, apiData: data });
      } catch (e) {}
    }
  };

  const validateName = (e) => {
    const value = e.target.value;
    const regexValue = value.replace(/[^\w\s]/gi, "").trim();
    if (regexValue.length !== 0) {
      setNameV({ valid: true, error: "" });
    } else {
      setNameV({ valid: false, error: "Name is Required" });
    }
    setInputValue(regexValue);
  };
  const handleChange = (event) => {
    const newValue = event.target.value;
    setNameValue(newValue);
    if (newValue.length == 0) {
      setNameV({
        valid: false,
        error:
          CreateYourNameconstant?.[localLang]?.name_is_required ||
          "Name is Required",
      });
    } else if (newValue.length < 2) {
      setNameV({
        valid: false,
        error:
          CreateYourNameconstant?.[localLang]?.minimum_char_required ||
          "Minimum 2 characters required",
      });
    } else if (newValue.length > 10) {
      setNameV({
        valid: false,
        error:
          CreateYourNameconstant?.[localLang]?.max_char_allowed ||
          "Maximum 10 characters required",
      });
    } else {
      setNameV({ valid: true, error: "" });
    }
  };

  return (
    <>
      <img
        className={` ${styles.tablet_logo}`}
        src={appConfig?.appLogo}
        alt="Logo"
      />
      <div className={`${styles.profile_page}`}>
        <div className={`${styles.create_profile_page}`}>
          <h1>{CreateYourNameconstant[localLang].Create_Your_Profile}</h1>
          <p className={`${styles.sub_text}`}>
            {
              CreateYourNameconstant[localLang]
                .Create_upto_5_personalised_profiles_to_share_the_fun_with_those_who_live_with_you
            }
          </p>
          <form onSubmit={addProfileName}>
            <TextField
              fullWidth
              id="name"
              label={CreateYourNameconstant[localLang].Your_Profile_Name}
              name="name"
              margin="normal"
              autoFocus
              variant="outlined"
              sx={fromStyle}
              inputRef={nameRef}
              onBlur={handleChange}
              onFocus={() => setNameV({ valid: true, error: "" })}
              defaultValue={""}
              key="name"
              value={nameValue}
              onChange={handleChange}
            />
            <div className={` ${styles.valid_error} `}>{nameV.error}</div>
            <div className={`${styles.footer_actions}`}>
              <button
                type="submit"
                className={`${styles.btn} ${nameValue.length < 2 || nameValue.length > 10 || nameValue.trim() === "" ? styles.disabled : styles.enabled}`}
                disabled={
                  nameValue.length < 2 ||
                  nameValue.length > 10 ||
                  nameValue.trim() === ""
                }
              >
                {CreateYourNameconstant[localLang].Continue}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateYourName;
