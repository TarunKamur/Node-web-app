/* eslint-disable react-hooks/exhaustive-deps */
import styles from "@/components/update-email/update-email.module.scss";
import { useEffect, useState } from "react";
import { CssBaseline, Dialog, ThemeProvider, createTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { actions, useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import usePostApiMutate from "@/hooks/usePostApidata";
import { fromStyle, validateM } from "@/services/utility.service";
import { setUserDetails } from "@/services/user.service";
import { Forgotpassword, UpdateMobileconstant } from "@/.i18n/locale";
import { useForm } from "react-hook-form";
import OtpVerify from "../otpVerify/otpVerify.component";
import DynamicFieldsMapper from "../reactHookFormFields/DynamicFieldsMapper";

const UpdateMobileComponent = ({ isOpen, onClose }) => {
  const [newMobileNumber, setMobileNumber] = useState("");
  const [selectCountry, setSelectCountry] = useState("");
  const { mutate: mobileUpdate, data: updatedMobileData } = usePostApiMutate();
  const {
    state: { userDetails, SystemConfig, localLang, SystemFeature },
    dispatch,
  } = useStore();
  const [otpData, setOtpData] = useState();
  const [errorMessage, setErrorMessage] = useState("");
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
      currentMobile: userDetails?.phoneNumber || "",
    },
  });

  useEffect(() => {
    setErrorMessage("");
    setOtpData("");
    setValue("newMobile", "");
    setTimeout(() => {
      setFocus("newMobile");
    }, 50);
  }, [isOpen, userDetails?.phoneNumber]);

  useEffect(() => {
    if (updatedMobileData?.data?.status) {
      if (
        updatedMobileData?.data?.response.statusCode == 2 ||
        updatedMobileData?.data?.response.statusCode == 4
      ) {
        const fd = {
          from: "update_mobile",
          verification: updatedMobileData?.data?.response.targetType,
          context: updatedMobileData?.data?.response.context,
          apiResponse: updatedMobileData,
        };
        if (
          SystemFeature?.otpauthentication?.fields
            ?.verification_type_for_mobile_update == "email"
        ) {
          const email = updatedMobileData?.data?.response?.target;
          fd.data = {
            title1: `${Forgotpassword[localLang].Otp_sent_to_your_email} ${email.slice(0, 5)}******${email.substring(8)}`,
            mobile: `${selectCountry.isdCode}-${newMobileNumber}`,
            email,
          };
        } else {
          fd.data = {
            title1: `${Forgotpassword[localLang].Otp_sent_to_your_mobile} ******${newMobileNumber.slice(newMobileNumber.length - 4)}`,
            mobile: updatedMobileData?.data?.response.target,
            email: "",
          };
        }
        setOtpData(fd);
      } else {
        userDetails.phoneNumber = `${selectCountry.isdCode}-${newMobileNumber}`;
        setUserDetails(userDetails);
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
        dispatch({
          type: actions.NotificationBar,
          payload: { message: updatedMobileData?.data?.response?.message },
        });
        closePopup();
      }
    } else if (updatedMobileData?.data?.status === false) {
      setErrorMessage(updatedMobileData.data.error.message);
      clearingErrorMessage();
    }
  }, [updatedMobileData]);

  const handleUpdateMobile = (data) => {
    const url = `${process.env.initJson.api}/service/api/auth/update/mobile`;
    const apiData = {
      mobile: `${selectCountry.isdCode}${data.newMobile}`,
    };
    setMobileNumber(data.newMobile);
    mobileUpdate({ url, apiData });
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

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const validateMobile = (value) => {
    const result = validateM(
      value,
      SystemConfig.configs.validMobileRegex || appConfig?.authMobilePattern
    );
    return result.valid || result.error;
  };

  const callbacksuccess = (data) => {
    userDetails.phoneNumber = `${selectCountry.isdCode}-${newMobileNumber}`;
    dispatch({ type: actions.userDetails, payload: { ...userDetails } });
    setUserDetails(userDetails);
    dispatch({
      type: actions.NotificationBar,
      payload: { message: data?.message },
    });
    setOtpData();
    closePopup();
  };

  const fieldsConfig = [
    {
      key: "currentMobile",
      label: UpdateMobileconstant[localLang]?.Current_Mobile_Number,
      name: "currentMobile",
      isDisplay: userDetails?.phoneNumber,
      // validateFunction: validateMobile,
      props: {
        disabled: true,
        fromStyle,
      },
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "newMobile",
      label: UpdateMobileconstant[localLang]?.Mobile_Number,
      name: "newMobile",
      validateFunction: validateMobile,
      type: "number",
      customStyle: `inputfield ${styles.mobileNumber} ${styles.has_country_code}`,
      isDisplay: true,
      component: "mobile_Number_field",
      props: {
        setSelectCountry,
      },
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

                  <div className={`${styles.updateEmail_cont}`}>
                    {otpData ? (
                      <OtpVerify
                        otpData={otpData}
                        callbacksuccess={callbacksuccess}
                        returnBack={() => setOtpData()}
                      />
                    ) : (
                      <>
                        <div className={`${styles.title_inner}`}>
                          <div className={`${styles.popup_title}`}>
                            <div className={`${styles.p_title}`}>
                              {
                                UpdateMobileconstant[localLang]
                                  .Change_Mobile_Number
                              }
                            </div>
                            <p className={`${styles.sub_heading}`}>
                              {
                                UpdateMobileconstant[localLang]
                                  .On_changing_your_mobile_number_you_will_be_redirected_to_settings_page
                              }
                            </p>
                          </div>
                        </div>
                        <form onSubmit={handleSubmit(handleUpdateMobile)}>
                          {/* {!!userDetails?.phoneNumber && (
                            <div className={` ${styles.forgot}`}>
                              <TextField
                                margin="normal"
                                fullWidth
                                label="Current Mobile Number"
                                name="currentMobile"
                                value={userDetails?.phoneNumber}
                                InputProps={{ readOnly: true }}
                                disabled
                                aria-autocomplete="none"
                                sx={fromStyle}
                              />
                            </div>
                          )}

                          <div
                            className={` ${styles.forgot} ${styles.inline} `}
                          >
                            <div className={` ${styles.c_dropdown}`}>
                              <CountryDropdown
                                getcountry={selectCountry}
                                changeCountry={(value) =>
                                  setSelectCountry(value)
                                }
                              />
                            </div>
                            <div
                              className={` ${styles.mobileNumber} ${styles.has_country_code}`}
                            >
                              <TextField
                                fullWidth
                                margin="normal"
                                label="Mobile Number"
                                name="mobile"
                                variant="outlined"
                                sx={fromStyle}
                                type="number"
                                value={mobileRef}
                                onKeyDown={(e) => {
                                  if ([38, 40].indexOf(e.keyCode) > -1) {
                                    e.preventDefault();
                                  }
                                }}
                                onWheel={(e) => e.target.blur()}
                                onBlur={(e) => validateMobile(e.target.value)}
                                onFocus={() =>
                                  setMobileV({ valid: true, error: "" })
                                }
                                onChange={(e) => setMobileRef(e.target.value)}
                                key="mobile"
                              />
                              <div className={` ${styles.valid_error} `}>
                                {mobileV.error}
                              </div>
                            </div>
                          </div> */}
                          {fieldsConfig.map((field) => (
                            <DynamicFieldsMapper
                              key={field.key}
                              field={field}
                            />
                          ))}
                          <div className={`${styles.text_danger1}`}>
                            <span>{errorMessage}</span>
                          </div>
                          <button
                            className={` ${styles.button} primary`}
                            type="submit"
                          >
                            {UpdateMobileconstant[localLang].Save}
                          </button>
                        </form>
                      </>
                    )}
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

export default UpdateMobileComponent;
