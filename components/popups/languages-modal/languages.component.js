import { useState, useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { actions, useStore } from "@/store/store";
import styles from "@/components/popups/languages-modal/language.module.scss";
import usePostApiMutate from "@/hooks/usePostApidata";
import { getItem, setItem, setItemEnc } from "@/services/local-storage.service";
import { Languageconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import DisplayLanguage from "./displaylang.component";
const LanguageModal = ({
  onClose,
  additionalData,
  callback,
  hideContentDisplay,
}) => {
  const {
    state: { SystemConfig, userDetails, SystemFeature, localLang },
    dispatch,
  } = useStore();
  const [open, setOpen] = useState(true);
  const [Currentprofile, setCurrentprofile] = useState();
  const [allLang, setallLang] = useState([]);
  const [selectedLang, setSelectedLang] = useState([]);
  const { mutate: mutatePostData, data: apiResponse } = usePostApiMutate();
  const [profilesList, setProfileList] = useState([]);
  const [selectedType, setSelectedType] = useState(
    appConfig?.languages?.primary || "content"
  );
  const [showDisplayLang, setshowDisplayLang] = useState(true);
  useEffect(() => {
    if (!!additionalData) {
      if (additionalData.from == "createprofile") {
        let data = SystemConfig?.contentLanguages?.map((ele) => {
          return { isSelected: false, ...ele };
        });
        setallLang(data);
        setshowDisplayLang(false);
        setSelectedType("content");

        // setSelectedLang(data);
      } else if (
        additionalData.from == "updateprofile" ||
        additionalData.from == "settings"
      ) {
        setshowDisplayLang(false);
        setSelectedType("content");
        let lPartners = additionalData?.sLangs?.split(",");
        console.log(additionalData);
        if (lPartners) {
          let data = SystemConfig?.contentLanguages?.map((ele) => {
            return { isSelected: lPartners?.includes(ele.code), ...ele };
          });
          setallLang(data);
          setSelectedLang(data.filter((ele) => ele.isSelected == true));
        } else {
          defaultLang();
        }
      }
    } else if (!!userDetails) {
      setProfileList(userDetails.profileParentalDetails);
      if (userDetails.profileId) {
        let currentProfile = userDetails?.profileParentalDetails.filter(
          (ele) => ele.profileId === userDetails.profileId
        );
        setCurrentprofile(currentProfile);
        let lPartners = currentProfile[0].langs?.split(",");
        let data = SystemConfig?.contentLanguages?.map((ele) => {
          return { isSelected: lPartners?.includes(ele.code), ...ele };
        });
        setallLang(data);
        let isSelectedlang = data.filter((ele) => ele.isSelected == true);
        if (!!isSelectedlang && isSelectedlang.length > 0) {
          setSelectedLang(isSelectedlang);
        } else {
          defaultLang();
        }
      } else {
        defaultLang();
      }
    } else {
      defaultLang();
    }
  }, [SystemConfig, userDetails, open]);

  const defaultLang = () => {
    let localLang = getItem("ContentLanguages");
    if (!!localLang) {
      let lPartners = localLang?.split(",");
      let data = SystemConfig?.contentLanguages?.map((ele) => {
        return { isSelected: lPartners.includes(ele.code), ...ele };
      });
      setallLang(data);
      setSelectedLang(data.filter((ele) => ele.isSelected == true));
    } else {
      let data = SystemConfig?.contentLanguages?.map((ele) => {
        return { isSelected: true, ...ele };
      });
      setallLang(data);
      setSelectedLang(data);
    }
  };

  useEffect(() => {
    if (!!apiResponse?.data.status) {
      let langs = selectedLang.map((ele) => ele.code).join();
      setItem("ContentLanguages", langs);
      if (
        !!userDetails &&
        !!SystemFeature &&
        !!SystemFeature.userprofiles &&
        SystemFeature.userprofiles.fields.is_userprofiles_supported == "true"
      ) {
        let dd = profilesList.map((profile) => {
          if (profile.profileId == Currentprofile[0].profileId) {
            profile.langs = langs;
          }
          return profile;
        });
        userDetails.profileParentalDetails = dd;
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
        setItemEnc("uDetails", userDetails);
      }
      dispatch({ type: actions.PageRefresh, payload: true });
      LanguageModalClose();
    }
  }, [apiResponse]);

  const LanguageModalClose = () => {
    onClose();
  };

  const SelectAllLangs = () => {
    allLang.forEach((ele) => (ele.isSelected = true));
    setallLang([...allLang]);
    createSelectedLang();
  };

  const DeselectAllLangs = () => {
    allLang.forEach((ele) => (ele.isSelected = false));
    setallLang([...allLang]);
    createSelectedLang();
  };

  const handleToggle = (e, id) => {
    allLang.forEach((ele) => {
      if (ele.id == id) {
        ele.isSelected = !ele.isSelected;
      }
    });
    setallLang([...allLang]);
    createSelectedLang();
  };

  const createSelectedLang = () => {
    let sPartners = allLang.filter((ele) => ele.isSelected == true);
    setSelectedLang(sPartners);
  };

  const applyPreference = () => {
    if (
      !!additionalData &&
      (additionalData.from == "updateprofile" ||
        additionalData.from == "createprofile" ||
        additionalData.from == "settings")
    ) {
      callback(selectedLang.map((ele) => ele.code).join());
    } else if (
      !!userDetails &&
      !!SystemFeature &&
      !!SystemFeature.userprofiles &&
      SystemFeature.userprofiles.fields.is_userprofiles_supported == "true"
    ) {
      let url =
        process.env.initJson["api"] + "/service/api/auth/update/user/profile";
      let postData = {
        profileId: userDetails.profileId,
        profileName: Currentprofile[0].name,
        langs: selectedLang.map((ele) => ele.code).join(","),
        image: Currentprofile[0].imageUrl,
        isProfileLockActive: Currentprofile[0].isProfileLockActive,
        isChildren: Currentprofile[0].isChildren,
      };
      sendEvent("profile_language", {
        profile_language: selectedLang.map((ele) => ele.code).join(","),
        profile_children: Currentprofile[0].isChildren,
        profile_name: Currentprofile[0].name,
      });
      mutatePostData({ url, apiData: postData });
    } else {
      const payload = {
        selected_lang_codes: selectedLang.map((ele) => ele.code).join(),
      };
      let url =
        process.env.initJson["api"] +
        "/service/api/auth/update/session/preference";
      try {
        mutatePostData({ url, apiData: payload });
      } catch (e) {}
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={LanguageModalClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <div className={`${styles.language_modal}`}>
            <div className={`${styles.modal_popup}`}>
              <div className={`${styles.main_modal}`}>
                <div className={`${styles.modal_wrapper}`}>
                  <div className={`${styles.modal_content}`}>
                    <button
                      className={`${styles.close_icon}`}
                      onClick={LanguageModalClose}
                    >
                      <img
                        src={`${ImageConfig?.popup?.closeIcon}`}
                        alt="lang_close"
                      />
                    </button>
                    <div className={`${styles.modal_content_inner}`}>
                      <div className={`${styles.modal_header}`}>
                        <h2 className={`${styles.modal_title}`}>
                          {
                            Languageconstant[localLang]
                              .Choose_your_preferred_languages
                          }
                        </h2>
                        {selectedType === "content" && (
                          <div className={`${styles.modal_description}`}>
                            {
                              Languageconstant[localLang]
                                .This_will_help_us_to_suggest_you_relevant_content
                            }
                          </div>
                        )}
                        {selectedType === "display" && (
                          <div className={`${styles.modal_description}`}>
                            {
                              Languageconstant[localLang]
                                .This_will_enable_you_to_set_the_app_language
                            }
                          </div>
                        )}
                        {selectedLang?.length == 0 && (
                          <div
                            className={`${styles.error_msg} ${styles.mobile}`}
                          >
                            {
                              Languageconstant[localLang]
                                .Please_Select_atleast_one_Language
                            }
                          </div>
                        )}
                        {!!appConfig?.languages?.isContentandDisplay &&
                          appConfig?.languages?.isselectcpDiplay &&
                          !hideContentDisplay &&
                          showDisplayLang && (
                            <div className={`${styles.language_toggle}`}>
                              <div className={`${styles.toggle}`}>
                                {Languageconstant[
                                  localLang
                                ]?.Toggle_fields?.map((toggletext, index) => (
                                  <div
                                    key={index}
                                    className={`${styles.toggle_child} ${selectedType === toggletext.code ? styles.active : ""}`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedType(toggletext.code)
                                      }
                                    >
                                      {" "}
                                      {toggletext.displayText}{" "}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                      {showDisplayLang && selectedType === "display" ? (
                        <DisplayLanguage allLang={allLang} onClose={onClose} />
                      ) : (
                        selectedType === "content" && (
                          <>
                            <div className={`${styles.select_clear_button}`}>
                              <button
                                className={`${styles.button}`}
                                onClick={SelectAllLangs}
                              >
                                {Languageconstant[localLang].Select_all}
                              </button>
                              <span>|</span>
                              <button
                                className={`${styles.button}`}
                                onClick={DeselectAllLangs}
                              >
                                {Languageconstant[localLang].Clear_all}
                              </button>
                            </div>
                            <div className={`${styles.select_language}`}>
                              <ul>
                                {allLang?.map((lang) => (
                                  <li key={lang.id}>
                                    <label
                                      className={`${styles.custom_language}`}
                                    >
                                      <span
                                        className={`${styles.language_maintext}`}
                                      >
                                        {lang.name}
                                      </span>
                                      <span
                                        className={`${styles.language_subtext}`}
                                      >
                                        {lang.displayText}
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={lang.isSelected}
                                        onChange={(e) =>
                                          handleToggle(e, lang.id)
                                        }
                                      />
                                      <span
                                        className={`${styles.checkmark}`}
                                      ></span>
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <ul>
                                {/* <li>
                            <button
                              className={`${styles.cancelbtn}`}
                              onClick={LanguageModalClose}
                            >
                             {Languageconstant[localLang].Cancel}
                            </button>
                          </li> */}
                                <li>
                                  <button
                                    className={
                                      selectedLang?.length !== 0
                                        ? `${styles.applybtn} primary`
                                        : `${styles.applybtn} ${styles.no_language_selected} primary`
                                    }
                                    onClick={applyPreference}
                                    disabled={selectedLang?.length == 0}
                                  >
                                    {Languageconstant[localLang].Apply}
                                  </button>
                                </li>
                              </ul>
                            </div>
                            <br />
                            {selectedLang?.length == 0 && (
                              <div className={`${styles.error_msg}`}>
                                {
                                  Languageconstant[localLang]
                                    .Please_Select_atleast_one_Language
                                }
                              </div>
                            )}
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LanguageModal;
