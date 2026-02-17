import {
  Dialog,
  DialogActions,
  DialogContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import styles from "@/components/dish1-profiles/dish-DeleteProfile/dish1-delete-profile.module.scss";
import { getAbsolutePath } from "@/services/user.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { actions, useStore } from "@/store/store";
import { DeleteProfileconstant } from "@/.i18n/locale";

export default function DishDeleteProfile({ popupData, isInPopup = false }) {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const {
    state: { localLang },
    dispatch,
  } = useStore();
  const {
    mutate: mutateDelete,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostApiMutate();
  const router = useRouter();

  // Provide defaults to prevent undefined errors
  const {
    isActive = false,
    closeTarget = () => {},
    currentSelected = {},
    noButtonType = "",
    yesButtonType = "",
    onDelete = null,
    isLoading: externalLoading = false,
  } = popupData || {};

  const handleClose = () => {
    if (typeof closeTarget === "function") {
      closeTarget();
    }
  };

  useEffect(() => {
    if (apiResponse?.data && !onDelete) {
      if (apiResponse?.data?.status) {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message: apiResponse?.data?.response?.message,
            icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/login_success_icon.svg",
          },
        });
        handleClose();
        // router.back();
        router.push("/profiles/manage-user-profile");
      }
    }
  }, [apiResponse, onDelete]);

  const deleteNow = (e) => {
    if (onDelete) {
      onDelete();
    } else {
      let url =
        process.env.initJson["api"] + "/service/api/auth/delete/user/profile";
      let apiData = { profileId: currentSelected.profileId };
      mutateDelete({ url, apiData });
    }
  };

  //  loading state to use
  const currentLoading = onDelete ? externalLoading : isLoading;

  const DeleteContent = () => (
    <>
      <div className={`${styles.popup_body}`}>
        <p className={`${styles.deleteTitle}`}>Delete Profile ?</p>
        <div className={`${styles.profile_image}`}>
          <img
            className={`${styles.profile_icon}`}
            src={
              !!currentSelected?.imageUrl
                ? getAbsolutePath(currentSelected?.imageUrl)
                : "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/dummy-profile-img.png"
            }
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src =
                "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg";
            }}
            alt={currentSelected?.name}
          />
          <div className={`${styles.profile_name}`}>
            {currentSelected?.name}
          </div>
        </div>
        <p className={`${styles.warningText}`}>
          Are you sure you want to delete this profile ?
        </p>
        <p className={`${styles.popup_subTitle}`}>
          The profile history will be gone forever, and you won't be able to
          access it again
        </p>
      </div>
      <div className={`deleteProfile_btns ${styles.btn}`}>
        <button
          className={`primary ${styles.continue_btn} ${yesButtonType}`}
          onClick={deleteNow}
          disabled={currentLoading}
        >
          Yes, Delete Profile
        </button>
        <button
          className={` ${styles.cancel} ${noButtonType}`}
          onClick={handleClose}
        >
          No, Keep Profile
        </button>
      </div>
    </>
  );

  if (isInPopup) {
    return (
      <div className={`${styles.dishDeleteProfile}`}>
        <DeleteContent />
      </div>
    );
  }

  // Default behavior
  return (
    <div
      className={`dishDeleteProfile ${styles.dishDeleteProfile} ${styles.web}`}
    >
      <ThemeProvider theme={darkTheme}>
        <Dialog
          open={isActive}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            "& .MuiModal-backdrop": {
              backgroundColor: "hsla(0, 0%, 0%, 0.7)",
            },
            "& .MuiPaper-elevation": {
              borderRadius: "20px",
            },
          }}
        >
          <div className={`${styles.modal_size}`}>
            <div className={`${styles.model_content}`}>
              <CssBaseline>
                <DialogContent className={`${styles.content_inner}`}>
                  <DeleteContent />
                </DialogContent>
              </CssBaseline>
            </div>
          </div>
        </Dialog>
      </ThemeProvider>
    </div>
  );
}
