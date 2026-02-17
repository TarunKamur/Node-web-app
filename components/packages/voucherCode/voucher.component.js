import { Ordersummaryconstant } from "@/.i18n/locale";
import PageLoader from "@/components/loader/page-loder.component";
import { ImageConfig } from "@/config/ImageConfig";
import useFromApiMutate from "@/hooks/useFromApidata";
import useUserDetailsUpdate from "@/hooks/useUserDetailsUpdate";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import { Drawer } from "@mui/material";
import styles from "./voucher.module.scss";
import { appConfig } from "@/config/app.config";

const VoucherCode = ({
  setPopUpData,
  navigateTo,
  proceedTopay,
  packageId,
  isloggedin,
}) => {
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const closeOverlay = (e) => {
    e.stopPropagation();
    setShowVoucherInput(false);
  };

  useEffect(() => {
    function windowResizeHandler() {
      if (window.screen.width < 767) {
        setIsMobile(true);
      }
    }
    windowResizeHandler();
    window.addEventListener("resize", windowResizeHandler);
    return () => {
      window.removeEventListener("resize", windowResizeHandler);
    };
  }, []);

  return (
    <div
      className={`${styles.coupon_code} ${!showVoucherInput ? styles.have_code : ""}`}
      onClick={() => {
        setShowVoucherInput(true);
      }}
    >
      {(!showVoucherInput || isMobile) && <h3>Have a Voucher Code?</h3>}
      {showVoucherInput && (
        <>
          <div className={`${styles.coupon_code_inner}`}>
            <InnerVoucherCode
              setPopUpData={setPopUpData}
              navigateTo={navigateTo}
              proceedTopay={proceedTopay}
              packageId={packageId}
              isloggedin={isloggedin}
              setShowVoucherInput={setShowVoucherInput}
            />
          </div>
          {isMobile && (
            <Drawer
              className={`${styles.showInMob}`}
              anchor="top"
              open={showVoucherInput}
              onClose={(e) => closeOverlay(e)}
            >
              <div className={`${styles.coupon_code} ${styles.bottomOverlay}`}>
                <span
                  className={`${styles.close_icon}`}
                  onClick={(e) => closeOverlay(e)}
                />
                <div>
                  <InnerVoucherCode
                    setPopUpData={setPopUpData}
                    navigateTo={navigateTo}
                    proceedTopay={proceedTopay}
                    packageId={packageId}
                    isloggedin={isloggedin}
                    setShowVoucherInput={setShowVoucherInput}
                  />
                </div>
              </div>
            </Drawer>
          )}
        </>
      )}
    </div>
  );
};
const InnerVoucherCode = ({
  setPopUpData,
  navigateTo,
  proceedTopay,
  packageId,
  isloggedin,
  setShowVoucherInput,
}) => {
  const {
    state: { localLang, SystemConfig },
  } = useStore();
  const voucherCodeParams = JSON.parse(
    SystemConfig?.configs?.voucherCodeParams
  );
  const [voucherCode, setVoucherCode] = useState("");
  const {
    mutate: mutateVoucherApply,
    data: apiVocherResponse,
    isLoading,
  } = useFromApiMutate();
  const { updateUser } = useUserDetailsUpdate();

  const applyVoucher = () => {
    if (isloggedin) {
      const url = `${process.env.initJson.api}/service/api/v1/voucher/apply`;
      const apiData = {
        voucher_code: voucherCode,
        // package_id: packageId.toString(),
      };
      try {
        mutateVoucherApply({ url, apiData });
      } catch (e) {
        // err
      }
    } else {
      const pop = {
        type: "signin",
        isActive: true,
        title1:
          Ordersummaryconstant[localLang]?.To_Avail_Voucher ||
          "To avail the Voucher Code",
        title2: "Sign in or Join to enjoy uninterrupted services",
        yesButton1: Ordersummaryconstant[localLang]?.Sign_In || "Sign In",
        yesButtonType: "secondary",
        yesButtonTarget1: () => navigateTo("signin"),
        noButton1: Ordersummaryconstant[localLang]?.Sign_Up || "Sign Up",
        noButtontarget1: () => navigateTo("signup"),
        noButtonType: "primary",
        close: true,
        closeTarget: () => setPopUpData({}),
      };
      setPopUpData(pop);
    }
  };

  useEffect(() => {
    if (apiVocherResponse?.data) {
      if (apiVocherResponse?.data?.status) {
        updateUser();
        const pop = {
          isActive: true,
          type: "signin",
          topImg: true,
          topImgValue: ImageConfig?.popup?.success,
          title1: apiVocherResponse?.data?.response?.message,
          title2: apiVocherResponse?.data?.response?.message2,
          yesButton1: "Continue Browsing",
          yesButtonType: "primary",
          yesButtonTarget1: () => navigateTo(""),
          close: false,
        };
        setPopUpData(pop);
      } else if (apiVocherResponse?.data?.error?.code == -1) {
        const pop = {
          isActive: true,
          type: "signin",
          topImg: true,
          topImgValue: ImageConfig?.popup?.warning,
          title1: apiVocherResponse?.data?.error?.message,
          yesButton1: "Ok",
          yesButtonType: "primary",
          yesButtonTarget1: () => setPopUpData({}),
          close: true,
          closeTarget: () => setPopUpData({}),
        };
        setPopUpData(pop);
      } else {
        const pop = {
          isActive: true,
          type: "signin",
          topImg: true,
          topImgValue: ImageConfig?.popup?.error,
          title1: apiVocherResponse?.data?.error?.message,
          title2: apiVocherResponse?.data?.error?.details?.description,
          yesButton1: "Try again",
          yesButtonType: "secondary",
          yesButtonTarget1: () => setPopUpData({}),
          noButton1: Ordersummaryconstant[localLang].Proceed_To_Pay,
          noButtontarget1: () => {
            setShowVoucherInput(false);
            setPopUpData({});
            proceedTopay();
          },
          noButtonType: "primary",
          close: true,
          closeTarget: () => setPopUpData({}),
        };
        setPopUpData(pop);
      }
    }
  }, [apiVocherResponse]);

  return (
    <>
      {isLoading && <PageLoader />}
      <h4>{voucherCodeParams?.title}</h4>
      <p>{voucherCodeParams?.description}</p>
      <form>
        <div className={`${styles.coupon_section}`}>
          <div className={`${styles.coupon_box}`}>
            <div className={`${styles.input_section}`}>
              <input
                className={`${voucherCode.length > 0 && voucherCode.length != appConfig.packageSettings.voucherLength ? styles.not_valid : ""}`}
                placeholder="Voucher Code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                maxLength={appConfig.packageSettings.voucherLength}
              />
              <button
                type="button"
                className={`${voucherCode.length != appConfig.packageSettings.voucherLength ? styles.disabled : ""}`}
                disabled={
                  voucherCode.length != appConfig.packageSettings.voucherLength
                    ? true
                    : false
                }
                onClick={applyVoucher}
              >
                Apply
              </button>
            </div>
            {voucherCode.length > 0 &&
              voucherCode.length != appConfig.packageSettings.voucherLength && (
                <span className={`${styles.error}`}>
                  Please enter valid voucher code
                </span>
              )}
          </div>
        </div>
      </form>
    </>
  );
};
export default VoucherCode;
