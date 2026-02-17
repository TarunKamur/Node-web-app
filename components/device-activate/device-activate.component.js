/* eslint-disable react-hooks/exhaustive-deps */
import Link from "next/link";
import styles from "@/components/device-activate/device-activate.module.scss";
import { appConfig } from "@/config/app.config";
import { useEffect, useState } from "react";
import usePostApiMutate from "@/hooks/usePostApidata";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import { getPlansDetails, getQueryParams } from "@/services/utility.service";
import { Deviceactivate } from "@/.i18n/locale";
import { getItem } from "@/services/local-storage.service";
import { sendEvent } from "@/services/analytics.service";
import { useForm } from "react-hook-form";
import CustomTextField from "../reactHookFormFields/CustomTextField";
import { ImageConfig } from "@/config/ImageConfig";

const DeviceActivate = () => {
  const {
    state: { userDetails, SystemConfig, navigateFrom, localLang },
    dispatch,
  } = useStore();
  const { mutate: activateDevice, data: activateDeviceData } =
    usePostApiMutate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const isUtUser = getItem("isUtuser");
  const [isDisabled, setIsDisabled] = useState(true);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    trigger,
    setValue,
  } = useForm({ mode: "onChange", shouldFocusError: false });

  const onSubmit = (data) => {
    activateDeviceApi({ key: data.tvCode });
  };
  useEffect(() => {
    if (activateDeviceData?.data?.status) {
      setSuccessMessage(activateDeviceData?.data?.response?.message);
      sendEvent("activate_TV_completed", getPlansDetails());
      if (navigateFrom) {
        router.push(`/${navigateFrom}`);
      } else if (isUtUser) {
        sendEvent("activate_TV_completed", getPlansDetails());
        window.location.href = SystemConfig?.configs?.siteURL;
      }
    } else if (activateDeviceData?.data?.error?.code === -827) {
      setErrorMessage(activateDeviceData?.data?.error?.message);
    } else {
      setErrorMessage(activateDeviceData?.data?.error?.message);
    }
  }, [activateDeviceData]);

  const activateDeviceApi = (apiData) => {
    const url = `${process.env.initJson.api}/service/api/auth/validate/passcode`;
    activateDevice({ url, apiData });
  };

  const validateCode = (event) => {
    const key = event.key;
    const charCode = event.which || event.keyCode;

    if (
      key === "Backspace" ||
      key === "Tab" ||
      key === "ArrowLeft" ||
      key === "ArrowRight"
    ) {
      return;
    }
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
    }
    // clearErrors("tvCode");
    // setValue("tvCode", event.target.value);
  };

  const handleSignIn = () => {
    dispatch({ type: actions.navigateFrom, payload: router.asPath });
    router.push("/signin");
  };
  const handleHome = () => {
    router.push("/");
  };
  function onBack() {
    router.push("/settings");
  }
  useEffect(() => {
    const pagePath = router.asPath;
    const params = getQueryParams(pagePath);
    if (params?.dactivetk) setValue("tvCode", params.dactivetk);
    const dactiveCode =
      pagePath?.split("/").length > 3
        ? pagePath.split("/")[pagePath.split("/").length - 1]
        : "";
    if (dactiveCode && !params?.dactivetk) {
      let final;
      if (dactiveCode.includes("?cb")) {
        final = dactiveCode.split("?")[0];
      } else {
        final = dactiveCode;
      }
      setIsDisabled(false);
      setValue("tvCode", final);
    }
  }, [router.asPath]);
  const handleTvCodeChange = (e) => {
    const value = e.target.value;

    if (value.length === 0) {
      setErrorMessage(Deviceactivate[localLang].Code_required);
      setIsDisabled(true);
    } else if (value.length < 6) {
      setErrorMessage(Deviceactivate[localLang].Enter_a_valid_code);
      setIsDisabled(true);
    } else {
      setErrorMessage("");
      setIsDisabled(false);
    }
    clearErrors("tvCode");
    setValue("tvCode", e.target.value);
  };

  return (
    <div className={`${styles.activate_device}`}>
      {/* <Link href="/" prefetch={false} aria-label="app logo">
        <img
          className={` ${styles.tablet_logo}`}
          src={appConfig?.appLogo}
          alt="app-logo"
        />
      </Link> */}
      <div className={` ${styles.back_btn}`}>
        <span onClick={onBack}>
          <img
            alt="back"
            className={` ${styles.back}`}
            src={`${ImageConfig?.changePassword?.arrowBack}`}
          />
        </span>
        <h2>{Deviceactivate[localLang].Activate_Device}</h2>
      </div>
      {!successMessage && (
        <div className={`${styles.activate_inner}`}>
          <h2>{Deviceactivate[localLang].Activate_Device}</h2>
          {!userDetails && (
            <p className={`${styles.msg2}`}>
              {Deviceactivate[localLang].Please_sign_in_to_activate_your_device}
            </p>
          )}
          {!!userDetails && (
            <>
              <p className={`${styles.msg1}`}>
                {
                  Deviceactivate[localLang]
                    .Enter_the_code_shown_on_your_Tv_screen_and_click_on_Activate
                }
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CustomTextField
                  label={Deviceactivate[localLang].Enter_the_code}
                  name="tvCode"
                  register={register}
                  errors={errors}
                  trigger={trigger}
                  clearErrors={clearErrors}
                  onKeyDown={validateCode}
                  maxLength={6}
                  onChange={handleTvCodeChange}
                />
                <div className={`${styles.text_danger1}`}>{errorMessage}</div>
                <button
                  className={`${styles.btn} ${isDisabled ? styles.disabled : ""} primary`}
                  type="submit"
                  disabled={isDisabled}
                >
                  {Deviceactivate[localLang].Activate}
                </button>
              </form>
            </>
          )}

          {!userDetails && (
            <button
              className={`${styles.signin_btn} primary`}
              onClick={handleSignIn}
              type="button"
            >
              {Deviceactivate[localLang].Sign_In}
            </button>
          )}
          <p className={`${styles.msg}`}>
            {Deviceactivate[localLang].By_continuing_you_agree_brand_name}
            <Link
              className={`${styles.link}`}
              href="/support/terms"
              prefetch={false}
            >
              {Deviceactivate[localLang].Terms_and_Conditions}
            </Link>
          </p>
        </div>
      )}
      {!!successMessage && (
        <div className={`${styles.stream__pin__validate}`}>
          <div className={`${styles.success_inner}`}>
            <div>
              <h3>{successMessage}</h3>
              <div className={`${styles.bottom_buttons}`}>
                <button
                  className={`${styles.apply}`}
                  onClick={handleHome}
                  type="button"
                >
                  {Deviceactivate[localLang].Go_To_Home}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceActivate;
