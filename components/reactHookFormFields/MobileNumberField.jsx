import React from "react";
import { CountryDropdown } from "../country-dropdown/country-dropdown.component";
import CustomTextField from "./CustomTextField";
import styles from "./formStyles.module.scss";
/**
 * MobileNumberField is a functional component for rendering a mobile number input field with a country code dropdown.
 *
 * @param {Object} props - The props for the component.
 * @param {string} name - The name of the input field, used for form registration and error handling.
 * @param {string} label - The label text for the input field.
 * @param {function} register - The register function from react-hook-form for registering the input field.
 * @param {Object} errors - The errors object from react-hook-form to access and display validation errors.
 * @param {function} trigger - The trigger function from react-hook-form to manually trigger validation on blur.
 * @param {function} clearErrors - The clearErrors function from react-hook-form to clear errors on focus.
 * @param {function} [validateFunction] - Custom validation function for additional validation logic.
 * @param {string} selectCountry - The currently selected country code.
 * @param {function} [setSelectCountry] - Function to update the selected country code.
 * @param {boolean} props.isMandatory - if field is optional pass isMandatory as false.
 *
 * @returns {JSX.Element} The rendered mobile number input field component.
 */

const MobileNumberField = ({
  name,
  label,
  register,
  errors,
  trigger,
  clearErrors,
  validateFunction,
  selectCountry,
  setSelectCountry = () => {},
  ...props
}) => {
  return (
    <div className={` ${styles.textField} ${styles.inline} `}>
      <div className={` ${styles.c_dropdown}`}>
        <CountryDropdown
          getcountry={selectCountry}
          changeCountry={(value) => setSelectCountry(value)}
        />
      </div>
      <CustomTextField
        name={name}
        label={label}
        customStyle={`inputfield ${styles.mobileNumber} ${styles.has_country_code}`}
        register={register}
        type="number"
        errors={errors}
        trigger={trigger}
        clearErrors={clearErrors}
        validateFunction={validateFunction}
        onKeyDown={(e) => {
          if ([38, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
          }
        }}
        onWheel={(e) => e.target.blur()}
        {...props?.isMandatory}
      />
    </div>
  );
};
export default MobileNumberField;
