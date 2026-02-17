import React, { useState, useEffect } from "react";
import styles from "./kid-data.module.scss";

const ageGroupOptions = [
  { label: "Pre-school", subLabel: "ages 4 & under" },
  { label: "Younger", subLabel: "ages 5-8" },
  { label: "Older", subLabel: "ages 9-12" }
];

const KidData = ({
  userID,
  setSelectedAgeGroup,       
  selectedAgeGroup,           
  saveBtn,
  isMobile
}) => {
  const [localSelectedAge, setLocalSelectedAge] = useState(selectedAgeGroup || "");
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  useEffect(() => {
    setLocalSelectedAge(selectedAgeGroup || "");
  }, [selectedAgeGroup]);

  const handleSave = () => {
    setIsBtnLoading(true);
    if (typeof saveBtn === "function") {
      saveBtn("kid");
    }
    setIsBtnLoading(false);
  };

  const handleAgeSelect = (age) => {
    setLocalSelectedAge(age);
    if (typeof setSelectedAgeGroup === "function") {
      setSelectedAgeGroup(age);
    }
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.SelectContent}>Age Group</h4>
      <div className={styles.options}>
        {ageGroupOptions.map(({ label, subLabel }) => {
          const value = `${label} ${subLabel}`;
          return (
            <button
              key={value}
              className={`${styles.optionButton} ${localSelectedAge === value ? styles.selected : ""}`}
              onClick={() => handleAgeSelect(value)}
              type="button"
            >
              <span className={styles.label}>{label}</span>
              <span className={styles.subLabel}>{subLabel}</span>
            </button>
          );
        })}
      </div>
      {!isMobile && (
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={isBtnLoading}
        >
          {isBtnLoading ? "Saving..." : "Save"}
        </button>
      )}
    </div>
  );
};

export default KidData;
