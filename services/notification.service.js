// let notificData = {
//   message: "RVCJ Media Successfully Unfollow.",
//   code: "freedom_tv",
// };
// let windowWidth = window.innerWidth;
// if (windowWidth <= 991) {
//   notificData = {
//     message: "RVCJ Media Successfully Unfollow.",
//     code: "freedom_tv", //based on freedom_tv code style apply
//     imgStatus: ImageConfig?.payments?.subscriptionSuccessful, // to show img icon
//   };
// }

// dispatch({
//   type: actions.NotificationBar,
//   payload: notificData,
// });
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import { actions, useStore } from "@/store/store";
import { useEffect, useState, useRef } from "react";
import { styled } from "@mui/material";

const StyledSnackBar = styled(Snackbar)(() => ({
  "&.MuiSnackbar-root": {
    background: "#3C3C3C",
    padding: "18px 23px !important",
    border: " 1px solid #333",
    borderRadius: "8px",
    ".MuiSnackbarContent-root": {
      padding: "0",
      background: "#222",
      boxShadow: "none !important",
      ".MuiSnackbarContent-message": {
        padding: "0",
        fontSize: "18px",
        fontFamily: "Poppins, sans-serif",
      },
    },
  },
  "@media (max-width: 480px)": {
    "&.MuiSnackbar-root": {
      width: "fit-content",
      maxWidth: "80%",
      padding: "12px !important",
      textAlign: "center",
      left: "5%",
      right: "5%",
      bottom: "50px",
      margin: "0 auto",
      fontSize: "12px",
      color: "#FFFFFF",
      height: "fit-content",
    },
    ".MuiSnackbarContent-message": {
      fontSize: "15px !important",
    },
  },
  "@media (min-width: 480px)": {
    "&.MuiSnackbar-root": {
      width: "fit-content",
      height: "fit-content",
      padding: "12px !important",
      textAlign: "center",
      right: "5%",
      top: "40px",
      background: "#262626",
      margin: "0 auto",
      fontSize: "12px",
      color: "#FFFFFF",
    },
    ".MuiSnackbarContent-message": {
      fontSize: "15px !important",
    },
  },
}));

export default function PositionedNotificationbar() {
  const {
    state: { NotificationBar },
    dispatch,
  } = useStore();
  const [open, setOpenState] = useState(false);
  const [className, setClassName] = useState("");
  const [message, setMessage] = useState("");
  const timeoutRef = useRef(null);
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    if (NotificationBar) {
      setOpenState(true);
      setMessage(NotificationBar.message);
      clearTimeout(timeoutRef.current);
      if (NotificationBar?.code == "freedom_tv") setClassName("freedom_tv");
      if (!!NotificationBar?.imgStatus) {
        let imgSet = NotificationBar?.imgStatus;
        setTimeout(() => {
          const notificationBarElement = document.getElementById(
            "PositionedNotificationbar"
          );
          if (notificationBarElement) {
            if (!notificationBarElement.querySelector(".notification-img")) {
              const img = document.createElement("img");
              img.src = imgSet;
              img.alt = NotificationBar?.status;

              img.style.width = "22px";
              img.style.marginRight = "10px";
              img.classList.add("notification-img");

              notificationBarElement.insertBefore(
                img,
                notificationBarElement.firstChild
              );
            }
          }
        }, 1);
      }
      setIcon(NotificationBar?.icon || null);
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: actions.NotificationBar, payload: null });
      }, NotificationBar.duration || 5000);
    } else {
      setOpenState(false);
      setMessage(null);
      setIcon(null);
      clearTimeout(timeoutRef.current);
    }
  }, [NotificationBar]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Box sx={{ fontSize: "48px", fontWeight: "bold" }}>
      {/* <StyledSnackBar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={open}
        message={message}
        id="PositionedNotificationbar"
        className={`PositionedNotificationbar  ${className}`}
        key={{ vertical: "bottom", horizontal: "right" }}
      /> */}
      {open && (
        <StyledSnackBar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={open}
          message={
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {icon && (
                <img
                  src={icon}
                  alt="notification-icon"
                  style={{ width: 24, height: 24 }}
                />
              )}
              <span>{message}</span>
            </Box>
          }
          className="PositionedNotificationbar"
          key={{ vertical: "bottom", horizontal: "right" }}
        />
      )}
    </Box>
  );
}
