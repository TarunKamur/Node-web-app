import { useCallback, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import styles from "./tvguidefiters.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import Tvguidefilter from "./tvguidefilter/tvguidefilter.component";
import { useRouter } from "next/router";
import { Tvguideconstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";

const TvGuideFilterModal = ({ tvguidefilters, closeFilterModal }) => {
  // const [open, setOpen] = useState(true);

  const [selectedFilterData, setSelectedFilterData] = useState({});
  const [disableapply, setDisableapply] = useState(false);
  const router = useRouter();
  const {
    state: { localLang },
    dispatch,
  } = useStore();
  useMemo(() => {
    if (Object.keys(selectedFilterData).length === 0) {
      setDisableapply(true);
    } else if (Object.keys(selectedFilterData).length > 0) {
      let isEmpty = true;
      Object.keys(selectedFilterData).map((key, index) => {
        if (selectedFilterData[key]?.length > 0) {
          isEmpty = false;
        }
      });
      if (isEmpty === true) {
        setDisableapply(true);
      } else {
        setDisableapply(false);
      }
    } else {
      setDisableapply(false);
    }
  }, [selectedFilterData]);

  const handleselectedFiltersData = (filters, filterCode) => {
    let selectedfilters = filters.filter((filter) => {
      return filter.isSelected;
    });
    setSelectedFilterData((selectedFilterData) => ({
      ...selectedFilterData,
      [filterCode]: selectedfilters,
    }));
  };

  const handleApply = () => {
    let filter_param = "";
    Object.keys(selectedFilterData).map((key, index) => {
      let codes = [];
      selectedFilterData[key]?.map((filter) => {
        codes.push(filter.code);
      });
      if (codes.length > 0)
        filter_param = filter_param + `${key}:${codes.join(",")};`;
    });
    if (!filter_param) {
      return;
    }
    filter_param = encodeURI(filter_param);
    modalClose();
    router.push(`/tvguide/?filter=${filter_param}`);
  };

  const modalClose = () => {
    closeFilterModal();
  };

  return (
    <div>
      <Dialog
        open={true}
        onClose={modalClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <div className={`${styles.guidefilter_modal}`}>
            <div className={`${styles.modal_popup}`}>
              <div className={`${styles.main_modal}`}>
                <div className={`${styles.modal_wrapper}`}>
                  <div className={`${styles.modal_content}`}>
                    <button
                      className={`${styles.close_icon}`}
                      onClick={modalClose}
                    >
                      <img
                        src={`${ImageConfig?.popup?.closeIcon}`}
                        alt="lang_close"
                      />
                    </button>
                    <div className={`${styles.modal_content_inner}`}>
                      <div className={`${styles.modal_header}`}>
                        <h1 className={`${styles.modal_title}`}>
                          {Tvguideconstant[localLang].apply_filters}
                        </h1>
                        <p className={`${styles.modal_description}`}>
                          {Tvguideconstant[localLang].select_genres_and} /{" "}
                          {Tvguideconstant[localLang].languages_from_below}
                        </p>
                      </div>
                      {tvguidefilters?.map((guidefilter, index) => {
                        return (
                          <Tvguidefilter
                            guidefilter={guidefilter}
                            handleselectedFiltersData={
                              handleselectedFiltersData
                            }
                            key={index}
                          />
                        );
                      })}
                      <div className={`${styles.modal_footer}`}>
                        <div className={`${styles.modal_footer_btns}`}>
                          {/* <button
                            className={`${styles.btn}`}
                            onClick={modalClose}
                          >
                            {Tvguideconstant[localLang].Cancel}
                          </button> */}
                          <button
                            className={`${styles.btn}`}
                            onClick={handleApply}
                            disabled={disableapply}
                            // disabled={languageState.selectedCount === 0}
                          >
                            {Tvguideconstant[localLang].apply}
                          </button>
                        </div>
                        {disableapply && (
                          <p className={`${styles.modal_error_text}`}>
                            {
                              Tvguideconstant[localLang]
                                .please_select_at_least_one_language
                            }
                          </p>
                        )}
                      </div>
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

export default TvGuideFilterModal;
