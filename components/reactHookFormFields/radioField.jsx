/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-array-index-key */
import React from "react";
import { Controller } from "react-hook-form";
import styles from "./formStyles.module.scss";
/**
 * RadioSelection is a functional component for rendering a group of radio buttons with custom validation and styles.
 *
 * @param {Object} props - The props for the component.
 * @param {Object} control - The control object from react-hook-form for controlling the form state.
 * @param {string} name - The name of the input field, used for form registration and error handling.
 * @param {string} label - The label text for the group of radio buttons.
 * @param {Array} options - The options for the radio buttons, each option is an object with `value` and `label` properties.
 * @param {Object} errors - The errors object from react-hook-form to access and display validation errors.
 * @param {Object} [radioColor] - Optional custom class name to apply color styles to the selected radio button.
 * @param {boolean} props.isMandatory - if field is optional pass isMandatory as false.
 *
 * @returns {JSX.Element} The rendered radio button group component.
 */

const RadioSelection = ({
  control,
  name,
  label,
  options,
  errors,
  ...props
}) => {
  return (
    <div className={` ${styles.genderCont} `}>
      <div className={` ${styles.genderLabel} `}>{label}:</div>
      <div className={`${styles.genderLabel}`}>
        {options.map((option, index) => (
          <div className={`${styles.loopGender}`} key={`radio${index}`}>
            <label
              htmlFor={`radio_${index}`}
              className={`${styles.genderradio}`}
            >
              <Controller
                name={name}
                control={control}
                rules={{
                  required:
                    props.isMandatory != undefined && !props.isMandatory
                      ? false
                      : `${label?.replace(/\*/g,'')} is required`,
                }}
                render={({ field }) => (
                  <>
                    <input
                      type="radio"
                      id={`radio_${index}`}
                      value={option.value}
                      name={name}
                      checked={field.value === option.value}
                      onChange={() => field.onChange(option.value)}
                      className={`${field.value === option.value ? (props?.radioColor ? styles[props?.radioColor] : styles.whitebtn) : ""}`}
                    />
                    <span className={`${styles.indicator}`} />
                    {field.value === option.value && (
                      <span className={`${styles.dotbutton}`} />
                    )}
                    <span
                      className={`${styles.label_text}`}
                      htmlFor={`radio_${index}`}
                    >
                      {option.label}
                    </span>
                  </>
                )}
              />
            </label>
          </div>
        ))}
      </div>
      <div className={` ${styles.valid_error} `}>
        {errors[name] && errors[name].message}
      </div>
    </div>
  );
};

export default RadioSelection;
