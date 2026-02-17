import styles from "./contentpartner.module.scss";
import React from "react";

const Contentpartner = (props) => {
  const { partnerdata, handleActivatePartner } = props;
  const { buttonText, isActive, partnerName, hasNetworkSubscription } =
    partnerdata;
  const getBtnclass = () => {
    let className = `${styles.partner_activate_btn} `;
    if (!hasNetworkSubscription) {
      className = className + `${styles.active}`;
    }
    return className;
  };

  const handlePartnerClick = () => {
    if (!hasNetworkSubscription) {
      handleActivatePartner(partnerdata, partnerdata._index);
    }
  };

  return (
    <div className={`${styles.partner_container}`}>
      <h3 className={`${styles.partner_name}`}>{partnerName}</h3>
      <button className={getBtnclass()} onClick={handlePartnerClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default Contentpartner;
