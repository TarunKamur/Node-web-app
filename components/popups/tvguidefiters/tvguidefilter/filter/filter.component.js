import React from "react";
import styles from "./filter.module.scss";
const Filter = ({ filter, handleFilterSelect }) => {
  const { title, isSelected } = filter;
  const handleFilterToggle = () => {
    handleFilterSelect(filter);
  };
  return (
    <div className={`${styles.filter_container}`} onClick={handleFilterToggle}>
      <div className={`${styles.filter} ${isSelected ? styles.selected : ''}`}>
        <span className={`${styles.filter_text}`}>{title}</span>
        <div
          className={`${styles.select_filter_icon} ${isSelected ? styles.active : ""}`}
        ></div>
      </div>
    </div>
  );
};

export default Filter;
