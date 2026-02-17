import styles from "@/components/settings/edit-profile.module.scss";
import TextField from "@mui/material/TextField";
import { actions, useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { appConfig } from "@/config/app.config";
import { useRouter } from "next/router";
import usePostApiMutate from "@/hooks/usePostApidata";
import { fromStyle2, validateN } from "@/services/utility.service";
import { EditProfileconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Loader from "../loader/loader.component";
import { getPlansDetails } from "@/services/utility.service";
import { sendEvent, updateUserSession } from "@/services/analytics.service";

export default function EditProfile() {
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();
  const refetchUser = useRef(false);
  const {
    mutate: mutateUpdateUserDetails,
    data: apiResponse,
    isLoading,
  } = usePostApiMutate();

  const nameRef = useRef("");
  const firstNameRef = useRef("");
  const lastNameRef = useRef("");
  const mobileRef = useRef("");
  const ageRef = useRef("");
  const [nameV, setNameV] = useState({ valid: false, error: "" });
  const [fNameV, setFNameV] = useState({ valid: false, error: "" });
  const [lNameV, setLNameV] = useState({ valid: false, error: "" });
  const [mobileV, setMobileV] = useState({ valid: false, error: "" });
  const [ageV, setAgeV] = useState({ valid: false, error: "" });
  const [genderErr, setGenderErr] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dateV, setDateV] = useState({ valid: false, error: "" });
  const [loopGender, setloopGender] = useState([
    { label: EditProfileconstant[localLang].male, checked: false, value: "M" },
    {
      label: EditProfileconstant[localLang].female,
      checked: false,
      value: "F",
    },
    {
      label: EditProfileconstant[localLang].others,
      checked: false,
      value: "O",
    },
  ]);
  const router = useRouter();
  // const fromStyle2 = fromStyle2;
  //  {
  //   "& .MuiInputLabel-root": {
  //     color: "#fff !important",
  //     width: "100%",
  //     fontSize:"18px"
  //   },
  //   "& .MuiOutlinedInput-root": {
  //     "& > fieldset": { border: "1px solid #666 !important" },
  //   },
  //   "& .MuiInputBase-input":{
  //     color: "#ccc !important",
  //     padding: "6px 14px",
  //     height: "36px",
  //   },
  //   "&:focus-within fieldset, &:focus-visible fieldset": {
  //     border: "1px solid #666 !important",
  //   },
  //   "&:hover fieldset": {
  //     borderColor: "yellow",
  //   },
  //   ".MuiInputBase-input.Mui-disabled": {
  //     WebkitTextFillColor: "#ccc",
  //   }
  // };

  useEffect(() => {
    if (!nameRef.current) return;
    if (!!userDetails && refetchUser.current == false) {
      if (appConfig?.settings?.editProfile?.name) {
        if (userDetails.name) {
          nameRef.current.value = userDetails.name || userDetails.firstName;
          setNameV({ valid: true, error: "" });
        } else nameRef.current.value = "";
      } else if (appConfig?.settings?.editProfile?.firstLastName) {
        if (userDetails.firstName) {
          firstNameRef.current.value = userDetails.firstName;
          setFNameV({ valid: true, error: "" });
        } else firstNameRef.current.value = "";
        if (userDetails.lastName) {
          lastNameRef.current.value = userDetails.lastName;
          setLNameV({ valid: true, error: "" });
        } else lastNameRef.current.value = "";
      }
      if (appConfig?.settings?.editProfile?.mobile) {
        mobileRef.current.value = userDetails.phoneNumber.substring(
          userDetails.phoneNumber.indexOf("-") + 1
        );
      }
      if (appConfig?.settings?.editProfile?.age) {
        if (userDetails.age) {
          ageRef.current.value = userDetails.age;
          if (ageRef.current.value > 18) {
            setAgeV({ valid: true, error: "" });
          }
        } else ageRef.current.value = "";
      }
      if (appConfig?.settings?.editProfile?.dob) {
        if (userDetails.dob) {
          setSelectedDate(userDetails?.dob);
        }
      }
      checkgender(
        loopGender.findIndex((item) => item.value === userDetails.gender)
      );
    }
  }, [userDetails]);
  useEffect(() => {
    let dupGen = [
      {
        label: EditProfileconstant[localLang].male,
        checked: false,
        value: "M",
      },
      {
        label: EditProfileconstant[localLang].female,
        checked: false,
        value: "F",
      },
      {
        label: EditProfileconstant[localLang].others,
        checked: false,
        value: "O",
      },
    ];

    setloopGender(dupGen);

    if (!!userDetails && refetchUser.current == false) {
      checkgender(
        loopGender.findIndex((item) => item.value === userDetails.gender),
        dupGen
      );
    }
  }, [localLang]);

  useEffect(() => {
    if (apiResponse?.data) {
      if (apiResponse?.data?.status) {
        let gender = loopGender.filter((ele) => ele?.checked == true);
        sendEvent("profile_update", {
          ...getPlansDetails(true),
          user_name: !!nameRef?.current?.value ? nameRef?.current?.value : -1,
          gender: !!gender[0]?.value ? gender[0]?.value : -1,
          date_of_birth: !!ageRef?.current?.value ? ageRef?.current?.value : -1,
        });
        updateUserSession(
          {
            Name: nameRef?.current?.value,
            Age: ageRef?.current?.value,
            Gender: gender[0]?.value,
            user_name: nameRef?.current?.value,
          },
          "clevertap"
        );
        router.push("/settings");
      } else if (
        apiResponse?.data?.error &&
        apiResponse?.data?.error?.code === 401
      ) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: "Session expired!" },
        });
        unAuthorisedHandler();
      } else {
        // signinErrorCase(apiResponse?.data?.error);
      }
    }
  }, [apiResponse]);

  const onSubmit = (event) => {
    event.preventDefault();
    const isNameValid = validateName();
    const isAgeValid = validateAge();
    const isDobValid = validateDob(selectedDate);
    const isGenderValid = loopGender.some((item) => item.checked === true);
    if (!isGenderValid) {
      setGenderErr(EditProfileconstant?.[localLang]?.gender_is_required);
    }
    if (isNameValid && isAgeValid && isGenderValid && isDobValid) {
      const apiData = {
        first_name: appConfig?.settings?.editProfile?.name
          ? nameRef?.current?.value
          : firstNameRef?.current?.value,
        last_name: appConfig?.settings?.editProfile?.firstLastName
          ? lastNameRef?.current?.value
          : "",
        gender: loopGender.find((item) => item.checked === true).value,
      };
      if (appConfig?.settings?.editProfile?.age) {
        apiData.age = ageRef.current.value;
      } else if (appConfig?.settings?.editProfile?.dob) {
        apiData.date_of_birth = `${selectedDate}`;
      }
      const url = `${process.env.initJson.api}/service/api/auth/update/preference`;
      mutateUpdateUserDetails({ url, apiData });
    }
  };

  const validateName = (e) => {
    if (appConfig?.settings?.editProfile?.name) {
      const result = validateN(
        nameRef.current.value,
        appConfig.namePattern,
        EditProfileconstant?.[localLang]
          ?.Not_allowed_space_numbers_and_special_characters,
        localLang
      );

      if (/^[a-zA-Z\s]*$/.test(nameRef.current.value) === false) {
        nameRef.current.value = nameRef.current.value.slice(
          0,
          nameRef.current.value.length - 1
        );
      }
      setNameV(result);
      return result?.valid;
    }

    if (appConfig?.settings?.editProfile?.firstLastName) {
      const fNameResult = validateN(
        firstNameRef.current.value,
        appConfig.namePattern,
        EditProfileconstant?.[localLang]?.First_Name,
        localLang
      );
      setFNameV(fNameResult);
      const lNameResult = validateN(
        lastNameRef.current.value,
        appConfig.namePattern,
        EditProfileconstant?.[localLang]?.Last_Name,
        localLang
      );
      setLNameV(lNameResult);
      return fNameResult?.valid && lNameResult?.valid;
    }
    return true;
    // const reg = new RegExp("^[a-z A-Z]+$");
    // if (nameRef.current.value == undefined || nameRef.current.value == "") {
    //   setNameV({ valid: false, error: "Name Required" });
    // } else if(!reg.test(nameRef.current.value)) {
    //   setNameV({ valid: false, error: "Not allowed numbers and special characters" });
    // }
    //  else {
    //   setNameV({ valid: true, error: "" });
    // }
  };
  const validateMobile = () => {
    if (mobileRef.current.value == undefined || mobileRef.current.value == "") {
      setMobileV({ valid: false, error: "Mobile Number Required" });
      return false;
    }
    if (
      !new RegExp(appConfig?.authMobilePattern).test(mobileRef.current.value)
    ) {
      setMobileV({ valid: false, error: "Invalid Mobile Number" });
      return false;
    }
    setMobileV({ valid: true, error: "" });
    return true;
  };

  const validateAge = () => {
    if (!appConfig?.settings?.editProfile?.age) {
      setAgeV({ valid: true, error: "" });
      return true;
    }
    if (ageRef.current.value == undefined || ageRef.current.value == "") {
      setAgeV({
        valid: false,
        error: EditProfileconstant?.[localLang]?.age_is_required,
      });
      return false;
    }
    if (ageRef.current.value < 18) {
      setAgeV({
        valid: false,
        error: EditProfileconstant?.[localLang]?.age_must_be_at_least_18,
      });
      return false;
    }
    setAgeV({ valid: true, error: "" });
    return true;
  };

  const checkgender = (genIndex = 0, langAry = null) => {
    let duploop = [...loopGender];
    if (langAry != null) {
      duploop = langAry;
    }

    // eslint-disable-next-line no-return-assign
    duploop?.forEach((value) => (value.checked = false));
    if (genIndex !== -1) {
      duploop[genIndex].checked = true;
    }
    setGenderErr("");
    setloopGender(duploop);
  };

  const validateDob = (date) => {
    if (appConfig?.settings?.editProfile?.dob) {
      if (date) {
        const presentDate = dayjs();
        const pastDate = dayjs().subtract(100, "year");
        if (date >= presentDate) {
          setDateV({ valid: false, error: "Invalid DOB" });
          return false;
        }
        if (date <= pastDate) {
          setDateV({ valid: true, error: "Invalid DOB" });
          return false;
        }
        setDateV({ valid: true, error: "" });
        return true;
      }
      setDateV({ valid: false, error: "DOB is Required" });
      return false;
    }
    setDateV({ valid: true, error: "" });
    return true;
  };

  const handleDateChange = (date) => {
    if (date) {
      setDateV({ valid: true, error: "" });
      setSelectedDate(date);
    } else {
      validateDob(date);
    }
  };
  const NavigateBack = () => {
    let gender = loopGender.filter((ele) => ele.checked == true);
    sendEvent("profile_update_skip", {
      ...getPlansDetails(true),
      user_name: !!nameRef?.current?.value ? nameRef?.current?.value : -1,
      gender: !!gender[0]?.value ? gender[0]?.value : -1,
      date_of_birth: !!ageRef?.current?.value ? ageRef?.current?.value : -1,
    });
    router.back();
  };
  return (
    <div className={`${styles.editProfileCont}`}>
      <h2 className={` ${styles.mobileBack}`}>
        <img
          onClick={() => router.back()}
          alt="back"
          className={` ${styles.back}`}
          src={`${ImageConfig?.profile?.back}`}
        />
        {EditProfileconstant[localLang].Personal_Details}
      </h2>
      <div className={`${styles.editProfileCen}`}>
        <h4>{EditProfileconstant[localLang].Enter_your_details}</h4>
        <div className={`${styles.editForm}`}>
          <form onSubmit={onSubmit}>
            <div className={`${styles.nameNumField}`}>
              {appConfig?.settings?.editProfile?.name &&
                !appConfig?.settings?.editProfile?.firstLastName && (
                  <div className={`editprofileFiled ${styles.forgot} `}>
                    <TextField
                      fullWidth
                      id="name"
                      label={EditProfileconstant[localLang].name}
                      name="name"
                      margin="normal"
                      autoFocus
                      variant="outlined"
                      sx={fromStyle2}
                      inputRef={nameRef}
                      onChange={validateName}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      // onFocus={() => setNameV({ valid: true, error: "" })}
                      key="email"
                      defaultValue={nameRef?.current?.value}
                    />
                    <div className={` ${styles.valid_error} `}>
                      {nameV.error}
                    </div>
                  </div>
                )}
              {!appConfig?.settings?.editProfile?.name &&
                appConfig?.settings?.editProfile?.firstLastName && (
                  <>
                    <div className={`editprofileFiled ${styles.forgot} `}>
                      <TextField
                        fullWidth
                        id="firstName"
                        label="First Name*"
                        name="firstName"
                        margin="normal"
                        autoFocus
                        variant="outlined"
                        sx={fromStyle2}
                        inputRef={firstNameRef}
                        onChange={validateName}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onFocus={() => setNameV({ valid: true, error: "" })}
                        key="email"
                        defaultValue={firstNameRef?.current?.value}
                      />
                      <div className={` ${styles.valid_error} `}>
                        {fNameV.error}
                      </div>
                    </div>
                    <div className={`editprofileFiled ${styles.forgot} `}>
                      <TextField
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="name"
                        margin="normal"
                        autoFocus
                        variant="outlined"
                        sx={fromStyle2}
                        inputRef={lastNameRef}
                        onChange={validateName}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onFocus={() => setNameV({ valid: true, error: "" })}
                        key="email"
                        defaultValue={lastNameRef?.current?.value}
                      />
                      <div className={` ${styles.valid_error} `}>
                        {lNameV.error}
                      </div>
                    </div>
                  </>
                )}
              {appConfig?.settings?.editProfile?.mobile && (
                <div
                  className={`editprofileFiled ${styles.forgot}  ${styles.mobile_field}  `}
                >
                  <TextField
                    fullWidth
                    disabled
                    id="mobile"
                    margin="normal"
                    label={EditProfileconstant[localLang].mobile_number}
                    name="mobile"
                    variant="outlined"
                    sx={fromStyle2}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="number"
                    inputRef={mobileRef}
                    onBlur={validateMobile}
                    onFocus={() => setMobileV({ valid: true, error: "" })}
                    key="mobile"
                  />
                  <div className={` ${styles.valid_error} `}>
                    {mobileV.error}
                  </div>
                </div>
              )}
            </div>
            {appConfig?.settings?.editProfile?.age &&
              !appConfig?.settings?.editProfile?.dob && (
                <div
                  className={`editprofileFiled ${styles.forgot} ${styles.ageField} `}
                >
                  <TextField
                    fullWidth
                    id="age"
                    margin="normal"
                    label={EditProfileconstant[localLang].age}
                    name="age"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{ maxLength: 3 }}
                    variant="outlined"
                    sx={fromStyle2}
                    type="number"
                    inputRef={ageRef}
                    onChange={validateAge}
                    onInput={(e) => {
                      e.target.value = Math.max(0, parseInt(e.target.value))
                        .toString()
                        .slice(0, 2);
                    }}
                    min={0}
                    onFocus={() => setMobileV({ valid: true, error: "" })}
                    key="age"
                  />
                  <div className={` ${styles.valid_error} `}>{ageV.error}</div>
                </div>
              )}
            {!appConfig?.settings?.editProfile?.age &&
              appConfig?.settings?.editProfile?.dob && (
                <div className={` ${styles.forgot} ${styles.ageField} `}>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale={appConfig?.datePicker?.format || "en-gb"}
                  >
                    <div className={`${styles.datePicker}`}>
                      <DatePicker
                        label="Date of Birth"
                        format={appConfig?.datePicker?.dformat || "DD/MM/YYYY"}
                        value={
                          selectedDate ? dayjs(new Date(selectedDate)) : null
                        }
                        sx={{ ...fromStyle2, width: "100%" }}
                        onChange={(date) => {
                          const d = new Date(date).getTime();
                          handleDateChange(d);
                        }}
                        disableFuture
                        minDate={dayjs().subtract(100, "year")}
                        maxDate={dayjs()}
                      />
                      <div className={` ${styles.valid_error} `}>
                        {dateV.error}
                      </div>
                    </div>
                  </LocalizationProvider>
                </div>
              )}
            <div className={` ${styles.genderCont} ${styles.forgot}`}>
              <div className={` ${styles.genderLabelSh} `}>
                {`${EditProfileconstant[localLang].Gender} :`}
              </div>
              <div className={`${styles.genderLabel}`}>
                {loopGender.map((values, index) => (
                  <div
                    className={`${styles.loopGender}`}
                    key={values?.value}
                    onChange={() => checkgender(index)}
                  >
                    <div className={`${styles.genderradio}`}>
                      <input
                        type="radio"
                        id={`test${index}`}
                        value={values?.value}
                        className={`${values.checked && styles.whitebtn}`}
                        name="radio-group"
                        checked={values.checked}
                        onChange={() => {}}
                      />
                      <label
                        htmlFor={`test${index}`}
                        className={` ${styles.radiobtn} `}
                      >
                        {values.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className={` ${styles.valid_error} `}>{genderErr}</div>
            </div>
            <div className={` ${styles.btncont} `}>
              <button
                className={` ${styles.button} ${styles.cancel} `}
                type="button"
                onClick={NavigateBack}
              >
                {EditProfileconstant[localLang].Cancel}
              </button>
              <button
                className={` ${styles.button} primary`}
                type="submit"
                disabled={!!isLoading}
              >
                {isLoading ? (
                  <Loader type="button" />
                ) : (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>{EditProfileconstant[localLang].Submit}</>
                )}
              </button>
            </div>
          </form>
          <div className={`${styles.noteFields}`}>
            {EditProfileconstant[localLang].Note}
          </div>
        </div>
      </div>
    </div>
  );
}
