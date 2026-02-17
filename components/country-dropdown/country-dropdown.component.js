import { useEffect, useRef, useState } from "react";
import useGetApiMutate from "@/hooks/useGetApidata";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { useStore } from "@/store/store";
import { getItem, setItem } from "@/services/local-storage.service";
import { ImageConfig } from "@/config/ImageConfig";
import styles from "./country-dropdown.module.scss";
import { signinconstant } from "@/.i18n/locale";

// eslint-disable-next-line import/prefer-default-export
export const CountryDropdown = ({
  getcountry,
  changeCountry,
  isPaymentDropDown = false,
  onBlur = () => {},
}) => {
  const {
    state: { Session, Location, localLang },
  } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  // const [locationInfo, setLocationInfo] = useState(true);
  const [isopen, SetOpen] = useState("");
  const [selectCountry, setSelectCountry] = useState("");
  const [allCountry, setAllCountry] = useState(""); // Filtered country list
  const [countryListUnModified, setCountryListUnModified] = useState("");
  const { mutate: mutateCountry, data: apiCountryResponse } = useGetApiMutate();

  const dropdownRef = useRef(null);

  const dataValidate = (timestamp) => {
    const threeHoursInMillis = 3 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    return currentTime - timestamp > threeHoursInMillis;
  };

  useEffect(() => {
    if (Session) {
      const storedData = getItem("apiCountryData");
      if (storedData && !dataValidate(storedData.t)) {
        setAllCountry(storedData.response);
        setCountryListUnModified(storedData.response);
      } else {
        if (storedData) {
          setAllCountry(storedData.response);
          setCountryListUnModified(storedData.response);
        }
        const url = `${process.env.initJson.api}/service/api/v1/get/country`;
        mutateCountry(url);
      }
    }
  }, [Session]);

  useEffect(() => {
    if (!getcountry?.iconUrl && allCountry?.length && !isPaymentDropDown) {
      const selectedCountry =
        allCountry.find(
          (item) => item.isdCode.toString() === getcountry?.isdCode
        ) ||
        allCountry?.find(
          (item) =>
            item.code.toLocaleLowerCase() ===
            Location.ipInfo?.countryCode?.toLocaleLowerCase()
        ) ||
        allCountry[0];
      setSelectCountry(selectedCountry);
      changeCountry(selectedCountry);
    }
  }, [getcountry, allCountry]);

  useEffect(() => {
    if (!isPaymentDropDown) {
      setSelectCountry(getcountry);
    }
  }, [getcountry]);

  useEffect(() => {
    if (isPaymentDropDown && searchTerm == "") {
      changeCountry("");
    }
  }, [searchTerm]);

  useEffect(() => {
    if (apiCountryResponse?.data) {
      if (apiCountryResponse?.data?.status) {
        setAllCountry(apiCountryResponse?.data?.response);
        setCountryListUnModified(apiCountryResponse?.data?.response);
        const filteredResponse = apiCountryResponse?.data?.response.filter(
          (item) =>
            item.code.toLocaleLowerCase() ===
            Location.ipInfo?.countryCode?.toLocaleLowerCase()
        );
        setItem("apiCountryData", {
          response: apiCountryResponse?.data?.response,
          t: new Date().getTime(),
        });
        if (!getcountry && !isPaymentDropDown) {
          const selectedCountry = filteredResponse[0];
          setSelectCountry(selectedCountry);
          changeCountry(selectedCountry);
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (
          apiCountryResponse?.data?.error &&
          apiCountryResponse?.data?.error?.code === 401
        ) {
          unAuthorisedHandler();
        }
      }
    }
  }, [apiCountryResponse]);

  // for outside side click detection
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, [dropdownRef]);

  const openDropdown = () => {
    if (isopen === "show") {
      SetOpen("");
      if (!isPaymentDropDown) {
        setSearchTerm("");
        setAllCountry(countryListUnModified);
      }
    } else {
      SetOpen("show");
    }
  };
  const choseCountry = (country) => {
    if (!country) return;
    SetOpen("");
    changeCountry(country);
    if (isPaymentDropDown) {
      setSearchTerm(country.name);
    } else {
      setSelectCountry(country);
      setSearchTerm("");
      setAllCountry(countryListUnModified);
    }
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    const searchResult = countryListUnModified.filter(
      (country) =>
        country.name.toLowerCase().includes(event.target.value.toLowerCase()) ||
        country.isdCode
          .toString()
          .toLowerCase()
          .includes(event.target.value.toString().toLowerCase())
    );
    if (searchResult.length > 0) {
      SetOpen("show");
    }
    setAllCountry(searchResult);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      SetOpen("");
      setSearchTerm("");
    }
  };

  // textfield with country dropdown
  if (isPaymentDropDown) {
    return (
      <div ref={dropdownRef}>
        <input
          tabIndex="-1"
          type="text"
          placeholder="Country"
          value={searchTerm}
          onChange={handleInputChange}
          onBlur={(event) => onBlur(event)}
          name="country"
        />
        <div
          id="myDropdown"
          className={` ${styles.dropdown_content} ${isopen == "show" && styles.show}`}
        >
          {allCountry?.length > 0 && (
            <div className={` ${styles.countries_list}`}>
              {allCountry.map((country) => {
                return (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                  <div
                    key={country?.code}
                    onClick={() => choseCountry(country)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                  >
                    <img src={country.iconUrl} alt="flag" />
                    <span>
                      {country.name} +{country.isdCode}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={` ${styles.dropdown}`} ref={dropdownRef}>
      <button
        className={` ${styles.dropbtn}`}
        tabIndex="-1"
        type="button"
        onClick={openDropdown}
      >
        <img src={selectCountry?.iconUrl} alt="flag" />
        <span>+ {selectCountry?.isdCode}</span>
        {/* <span className={` ${styles.down_arrow}`} /> */}
        <img
          className={`${styles.arrow_down}`}
          src={ImageConfig.countryDropDown.dropdownIcon}
        />
        {/* <span className={`${styles.pipe_symbol}`}></span> */}
      </button>
      <div
        id="myDropdown"
        className={` ${styles.dropdown_content} ${isopen == "show" && styles.show}`}
      >
        <input
          tabIndex="-1"
          type="text"
          placeholder={signinconstant?.[localLang]?.Country_Name}
          value={searchTerm}
          onChange={handleInputChange}
        />
        {searchTerm != "" && (
          <span className={` ${styles.clear}`}>
            <img
              onClick={(event) => {
                event?.stopPropagation();
                setSearchTerm("");
                setAllCountry(countryListUnModified);
              }}
              src={`${ImageConfig?.countryDropDown?.closeIcon}`}
              alt="close"
            />
          </span>
        )}
        <div className={` ${styles.countries_list}`}>
          {allCountry?.length > 0 &&
            allCountry.map((country) => {
              return (
                <div key={country?.code} onClick={() => choseCountry(country)}>
                  <img src={country.iconUrl} alt="flag" />
                  <span>
                    {country.name} +{country.isdCode}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
