import React, { Suspense, useState, useEffect } from "react";
import styles from "./pay-history.module.scss";
import PayCard from "./pay-card.component";
// import PayPopUp from "./pay-popup.component";
import { Button, Dialog, DialogTitle } from "@mui/material";
import { ImageConfig } from "@/config/ImageConfig";
import { Router, useRouter } from "next/router";
import dynamic from "next/dynamic";
import useMobileHideHeaderFooter from "@/hooks/useMobileHideHeaderFooter";

const OverlayPopupModal = dynamic(
  () => import("@/components/popups/overlay-popup/overlay-popup-modal")
);

// function SimpleDialog({ open, onClose }) {

//   return (
//     <Dialog onClose={onClose} open={open}
//     sx={{
//       "& .MuiBackdrop-root": {
//         backgroundColor: "none",
//       },
//       "& .MuiPaper-root": {
//         background:"none"
//       },
//     }}>
//     <PayPopUp onClick={onClose}/>
//     </Dialog>
//   );
// }

const PaymentHistory = () => {
  const [open, setOpen] = useState(false);
  const [popupData, setPopUpData] = useState({});

  useMobileHideHeaderFooter();

  const handleClickOpen = (e) => {
    e.preventDefault();
    const paymentHistoryList = [
      { label: "Order ID", value: "2K123KSFSK3K3MKAK1" },
      { label: "Package Name", value: "Watcho Max" },
      { label: "Payment Mode", value: "Card" },
      { label: "Amount", value: "Rs 1999" },
      { label: "Payment Date", value: "12 Oct 2024 11:00AM" },
      { label: "Effected From", value: "12 Oct 2024 11:00AM" },
      { label: "Expiry Time", value: "12 Oct 2025 12:00AM" },
      {
        label: "Status",
        value: "Successfully",
      },
    ];
    let pop = {
      type: "PaymentHistory",
      isActive: true,
      title1: "Transition History",
      title2: "",
      yesButton1: "Okay, Got it",
      yesButtonType: "primary",
      yesButtonTarget1: onsubmitBtn,
      noButton1: "Download Invoice",
      noButtontarget1: handleClose,
      noButtonType: "secondary",
      close: true,
      paymentHistoryList: paymentHistoryList,
      closeTarget: handleClose,
      parentclassName: "paymentHistory",
    };
    setPopUpData(pop);
  };
  const onsubmitBtn = () => {
    console.log(">>>>onsubmitBtn", onsubmitBtn);
  };
  const handleClose = () => {
    setOpen(false);
    setPopUpData({});
  };
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
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
  ];
  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <img
          alt="back"
          onClick={handleBack}
          className={` ${styles.back}`}
          src={`${ImageConfig?.settings?.back}`}
        />
        <span>Swag Payment history</span>
      </div>
      <div className={styles.cardswraper}>
        {cardData.map((data, index) => (
          <PayCard
            key={index}
            title={data.title}
            date={data.date}
            amount={data.amount}
            status={data.status}
            onClick={handleClickOpen}
          />
        ))}
      </div>
      {/* <div>
      <SimpleDialog open={open} onClose={handleClose} />
    </div> */}
      {popupData.isActive && popupData.type == "PaymentHistory" && (
        <OverlayPopupModal popupData={popupData} />
      )}
    </div>
  );
};

export default PaymentHistory;
