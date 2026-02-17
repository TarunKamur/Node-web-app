import Link from "next/link";
import dynamic from "next/dynamic";
import { ImageConfig } from "@/config/ImageConfig";
import { CreatePaassword } from "@/.i18n/locale";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { actions, useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import usePostApiMutate from "@/hooks/usePostApidata";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { validateP, validateCP, fromStyle } from "@/services/utility.service";
import styles from "./create-password.module.scss";

const SignInVestaImage = dynamic(
  () => import("@/components/signinVestaImage/signin-vesta-image.component")
);

const CreatePassword = () => {
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();
  const passwordRef = useRef("");
  const newPasswordRef = useRef("");
  const [creatV, setCreatV] = useState({ valid: false, error: "" });
  const [newV, setNewV] = useState({ valid: false, error: "" });
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleold, setIsVisibleold] = useState(false);
  const [isVisiblenew, setIsVisiblenew] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate: createPaasswordApi, data: createPasswordData } =
    usePostApiMutate();
  const router = useRouter();

  useEffect(() => {
    if (createPasswordData?.data?.status) {
      dispatch({
        type: actions.NotificationBar,
        payload: { message: createPasswordData?.data?.response?.message },
      });
      router.back();
    } else if (createPasswordData?.data?.status === false) {
      if (
        createPasswordData?.data?.error &&
        createPasswordData?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      } else {
        setErrorMessage(createPasswordData?.data?.error.message);
        clearingErrorMessage();
      }
    }
  }, [createPasswordData]);

  const handleClick = (event) => {
    event.preventDefault();
    if (
      validatePassword(event.target.oldpassword.value) &&
      validateNewPassword(event.target.newpassword.value)
    ) {
      const apiData = {
        newPassword: newPasswordRef.current.value,
      };
      let url =
        process.env.initJson["api"] + "/service/api/auth/change/password";
      createPaasswordApi({ url, apiData });
    }
  };

  const validatePassword = (value) => {
    let result = validateP(
      value,
      appConfig.authMinLength,
      appConfig.authMaxLength,
      localLang
    );
    setCreatV(result);
    return result.valid;
  };

  const validateNewPassword = (value) => {
    let result = validateCP(value, passwordRef.current.value, localLang);
    setNewV(result);
    return result.valid;
  };

  const clearingErrorMessage = () => {
    let init1 = setTimeout(() => {
      setErrorMessage("");
      clearTimeout(init1);
    }, 5000);
  };

  function onBack() {
    router.push("/settings");
  }

  return (
    <>
      <div className={` ${styles.signin_cont_page}`}>
        <Link href="/" prefetch={false} aria-label="app logo">
          <img
            className={` ${styles.tablet_logo}`}
            src={appConfig?.appLogo}
            alt="appLogo"
          />
        </Link>
        {process.env.initJson?.tenantCode === "vesta" && (
          <SignInVestaImage></SignInVestaImage>
        )}
        <div className={` ${styles.mobileBack}`}>
          <span className={`${styles.back_btn}`} onClick={onBack}>
            <img
              alt="back"
              className={` ${styles.back}`}
              src={`${ImageConfig?.changePassword?.arrowBack}`}
            />
          </span>
          <h2>{CreatePaassword[localLang].create_password}</h2>
        </div>

        <div className={`${styles.signin_cont}`}>
          <h1>{CreatePaassword[localLang].create_password}</h1>
          <div>
            <form onSubmit={handleClick}>
              <div className={` ${styles.forgot} `}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="oldpassword"
                  label={CreatePaassword[localLang].Password}
                  type={isVisibleold ? "text" : "password"}
                  sx={fromStyle}
                  inputRef={passwordRef}
                  autoComplete="off"
                  inputProps={{ maxLength: appConfig.authMaxLength }}
                  onBlur={(e) => validatePassword(e.target.value)}
                  onFocus={() => setCreatV({ valid: true, error: "" })}
                />
                <span
                  className={` ${styles.show}`}
                  onClick={() => setIsVisibleold(!isVisibleold)}
                >
                  {isVisibleold
                    ? `${CreatePaassword[localLang].Hide}`
                    : `${CreatePaassword[localLang].Show}`}
                </span>
                <div className={` ${styles.valid_error} `}>{creatV.error}</div>
              </div>

              <div className={` ${styles.forgot} `}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="newpassword"
                  label={CreatePaassword[localLang].Password}
                  type={isVisiblenew ? "text" : "password"}
                  sx={fromStyle}
                  inputRef={newPasswordRef}
                  autoComplete="off"
                  inputProps={{ maxLength: appConfig.authMaxLength }}
                  onChange={(e) => validateNewPassword(e.target.value)}
                  onFocus={() => setNewV({ valid: true, error: "" })}
                />
                <span
                  className={` ${styles.show}`}
                  onClick={() => setIsVisiblenew(!isVisiblenew)}
                >
                  {isVisiblenew
                    ? `${CreatePaassword[localLang].Hide}`
                    : `${CreatePaassword[localLang].Show}`}
                </span>
                <div className={` ${styles.valid_error} `}>{newV.error}</div>
              </div>
              <div className={`${styles.text_danger1}`}>
                <span>{errorMessage}</span>
              </div>
              <button className={`${styles.button} primary`} type="submit">
                <span className={` ${styles.tabletHide} `}>
                  {CreatePaassword[localLang].create_password}
                </span>
                <span className={` ${styles.mobileShow}`}>
                  {CreatePaassword[localLang].Save}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePassword;
