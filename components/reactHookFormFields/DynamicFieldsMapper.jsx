import React from "react";
import CustomTextField from "./CustomTextField";
import DatePickerComponent from "./DatePicker";
import MobileNumberField from "./MobileNumberField";
import PasswordField from "./PasswordField";
import RadioSelection from "./radioField";

/**
 * The DynamicFieldsMapper function dynamically renders different field components based on a given
 * field object.
 * @returns The DynamicFieldsMapper function returns a React component that dynamically renders a
 * specific field component based on the field's component type. It also renders any extra fields if
 * specified, and passes various props to the rendered field component such as label, name, register,
 * errors, trigger, clearErrors, validateFunction, customStyle, type, and any additional props provided
 * in the field object. This component specifically desgined for react hook forms
 *
 * BY DEFAULT EVERY FIELD IS MANDATORY USE isMandatory:false to make optional field
 */

const DynamicFieldsMapper = ({ field }) => {
  if (!field.isDisplay) return null;

  const fields = {
    date_picker: DatePickerComponent,
    custom_text_field: CustomTextField,
    mobile_Number_field: MobileNumberField,
    password_field: PasswordField,
    radio_field: RadioSelection,
  };

  const FieldComponent = fields[field.component] || CustomTextField;
  return (
    <React.Fragment key={field.key}>
      {/* if any extra fields to render */}
      {field.renderExtra && field.renderExtra()}
      <FieldComponent
        label={field.label}
        name={field.name}
        register={field.register}
        errors={field.errors}
        trigger={field.trigger}
        clearErrors={field.clearErrors}
        validateFunction={field.validateFunction}
        customStyle={field.customStyle}
        type={field.type}
        // to assign extra props
        {...field.props}
      />
    </React.Fragment>
  );
};

export default DynamicFieldsMapper;
