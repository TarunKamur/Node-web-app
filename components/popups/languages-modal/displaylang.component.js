import React, { useEffect, useState } from "react";
import styles from "@/components/popups/languages-modal/displaylang.module.scss";
import { DisplayLanguageConstant } from "@/.i18n/locale";
import { setItem, setNookie } from "@/services/local-storage.service";
import { actions, useStore } from "@/store/store";
import { getNewConfigdata } from "@/services/user.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { sendEvent } from "@/services/analytics.service";

const DisplayLanguage = ({ onClose }) => {
  const {
    state: { localLang },
    dispatch,
  } = useStore();
  const { mutate: mutatePostData, data: apiResponse } = usePostApiMutate();
  const [selectedLanguage, setSelectedLanguage] = useState(localLang);

  const handleDisplayLanguage = () => {
    let selectedlangName = DisplayLanguageConstant[
      selectedLanguage
    ].Display_languages.filter((val) => val.code == selectedLanguage);
    const payload = {
      display_lang_code: selectedLanguage.toUpperCase(),
    };
    setItem("langchanged",true);
    sendEvent("Language_Selected", {
      Language_code: payload.display_lang_code,
      Language_name: selectedlangName[0].name,
    });
    let url =
      process.env.initJson["api"] +
      "/service/api/auth/update/session/preference";
    try {
      mutatePostData({ url, apiData: payload });
    } catch (e) {}
  };

  useEffect(() => {
    (async () => {
      if (!!apiResponse?.data?.status) {
        setNookie("userLanguage", selectedLanguage);
        setItem("userLanguage", selectedLanguage);
        dispatch({
          type: actions.LocalLang,
          payload: selectedLanguage.toLowerCase(),
        });
        let _SC = await getNewConfigdata();
        if (!!_SC) dispatch({ type: actions.SystemConfig, payload: _SC });
        onClose();
      }
    })();
  }, [apiResponse]);
  const displayLanguageClose = () => {
    onClose();
  };

  return (
    <>
      <div className={`${styles.select_displaylang}`}>
        <ul className={`${styles.language_row}`}>
          {DisplayLanguageConstant?.[localLang]?.Display_languages?.map(
            (lang, index) => (
              <li key={index} className={`${styles.lang_item}`}>
                <label className={`${styles.language_control}`}>
                  <span className={`${styles.lang_text}`}>{lang.name}</span>
                  {selectedLanguage === lang.code ? (
                    <span className={`${styles.global_text}`}>
                      {
                        DisplayLanguageConstant?.[selectedLanguage]
                          ?.Selected_lang_text
                      }
                    </span>
                  ) : (
                    <span className={`${styles.global_text}`}>
                      {lang.displayText}
                    </span>
                  )}
                  <input
                    type="radio"
                    name="radio"
                    onClick={() => setSelectedLanguage(lang.code)}
                    checked={selectedLanguage === lang.code}
                  />
                  <div className={`${styles.indicator}`}></div>
                </label>
              </li>
            )
          )}
        </ul>
      </div>
      <div>
        <ul className={`${styles.displayLanguageactions}`}>
          <li className={`${styles.actions_btns}`}>
            <button
              className={`${styles.cancelbtn} grey`}
              onClick={() => displayLanguageClose()}
            >
              {DisplayLanguageConstant?.[localLang].Cancel}
            </button>
          </li>
          <li className={`${styles.actions_btns}`}>
            <button
              className={`${styles.applybtn} primary`}
              onClick={() => handleDisplayLanguage()}
            >
              {DisplayLanguageConstant?.[localLang].Apply}
            </button>
          </li>
          <li className={`${styles.actions_btns} ${styles.mobile}`}>
            <button
              className={`${styles.applybtn} primary`}
              onClick={() => handleDisplayLanguage()}
            >
              {DisplayLanguageConstant?.[localLang].Continue}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default DisplayLanguage;
