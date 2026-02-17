import { useState, useEffect, useRef } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import styles from "@/components/settings/settings.module.scss";
import Link from "next/link";
import { actions, useStore } from "@/store/store";
import {
  signoutTheApp,
  unAuthorisedHandler,
} from "@/services/data-manager.service";
import { getItem, setItem } from "@/services/local-storage.service";
import { useRouter } from "next/router";
import { appConfig } from "@/config/app.config";
import useGetApiMutate from "@/hooks/useGetApidata";
import { setUserDetails } from "@/services/user.service";
import { Dialog, Switch, styled } from "@mui/material";
import VideoQuality from "./video-quality.component";
import PageLoader from "../loader/page-loder.component";
import { Settingsconstant } from "@/.i18n/locale";
import dynamic from "next/dynamic";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import { getPlansDetails } from "@/services/utility.service";
import Skeleton from "../skeleton/skeleton.component";
import PayCard from "../payment-history/pay-card.component";

const CPActivationList = dynamic(
  () => import("@/components/settings/cpactivation/cp-activation.component")
);
const ProfilePassword = dynamic(
  () =>
    import(
      "../popups/profile/profile-password/profile-password-popup.component"
    )
);
const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
const UpdateEmailComponent = dynamic(
  () => import("../update-email/update-email.component")
);
const UpdateMobileComponent = dynamic(
  () => import("../update-mobile/update-mobile.component")
);
const ProfileSettings = dynamic(() => import("./profile-settings.component"));
const DevicesList = dynamic(() => import("./device-list.component"));
const ParentalSettings = dynamic(() => import("./parental-settings.component"));
const SubscitpionList = dynamic(() => import("./subscriptions.component"));
const OtpVerify = dynamic(() => import("../otpVerify/otpVerify.component"));

const QualityMenuItem = styled(MenuItem)(({}) => ({
  "&.Mui-selected": {
    backgroundColor: "rgba(20, 20, 20, 0.6)",
  },
  "&.Mui-selected:hover": {
    backgroundColor: "rgba(20, 20, 20, 0.6)",
  },
  "&:hover": {
    backgroundColor: "rgba(20, 20, 20, 0.6)",
  },
}));

export default function SettingsPage() {
  const cardData = [
    {
      title: "Subscribed TVF",
      date: "17 Sep 2024 1:21 AM",
      amount: "100.00",
      status: "success",
    },
    {
      title: "Subscribed TVF",
      date: "17 Sep 2024 1:21 AM",
      amount: "100.00",
      status: "canceled",
    },
    // Add more card data as needed
  ]; // carData is dummey data removed later
  const {
    state: {
      SystemFeature,
      SystemConfig,
      userDetails,
      navigateFrom,
      SystemLanguages,
      localLang,
      Location,
    },
    dispatch,
  } = useStore();
  const [isUpdateEmailOpen, setIsUpdateEmailOpen] = useState(false);
  const [isUpdateMobileOpen, setIsUpdateMobileOpen] = useState(false);
  const {
    mutate: mutateGetUserData,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const [vdquality, setVideoQuality] = useState("Auto");
  const [open, setOpen] = useState(false);
  const [popupData, setPopUpData] = useState({});
  const [otpComponent, setOtpComponent] = useState(false);
  const [passwordComponent, setPasswordComponent] = useState(false);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [otpData, setOtpData] = useState();
  const [activepackages, setActivePackagesData] = useState("");
  const router = useRouter();
  const refetchUser = useRef(false);
  const [otpNum, setotpNum] = useState();
  const [deviceId, setDeviceId] = useState();
  const [isUtUser, setUtUser] = useState();
  const [loder, setLoder] = useState(false);
  const [qualitySettings, setQualitySettings] = useState();
  const [isGlobalCCEnabled, setGlobalCCEnabled] = useState(false);
  const fetechuserDetails = () => {
    let url = process.env.initJson["api"] + "/service/api/auth/user/info";
    mutateGetUserData(url);
  };
  const [infoApihitcount, setInfoApihitcount] = useState(false);

  useEffect(() => {
    setUtUser(getItem("isUtuser"));
    setDeviceId(getItem("clientId"));
    setGlobalCCEnabled(getItem("closedCaption"));
  }, []);

  useEffect(() => {
    if (!!apiResponse) {
      if (apiResponse?.data?.status === true) {
        setUserDetails(apiResponse.data.response);
        dispatch({
          type: actions.userDetails,
          payload: apiResponse.data.response,
        });
      } else if (
        apiResponse?.data?.status === false &&
        apiResponse?.data?.error &&
        apiResponse?.data?.error?.code === 401
      ) {
        dispatch({
          type: actions.NotificationBar,
          payload: { message: "Session expired!" },
        });
        unAuthorisedHandler();
      }
    }
  }, [apiResponse]);

  useEffect(() => {
    if (!!SystemConfig && SystemConfig?.configs?.videoQualitySettings) {
      let bitrate = !!getItem("selectedBitRate")
        ? getItem("selectedBitRate")
        : "auto";
      const videoQ = JSON.parse(SystemConfig?.configs?.videoQualitySettings);

      setQualitySettings(videoQ);
      setItem("selectedBitRate", bitrate);
      setVideoQuality(bitrate);
    }
  }, [SystemConfig]);

  useEffect(() => {
    if (!!userDetails) {
      if (refetchUser.current == false) {
        dispatch({ type: actions.PageData, payload: null });
        refetchUser.current = true;
        fetechuserDetails();
        setTimeout(() => {
          setInfoApihitcount(true);
        }, 1000);
      }
    } else {
      let isLogginIn = getItem("isloggedin");
      let Utuser = getItem("isUtuser");
      if (!isLogginIn && !Utuser) {
        router.push("/signin");
      }
    }
  }, [userDetails]);

  useEffect(() => {
    if (!!userDetails && localLang) {
      if (infoApihitcount == true) {
        fetechuserDetails();
      }
    }
  }, [localLang]);
  const handleChangequality = (event) => {
    setItem("selectedBitRate", event.target.value);
    setVideoQuality(event.target.value);
  };

  const handleCloseVideoQuality = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const toggleUpdateEmail = () => {
    setIsUpdateEmailOpen(!isUpdateEmailOpen);
  };
  const toggleUpdateMobile = () => {
    setIsUpdateMobileOpen(!isUpdateMobileOpen);
  };

  const signoutHandler = () => {
    let pop = {
      type: "signout",
      isActive: true,
      title1:
        Settingsconstant[localLang]?.Want_To_Signout ||
        "Are You sure, you want to sign out from this device?",
      yesButton1: Settingsconstant[localLang]?.Sign_Out || "Sign Out",
      yesButtonType: "primary",
      yesButtonTarget1: proccedLogout,
      noButton1: Settingsconstant[localLang]?.Cancel || "Cancel",
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
  };

  const deleteAccountHandler = () => {
    const UserType =
      !!activepackages &&
      activepackages.some((item) => item.gateway === "amazoninapp")
        ? "amazon"
        : "nonamazon";
    const delAccPopupdata = SystemLanguages?.[localLang]?.delAccPopupText
      ? JSON.parse(SystemLanguages?.[localLang]?.delAccPopupText)
      : JSON.parse(SystemConfig?.configs?.delAccPopupText || "{}");
    {
      delAccPopupdata?.subtitle1?.includes("|") ? (
        delAccPopupdata?.subtitle1?.split("|").map((ele) => {
          return <span>{ele}</span>;
        })
      ) : (
        <span>{delAccPopupdata?.subtitle1}</span>
      );
    }
    let pop = {
      type: "deleteAccount",
      isActive: true,
      title1:
        delAccPopupdata.title ||
        "Are You sure, you want to delete your account?",
      title2: delAccPopupdata.subtitle,
      subtitle1: delAccPopupdata?.cppopup?.[UserType],
      yesButton1: Settingsconstant?.[localLang].yes,
      yesButtonType: "primary",
      yesButtonTarget1: proccedDeletion,
      noButton1: Settingsconstant?.[localLang].no,
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      hasSetPassword: userDetails.hasPassword,
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
    setConfirmPopup(true);
  };

  const handleClose = () => {
    setOtpComponent(false);
    setPopUpData({});
  };

  const proccedLogout = () => {
    sendEvent("signout", getPlansDetails(true));
    setLoder(true);
    handleClose();
    signoutTheApp();
  };

  const proccedDeletion = () => {
    deleteAccount();
    setConfirmPopup(false);
    if (appConfig.deleteAccountType.otp === true) {
      setOtpComponent(true);
    } else {
      setPasswordComponent(true);
    }
  };

  const onBack = () => {
    if (isUtUser) {
      window.location.href = SystemConfig.configs.siteURL;
    } else {
      if (!!navigateFrom) {
        dispatch({ type: actions.navigateFrom, payload: null });
        router.push(navigateFrom);
      } else {
        router.push("/");
      }
    }
  };

  const scprops = {
    border: "none",
    backgroundColor: "#222",
    boxShadow: "none",
  };

  const showSubscriptionBtn = (data) => {
    setActivePackagesData(data);
  };

  const explorePlans = (e) => {
    e?.stopPropagation();
    router.push("/plans/list");
  };

  const callbacksuccess = (data) => {
    setOtpData();
    setotpNum(data);
    router.push("/");
  };
  const deleteAccount = () => {
    if (appConfig.deleteAccountType.otp === true) {
      let fd = {
        from: "delete_account",
        context: "delete_account",
        data: {
          title1: `${Settingsconstant[localLang].otp_has_sent} ******${userDetails.phoneNumber.slice(userDetails.phoneNumber.length - 4)}`,
          mobile: `${userDetails.phoneNumber}`,
        },
      };
      setOtpData(fd);
    } else {
      let fd = {
        type: "deleteAccountPassword",
        subtype: "DeleteAccount",
        isActive: true,
        userProfile: userDetails,
        closeTarget: handleClose,
        hasSetPassword: userDetails.hasPassword,
      };
      setPopUpData(fd);
    }
  };

  const handleClosedCaption = (event) => {
    setItem("closedCaption", event.target.checked);
    setGlobalCCEnabled(event.target.checked);
  };

  const paymentHistoryRedirection = () => {
    let isUtuser = getItem("isUtuser");
    sendEvent("transaction_history", getPlansDetails());
    if (!!isUtuser && appConfig.settings.transaction === 2) {
      window.open(
        SystemConfig.configs.siteURL + "openlink?redirect=/transaction",
        "_self"
      );
    } else {
      router.push("swag/payment-history");
    }
    sendEvent("transaction_history", getPlansDetails());
  };

  return (
    <>
      {!!userDetails ? (
        <div className={`${styles.settings}`}>
          <div className={`${styles.container}`}>
            <span className={` ${styles.mobileBack}`} onClick={onBack}>
              <img
                alt="back"
                className={` ${styles.back}`}
                src={`${ImageConfig?.settings?.back}`}
              />
              {Settingsconstant[localLang].Account_Settings}
            </span>

            <div className={`settings_inner ${styles.settings_inner}`}>
              <Accordion sx={scprops} defaultExpanded>
                <AccordionSummary
                  className={`${styles.account_info}`}
                  expandIcon={<ExpandMoreIcon className={`${styles.arrow}`} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <div className={`${styles.info_heading}`}>
                    {Settingsconstant[localLang].Account_Details}
                  </div>
                </AccordionSummary>
                <AccordionDetails className={`${styles.user_details}`}>
                  {!!appConfig.settings.personal && (
                    <div className={`${styles.user_values}`}>
                      <div className={`${styles.details_hd}`}>
                        {Settingsconstant[localLang].Personal_Details}
                        <div className={`${styles.sub_hd}`}>
                          {
                            Settingsconstant[localLang]
                              .Change_your_Name_Age_and_Gender
                          }
                        </div>
                        {SystemFeature?.globalsettings?.fields
                          ?.changeEmailSupport === "true" &&
                          userDetails?.loginMode != (5 || "5") && (
                            <div
                              className={` title ${styles.link} `}
                              onClick={toggleUpdateEmail}
                            >
                              {Settingsconstant[localLang].Change}
                            </div>
                          )}
                      </div>
                      <Link
                        href={"/settings/edit-profile"}
                        className={` title ${styles.link} `}
                        onClick={() =>
                          sendEvent("personal_details_edit", getPlansDetails())
                        }
                      >
                        {" "}
                        {Settingsconstant[localLang].Edit}
                      </Link>
                    </div>
                  )}
                  {!!appConfig.settings.email && (
                    <div className={`${styles.user_values}`}>
                      <div className={`${styles.left}`}>
                        <div className={`${styles.details_hd}`}>
                          {Settingsconstant[localLang].Email + " :"}
                        </div>
                        {SystemFeature?.globalsettings?.fields
                          ?.changeMobileSupport === "true" &&
                          userDetails?.loginMode != (5 || "5") && (
                            <div
                              className={` title ${styles.link} `}
                              onClick={toggleUpdateMobile}
                            >
                              {Settingsconstant[localLang].Update}
                            </div>
                          )}
                      </div>
                      {SystemFeature?.globalsettings?.fields
                        ?.changeEmailSupport === "true" && (
                        <div
                          className={` title ${styles.link} `}
                          onClick={toggleUpdateEmail}
                        >
                          {Settingsconstant[localLang].Change}
                        </div>
                      )}
                    </div>
                  )}
                  {!!appConfig.settings.mobile && (
                    <div className={`${styles.user_values}`}>
                      <div className={`${styles.left}`}>
                        <div className={`${styles.details_hd}`}>
                          {Settingsconstant[localLang].Mobile_Number + " :"}
                        </div>
                        <div className={`${styles.text}`}>
                          {userDetails?.phoneNumber}
                        </div>
                      </div>
                      {SystemFeature?.globalsettings?.fields
                        ?.changeMobileSupport === "true" && (
                        <div
                          className={` title ${styles.link} `}
                          onClick={toggleUpdateMobile}
                        >
                          {Settingsconstant[localLang].Update}
                        </div>
                      )}
                    </div>
                  )}
                  {!!appConfig.settings.password && (
                    <div className={`${styles.user_values}`}>
                      <div className={`${styles.left}`}>
                        <div className={`${styles.details_hd}`}>
                          {Settingsconstant[localLang].Password + " :"}
                        </div>
                        <div className={`${styles.text}`}>
                          {Settingsconstant[localLang].Hide_Password}
                        </div>
                      </div>
                      <Link
                        href={
                          !!userDetails &&
                          "hasPassword" in userDetails &&
                          userDetails["hasPassword"] === true
                            ? `/change-password`
                            : `/set-password`
                        }
                        className={` title ${styles.link} `}
                      >
                        {!!userDetails &&
                        "hasPassword" in userDetails &&
                        userDetails["hasPassword"] === true
                          ? `${Settingsconstant[localLang].Change}`
                          : `${Settingsconstant[localLang].Create}`}
                      </Link>
                    </div>
                  )}
                  {appConfig.settings?.showDeleteWeb && (
                    /* {((appConfig.settings?.showDeleteWeb && !isUtUser) ||
                    (isUtUser &&
                      ((!!appConfig.settings.showDeleteButtonIos &&
                        (deviceId === "6" || deviceId === "7")) ||
                        (!!appConfig.settings.showDeleteButtonAndroid &&
                          deviceId === "11")))) && ( */
                    <div className={`${styles.user_values}`}>
                      <div className={`${styles.details_hd}`}>
                        {Settingsconstant[localLang].Delete_Account}
                        <div className={`${styles.sub_hd}`}>
                          {
                            Settingsconstant[localLang]
                              .All_your_information_will_be_lost_and_undercoverable
                          }
                        </div>
                      </div>
                      <div
                        className={` title ${styles.link} `}
                        onClick={deleteAccountHandler}
                      >
                        {Settingsconstant[localLang].Delete}
                      </div>
                    </div>
                  )}
                  {!!appConfig.settings.logout && !isUtUser && (
                    <div className={`${styles.user_values}`}>
                      <div className={`${styles.details_hd}`}>
                        {Settingsconstant[localLang].Sign_Out}
                        <div className={`${styles.sub_hd}`}>
                          {
                            Settingsconstant[localLang]
                              .You_Will_be_Signed_out_from_this_device
                          }
                        </div>
                      </div>
                      <div
                        className={` title ${styles.link} `}
                        onClick={signoutHandler}
                      >
                        {Settingsconstant[localLang].Sign_Out}
                      </div>
                    </div>
                  )}
                </AccordionDetails>
              </Accordion>
              <Accordion sx={scprops}>
                <AccordionSummary
                  className={`${styles.account_info} ${!isUtUser ? `${styles.active}` : ""} `}
                  expandIcon={<ExpandMoreIcon className={`${styles.arrow}`} />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <div className={`${styles.info_heading}`}>
                    {Settingsconstant[localLang].Active_Screens_Devices}
                  </div>
                  {!isUtUser &&
                    (Location?.ipInfo?.countryCode === "IN" ||
                      Location?.ipInfo?.countryCode === "US") && (
                      <button className={`${styles.activate_btn}`}>
                        {
                          <Link
                            href={{ pathname: "/activate/device" }}
                            onClick={() => {
                              dispatch({
                                type: actions.navigateFrom,
                                payload: router.asPath,
                              });
                              sendEvent(
                                "activate_TV_initiated",
                                getPlansDetails()
                              );
                            }}
                          >
                            {Settingsconstant[localLang].Activate_TV}
                          </Link>
                        }
                      </button>
                    )}
                </AccordionSummary>
                <AccordionDetails className={`${styles.user_details}`}>
                  <DevicesList></DevicesList>
                </AccordionDetails>
              </Accordion>

              {!!appConfig.settings.showPackages && (
                <Accordion sx={scprops} defaultExpanded>
                  <AccordionSummary
                    className={`${styles.subscriptionInfo}`}
                    expandIcon={
                      <ExpandMoreIcon className={`${styles.arrow}`} />
                    }
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <div className={`${styles.info_heading}`}>
                      {Settingsconstant[localLang].Subscription}
                    </div>
                    {(Location?.ipInfo?.countryCode === "IN" ||
                      Location?.ipInfo?.countryCode === "US") &&
                      activepackages?.length === 0 && (
                        <button className={`${styles.activate_btn}`}>
                          <span onClick={explorePlans}>
                            {Settingsconstant[localLang].Explore_Plans}
                          </span>
                        </button>
                      )}
                    {/* {!!activepackages && activepackages?.filter(ele=>ele.isUpGradeable).length > 0 &&<button type="button" className={`${styles.activate_btn}`}>
                <span onClick={(e) => {e?.stopPropagation(); router.push('/plans/list')}} >Upgrade Plan</span>
              </button>} */}
                  </AccordionSummary>
                  <AccordionDetails
                    className={`${styles.user_details} ${styles.packages_info} `}
                  >
                    <SubscitpionList showButton={showSubscriptionBtn} />
                  </AccordionDetails>
                </Accordion>
              )}

              {(Location?.ipInfo?.countryCode === "IN" ||
                Location?.ipInfo?.countryCode === "US") &&
                appConfig.settings?.cpactivation &&
                SystemConfig?.configs?.showActivateCp == "true" &&
                !!activepackages?.length && (
                  <Accordion sx={scprops}>
                    <AccordionSummary
                      className={`${styles.account_info} ${!isUtUser ? `${styles.active}` : ""} `}
                      expandIcon={
                        <ExpandMoreIcon className={`${styles.arrow}`} />
                      }
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                      <div className={`${styles.info_heading}`}>
                        {Settingsconstant[localLang].Activate_CP}
                      </div>
                    </AccordionSummary>
                    <AccordionDetails className={`${styles.user_details}`}>
                      <CPActivationList />
                    </AccordionDetails>
                  </Accordion>
                )}
              {appConfig.settings?.isCCEnable1 && (
                <Accordion sx={scprops} expanded={true} defaultExpanded>
                  <AccordionDetails
                    className={`${styles.account_info} ${styles.closed_caption}`}
                  >
                    <div className={`${styles.info_heading}`}>
                      {Settingsconstant[localLang].Closed_Caption}
                    </div>
                    <div>
                      <Switch
                        {...{ inputProps: { "aria-label": "closed caption" } }}
                        color="default"
                        checked={isGlobalCCEnabled}
                        onChange={handleClosedCaption}
                        className="customCC-switch"
                      />
                    </div>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* swag accordian stars here */}

              {false && (
                <Accordion sx={scprops} expanded={true} defaultExpanded>
                  <AccordionSummary
                    className={`${styles.account_info}`}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <div className={`${styles.info_heading}`}>
                      {Settingsconstant[localLang].SWAG_Transactions}
                    </div>
                  </AccordionSummary>

                  <AccordionDetails className={`${styles.user_details}`}>
                    <div className={styles.cardswraper}>
                      {cardData.map((data, index) => (
                        <PayCard
                          key={index}
                          title={data.title}
                          date={data.date}
                          amount={data.amount}
                          status={data.status}
                        />
                      ))}
                    </div>

                    <div>
                      <p
                        className={styles.t_history}
                        onClick={() => {
                          paymentHistoryRedirection();
                        }}
                      >
                        {Settingsconstant[localLang].Transaction_History}
                      </p>
                    </div>
                  </AccordionDetails>
                </Accordion>
              )}
              {/* swag accordian ends here */}

              {!isUtUser && !!appConfig.settings.userSettings && (
                <Accordion
                  sx={scprops}
                  className={`${styles.videoquality_web}`}
                >
                  <AccordionSummary
                    className={`${styles.account_info}`}
                    expandIcon={
                      <ExpandMoreIcon className={`${styles.arrow}`} />
                    }
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <div className={`${styles.info_heading}`}>
                      {Settingsconstant[localLang].User_Settings}
                    </div>
                  </AccordionSummary>
                  {appConfig.settings?.videoQuality && (
                    <AccordionDetails
                      className={`${styles.user_details} ${styles.videoquality_web}`}
                    >
                      <div>{Settingsconstant[localLang].Video_Quality}</div>
                      <div>
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                          {/* <InputLabel id="demo-controlled-open-select-label">Video Quality</InputLabel> */}
                          <Select
                            className={`${styles.video_quality}`}
                            labelId="demo-controlled-open-select-label"
                            id="demo-controlled-open-select"
                            open={open}
                            onClose={handleCloseVideoQuality}
                            onOpen={handleOpen}
                            IconComponent={() => (
                              <KeyboardArrowDownIcon
                                onClick={handleOpen}
                                sx={{
                                  color: "currentColor",
                                  cursor: "pointer",
                                }}
                              />
                            )}
                            value={vdquality}
                            label="Age"
                            inputProps={{
                              MenuProps: {
                                MenuListProps: {
                                  sx: {
                                    backgroundColor: "#282828",
                                    color: "white",
                                    "&:focused": {
                                      border: "none",
                                    },
                                  },
                                },
                              },
                            }}
                            onChange={handleChangequality}
                          >
                            {qualitySettings?.length > 0 &&
                              qualitySettings?.map((q) => {
                                return (
                                  <QualityMenuItem key={q.code} value={q.code}>
                                    {Settingsconstant[localLang][q.code]}
                                  </QualityMenuItem>
                                );
                              })}
                          </Select>
                        </FormControl>
                      </div>
                    </AccordionDetails>
                  )}
                  {((appConfig.settings?.showDeleteWeb && !isUtUser) ||
                    (appConfig.settings?.isCCEnable2 && !isUtUser) ||
                    (isUtUser &&
                      ((!!appConfig.settings.showDeleteButtonIos &&
                        (deviceId === "6" || deviceId === "7")) ||
                        (!!appConfig.settings.showDeleteButtonAndroid &&
                          deviceId === "11")))) && (
                    <AccordionDetails className={`${styles.user_details}`}>
                      {appConfig.settings?.isCCEnable2 && !isUtUser && (
                        <div className={`${styles.user_values}`}>
                          <div className={`${styles.details_hd}`}>
                            {Settingsconstant[localLang].Closed_Caption}
                          </div>
                          <div className={` title ${styles.link} `}>
                            <Switch
                              {...{
                                inputProps: { "aria-label": "closed caption" },
                              }}
                              color="default"
                              checked={isGlobalCCEnabled}
                              onChange={handleClosedCaption}
                              className="customCC-switch"
                            />
                          </div>
                        </div>
                      )}
                    </AccordionDetails>
                  )}
                </Accordion>
              )}
              {/* {!isUtUser && appConfig.settings?.videoQuality && (
                <VideoQuality qualityOptions={qualitySettings}> </VideoQuality>
              )} */}
              {((!!SystemFeature &&
                !!SystemFeature.userprofiles &&
                SystemFeature.userprofiles.fields.is_userprofiles_supported ==
                  "true") ||
                !!appConfig.settings.profileControls) && (
                <Accordion sx={scprops} expanded={true} defaultExpanded>
                  <AccordionSummary
                    className={`${styles.account_info} ${styles.profile_main}`}
                  >
                    <div className={`${styles.info_heading}`}>
                      {Settingsconstant[localLang].Profile_Parental_Controls}
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className={`${styles.profile}`}>
                    <ProfileSettings></ProfileSettings>
                  </AccordionDetails>
                </Accordion>
              )}
              {((!!SystemFeature &&
                !!SystemFeature.userprofiles &&
                SystemFeature.userprofiles.fields.is_userprofiles_supported ==
                  "false" &&
                SystemFeature?.parentalcontrol?.fields
                  ?.is_parental_control_supported == "true") ||
                !!appConfig.settings.parentalControls) && (
                <Accordion sx={scprops} expanded={true} defaultExpanded>
                  <AccordionSummary
                    className={`${styles.account_info} ${styles.profile_main}`}
                  >
                    <div className={`${styles.info_heading}`}>
                      {Settingsconstant[localLang].Profile_Parental_Controls}
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className={`${styles.profile}`}>
                    <ParentalSettings />
                  </AccordionDetails>
                </Accordion>
              )}
            </div>
          </div>
          {/* delete account popup */}
          <Dialog open={popupData.isActive ? popupData.isActive : false}>
            {appConfig.deleteAccountType.otp === true
              ? otpComponent && (
                  <OtpVerify
                    otpData={otpData}
                    callbacksuccess={callbacksuccess}
                    returnBack={() => handleClose()}
                  />
                )
              : passwordComponent &&
                popupData.type === "deleteAccountPassword" && (
                  <ProfilePassword popupData={popupData} />
                )}
          </Dialog>

          {popupData.isActive && popupData.type === "signout" && (
            <PopupModal popupData={popupData} />
          )}
          {confirmPopup &&
            popupData.isActive &&
            popupData.type === "deleteAccount" && (
              <PopupModal popupData={popupData} />
            )}
          {
            <UpdateEmailComponent
              isOpen={isUpdateEmailOpen}
              onClose={toggleUpdateEmail}
            />
          }
          {
            <UpdateMobileComponent
              isOpen={isUpdateMobileOpen}
              onClose={toggleUpdateMobile}
            />
          }
          {loder && <PageLoader />}
        </div>
      ) : (
        <Skeleton></Skeleton>
      )}
    </>
  );
}
