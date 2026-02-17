/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import { Controller } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
import TextField from "@mui/material/TextField";
import { appConfig } from "@/config/app.config";
import styles from "./formStyles.module.scss";

/**
 * DatePickerComponent is a functional component for rendering a date picker with custom validation and styles.
 *
 * @param {Object} props - The props for the component.
 * @param {Object} control - The control object from react-hook-form for controlling the form state.
 * @param {string} name - The name of the input field, used for form registration and error handling.
 * @param {string} label - The label text for the input field.
 * @param {Object} [rules] - The validation rules for the input field.
 * @param {Object} [fromStyle] - Custom styles to apply to the input field.
 * @param {Object} errors - The errors object from react-hook-form to access and display validation errors.
 * @param {function} trigger - The trigger function from react-hook-form to manually trigger validation on blur.
 * @param {function} clearErrors - The clearErrors function from react-hook-form to clear errors on focus.
 * @param {function} [validateFunction] - Custom validation function for additional validation logic.
 * @param {boolean} props.isMandatory - if field is optional pass isMandatory as false.
 *
 * @returns {JSX.Element} The rendered date picker component.
 */
const DatePickerComponent = ({
  control,
  name,
  label,
  fromStyle,
  errors,
  trigger,
  clearErrors,
  validateFunction,
  ...props
}) => {
  return (
    <div className={`inputfield ${styles.textField}`}>
      <Controller
        name={name}
        control={control}
        rules={{
          required:
            props.isMandatory !== undefined && !props.isMandatory
              ? false
              : `${label} is required`,
          validate: validateFunction,
        }}
        render={({ field, fieldState: { error } }) => (
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={appConfig?.datePicker?.format || "en-gb"}
          >
            <div className={`${styles.datePicker}`}>
              <DatePicker
                label={label}
                value={field.value ? dayjs(field.value) : null}
                sx={{ ...fromStyle, width: "100%" }}
                onChange={(date) => {
                  const timestamp = date ? date.toDate().getTime() : null;
                  field.onChange(timestamp);
                  trigger(name);
                }}
                disableFuture
                minDate={dayjs().subtract(100, "year")}
                maxDate={dayjs()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : null}
                  />
                )}
                onBlur={() => trigger(name)}
                onFocus={() => clearErrors(name)}
              />
              <div className={`${styles.valid_error}`}>
                {errors[name] && errors[name].message}
              </div>
            </div>
          </LocalizationProvider>
        )}
      />
    </div>
  );
};

export default DatePickerComponent;
