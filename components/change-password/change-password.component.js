/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-props-no-spreading */
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { actions, useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import usePostApiMutate from "@/hooks/usePostApidata";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { validateP, validateCP } from "@/services/utility.service";
import { Changepassword } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import styles from "./change-password.module.scss";
import PasswordField from "../reactHookFormFields/PasswordField";

const SignInVestaImage = dynamic(
  () => import("@/components/signinVestaImage/signin-vesta-image.component")
);

const ChangePassword = () => {
  const {
    state: { localLang },
    dispatch,
  } = useStore();
  const [visibility, setVisibility] = useState({
    currentpassword: false,
    newpassword: false,
    confirmnewpassword: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const { mutate: changePasswordApi, data: updatedPasswordData } =
    usePostApiMutate();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    trigger,
    watch,
  } = useForm({ mode: "onChange", shouldFocusError: false });

  const onSubmit = (data) => {
    const apiData = {
      oldPassword: data.currentpassword,
      newPassword: data.newpassword,
    };
    const url = `${process.env.initJson.api}/service/api/auth/change/password`;
    changePasswordApi({ url, apiData });
  };

  const toggleVisibility = (key) => {
    setVisibility((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  useEffect(() => {
    if (updatedPasswordData?.data?.status) {
      dispatch({
        type: actions.NotificationBar,
        payload: { message: updatedPasswordData?.data?.response?.message },
      });
      router.back();
    } else if (updatedPasswordData?.data?.status === false) {
      if (
        updatedPasswordData?.data?.error &&
        updatedPasswordData?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      } else {
        setErrorMessage(updatedPasswordData?.data?.error.message);
        clearingErrorMessage();
      }
    }
  }, [updatedPasswordData]);

  const validatePassword = (value) => {
    const result = validateP(
      value,
      appConfig.authMinLength,
      appConfig.authMaxLength,
      localLang
    );
    return result.valid || result.error;
  };

  const validateConfirmPassword = (value) => {
    const newPassword = watch("newpassword");
    const result = validateCP(value, newPassword, localLang);
    return result.valid || result.error;
  };

  const clearingErrorMessage = () => {
    const timeout = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(timeout);
    }, 5000);
  };

  function onBack() {
    router.push("/settings");
  }

  const fields = [
    {
      name: "currentpassword",
      label: Changepassword[localLang].Current_Password,
      validateFunction: validatePassword,
    },
    {
      name: "newpassword",
      label: Changepassword[localLang].New_Password,
      validateFunction: validatePassword,
    },
    {
      name: "confirmnewpassword",
      label: Changepassword[localLang].Confirm_New_Password,
      validateFunction: validateConfirmPassword,
    },
  ];

  return (
    <div className={` ${styles.signin_cont_page}`}>
      <Link href="/" prefetch={false} aria-label="app logo">
        <img
          className={` ${styles.tablet_logo}`}
          src={appConfig?.appLogo}
          alt="app-logo"
        />
      </Link>
      {process.env.initJson?.tenantCode === "vesta" && <SignInVestaImage />}
      <div className={` ${styles.mobileBack}`}>
        <span className={`${styles.back_btn}`} onClick={onBack}>
          <img
            alt="back"
            className={` ${styles.back}`}
            src={`${ImageConfig?.changePassword?.arrowBack}`}
          />
        </span>
        <h2>{Changepassword[localLang].Change_Password}</h2>
      </div>

      <div className={`${styles.signin_cont}`}>
        <h1>{Changepassword[localLang].Change_Password}</h1>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field) => (
              <PasswordField
                key={field.name}
                name={field.name}
                label={field.label}
                visibility={visibility[field.name]}
                toggleVisibility={toggleVisibility}
                register={register}
                errors={errors}
                trigger={trigger}
                clearErrors={clearErrors}
                validateFunction={field.validateFunction}
              />
            ))}
            <div className={`${styles.text_danger1}`}>
              <span>{errorMessage}</span>
            </div>
            <button className={`${styles.button} primary`} type="submit">
              <span className={` ${styles.tabletHide} `}>
                {Changepassword[localLang].Change_Password}
              </span>
              <span className={` ${styles.mobileShow}`}>
                {Changepassword[localLang].Save}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
