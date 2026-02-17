/* eslint-disable react/jsx-props-no-spreading */
import TextField from "@mui/material/TextField";
import { fromStyle } from "@/services/utility.service";
import { appConfig } from "@/config/app.config";
import Link from "next/link";
import styles from "./formStyles.module.scss";
import { ProfilePasswordOtpconstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";

/**
 * PasswordField is a functional component for rendering a password input field with visibility toggle.
 *
 * @param {Object} props - The props for the component.
 * @param {string} name - The name of the input field, used for form registration and error handling.
 * @param {string} label - The label text for the input field.
 * @param {boolean} visibility - The current visibility state of the password field (true for text, false for password).
 * @param {function} toggleVisibility - Function to toggle the visibility state of the password field.
 * @param {function} register - The register function from react-hook-form for registering the input field.
 * @param {Object} errors - The errors object from react-hook-form to access and display validation errors.
 * @param {function} trigger - The trigger function from react-hook-form to manually trigger validation on blur.
 * @param {function} clearErrors - The clearErrors function from react-hook-form to clear errors on focus.
 * @param {function} validateFunction - Custom validation function for additional validation logic.
 * @param {boolean} props.isMandatory - if field is optional pass isMandatory as false.
 * @param {boolean} displayForgotPassword - Boolean to display Forgot password button under password field.
 * @param {string} forgotPasswordText -- If displayForgotPassword is true, provide string to display for forgot text
 *
 * @returns {JSX.Element} The rendered password input field component.
 */
const PasswordField = ({
  name,
  label,
  visibility,
  toggleVisibility,
  register,
  errors,
  trigger,
  clearErrors,
  validateFunction = () => {},
  displayForgotPassword,
  forgotPasswordText,
  ...props
}) => {
  const {
    state: { localLang },
  } = useStore();

  return (
    <div className={` ${styles.textField} `}>
      <TextField
        fullWidth
        margin="normal"
        name={name}
        label={label}
        type={visibility ? "text" : "password"}
        sx={fromStyle}
        autoComplete="off"
        inputProps={{ maxLength: appConfig.authMaxLength }}
        {...register(name, {
          required: !props.isMandatory
            ? false
            : `${label.replace(/\*/g, "")} Required`,
          validate: (value) => {
            if (
              value == "" &&
              props.isMandatory != undefined &&
              !props.isMandatory
            ) {
              return true;
            }
            return validateFunction(value);
          },
        })}
        onBlur={() => trigger(name)}
        onFocus={() => clearErrors(name)}
        onKeyDown={(e) => {
          if (e.keyCode === 32) {
            e.preventDefault();
          }
        }}
      />
      <span
        className={` ${styles.show}`}
        onClick={() => toggleVisibility(name)}
      >
        {visibility
          ? `${ProfilePasswordOtpconstant[localLang].Hide}`
          : `${ProfilePasswordOtpconstant[localLang].Show}`}
      </span>
      <div className={styles.errorAndForgotContainer}>
        <div className={` ${styles.valid_error} `}>
          {errors[name] && errors[name].message}
        </div>
        {displayForgotPassword && (
          <div className={` ${styles.forgetpassword}`}>
            <Link href="forgot-password" prefetch={false}>{forgotPasswordText}</Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default PasswordField;
