import Link from "next/link";
import styles from "@/components/activate-voucher/activate-voucher.module.scss";
import { appConfig } from "@/config/app.config";
import { useStore } from "@/store/store";
import { ActivateVoucher } from "@/.i18n/locale";
import { getItem } from "@/services/local-storage.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { useEffect, useState } from "react";
import VoucherStatus from "./voucher-status.component";
const VoucherActivate = () => {
  const {
    state: { localLang },
  } = useStore();
  const [voucherValue, setVoucherValue] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const isLoggedIn = getItem("isloggedin");
  const [showSuccessPage, setshowSuccessPage] = useState(false);
  const { mutate: mutateActivateVoucherData, data: activateVoucherResponse } =
    usePostApiMutate();

  // voucher api response
  useEffect(() => {
    if (activateVoucherResponse?.data?.status) {
      setshowSuccessPage(true);
    } else {
      setErrMsg(activateVoucherResponse?.data?.error?.message);
    }
  }, [activateVoucherResponse]);

  // voucher input value change
  const inputChangeHandler = (event) => {
    setVoucherValue(event.target.value);
    setErrMsg("");
  };

  // on applying voucher -- YOTT-1400
  const applyVoucherHandler = (event) => {
    event.preventDefault();
    if (!!voucherValue) {
      let url = process.env.initJson["api"] + "/service/api/v1/voucher/apply";
      let apiData = new FormData();
      apiData.append("voucher_code", voucherValue);
      mutateActivateVoucherData({ url, apiData });
    } else {
      setErrMsg(
        `${ActivateVoucher[localLang].Please_enter_a_valid_voucher_code}`
      );
    }
  };

  return (
    <div className={`${styles.activate_voucher}`}>
      <Link href="/" prefetch={false} aria-label="app logo">
        <img
          className={` ${styles.tablet_logo}`}
          src={appConfig?.appLogo}
          alt="logo"
        />
      </Link>
      {!showSuccessPage ? (
        <div className={`${styles.activate_inner}`}>
          <h2>
            {ActivateVoucher?.[localLang]?.Activate_Voucher ||
              "Activate voucher"}
          </h2>
          <p className={`${styles.msg1}`}>
            {!isLoggedIn
              ? ActivateVoucher[localLang]
                  .Please_sign_in_to_activate_your_voucher
              : ActivateVoucher[localLang].Please_enter_the_Voucher_code_below}
          </p>
          {isLoggedIn ? (
            <form>
              <div className={`${styles.form_rows}`}>
                <label className={`${styles.isActivate}`}>
                  <span className={`${styles.title}`}>
                    {ActivateVoucher[localLang].Enter_the_code}
                  </span>
                  <input
                    type="text"
                    value={voucherValue}
                    onChange={inputChangeHandler}
                    placeholder={
                      ActivateVoucher?.[localLang]?.Enter_Voucher_Code
                    }
                    className={`${styles.form_control}`}
                    maxLength={appConfig.packageSettings.voucherLength}
                  />
                </label>
                {!!errMsg && (
                  <div className={`${styles.text_danger1}`}>{errMsg}</div>
                )}
                {!errMsg &&
                  voucherValue.length > 0 &&
                  voucherValue.length !=
                    appConfig.packageSettings.voucherLength && (
                    <div className={`${styles.text_danger1}`}>
                      {
                        ActivateVoucher[localLang]
                          .Please_enter_a_valid_voucher_code
                      }
                    </div>
                  )}
              </div>
              <button
                className={`${styles.btn} primary ${voucherValue.length != appConfig.packageSettings.voucherLength ? styles.disabled : ""}`}
                disabled={
                  voucherValue.length != appConfig.packageSettings.voucherLength
                    ? true
                    : false
                }
                onClick={applyVoucherHandler}
              >
                {ActivateVoucher[localLang].Apply}
              </button>
            </form>
          ) : (
            <>
              <Link
                className={`${styles.signin_btn} primary`}
                href="/signin"
                prefetch={false}
              >
                {ActivateVoucher[localLang].Sign_In}
              </Link>
              <p className={`${styles.msg}`}>
                {ActivateVoucher[localLang].By_continuing_you_agree}
                <Link
                  className={`${styles.link}`}
                  href="/support/terms"
                  prefetch={false}
                >
                  {ActivateVoucher[localLang].Terms_and_Conditions}
                </Link>
              </p>
            </>
          )}
        </div>
      ) : (
        <VoucherStatus
          date={new Date()}
          voucherData={activateVoucherResponse?.data?.response}
        />
      )}
    </div>
  );
};

export default VoucherActivate;
