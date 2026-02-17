import styles from "@/components/settings/video-quality.module.scss";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect, useState } from "react";
import { VideoQualityconstant } from "@/.i18n/locale";
import { getItem, setItem } from "@/services/local-storage.service";
import { useStore } from "@/store/store";
const VideoQuality = ({ pagePath, qualityOptions }) => {
  const scprops = {
    border: "none",
    backgroundColor: "#222",
    boxShadow: "none",
  };
  const [selectedQuality, setSelectedQuality] = useState(!!getItem("selectedBitRate") ? getItem("selectedBitRate") : 'Auto');
  const { state: { localLang },} = useStore();

  const handleQualityChange = (quality) => {
    setItem('selectedBitRate',quality);
    setSelectedQuality(quality);
  };
  return (
    <>
      <Accordion sx={scprops} className={`${styles.videoquality_mobile}`}>
        <AccordionSummary
          className={`${styles.account_info} `}
          expandIcon={<ExpandMoreIcon className={`${styles.arrow}`} />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <div className={`${styles.info_heading}`}>{VideoQualityconstant[localLang].Video_Quality}</div>
        </AccordionSummary>
        <AccordionDetails className={`${styles.user_details}`}>
          <div className={styles.form_group}>
            <div className={styles.quality_list}>
              {qualityOptions?.map((quality) => (
                <label key={quality.code}>
                  <input
                    type="radio"
                    name="videoQuality"
                    className={`${styles.radio} ${selectedQuality === quality.displayTitle ? styles.selected : ''}`}
                    onChange={() => handleQualityChange(quality.displayTitle)}
                  />
                  <span className={styles.sm_label}>{quality.displayTitle}</span>
                  <span className={styles.check_radio}></span>
                </label>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default VideoQuality;
