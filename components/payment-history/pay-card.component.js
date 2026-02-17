import React from "react";
import styles from "./pay-card.module.scss";
import { ImageConfig } from "@/config/ImageConfig";

const PayCard = ({ title, date, amount, status, onClick }) => {
  const isSuccess = status === "success";

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.iconWrapper}>
        <img
          className={styles.icon}
          src={`${ImageConfig?.payments?.exchangeIcon}`}
        />
      </div>
      <div className={styles.detailsWrapper}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.date}>{date}</p>
      </div>
      <div className={styles.statusWrapper}>
        <p className={styles.amount}>₹{amount}</p>
        <span
          className={`${styles.status} ${isSuccess ? styles.success : styles.canceled}`}
        >
          {isSuccess ? "Successfully" : "Canceled"}
        </span>
      </div>
    </div>
  );
};

export default PayCard;
