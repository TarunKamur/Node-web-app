import {
  Dialog,
  DialogActions,
  DialogContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import styles from "@/components/popups/profile/delete-profile/delete-profile.module.scss";
import { getAbsolutePath } from "@/services/user.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { actions, useStore } from "@/store/store";
import { DeleteProfileconstant } from "@/.i18n/locale";
export default function DeleteProfile({ popupData }) {
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

  const handleClose = () => {
    popupData.closeTarget();
  };
  useEffect(() => {
    if (apiResponse?.data) {
      if (apiResponse?.data?.status) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: apiResponse?.data?.response?.message },
        });
        router.back();
      }
    }
  }, [apiResponse]);

  const deleteNow = (e) => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/delete/user/profile";
    let apiData = { profileId: popupData.currentSelected.profileId };
    mutateDelete({ url, apiData });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        open={popupData.isActive ? popupData.isActive : false}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className={`${styles.modal_size}`}>
          <div className={`${styles.model_content}`}>
            <CssBaseline>
              <DialogContent className={`${styles.content_inner}`}>
                <div className={`${styles.popup_body}`}>
                  <div className={`${styles.profile_image}`}>
                    <img
                      className={`${styles.profile_icon}`}
                      src={
                        !!popupData?.currentSelected?.imageUrl
                          ? getAbsolutePath(
                              popupData?.currentSelected?.imageUrl
                            )
                          : "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg"
                      }
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src =
                          "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg";
                      }}
                      alt={popupData?.currentSelected?.name}
                    ></img>
                    <div className={`${styles.profile_name}`}>
                      {popupData?.currentSelected?.name}
                    </div>
                  </div>
                  <div className={`${styles.popup_title}`}>
                    {
                      DeleteProfileconstant[localLang]
                        .Are_you_sure_you_want_to_delete_this_profile
                    }
                  </div>
                  <div className={`${styles.popup_subTitle}`}>
                    {
                      DeleteProfileconstant[localLang]
                        .This_profile_history_will_be_gone_forever_and_you_wont_be_able_to_access_it_again
                    }
                  </div>
                </div>
              </DialogContent>
              <div className={`deleteProfile_btns ${styles.btn}`}>
                <button
                  className={`grey ${styles.continue_btn} ${popupData.noButtonType}`}
                  onClick={handleClose}
                >
                  {" "}
                  {DeleteProfileconstant[localLang].Cancel}{" "}
                </button>
                <button
                  className={`primary ${styles.cancel} ${popupData.yesButtonType}`}
                  onClick={deleteNow}
                >
                  {" "}
                  {DeleteProfileconstant[localLang].Delete}{" "}
                </button>
              </div>
            </CssBaseline>
          </div>
        </div>
      </Dialog>
    </ThemeProvider>
  );
}
