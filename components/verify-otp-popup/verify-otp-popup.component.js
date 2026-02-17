import {
  CssBaseline,
  Dialog,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "@/components/verify-otp-popup/verify-otp-popup.module.scss";
import { actions, useStore } from "@/store/store";
import OtpVerify from "../otpVerify/otpVerify.component";
const VerifyOtpPopup = ({ otpData, returnBack, isOpen }) => {
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const closePopup = () => {
    returnBack();
  };

  const callbacksuccess=(data)=>{
    userDetails.isEmailVerified = true;
    dispatch({ type: actions.userDetails, payload: { ...userDetails } });
    dispatch({
      type: actions.NotificationBar,
      payload: { message: data?.message },
    });
    // setOtpData();
    dispatch({ type: actions.PageRefresh, payload: true });
    closePopup();
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        open={isOpen}         
      >
        <div className={`${styles.modal_parent}`}>
          <div className={`${styles.modal_popup}`}>
            <div className={`${styles.main_modal}`}>
              <div className={`${styles.modal_size}`}>
                <CssBaseline>
                  <div className={`${styles.title}`}>
                    <CloseIcon
                      className={`${styles.cross_icon}`}
                      onClick={closePopup}
                    ></CloseIcon>                  
                  </div>
                  <div>
                    <div className={`${styles.updateEmail_cont}`}>
                    {  !!otpData &&
                        <OtpVerify otpData ={otpData} callbacksuccess={callbacksuccess} returnBack={returnBack}></OtpVerify>                      
                      }
                    </div>

                  </div>
                </CssBaseline>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </ThemeProvider>
  );
};

export default VerifyOtpPopup;
