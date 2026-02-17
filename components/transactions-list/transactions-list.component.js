import styles from "./transactions-list.module.scss";
import { useEffect, useState } from "react";
import useGetApiMutate from "@/hooks/useGetApidata";
import { useRouter } from "next/router";
import { actions, useStore } from "@/store/store";
import { TransactionsListconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import usePostApiMutate from "@/hooks/usePostApidata";
import { ImageConfig } from "@/config/ImageConfig";
import { getItem } from "@/services/local-storage.service";
import { unAuthorisedHandler } from "@/services/data-manager.service";
const TransactionsList = () => {
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();

  const {
    mutate: mutateTransaction,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const { mutate: InvoiceDownload, data: InvoiceResponse } = usePostApiMutate();
  const [transactionData, setTransactionData] = useState(null);
  const [selectedDownloadtransactionData, setselectedDownloadtransactionData] =
    useState(undefined);
  const router = useRouter();
  const tableHeaderList = [
    {
      label:
        TransactionsListconstant?.[localLang]?.transaction_id || "Order ID",
      className: "orderIdcls",
    },
    {
      label:
        TransactionsListconstant?.[localLang]?.package_name || "Package Name",
      className: "statuscls",
    },
    {
      label:
        TransactionsListconstant?.[localLang]?.payment_method ||
        "Payment Method",
      className: "statuscls",
    },
    {
      label: TransactionsListconstant?.[localLang]?.amount || " Amount ",
      className: "amountcls",
    },
    {
      label:
        TransactionsListconstant?.[localLang]?.payment_date || "Payment Date",
      className: "orderIdcls",
    },
    {
      label:
        TransactionsListconstant?.[localLang]?.effectiveFrom ||
        "Effective From",
      className: "orderIdcls",
    },
    {
      label: TransactionsListconstant?.[localLang]?.expiryTime || "Expiry Time",
      className: "orderIdcls",
    },
    {
      label: TransactionsListconstant?.[localLang]?.status || "Status",
      className: "statuscls",
    },
  ];

  useEffect(() => {
    if (!!apiResponse?.data) {
      if (!!apiResponse?.data?.status) {
        apiResponse?.data?.response?.map((transaction) => {
          // console.log('transaction',transaction,transaction.gatewayCode);
          if (
            transaction.gatewayCode.toLowerCase() === "paytm" ||
            transaction.gatewayCode.toLowerCase() === "juspay" ||
            transaction.gatewayCode.toLowerCase() === "billdesk"
          ) {
            transaction.isDownloadable = true;
          }
        });
        setTransactionData(apiResponse?.data?.response);
      } else {
        if (
          apiResponse?.data?.error &&
          apiResponse?.data?.error?.code === 401
        ) {
          dispatch({
            type: actions.NotificationBar,
            payload: { message: "Session expired!" },
          });
          unAuthorisedHandler();
        } else {
          // setEmailError(apiResponse?.data?.error);
        }
      }
    } else {
    }
  }, [apiResponse]);

  useEffect(() => {
    if (!!userDetails) {
      getTransactionData();
    }
  }, [userDetails]);

  useEffect(() => {
    try {
      if (InvoiceResponse?.status) {
        const blob = new Blob(
          [base64ToArrayBuffer(InvoiceResponse.data["response"])],
          { type: "application/pdf" }
        );
        const link = document.createElement("a");
        const fileName = `${selectedDownloadtransactionData.packageName}_${selectedDownloadtransactionData.purchaseTime}.pdf`;

        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        dispatch({
          type: actions.NotificationBar,
          payload: { message: "Invoice downloaded successfully" },
        });
      } else if (!!InvoiceResponse && !InvoiceResponse?.status) {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              TransactionsListconstant?.[localLang]?.Something_Went_Wrong,
          },
        });
      }
    } catch (error) {
      console.log(">>>error in useEffect", error);
    }
  }, [InvoiceResponse]);

  const getTransactionData = () => {
    let url =
      process.env.initJson["api"] +
      `/service/api/auth/transaction/history?page=0`;
    mutateTransaction(url);
  };

  const TimestampFormatter = (timestamp) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${formattedDate} ${formattedTime}`;
  };

  const handleBackToOorkaTv = () => {
    router.back();
  };

  if (isLoading) {
    // return (
    // )
  }
  if (isError || error) {
    // return (
    // )
  }

  const base64ToArrayBuffer = (base64) => {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  };

  const downloadInvoice = (data) => {
    try {
      setselectedDownloadtransactionData(data);
      dispatch({
        type: actions.NotificationBar,
        payload: {
          message:
            TransactionsListconstant?.[localLang]
              ?.We_are_proccesing_your_request,
        },
      });
      setTimeout(() => {
        let apiData = new FormData();
        apiData.append("order_id", data.orderId);
        let url = process.env.initJson["api"] + "/payment/api/v1/get/invoice";

        InvoiceDownload({ url, apiData });
      }, 1000);
    } catch (error) {
      console.log(">>>error on dowload", error);
    }
  };

  const showTopHeader = () => {
    // let isAndroid = getItem("clientId") === "11";
    let isUtuser =
      getItem("isUtuser") === "true" || getItem("isUtuser") === true;
    let isExternalBrowser = appConfig.settings.transaction === 2;
    /*
    if(transaction === 2 && isAndroid && utuser){
      return false;
    }
    else return true;

    // !((isAndroid && isUtuser && isExternalBrowser)) for only ios keep this condition
    //! (isUtuser && isExternalBrowser) if just utuser and external browser keep this this

    both are same
  */
    return !(isUtuser && isExternalBrowser);
  };
  return !!userDetails ? (
    <>
      <div className={` ${styles.transactionCont}`}>
        {showTopHeader() && (
          <div className={` ${styles.traHeader_cont}`}>
            <div
              className={` ${styles.backNav_cont}`}
              onClick={handleBackToOorkaTv}
            >
              <img alt="go" src={`${ImageConfig?.packages?.back}`} />
              <span className={`${styles.tabletHideHead}`}>
                {TransactionsListconstant[localLang].back}
              </span>
            </div>
            <h4>{TransactionsListconstant[localLang].Transaction_History}</h4>
            <div></div>
          </div>
        )}

        <div className={` ${styles.transactionList_cont}`}>
          {transactionData?.length <= 0 ||
            (transactionData === null && (
              <h5 className={` ${styles.NoHistry}`}>
                {TransactionsListconstant[localLang].No_transactions_found}
              </h5>
            ))}
          {transactionData?.length > 0 && (
            <table
              className={` ${styles.transListHeader} ${styles.eventlist} ${styles.tabletHideHead}`}
              border="0"
              cellPadding={0}
              cellSpacing={0}
            >
              <tr className={` ${styles.thead}`}>
                {tableHeaderList.map((value, index) => {
                  return (
                    <th
                      className={`${styles[value.className]} ${styles.commonStl} ${index == 0 && styles.aplyPadLeftplus}`}
                    >
                      {value.label}
                    </th>
                  );
                })}
              </tr>

              {transactionData.map((data, index) => {
                return (
                  <tr
                    className={`${styles.aplyPadLeft} ${styles.transListHeader} ${index % 2 ? styles.eventlist : ""}`}
                    key={index}
                  >
                    <td
                      className={` ${styles.orderIdcls} ${styles.commonListStl}`}
                    >
                      <div className={` ${styles.mobileViewHead}`}>
                        {tableHeaderList[0]?.label} :
                      </div>
                      <div className={` ${styles.order_id}`}>
                        {" "}
                        {data.orderId}
                        {data?.isDownloadable && (
                          <span onClick={() => downloadInvoice(data)}>
                            <img
                              class="link"
                              src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/download-icon.svg"
                              alt="download"
                            />
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className={` ${styles.statuscls} ${styles.commonListStl}`}
                    >
                      <div className={` ${styles.mobileViewHead}`}>
                        {tableHeaderList[1]?.label} :
                      </div>
                      <div> {data.packageName} </div>
                    </td>
                    <td
                      className={` ${styles.statuscls} ${styles.commonListStl}`}
                    >
                      <div className={` ${styles.mobileViewHead}`}>
                        {tableHeaderList[2]?.label} :
                      </div>
                      <div> {data.gateway} </div>
                    </td>
                    <td
                      className={` ${styles.amountcls} ${styles.commonListStl}`}
                    >
                      <div className={` ${styles.mobileViewHead}`}>
                        {tableHeaderList[3]?.label} :
                      </div>
                      <div>
                        {data.amount} {data.currency}
                      </div>
                    </td>
                    <td
                      className={` ${styles.orderIdcls} ${styles.commonListStl}`}
                    >
                      <div className={` ${styles.mobileViewHead}`}>
                        {tableHeaderList[4]?.label} :
                      </div>
                      <div> {TimestampFormatter(data.purchaseTime)} </div>
                    </td>
                    <td
                      className={` ${styles.orderIdcls} ${styles.commonListStl}`}
                    >
                      <div className={` ${styles.mobileViewHead}`}>
                        {tableHeaderList[5]?.label} :
                      </div>
                      <div>
                        {data.effectiveFrom
                          ? TimestampFormatter(data.effectiveFrom)
                          : process.env.initJson.tenantCode === "lynktelecom"
                            ? TimestampFormatter(data.purchaseTime)
                            : null}
                      </div>
                    </td>
                    <td
                      className={` ${styles.orderIdcls} ${styles.commonListStl}`}
                    >
                      <div className={` ${styles.mobileViewHead}`}>
                        {tableHeaderList[6]?.label} :
                      </div>
                      <div>{TimestampFormatter(data.expiryTime)} </div>
                    </td>
                    <td
                      className={` ${styles.statuscls} ${styles.commonListStl} ${styles.paymentsucss}`}
                    >
                      <div className={` ${styles.mobileViewHead}`}>
                        {tableHeaderList[7]?.label} :
                      </div>
                      <div> {data.message} </div>
                    </td>
                  </tr>
                );
              })}
            </table>
          )}
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};

export default TransactionsList;
