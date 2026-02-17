import React, { useState, useEffect } from "react";
import styles from "./age-gender.module.scss";

const AgeGender = ({ userID, setSelectedAge, selectedAge: propSelectedAge, setSelectedGender, selectedGender: propSelectedGender, isMobile, setDisableBtn, saveBtn }) => {
  const [localSelectedAge, setLocalSelectedAge] = useState(propSelectedAge || "");
  const [localSelectedGender, setLocalSelectedGender] = useState(propSelectedGender || "");
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  useEffect(() => {
    setLocalSelectedAge(propSelectedAge || "");
    setLocalSelectedGender(propSelectedGender || "");
  }, [propSelectedAge, propSelectedGender]);

  useEffect(() => {
    if (typeof setDisableBtn === "function") {
      setDisableBtn(!localSelectedAge || !localSelectedGender);
    }
  }, [localSelectedAge, localSelectedGender, setDisableBtn]);

  const handleSave = () => {
    if (!localSelectedAge || !localSelectedGender) return;
    setIsBtnLoading(true);
    if (typeof saveBtn === "function") {
      saveBtn("age");
    }
    setIsBtnLoading(false);
  };

  const handleAgeSelect = (age) => {
    setLocalSelectedAge(age);
    if (typeof setSelectedAge === "function") {
      setSelectedAge(age);
    }
  };

  const handleGenderSelect = (gender) => {
    setLocalSelectedGender(gender);
    if (typeof setSelectedGender === "function") {
      setSelectedGender(gender);
    }
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.SelectContent1}>Age group</h4>
      <h4 className={`${styles.SelectContent1} ${styles.mobile}`}>How old are you ?</h4>
      <div className={styles.options}>
        {["13-17", "18-24", "25-29", "30-34", "35-39", "40-49", "50+"].map((age) => (
          <button
            key={age}
            className={`${styles.optionButton} ${localSelectedAge === age ? styles.selected : ""}`}
            onClick={() => handleAgeSelect(age)}
          >
            {age}
          </button>
        ))}
      </div>
      <h4 className={styles.SelectContent2}>Gender</h4>
      <div className={`${styles.options} ${styles.gender}`}>
        {["Male", "Female", "Others"].map((gender) => (
          <button
            key={gender}
            className={`${styles.optionButton} ${localSelectedGender === gender ? styles.selected : ""}`}
            onClick={() => handleGenderSelect(gender)}
          >
            {gender}
          </button>
        ))}
      </div>
      {!isMobile && (
        <button
          className={`${styles.saveBtn} ${(!localSelectedAge || !localSelectedGender) && styles.disabled}`}
          onClick={handleSave}
          disabled={!localSelectedAge || !localSelectedGender || isBtnLoading}
        >
          {isBtnLoading ? "Saving..." : "Save"}
        </button>
      )}
    </div>
  );
};

export default AgeGender;