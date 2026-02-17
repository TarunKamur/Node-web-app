import {
  Dialog,
  DialogTitle,
  DialogActions,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  styled,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "@/components/contentpartnerpopup/ContentPartner.module.scss";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { contentPartnerConstant } from "@/.i18n/locale";

const StyledDialog = styled(Dialog)(({}) => ({
  "& .MuiPaper-root": {
    margin: "0px 20px",
  },
}));
export default function ContetPartnerPopup({ popupData }) {
  const {
    state: { SystemLanguages, localLang },
  } = useStore();
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });
  const [multilang, setmultilang] = useState(
    JSON.parse(SystemLanguages[localLang].cpPopupText)
  );
  const [checked, setChecked] = useState(false);

  const handleCheckboxClick = () => {
    setChecked(!checked);
  };
  useEffect(() => {
    let multilangTemp = JSON.parse(SystemLanguages[localLang].cpPopupText);
    multilangTemp.webtitle = multilang.webtitle.replace(
      "[App Name]",
      `<strong>${popupData.networkId}</strong>`
    );
    setmultilang(multilangTemp);
  }, [localLang]);

  const handleClick = (type) => {
    if (type === "checkbox") {
      setChecked(!checked);
    } else if (type == "cancel") {
      popupData.sendData({
        networkCode: popupData.networkId,
        showNotification: !!checked ? "false" : "true",
      });
    } else {
      popupData.sendData({
        networkCode: popupData.networkId,
        showNotification: !!checked ? "false" : "true",
      });
      if (type === "proceed") {
        popupData.navigateTo();
      }
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <StyledDialog
        open={popupData.isActive ? popupData.isActive : false}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className={`${styles.modal_size}`}>
          <div className={`${styles.modal_inner}`}>
            <div className={`${styles.modal_content}`}>
              <div className={`${styles.image_container}`}>
                <img alt="partnerIcon" src={popupData.topImgValue} />
              </div>
              <div className={`${styles.msg1_container}`}>
                <p
                  dangerouslySetInnerHTML={{ __html: multilang.webtitle }}
                  className={`${styles.message}`}
                >
                  {/* {multilang?.webtitle} */}
                </p>
              </div>
              <div className={`${styles.msg2_container}`}>
                <p className={`${styles.message}`}>{multilang?.websubtitle}</p>
              </div>
              <div className={`${styles.checkbox_container}`}>
                <div
                  className={`${styles.check_box}`}
                  onClick={handleCheckboxClick}
                >
                  <label className={`${checked && styles.checked}`} />
                  <input type="checkbox" />
                </div>
                <p className={styles.check_box_text}>{multilang?.check}</p>
              </div>
            </div>
            <div className={`${styles.modal_buttons}`}>
              <button
                className={`${styles.modal_button}`}
                onClick={() => handleClick("cancel")}
              >
                {" "}
                {contentPartnerConstant[localLang]?.Cancel}{" "}
              </button>
              <button
                className={`${styles.modal_button} ${styles.primary}`}
                onClick={() => handleClick("proceed")}
              >
                {contentPartnerConstant[localLang]?.proceed}
              </button>
            </div>
          </div>
        </div>
      </StyledDialog>
    </ThemeProvider>
  );
}
