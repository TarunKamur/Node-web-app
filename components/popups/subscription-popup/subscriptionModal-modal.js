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
import styles from "@/components/popups/subscription-popup/subscription-modal.module.scss";

export default function SubscrptionModal({ popupData }) {
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

  const yesButtonTarget2 = () => {
    popupData.yesButtonTarget2();
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
        className={`subscription_modal_dialog ${styles.modal_dialog}`}
        open={popupData.isActive ? popupData.isActive : false}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClick={(e) => handleDialog(e)}
      >
        <div className={`${styles.modal_size} `}>
          <CssBaseline>
            <div className={`${styles.title}`}>
              <CloseIcon
                className={`${styles.cross_icon}`}
                onClick={handleClose}
              ></CloseIcon>
              <DialogTitle>
                {(popupData.successImg || popupData.failureImg) && (
                  <div className={`${styles.imgBlock}`}>
                    {popupData.failureImg && (
                      <img src="http://mobond.yuppcdn.net/cf1/static/slt/images/payment-failure.svg" />
                    )}
                    {popupData.successImg && (
                      <img src="http://mobond.yuppcdn.net/cf1/static/slt/images/payment-success-icon.svg" />
                    )}
                  </div>
                )}
                {popupData.topImg && (
                  <div className={styles.topImgContainer}>
                    <img
                      src={popupData.topImgValue}
                      className={styles.topImg}
                    />
                  </div>
                )}
                <div className={`${styles.popup_title}`}>
                  <Typography variant="h5">{popupData.title1}</Typography>
                </div>
              </DialogTitle>
            </div>
            {(!!popupData.warning || !!popupData.Des) && (
              <div className={`${styles.popupText}`}>
                {!!popupData.warning && (
                  <p className={styles.warning}>{popupData.warning}</p>
                )}
                {!!popupData?.Des && (
                  <p className={styles.Des}>{popupData?.Des}</p>
                )}
              </div>
            )}
            {!!popupData.subTitle && (
              <h6 className={`${styles.subTitle}`}>{popupData.subTitle}</h6>
            )}
            <div className={`${styles.btn}`}>
              <DialogActions className={`${styles.btn_inner}`}>
                {popupData.noButton1 && (
                  <button
                    className={`grey ${styles.cancel} ${popupData.noButtonType}`}
                    onClick={noButtontarget1}
                  >
                    {popupData.noButton1}
                  </button>
                )}
                {popupData.yesButton1 && (
                  <button
                    className={`${styles.continue_btn} ${popupData.yesButtonType}`}
                    onClick={yesButtonTarget1}
                  >
                    {popupData.yesButton1}
                  </button>
                )}
                {popupData.yesButton2 && (
                  <button
                    className={`${styles.continue_btn} ${popupData.yesButtonType} ${styles.ok}`}
                    onClick={yesButtonTarget2}
                  >
                    {popupData.yesButton2}
                  </button>
                )}
              </DialogActions>
            </div>
          </CssBaseline>
        </div>
      </Dialog>
    </ThemeProvider>
  );
}
