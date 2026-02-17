import styles from "@/components/settings/device-list.module.scss";
import Link from "next/link";
import { actions, useStore } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import useGetApiMutate from "@/hooks/useGetApidata";
import TvIcon from "@mui/icons-material/Tv";
import LaptopIcon from "@mui/icons-material/Laptop";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import usePostApiMutate from "@/hooks/usePostApidata";
import { DeviceListconstant, DeviceLogoutConstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
const PopupModal = dynamic(() => import("../popups/generic/popup-modal"));
export default function DevicesList({ isPage = false, defaultTab }) {
  const [activeDevices, setActiveDevices] = useState([]);
  const [activeScreens, setActiveScreens] = useState([]);
  const [popupData, setPopUpData] = useState({});
  const [confirmPopup, setConfirmPopup] = useState(false);
  const { mutate: mutateGetdeviceData, data: apiResponseDevice } =
    useGetApiMutate();
  const { mutate: mutateGetScreenssubData, data: apiResponseScreens } =
    useGetApiMutate();
  const { mutate: mutateClosePlayer, data: closePlayerData } =
    usePostApiMutate();
  const { mutate: mutateLogoutDevice, data: apiResponseLogoutDevice } =
    usePostApiMutate();
  const [isActive, setIsActive] = useState(defaultTab || 1);
  const refetchUser = useRef(false);
  const router = useRouter();
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();

  useEffect(() => {
    if (!!userDetails && refetchUser.current == false) {
      refetchUser.current = true;
      getActiveDevices();
      getActiveScreens();
    }
  }, [userDetails]);
  useEffect(() => {
    if (isPage && isActive !== null) {
      if (isActive === 1 && router.asPath !== "/active/devices") {
        router.push("/active/devices");
      } else if (isActive === 2 && router.asPath !== "/active/screens") {
        router.push("/active/screens");
      }
    }
  }, [isActive, isPage]);

  useEffect(() => {
    if (isPage && defaultTab !== undefined && defaultTab !== isActive) {
      setIsActive(defaultTab);
    }
  }, [defaultTab, isActive]);

  const getActiveDevices = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/list/user/sessions";
    mutateGetdeviceData(url);
  };

  const getActiveScreens = () => {
    let url =
      process.env.initJson["api"] + "/service/api/v1/stream/active/sessions";
    mutateGetScreenssubData(url);
  };

  const closePlayer = (device, i) => {
    let apiData = new FormData();
    apiData.append("poll_key", device.streamPollKey);
    let url =
      process.env.initJson["api"] + "/service/api/v1/stream/session/end";
    mutateClosePlayer({ url, apiData });
    setActiveScreens((prevActiveScreens) =>
      prevActiveScreens.filter((_, index) => index !== i)
    );
    handleClose();
  };

  const logoutAccountHandler = (device, i) => {
    let pop = {
      type: "logoutDevice",
      isActive: true,
      title1: DeviceLogoutConstant[localLang].Want_To_Logout,
      yesButton1: DeviceLogoutConstant[localLang].Confirm,
      yesButtonType: "primary",
      yesButtonTarget1: () => delectiveActiveDevice(device, i),
      noButton1: DeviceLogoutConstant[localLang].Cancel,
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
    setConfirmPopup(true);
  };
  const handleClose = () => {
    setPopUpData({});
  };
  const closeScreens = (device, i) => {
    let pop = {
      type: "logoutDevice",
      isActive: true,
      title1:
        "Are you sure, you want to close the screen from selected Device?",
      yesButton1: "Cancel",
      yesButtonType: "primary",
      yesButtonTarget1: handleClose,
      noButton1: "Confirm",
      noButtontarget1: () => closePlayer(device, i),
      noButtonType: "secondary",
      close: true,
      closeTarget: handleClose,
    };
    setPopUpData(pop);
    setConfirmPopup(true);
  };
  const delectiveActiveDevice = (device, i) => {
    let apiData = new FormData();
    apiData.append("session_id", device.sessionId);
    let url = process.env.initJson["api"] + "/service/api/auth/logout/session";
    mutateLogoutDevice({ url, apiData });
    setActiveDevices((prevActiveScreens) =>
      prevActiveScreens.filter((_, index) => index !== i)
    );
  };
  useEffect(() => {
    if (!!apiResponseLogoutDevice) {
      setConfirmPopup(false);
      dispatch({
        type: actions.NotificationBar,
        payload: {
          message: apiResponseLogoutDevice?.data?.response?.message || "",
        },
      });
    }
  }, [apiResponseLogoutDevice]);
  useEffect(() => {
    if (!!apiResponseDevice) {
      setActiveDevices(apiResponseDevice.data.response);
    }
  }, [apiResponseDevice]);

  useEffect(() => {
    if (!!apiResponseScreens) {
      setActiveScreens(apiResponseScreens.data.response);
    }
  }, [apiResponseScreens]);
  return (
    <div className={`${styles.device_list}`}>
      <div className={`${styles.disply_inline}`}>
        <button
          className={`${styles.active_device} ${
            isActive === 1 ? `${styles.active}` : ``
          }`}
          onClick={() => setIsActive(1)}
        >
          {DeviceListconstant[localLang].Active_Devices}
        </button>
        {appConfig?.settings?.activeScreens === true && (
          <button
            className={`${styles.active_device} ${styles.activeScreens}  ${
              isActive === 2 ? `${styles.active}` : ``
            }`}
            onClick={() => setIsActive(2)}
          >
            {DeviceListconstant[localLang].Active_Screens}
          </button>
        )}
      </div>
      {isActive === 1 && (
        <div className={`${styles.stream_details}`}>
          <ul className={`${styles.add_scroll} ${isPage && styles.no_scroll}`}>
            {activeDevices?.map((device, i) => (
              <li key={i}>
                <div className={`${styles.device_row}`}>
                  <div className={`${styles.devices_left}`}>
                    <div className={`${styles.device_img}`}>
                      {device.deviceId != 11 &&
                        device.deviceId != 7 &&
                        device.deviceId != 5 &&
                        device.deviceId != 61 && (
                          <span>
                            <TvIcon fontSize="large"></TvIcon>
                          </span>
                        )}
                      {(device.deviceId == 7 ||
                        device.deviceId == 11 ||
                        device.deviceId == 61) && (
                        <span>
                          <PhoneAndroidIcon fontSize="large"></PhoneAndroidIcon>
                        </span>
                      )}
                      {device.deviceId == 5 && (
                        <span>
                          <LaptopIcon fontSize="large"></LaptopIcon>
                        </span>
                      )}
                    </div>
                    <div className={`${styles.device_info}`}>
                      <span className={`${styles.device_name}`}>
                        {device?.deviceTypeDetails?.name}
                      </span>
                      <span className={`${styles.device_loginTime}`}>
                        {DeviceListconstant[localLang].Last_Logged_In}{" "}
                        {new Date(device.loginTime).toLocaleString()}
                      </span>
                      <span className={`${styles.device_subtype}`}>
                        {device.deviceSubtype}
                      </span>
                    </div>
                  </div>
                  <div className={`${styles.devices_right}`}>
                    {device.isCurrentDevice != true ? (
                      <div>
                        <span
                          className={`${styles.delete_device}`}
                          onClick={() => logoutAccountHandler(device, i)}
                        >
                          {DeviceListconstant[localLang].Logout_Device}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className={`${styles.current_device}`}>
                          {DeviceListconstant[localLang].Current_Device}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isActive === 2 && activeScreens?.length > 0 ? (
        <div className={`${styles.stream_details}`}>
          <ul className={`${styles.add_scroll}`}>
            {activeScreens?.map((device, i) => (
              <li key={i}>
                <div className={`${styles.device_row}`}>
                  <div className={`${styles.devices_left}`}>
                    <div className={`${styles.device_img}`}>
                      {device.deviceId != 11 &&
                        device.deviceId != 7 &&
                        device.deviceId != 5 &&
                        device.deviceId != 61 && (
                          <span>
                            <TvIcon fontSize="large"></TvIcon>
                          </span>
                        )}
                      {(device.deviceId == 7 ||
                        device.deviceId == 11 ||
                        device.deviceId == 61) && (
                        <span>
                          <PhoneAndroidIcon fontSize="large"></PhoneAndroidIcon>
                        </span>
                      )}
                      {device.deviceId == 5 && (
                        <span>
                          <LaptopIcon fontSize="large"></LaptopIcon>
                        </span>
                      )}
                    </div>
                    <div className={`${styles.device_info}`}>
                      <span className={`${styles.device_name}`}>
                        {device.deviceName}
                      </span>
                    </div>
                  </div>
                  <div className={`${styles.devices_right}`}>
                    <span
                      className={`${styles.delete_device}`}
                      onClick={() => closeScreens(device, i)}
                    >
                      {DeviceListconstant[localLang].Close_Screen}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : isActive === 2 ? (
        <div className={`${styles.noScreens}`}>
          <p>{DeviceListconstant[localLang].No_Active_Screens}</p>
        </div>
      ) : (
        ""
      )}
      {confirmPopup &&
        popupData.isActive &&
        popupData.type === "logoutDevice" && (
          <PopupModal popupData={popupData}></PopupModal>
        )}
    </div>
  );
}
