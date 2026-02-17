/* eslint-disable react/jsx-props-no-spreading */
import TextField from "@mui/material/TextField";
import { fromStyle } from "@/services/utility.service";
import styles from "./formStyles.module.scss";

/**
 * CustomTextField is a functional component for rendering a text field with custom validation and styles.
 *
 * @param {Object} props - The extra props for the component.
 * @param {string} name - The name of the input field, used for form registration and error handling.
 * @param {string} label - The label text for the input field.
 * @param {string} [errorMsg] - The custom error message to display if the field is required but not filled.
 * @param {string} [type] - The type of the input field (e.g., "text", "password"). Defaults to "text".
 * @param {function} register - The register function from react-hook-form for registering the input field.
 * @param {Object} errors - The errors object from react-hook-form to access and display validation errors.
 * @param {function} trigger - The trigger function from react-hook-form to manually trigger validation on blur.
 * @param {function} clearErrors - The clearErrors function from react-hook-form to clear errors on focus.
 * @param {function} [validateFunction] - Custom validation function for additional validation logic.
 * @param {string} [props.customStyle] - Optional custom styles to apply to the input field.
 * @param {Object} [props.customClassName] - Optional custom class name to apply to the input field.
 * @param {...Object} props - Any additional props passed to the component.
 * @param {boolean} props.isMandatory - if field is optional pass isMandatory as false.
 * @returns {JSX.Element} The rendered custom text field component.
 */
const CustomTextField = ({
  name,
  label,
  errorMsg,
  type,
  register,
  errors,
  trigger,
  clearErrors,
  validateFunction = () => {},
  customStyle,
  allowSpaces = false,
  maxLength,
  onChange,
  ...props
}) => (
  <div
    className={` ${customStyle ? customStyle : styles.textField} ${props?.customClassName}`}
  >
    <TextField
      fullWidth
      variant={props?.variant || "outlined"}
      margin="normal"
      name={name}
      label={label}
      sx={fromStyle}
      type={type || "text"}
      autoComplete="off"
      inputProps={{ maxLength }} 
      {...register(name, {
        required: !props.isMandatory
          ? false
          : errorMsg || `${label.replace(/\*/g, "")} Required`,
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
        if (!allowSpaces && e.keyCode === 32) {
          e.preventDefault();
        }
      }}
      onChange={onChange}
      {...props}
    />
    <div className={` ${styles.valid_error} `}>
      {errors[name] && errors[name].message}
    </div>
  </div>
);
export default CustomTextField;
