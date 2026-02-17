/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
import styles from "@/components/additionalUserdata/additionalUserData.module.scss";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { appConfig } from "@/config/app.config";
import {
  decryptData,
  encryptData,
  fromStyle,
  validateE,
  validateM,
} from "@/services/utility.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { AdditionalUsaerDataconstant } from "@/.i18n/locale";
import { useForm } from "react-hook-form";
import DynamicFieldsMapper from "../reactHookFormFields/DynamicFieldsMapper";

const AdditionalUserData = ({ socialDetails, continueSocialUser }) => {
  const {
    state: { SystemFeature, SystemConfig, localLang },
  } = useStore();
  const loopGender = [
    { label: "Male", checked: false, value: "M" },
    { label: "Female", checked: false, value: "F" },
    { label: "Other", checked: false, value: "O" },
  ];
  const [localAppConfig, setLocalAppConfig] = useState(appConfig?.signup);
  const [selectCountry, setSelectCountry] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate: mutateValidate, data: apiResponseValidate } =
    usePostApiMutate();
  const { mutate: mutateSignupEnc, data: EncApiResponse } = usePostApiMutate();
  // react-hook-form states
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
    trigger,
    control,
  } = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues: {
      email: socialDetails?.email || "",
      mobile: socialDetails?.mobile?.split("-")?.[1] || "",
    },
  });

  useEffect(() => {
    if (SystemFeature) {
      if (!!SystemFeature.userfields && !!SystemFeature.userfields.fields) {
        localAppConfig.dob = SystemFeature.userfields.fields.age
          ? SystemFeature.userfields.fields.age
          : localAppConfig.dob;
        localAppConfig.gender = SystemFeature.userfields.fields.gender
          ? SystemFeature.userfields.fields.gender
          : localAppConfig.gender;
      }
      if (
        !!SystemFeature.globalsettings &&
        !!SystemFeature.globalsettings.fields
      ) {
        localAppConfig.email = SystemFeature.globalsettings?.fields
          ?.isEmailSupported
          ? SystemFeature.globalsettings?.fields?.isEmailSupported == "true"
            ? 1
            : 0
          : localAppConfig.email;
        localAppConfig.mobile = SystemFeature.globalsettings?.fields
          ?.isMobileSupported
          ? SystemFeature.globalsettings?.fields?.isMobileSupported == "true"
            ? 1
            : 0
          : localAppConfig.mobile;
        localAppConfig.firstName = SystemFeature.globalsettings?.fields
          ?.showFirstName
          ? SystemFeature.globalsettings?.fields?.showFirstName == "true"
            ? 1
            : 0
          : localAppConfig.firstName;
        localAppConfig.lastName = SystemFeature.globalsettings?.fields
          ?.showLastName
          ? SystemFeature.globalsettings?.fields?.showLastName == "true"
            ? 1
            : 0
          : localAppConfig.lastName;
        localAppConfig.firstNameCharLimit = SystemFeature.globalsettings?.fields
          ?.firstNameCharLimit
          ? SystemFeature.globalsettings?.fields?.firstNameCharLimit
          : localAppConfig.firstNameCharLimit;
        localAppConfig.lastNameCharLimit = SystemFeature.globalsettings?.fields
          ?.lastNameCharLimit
          ? SystemFeature.globalsettings?.fields?.lastNameCharLimit
          : localAppConfig.lastNameCharLimit;
      }
      setLocalAppConfig({ ...localAppConfig });
    }
  }, [SystemFeature]);

  useEffect(() => {
    if (!!apiResponseValidate?.data) {
      setResponseData(apiResponseValidate?.data);
    }
  }, [apiResponseValidate]);

  const setResponseData = (res) => {
    if (!!res?.status) {
      continueSocialUser(res?.response);
    } else {
      if (res?.error && res?.error?.code === 401) {
      } else {
        setErrorMessage(res?.error?.message);
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      }
    }
  };

  useEffect(() => {
    if (EncApiResponse?.data) {
      const decrypteData = JSON.parse(decryptData(EncApiResponse?.data?.data));
      setResponseData(decrypteData);
    }
  }, [EncApiResponse]);

  const onSubmit = (data) => {
    const apiData = {
      additional_params: {},
      email: data.email || "",
      mobile: data.mobile ? `${selectCountry.isdCode}-${data.mobile}` : "",
      other_login: {},
      userName: socialDetails?.name,
    };

    if (socialDetails?.login_type == "google") {
      apiData.other_login = { google: socialDetails?.login_id };
    }
    if (socialDetails?.login_type == "facebook") {
      apiData.other_login = { facebook: socialDetails?.login_id };
    }

    if (data?.dateOfBirth) {
      apiData.additional_params.dob = `${data.dateOfBirth}`;
    }
    if (data?.gender) {
      apiData.additional_params.gender = `${data.gender}`;
    }

    if (SystemFeature?.encryptApisList?.fields?.signin === "true") {
      // apiData.is_header_enrichment = "false";
      apiData.additional_params = JSON.stringify(apiData.additional_params);
      apiData.other_login = JSON.stringify(apiData.other_login);
      const encryptObj = {
        data: encryptData(JSON.stringify(apiData)),
        metadata: encryptData(JSON.stringify({ request: "signup/validate" })),
      };
      const url = `${process.env.initJson.api}/service/api/v1/send`;
      mutateSignupEnc({ url, apiData: encryptObj });
    } else {
      // apiPayload.is_header_enrichment = false;
      const url = `${process.env.initJson.api}/service/api/auth/signup/validate`;
      mutateValidate({ url, apiData });
    }
  };

  const validateEmail = (value) => {
    const result = validateE(value, appConfig?.authEmailPattern);
    return result.valid || result.error;
  };

  const validateMobile = (value) => {
    const result = validateM(
      value,
      SystemConfig?.configs?.validMobileRegex
        ? SystemConfig.configs.validMobileRegex
        : appConfig?.authMobilePattern
    );
    return result.valid || result.error;
  };

  const fieldsConfig = [
    {
      key: "email",
      label: "Email ID",
      name: "email",
      validateFunction: validateEmail,
      isDisplay: !!localAppConfig.email && !socialDetails?.email,
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "mobile",
      label: "Mobile Number",
      name: "mobile",
      validateFunction: validateMobile,
      type: "number",
      customStyle: `inputfield ${styles.mobileNumber} ${styles.has_country_code}`,
      onKeyDown: (e) => {
        if ([38, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
      },
      onWheel: (e) => e.target.blur(),
      isDisplay: !!localAppConfig.mobile,
      component: "mobile_Number_field",
      props: {
        setSelectCountry,
      },
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      name: "dateOfBirth",
      validateFunction: () => ({}),
      component: "date_picker",
      props: {
        control,
        styles,
        fromStyle,
      },
      isDisplay: localAppConfig.dob !== "0",
      register,
      trigger,
      clearErrors,
      errors,
    },
    {
      key: "gender",
      label: "Gender",
      name: "gender",
      validateFunction: () => ({}),
      component: "radio_field",
      props: {
        control,
        options: loopGender,
        errors,
      },
      isDisplay: localAppConfig.gender != "0",
      register,
      trigger,
      clearErrors,
      errors,
    },
  ];

  return (
    <div className={` ${styles.signin_cont}`}>
      <h1>{AdditionalUsaerDataconstant[localLang].Enter_Your_Mobile_Number}</h1>
      <p>
        {
          AdditionalUsaerDataconstant[localLang]
            .An_OTP_will_be_sent_to_your_mobile_for_verification
        }
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fieldsConfig.map((field) => (
          <DynamicFieldsMapper field={field} />
        ))}
        <div className={`${styles.text_danger1}`}>
          <span>{errorMessage}</span>
        </div>
        <button
          className={` ${styles.button} primary`}
          key="CONTINUE"
          type="submit"
        >
          {AdditionalUsaerDataconstant[localLang].CONTINUE}
        </button>
      </form>
    </div>
  );
};

export default AdditionalUserData;
