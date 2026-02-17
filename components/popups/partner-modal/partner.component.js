import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import styles from "@/components/popups/languages-modal/language.module.scss";

import { actions, useStore } from "@/store/store";
import { getAbsolutePath } from "@/services/user.service";
import { getItem, setItem } from "@/services/local-storage.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { Partnerconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import Image from "next/image";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
const PartnerModel = ({ onClose }) => {
  const {
    state: { SystemConfig, userDetails, localLang },
    dispatch,
  } = useStore();
  const [open, setOpen] = useState(true);
  const [allPartners, setallPartners] = useState([]);
  const [selectedPartners, setSelectedPartners] = useState([]);
  const { mutate: mutatePostData, data: apiResponse } = usePostApiMutate();
  useEffect(() => {
    let localPartners = getItem("networks");
    if (!!localPartners) {
      let lPartners = localPartners.split(",");
      let data = SystemConfig.networks.map((ele) => {
        return { isSelected: lPartners.includes(ele.code), ...ele };
      });
      setallPartners(data);
      setSelectedPartners(data.filter((ele) => ele.isSelected == true));
    } else {
      let data = SystemConfig?.networks?.map((ele) => {
        return { isSelected: true, ...ele };
      });
      setallPartners(data);
      setSelectedPartners(data);
    }
  }, [SystemConfig, open]);

  useEffect(() => {
    if (!!apiResponse) {
      let selectedPartnersString = selectedPartners
        .map((ele) => ele.code)
        .join();
      setItem("networks", selectedPartnersString);
      sendEvent("filter_channel_partner_select", {
        channel_partner: selectedPartnersString,
      });
      dispatch({ type: actions.PageRefresh, payload: true });
      PartnerModalClose();
    }
  }, [apiResponse]);

  const PartnerModalClose = () => {
    onClose();
  };

  const SelectAllLangs = () => {
    allPartners.forEach((ele) => (ele.isSelected = true));
    setallPartners([...allPartners]);
    createSelectedPartners();
  };

  const DeselectAllLangs = () => {
    allPartners.forEach((ele) => (ele.isSelected = false));
    setallPartners([...allPartners]);
    createSelectedPartners();
  };

  const handleToggle = (e, id) => {
    allPartners.forEach((ele) => {
      if (ele.id == id) {
        ele.isSelected = !ele.isSelected;
      }
    });
    setallPartners([...allPartners]);
    createSelectedPartners();
  };

  const createSelectedPartners = () => {
    let sPartners = allPartners.filter((ele) => ele.isSelected == true);
    setSelectedPartners(sPartners);
  };

  function getImagePath(path) {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  }

  const applyPreference = () => {
    const payload = {
      networks: selectedPartners.map((ele) => ele.code).join(),
    };
    let url =
      process.env.initJson["api"] +
      "/service/api/auth/update/session/preference";
    try {
      mutatePostData({ url, apiData: payload });
    } catch (e) {}
  };

  const loaderProp = ({ src }) => {
    return src;
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={PartnerModalClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <div className={`${styles.language_modal}`}>
            <div className={`${styles.modal_popup}`}>
              <div className={`${styles.main_modal} ${styles.partners}`}>
                <div className={`${styles.modal_wrapper}`}>
                  <div className={`${styles.modal_content}`}>
                    <button
                      className={`${styles.close_icon}`}
                      onClick={PartnerModalClose}
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
                            Partnerconstant[localLang]
                              .Choose_our_content_partners
                          }
                        </h2>
                        <div className={`${styles.modal_description}`}>
                          {
                            Partnerconstant[localLang]
                              .This_will_help_us_to_suggest_you_relevant_content
                          }
                        </div>
                      </div>
                      <div className={`${styles.select_clear_button}`}>
                        <button
                          className={`${styles.button}`}
                          onClick={SelectAllLangs}
                        >
                          {Partnerconstant[localLang].Select_all}
                        </button>
                        <span>|</span>
                        <button
                          className={`${styles.button}`}
                          onClick={DeselectAllLangs}
                        >
                          {Partnerconstant[localLang].Clear_all}
                        </button>
                      </div>
                      <div className={`${styles.select_partners}`}>
                        <h5> {Partnerconstant[localLang].OTT_Channels}</h5>
                        <ul>
                          {allPartners?.map((part) => (
                            <li>
                              <label
                                key={part.id}
                                className={`${styles.custom_partner}`}
                              >
                                <Image
                                  src={getImagePath(part.iconUrl)}
                                  alt="image"
                                  title="image"
                                  loader={loaderProp}
                                  fill
                                />
                                <input
                                  checked={part.isSelected}
                                  type="checkbox"
                                  onChange={(e) => handleToggle(e, part.id)}
                                />
                                <span className={`${styles.checkmark}`}></span>
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
                              onClick={PartnerModalClose}
                            >
                              Cancel
                            </button>
                          </li> */}
                          <li>
                            <button
                              onClick={applyPreference}
                              disabled={selectedPartners?.length == 0}
                              className={
                                selectedPartners?.length !== 0
                                  ? `${styles.applybtn}`
                                  : `${styles.applybtn} ${styles.no_language_selected}`
                              }
                            >
                              {Partnerconstant[localLang].Apply_Filters}
                            </button>
                          </li>
                        </ul>
                      </div>
                      {selectedPartners?.length == 0 && (
                        <div className={`${styles.error}`}>
                          {
                            Partnerconstant[localLang]
                              .Please_Select_atleast_one_Content_Parther
                          }
                        </div>
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

export default PartnerModel;
