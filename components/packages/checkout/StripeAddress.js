/* eslint-disable no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { CountryDropdown } from "@/components/country-dropdown/country-dropdown.component";
import CustomTextField from "@/components/reactHookFormFields/CustomTextField";
import { Controller, useForm } from "react-hook-form";
import styles from "./checkout.module.scss";

const StripeAddressComponent = ({
  stripeErrorStatus,
  formData,
  setPayDisabledProp,
}) => {
  const {
    register,
    watch,
    control,
    formState: { errors },
    trigger,
    clearErrors,
    setError,
    setValue,
  } = useForm({
    mode: "onChange",
    shouldFocusError: false,
  });

  const validateField = (value, name) => {
    if (value === undefined || value.trim() === "") {
      return `${name} is required`;
    }
    return true;
  };
  useEffect(() => {
    const subscription = watch((values) => {
      if (Object.entries(errors).length == 0) {
        const { name, address, country, state, city } = values;
        if (
          name != "" &&
          address != "" &&
          country != undefined &&
          country?.name != ""
        ) {
          formData({ name, address, country: country?.code, state, city });
          setPayDisabledProp(false);
        }
      } else {
        setPayDisabledProp(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, errors]);

  return (
    stripeErrorStatus && (
      <div className={styles.shipping_info}>
        <CustomTextField
          placeholder="Name as on your card"
          name="name"
          register={register}
          errors={errors}
          trigger={trigger}
          clearErrors={clearErrors}
          customStyle={styles.form_group}
          validateFunction={(value) => validateField(value, "Name")}
          allowSpaces
          InputProps={{
            style: { border: " 1px solid #999", borderRadius: "4px" },
          }}
        />
        <CustomTextField
          placeholder="Street Address"
          name="address"
          register={register}
          errors={errors}
          trigger={trigger}
          clearErrors={clearErrors}
          customStyle={styles.form_group}
          validateFunction={(value) => validateField(value, "Address")}
          allowSpaces
          InputProps={{
            style: { border: "1px solid #999", borderRadius: "4px" },
            disableUnderline: true,
          }}
        />
        <div className={`${styles.form_group} ${styles.country_code}`}>
          <Controller
            name="country"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <CountryDropdown
                value={field.value}
                changeCountry={(selectedCountry) => {
                  if (selectedCountry != "") clearErrors("country");
                  field.onChange(selectedCountry);
                  trigger("country");
                }}
                onBlur={() => {
                  field.onBlur();
                  if (field.value == "") {
                    setError("country", {
                      type: "manual",
                      message: "Country is required",
                    });
                    setValue("country", "");
                  }
                  trigger("country");
                }}
                onFocus={() => {
                  clearErrors("country");
                }}
                isPaymentDropDown
              />
            )}
          />
          {errors.country && (
            <span className={styles.error}>{errors.country.message}</span>
          )}
        </div>
        <CustomTextField
          type="text"
          name="city"
          placeholder="City (optional)"
          register={register}
          errors={errors}
          trigger={trigger}
          clearErrors={clearErrors}
          customStyle={styles.form_group}
          allowSpaces
          InputProps={{
            style: { border: " 1px solid #999", borderRadius: "4px" },
          }}
        />
        <CustomTextField
          type="text"
          name="state"
          placeholder="State (optional)"
          register={register}
          errors={errors}
          trigger={trigger}
          clearErrors={clearErrors}
          customStyle={styles.form_group}
          allowSpaces
          InputProps={{
            style: { border: " 1px solid #999", borderRadius: "4px" },
          }}
        />
      </div>
    )
  );
};

export default StripeAddressComponent;
