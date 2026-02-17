/* eslint-disable react-hooks/exhaustive-deps */
import { CssBaseline, Dialog, ThemeProvider, createTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import styles from "@/components/update-email/update-email.module.scss";
import { actions, useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import usePostApiMutate from "@/hooks/usePostApidata";
import { fromStyle, validateE } from "@/services/utility.service";
import { setUserDetails } from "@/services/user.service";
import { Forgotpassword, UpdateEmailconstant } from "@/.i18n/locale";
import { useForm } from "react-hook-form";
import OtpVerify from "../otpVerify/otpVerify.component";
import DynamicFieldsMapper from "../reactHookFormFields/DynamicFieldsMapper";

const UpdateEmailComponent = ({ isOpen, onClose }) => {
  const [newEmail, setNewEmail] = useState("");
  const { mutate: updateEmail, data: updatedEmailData } = usePostApiMutate();
  const [errorMessage, setErrorMessage] = useState("");
  const [otpData, setOtpData] = useState();
  const {
    state: { userDetails, localLang, SystemFeature },
    dispatch,
  } = useStore();

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    trigger,
    setValue,
    setFocus,
  } = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues: {
      currentEmail: userDetails?.email || "",
    },
  });

  useEffect(() => {
    setFocus("newEmail");
  }, [setFocus]);

  useEffect(() => {
    setValue("newEmail", "");
    setOtpData("");
    setTimeout(() => {
      setFocus("newEmail");
    }, 50);
  }, [isOpen]);

  useEffect(() => {
    if (updatedEmailData?.data?.status) {
      if (
        updatedEmailData?.data?.response.statusCode == 2 ||
        updatedEmailData?.data?.response.statusCode == 4
      ) {
        const fd = {
          from: "update_email",
          verification: updatedEmailData?.data?.response.targetType,
          context: updatedEmailData?.data?.response.context,
          apiResponse: updatedEmailData,
        };
        if (
          SystemFeature?.otpauthentication?.fields
            ?.verification_type_for_email_update == "mobile"
        ) {
          const mobile = updatedEmailData?.data?.response?.target;
          fd.data = {
            title1: `${Forgotpassword[localLang].Otp_sent_to_your_mobile} ******${mobile.slice(Number(mobile?.length) - 4)}`,
            mobile,
            email: newEmail,
          };
        } else {
          fd.data = {
            title1: `${Forgotpassword[localLang].Otp_sent_to_your_email} ${newEmail.slice(0, 5)}******${newEmail.substring(8)}`,
            mobile: "",
            email: newEmail,
          };
        }
        setOtpData(fd);
      } else {
        userDetails.email = newEmail;
        setUserDetails(userDetails);
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
        dispatch({
          type: actions.NotificationBar,
          payload: { message: updatedEmailData?.data?.response?.message },
        });
        closePopup();
      }
    } else if (updatedEmailData?.data?.status === false) {
      setErrorMessage(updatedEmailData.data.error.message);
      clearingErrorMessage();
    }
  }, [updatedEmailData]);

  const handleUpdateEmail = (data) => {
    const url = `${process.env.initJson.api}/service/api/auth/update/email`;
    const apiData = {
      email: data.newEmail,
    };
    setNewEmail(data.newEmail);
    updateEmail({ url, apiData });
  };

  const closePopup = () => {
    onClose();
  };

  const clearingErrorMessage = () => {
    const init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 5000);
  };

  const validateEmail = (data) => {
    const result = validateE(
      data,
      appConfig.authEmailPattern,
      userDetails.email
    );
    // setEmailValidation(result);
    return result.valid || result.error;
  };

  const callbacksuccess = (data) => {
    userDetails.email = newEmail;
    setUserDetails(userDetails);
    dispatch({ type: actions.userDetails, payload: { ...userDetails } });
    dispatch({
      type: actions.NotificationBar,
      payload: { message: data?.message },
    });
    setOtpData();
    closePopup();
  };

  const fieldsConfig = [
    {
      name: "currentEmail",
      label: UpdateEmailconstant[localLang]?.Current_Email,
      isDisplay: true,
      props: {
        disabled: true,
        type: "text",
        fromStyle,
        customClassName: styles.editProfileDetails,
        inputProps: {
          style: { cursor: "not-allowed" },
        },
      },
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      name: "newEmail",
      label: UpdateEmailconstant[localLang]?.New_Email,
      validateFunction: validateEmail,
      isDisplay: true,
      register,
      trigger,
      clearErrors,
      errors,
    },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog open={isOpen}>
        <div className={`${styles.modal_parent}`}>
          <div className={`${styles.modal_popup}`}>
            <div className={`${styles.main_modal}`}>
              <div className={`${styles.modal_size}`}>
                <CssBaseline>
                  <div className={`${styles.title}`}>
                    <CloseIcon
                      className={`${styles.cross_icon}`}
                      onClick={closePopup}
                    />
                  </div>
                  <div>
                    <div className={`${styles.updateEmail_cont}`}>
                      {otpData ? (
                        <OtpVerify
                          otpData={otpData}
                          callbacksuccess={callbacksuccess}
                          returnBack={() => setOtpData()}
                        />
                      ) : (
                        <div>
                          <div className={`${styles.title_inner}`}>
                            <div className={`${styles.popup_title}`}>
                              <h1 className={`${styles.p_title}`}>
                                {UpdateEmailconstant[localLang].Change_Email_Id}
                              </h1>
                              <p className={`${styles.sub_heading}`}>
                                {
                                  UpdateEmailconstant[localLang]
                                    .On_changing_Email_you_will_be_redirected_to_settings_page
                                }
                              </p>
                            </div>
                          </div>
                          <form onSubmit={handleSubmit(handleUpdateEmail)}>
                            {fieldsConfig.map((field) => (
                              <DynamicFieldsMapper field={field} />
                            ))}
                            <div className={`${styles.text_danger1}`}>
                              <span>{errorMessage}</span>
                            </div>
                            <button
                              className={` ${styles.button} primary`}
                              type="submit"
                            >
                              {UpdateEmailconstant[localLang].Save}
                            </button>
                          </form>
                        </div>
                      )}
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

export default UpdateEmailComponent;
