/*{
  type: "signin",
  isActive : true,
  title1 : "To access this feature please sign in",
  yesButton1 : "SignUp", 
  yesButtonTarget1 : navigateToSignup,
  yesButtonType:"primary",
  noButton1  : "SignIn",
  noButtontarget1 : navigateToSignIn,
  noButtonType:"secondary",
  close : false,
  closeTarget : handleClose
}*/

import {
  Dialog,
  DialogTitle,
  DialogActions,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "@/components/popups/generic/popup-modal.module.scss";

export default function PopupModal({ popupData }) {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const handleClose = () => {
    popupData.closeTarget();
  };

  const yesButtonTarget1 = () => {
    popupData.yesButtonTarget1();
  };

  const noButtontarget1 = () => {
    popupData.noButtontarget1();
  };

  const handleDialog = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        className={`popup_modal ${styles.popup_modal}`}
        open={popupData.isActive ? popupData.isActive : false}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClick={(e) => handleDialog(e)}
      >
        <div
          className={`${styles.modal_size} ${styles[popupData?.parentclassName]}`}
        >
          <CssBaseline>
            <div className={`${styles.title}`}>
              {popupData.close && (
                <CloseIcon
                  className={`${styles.cross_icon}`}
                  onClick={handleClose}
                ></CloseIcon>
              )}
              {popupData.topImg && popupData.topImgValue && (
                <div className={`${styles.popup_topImg}`}>
                  <img src={popupData.topImgValue} alt="" />
                </div>
              )}
              <div className={`${styles.popup_title}`}>
                <h2>{popupData.title1}</h2>
              </div>
              {popupData.title2 && (
                <div className={`${styles.popup_title2} ${styles.sub}`}>
                  <h3>{popupData.title2}</h3>
                </div>
              )}
              {
                <div className={`${styles.subtitle1}`}>
                  {popupData.subtitle1?.map((ele, index) => {
                    return (
                      <div className={`${styles.delActpoints}`}>
                        {index + 1}.<span>{ele}</span>
                      </div>
                    );
                  })}
                </div>
              }
            </div>
            <div
              className={`${styles.btn} ${popupData.subtitle1?.length > 0 ? styles.deleteAccountBtn : ""}`}
            >
              {popupData.noButton1 && (
                <button
                  className={`${!!popupData.noButtonType ? popupData.noButtonType : "secondary"} ${styles.cancel}`}
                  onClick={noButtontarget1}
                >
                  {popupData.noButton1}
                </button>
              )}
              {popupData.yesButton1 && (
                <button
                  className={`${!!popupData.yesButtonType ? popupData.yesButtonType : "primary"}  ${styles.continue_btn} `}
                  onClick={yesButtonTarget1}
                >
                  {popupData.yesButton1}
                </button>
              )}
            </div>
          </CssBaseline>
        </div>
      </Dialog>
    </ThemeProvider>
  );
}
