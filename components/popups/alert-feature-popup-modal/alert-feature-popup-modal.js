import React, { useEffect, useState } from "react";
import styles from "@/components/popups/alert-feature-popup-modal/alert-feature-popup-modal.module.scss";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";

const AlertFeaturePopup = ({ popupData }) => {
  const [closePopUp, setclosePopUp] = useState(false);
  const [width, setWidth] = useState(null);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      // console.log(screenWidth);
      setWidth(screenWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const closeTarget = (carryMethod, data = "") => {
    carryMethod(data);
  };

  const handleClose = () => {
    closeTarget(popupData.closeTarget);
    setclosePopUp(true);
  };

  const handleDialog = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div>
      <ThemeProvider theme={darkTheme}>
        <Dialog
          open={popupData?.isActive ? popupData?.isActive : false}
          onClose={handleClose}
          className={`${popupData?.parentclassName}  ${closePopUp && "closePopUp"}`}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          onClick={(e) => handleDialog(e)}
          PaperProps={{
            className: styles[popupData?.parentclassName],
          }}
        >
          <div className={`${styles.container}`}>
            <div>
              {popupData?.icon && (
                <img
                  src={popupData?.icon}
                  alt="swag-icon"
                  className={styles.swagIcon}
                />
              )}
              <p className={styles.label}>
                {popupData?.labelIcon && (
                  <img src={popupData?.labelIcon} alt="king-core" />
                )}
                {popupData?.label}
              </p>
            </div>
            <div>
              <h4 className={styles.title1}>{popupData?.title1}</h4>
              <p className={styles.text1}>{popupData?.text1}</p>
            </div>

            <div className={styles.closeBtn}>
              <p onClick={handleClose}>{popupData?.noButton1}</p>
            </div>
          </div>
        </Dialog>
      </ThemeProvider>
    </div>
  );
};

export default AlertFeaturePopup;

// Required
// import AlertFeaturePopup from "@/components/popups/alert-feature-popup-modal/alert-feature-popup-modal";
// import { ImageConfig } from "@/config/ImageConfig";
// import React, { useEffect, useState } from "react";
// import { alertFeaturePopupConstant } from "@/.i18n/locale";
// import { useStore } from "@/store/store";

// const Thunder = () => {
//   const {
//     state: { localLang },
//   } = useStore();
//   const [popUpData, setPopUpData] = useState({});
//   const [width, setWidth] = useState(null);

//   useEffect(() => {
//     const handleResize = () => {
//       const screenWidth = window.innerWidth;
//       // console.log(screenWidth);
//       setWidth(screenWidth);
//     };

//     handleResize();

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   const handleClose = () => {
//     setPopUpData({});
//   };

//   const swagPopUpSet = () => {
//     const pop = {
//       isActive: true,
//       closeTarget: handleClose,
//       //   icon: ImageConfig?.swagPopUp?.swagIcon,
//       icon: ImageConfig?.popup?.swagIconPink,
//       label: alertFeaturePopupConstant[localLang]?.Swag,
//       title1: alertFeaturePopupConstant[localLang]?.Try_Our_New_Feature,
//       text1: alertFeaturePopupConstant[localLang]?.Swag_Text,
//       noButton1: alertFeaturePopupConstant[localLang]?.Close,
//       parentclassName: "swagPopUp",
//     };

//     if (width < 991) {
//       setPopUpData(pop);
//     } else {
//       setPopUpData({});
//     }
//   };

//   const rentPopUpSet = () => {
//     const pop = {
//       isActive: true,
//       closeTarget: handleClose,
//       label: alertFeaturePopupConstant[localLang]?.Rent,
//       title1:
//         alertFeaturePopupConstant[localLang]
//           ?.Rent_Now_To_Watch_Exclusive_content,
//       text1: alertFeaturePopupConstant[localLang]?.Rent_Text,
//       noButton1: alertFeaturePopupConstant[localLang]?.Close,
//       parentclassName: "rentPopUp",
//     };

//     if (width < 991) {
//       setPopUpData(pop);
//     } else {
//       setPopUpData({});
//     }
//   };

//   const subscribePopUpSet = () => {
//     const pop = {
//       isActive: true,
//       closeTarget: handleClose,
//       label: alertFeaturePopupConstant[localLang]?.Subscribe,
//       labelIcon: ImageConfig?.card?.kingCore,
//       title1:
//         alertFeaturePopupConstant[localLang]
//           ?.Rent_Now_To_Watch_Exclusive_content,
//       text1: alertFeaturePopupConstant[localLang]?.Subscribe_Text,
//       noButton1: alertFeaturePopupConstant[localLang]?.Close,
//       parentclassName: "subscribePopUp",
//     };

//     if (width < 991) {
//       setPopUpData(pop);
//     } else {
//       setPopUpData({});
//     }
//   };

//   return (
//     <div style={{ marginTop: width > 991 ? "100px" : "0px" , padding : "20px"}}>
//       <h4 onClick={swagPopUpSet}>swag</h4>
//       <h4 onClick={rentPopUpSet}>Rent</h4>
//       <h4 onClick={subscribePopUpSet}>Subscribe</h4>
//       <AlertFeaturePopup popupData={popUpData} />
//     </div>
//   );
// };

// export default Thunder;
