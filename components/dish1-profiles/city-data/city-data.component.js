import React, { useState, useEffect } from "react";
import styles from "./city-data.module.scss";

const CityData = ({
  setSelectedCity,
  selectedCity: propSelectedCity,
  isMobile,
  setDisableBtn,
  saveBtn,
}) => {
  const [localSelectedCity, setLocalSelectedCity] = useState(
    propSelectedCity || ""
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(isMobile);
  const [searchTerm, setSearchTerm] = useState(propSelectedCity || "");
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalSelectedCity(propSelectedCity || "");
    if (isMobile && propSelectedCity) {
      setSearchTerm(propSelectedCity);
    }
  }, [propSelectedCity, isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsDropdownOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (typeof setDisableBtn === "function") {
      setDisableBtn(!localSelectedCity);
    }
  }, [localSelectedCity, setDisableBtn]);

  useEffect(() => {
    if ((isMobile || isDropdownOpen) && cities.length === 0 && !isLoading) {
      setIsLoading(true);
      fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: "India" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            setCities(data.data);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isDropdownOpen, isMobile, cities.length, isLoading]);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!localSelectedCity) return;
    setIsBtnLoading(true);
    if (typeof saveBtn === "function") {
      saveBtn("city");
    }
    setIsBtnLoading(false);
  };

  const handleDropdownToggle = () => {
    if (!isMobile) {
      setIsDropdownOpen((prev) => !prev);
      if (!isDropdownOpen) {
        setSearchTerm("");
      }
    }
  };

  const handleCitySelect = (city) => {
    setLocalSelectedCity(city);
    if (typeof setSelectedCity === "function") {
      setSelectedCity(city);
    }
    if (!isMobile) {
      setTimeout(() => setIsDropdownOpen(false), 0);
    }
    if (typeof setDisableBtn === "function") {
      setDisableBtn(!city);
    }
  };

  return (
    <div className={styles.container}>
      {!isMobile && isDropdownOpen && (
        <div
          className={styles.overlay}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      <h4 className={styles.SelectContent}>Which City Do You Live In?</h4>
      <h4 className={`${styles.SelectContent} ${styles.mobile}`}>
        Select City
      </h4>

      <div
        className={styles.dropdown}
        style={{ position: "relative", zIndex: 2 }}
      >
        {!isMobile && (
          <div onClick={handleDropdownToggle} className={styles.dropdownInput}>
            <span>{localSelectedCity || "Select a city"}</span>
            <svg
              className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.open : ""}`}
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#FFFFFF99"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {(isMobile || isDropdownOpen) && (
          <div
            className={`${styles.dropdownPanel} ${isMobile ? styles.mobilePanel : ""}`}
          >
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <svg
                  className={styles.searchIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="#FFFFFF99"
                    strokeWidth="2"
                  />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="#FFFFFF99"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your city"
                  className={styles.searchInput}
                  autoFocus={isMobile}
                />
              </div>
            </div>

            <ul className={styles.dropdownList}>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className={styles.dropdownItem}>
                      <div className={styles.skeletonItem}></div>
                    </li>
                  ))
                : filteredCities.map((city, index) => (
                    <li
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className={`${styles.dropdownItem} ${localSelectedCity === city ? styles.selected : ""}`}
                    >
                      <span>{city}</span>
                      {localSelectedCity === city && (
                        <svg
                          className={styles.tick}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </li>
                  ))}
            </ul>
          </div>
        )}
      </div>

      {!isMobile && (
        <button
          className={`${styles.saveBtn} ${!localSelectedCity && styles.disabled}`}
          onClick={handleSave}
          disabled={!localSelectedCity || isBtnLoading}
        >
          {isBtnLoading ? "Saving..." : "Save"}
        </button>
      )}
    </div>
  );
};

export default CityData;
