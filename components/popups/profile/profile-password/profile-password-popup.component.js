import { useState,useRef, useEffect } from "react";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "../profile-password/profile-password-popup.module.scss";
import { getAbsolutePath } from "@/services/user.service";
import { appConfig } from "@/config/app.config";
import useFromApiMutate from "@/hooks/useFromApidata";
import { useRouter } from "next/router";
import TextField from "@mui/material/TextField";
import { actions, useStore } from "@/store/store";
import { fromStyle } from "@/services/utility.service";
import { validateP } from "@/services/utility.service";
import usePostApiMutate from "@/hooks/usePostApidata";
import { clearStorage, getItem } from "@/services/local-storage.service";
import PageLoader from "@/components/loader/page-loder.component";
import { ProfilePasswordOtpconstant, Settingsconstant } from "@/.i18n/locale";
import Link from "next/link";
export default function ProfilePassword({ popupData }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const passwordRef = useRef("");
  const [passV, setPassV] = useState({ valid: false, error: "" });
  const [errorMessage,setErrorMessage] = useState('')
  const isUtUser = getItem('isUtuser')
  const {
    mutate: mutateVerifypass,
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFromApiMutate();
  const { mutate: mutateDeleteAccount, data: deleteAcountData, isLoading: deleteAccountLoading, isError: deleteAccountError } = usePostApiMutate()
  const { state: { profileUtil, userDetails, SystemConfig, localLang }, dispatch } = useStore()

  const handleClose = (e) => {
    e.preventDefault();
    popupData.closeTarget();
  };


  useEffect(
    ()=>{
      if(!!apiResponse){
        if(!!apiResponse.data.status){
          dispatch({type:actions.profileUtil,  payload: apiResponse.data.response})
          if(popupData.subtype == 'pin'){
            router.push("/profiles/profile-lock/"+popupData.userProfile.profileId);
          } else if (popupData.subtype == "DeleteAccount") {
            deleteAccountApi()
          }
          else {
            if(popupData?.isParentalControl){
              router.push("/profiles/parental-controls")
            } else{
              router.push("/profiles/view-restrictions/" + popupData.userProfile?.profileId);
            }
          }         
        }else{
          setErrorMessage(apiResponse.data.error.message)
          clearingErrorMessage()
        }
      }
    },[apiResponse]
  )
  useEffect(() => {
    if (deleteAcountData?.data?.status === true) {
      if (!!isUtUser) {
        window.open(SystemConfig.configs.siteURL + "/delete-account", "_self");
      } else {
        window.open(SystemConfig.configs.siteURL, "_self");
      }
    } else {
      setErrorMessage(deleteAcountData?.data?.error?.message)
    }
  }, [deleteAcountData])
  const clearingErrorMessage = () => {  
    let init1 = setTimeout(() => {
      setErrorMessage('')    
      clearTimeout(init1);
    }, 5000);
  } 

  const validatePassword = (value) => {
    let result =validateP(value,appConfig.authMinLength,appConfig.authMaxLength)
    setPassV(result)  
    return result.valid  
  };

  const onSubmit = (event)=>{
    event.preventDefault();  
    if (validatePassword(event.target.password.value)){
      let url=process.env.initJson["api"] +"/service/api/auth/user/authentication"
      let apiData={context: "userprofiles",password: passwordRef.current.value}
      try {
        mutateVerifypass({ url, apiData });    
      } catch (e) {}
    }
  }
  const deleteAccountApi = () => {
    let apiData = {
      "password": passwordRef.current.value,
    }
    let url = process.env.initJson["api"] + "/service/api/auth/delete/account"
    mutateDeleteAccount({ url, apiData })
  }

  if (deleteAccountLoading) {
    <PageLoader></PageLoader>
  }

  return (
    <Dialog
      open={popupData.isActive ? popupData.isActive : false} 
    >
      <div className={styles.sharecontent_modal}>
        <div className={styles.main_modal}>
          <div className={styles.modal_wrapper}>
            <div className={styles.modal_content}>
              <CloseIcon
                className={`${styles.cross_icon}`}
                onClick={handleClose}
              >               
              </CloseIcon>
              <div className={`${styles.modal_content_inner}`}>
                  <div className={`${styles.profile_img}`}>
                  <img
                  src={
                      !!popupData.userProfile?.imageUrl
                        ? getAbsolutePath(popupData.userProfile?.imageUrl)
                      : "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg"
                  }
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src =
                      "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg";
                  }}
                    alt={popupData.userProfile?.name}
                /> 
                  </div>              
                  {popupData.subtype == "pin" && (
                    <>
                      <h5 className={`${styles.otp_Txt} ${styles.View_Txt}`}>
                     {ProfilePasswordOtpconstant[localLang].Profile_Lock}
                      </h5>
                      <p className={`${styles.otp_subTxt} ${styles.View_subTxt}`}>
                      {ProfilePasswordOtpconstant[localLang].Enter_your_account_password_to_edit_profile_lock}
                      {` ${popupData.userProfile?.name}`}’s {ProfilePasswordOtpconstant[localLang].Profile}
                      </p>
                    </>
                  )}
                  {popupData.subtype == "view" && (   
                      <>
                      <h5 className={`${styles.otp_Txt} ${styles.View_Txt}`}>
                        {ProfilePasswordOtpconstant[localLang].Viewing_Restrictions}
                      </h5>
                      <p className={`${styles.otp_subTxt} ${styles.View_subTxt}`}>
                      {ProfilePasswordOtpconstant[localLang].Enter_your_password_to_edit_profile_Maturity_Rating_and_Title_Restrictions_for} {popupData.userProfile?.name}’s {ProfilePasswordOtpconstant[localLang].Profile}
                    </p>
                  </>
                )}
                {popupData.subtype == "DeleteAccount" && (
                  <>
                    <h5 className={`${styles.otp_Txt} ${styles.View_Txt}`}>
                      {ProfilePasswordOtpconstant[localLang].Delete_Account}
                    </h5>
                    <p className={`${styles.otp_subTxt} ${styles.View_subTxt}`}>
                      {popupData.userProfile?.name} {ProfilePasswordOtpconstant[localLang].Enter_your_password_to_delete_your_Account}
                    </p>
                  </>
                )}
                   {popupData.hasSetPassword ? <form className={styles.otp_block} onSubmit={onSubmit} >
                        <div className={`${styles.forgot}`}>                        
                           <TextField
                            fullWidth                           
                            autoFocus
                            margin="normal"
                            name="password"
                            label="Password"
                            inputRef={passwordRef}
                            sx={fromStyle}
                            type={isVisible ? "text" : "password"}
                            key="password"
                            inputProps={{ maxLength: appConfig.authMaxLength}}
                            onBlur={(e)=>validatePassword(e.target.value)}
                            onFocus={() => setPassV({ valid: true, error: "" })}                           
                          />
                            <span
                            className={` ${styles.show}`}
                            onClick={() => setIsVisible(!isVisible)}
                          >
                            {isVisible ? "Hide" : "Show"}
                          </span>
                    <div className={` ${styles.valid_error} `}>{passV.error}</div>

                          <span className={`${styles.otp_sent}`}>
                            {errorMessage}
                          </span>
                        </div>
                        <div className={styles.footer_actions}>
                          <button type="button" onClick={handleClose} >{ProfilePasswordOtpconstant[localLang].Cancel}</button>
                          <button type="submit" className={`primary`}>{ProfilePasswordOtpconstant[localLang].Continue}</button>
                        </div>
                      </form>:
                      <>
                      <p className={`${styles.otp_subTxt} ${styles.View_subTxt} ${styles.createPass}`}>
                        {ProfilePasswordOtpconstant[localLang]?.Please_Create_Your_Passoword}
                      <Link className={`primary`} href='/set-password'> {Settingsconstant[localLang].Create} </Link>
                      </p>
                      </>
                      } 
                </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
