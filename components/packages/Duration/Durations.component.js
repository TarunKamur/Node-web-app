import { useEffect, useState } from "react";
import styles from "./Duration.module.scss";
import Link from "next/link";
import { actions, useStore } from "@/store/store";
import { Durationconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import ActivePlans from "@/components/packages/activePlans/active-plans.component";
import { getItem } from "@/services/local-storage.service";
import { Packagesconstant } from "@/.i18n/locale";


function Durations({ packagesResponse, handleActivePackage, userActivepackages, ismobile, showmobileSummary, active_plan_index, title }) {
  const [activePlanIndex, setActivePlanIndex] = useState(undefined);
  const { state: { Session, userDetails, packageUtil, localLang },dispatch } = useStore();
  useEffect(()=>{
    if (active_plan_index !== ''){
      setActivePlanIndex(active_plan_index)
      return;
    }
    if(userDetails){
      if (is_selected_plan_subscribed() === false && packageUtil && packageUtil.active_plan_index !== undefined){
      };
    }
    else{
      if (packageUtil && packageUtil.active_plan_index !== undefined) return;
    }
    let isFound = false;
    for(let i=0;i<packagesResponse?.length;i++){
        let _index = 0;
        let prev_row = i - 1;
        while (prev_row >= 0) {
          _index =
            _index + packagesResponse[prev_row].packageInfo.packages.length;
          prev_row = prev_row - 1;
        }
      for(let j=0;j<packagesResponse[i].packageInfo.packages.length;j++){
        if(packagesResponse[i].packageInfo.packages[j].isSelectable === true &&  packagesResponse[i].packageInfo.packages[j].isSubscribed === false){
       // if(packagesResponse[i].packageInfo.packages[j].isSubscribed === false){   
          handleDurationClick(packagesResponse[i], j+_index,j)
          isFound = true;
          break;
        }
      }

      if(isFound === true){
        break
      }
    }
    packagesResponse
  }, [packagesResponse, userActivepackages])

  const handleDurationClick = (packagesResponse, plan_index,activ_pkg_indx) => {
    setActivePlanIndex(plan_index);   
    handleActivePackage(packagesResponse, activ_pkg_indx, plan_index); 
  };

  const getplanStatus = (packageId)=>{
    if (userActivepackages.length > 0){
      let plan = userActivepackages.filter((pkg)=>pkg.id === packageId)[0]
    
      if (plan && plan.isCurrentlyActivePlan === true && plan.isUnSubscribed === false){
        return "Current Plan"
      }
      else if(plan && plan.isCurrentlyActivePlan === true && plan.isUnSubscribed === true){
        return "Subscribed"
      }
      return ""
    }
    return ""
  }

  const isSelected = (index2 ,_index)=>{
    return index2 + _index === activePlanIndex
  }

  const is_selected_plan_subscribed = ()=>{
    if (packageUtil && packageUtil.activePackage && packageUtil.active_plan_index !== undefined){
      if (userActivepackages && userActivepackages.length > 0){
        for (let k = 0; k < packageUtil.activePackage.packageInfo.packages.length;k++){
          for (let i = 0; i < userActivepackages.length; i++) {
            if (packageUtil.activePackage.packageInfo.packages[k].id === userActivepackages.id) {
              return true;
            }
          }
        }
      }
      return false
    }
  }

  return (
    <>
      <div
        className={`${styles.durations_container} ${
          ismobile ? styles.mobile : ""
        }`}
      >
        {(ismobile && userDetails && appConfig.packageSettings.activePlans !== "false") && <div className={`${styles.active_plans_container}`}>
          <ActivePlans userActivepackages={userActivepackages} ismobile={ismobile} title={title}></ActivePlans>
        </div>}
        {(ismobile && appConfig.packageSettings.activePlans !== 'true') &&
          <h1 className={`${styles.plans_heading}`}>
            {title ? title : Packagesconstant[localLang].Choose_the_plan_thats_right_for_you}
          </h1>}
        {(appConfig.packageSettings.activePlans !== 'true' || !userDetails) && packagesResponse.map((packageResponseData, index1) => {
          let _index = 0;
          let prev_row = index1 - 1;
          while (prev_row >= 0) {
            _index =
              _index + packagesResponse[prev_row].packageInfo.packages.length;
            prev_row = prev_row - 1;
          }

          return packageResponseData.packageInfo.packages.map((pkg, index2) => {
            return (
              <div
                key={index2 + _index}
                className={
                  `${styles.duration}` +
                  `${isSelected(index2, _index) ? " " + styles.selected : ""}` +
                  `${
                    pkg.isSelectable === false || pkg.isSubscribed == true
                      ? " " + styles.disable
                      : ""
                  }`
                }
                onClick={() => {
                  !(pkg.isSelectable === false || pkg.isSubscribed === true)
                    ? handleDurationClick(
                        packageResponseData,
                        index2 + _index,
                        index2
                      )
                    : "";
                }}
                // onClick={() =>
                //   handleDurationClick(packageResponseData, index2 + _index, index2)
                // }
              >
                {getplanStatus(pkg.id) && (
                  <span className={`${styles.plan_status}`}>
                    {getplanStatus(pkg.id)}
                  </span>
                )}
                <div className={`${styles.duration_left}`}>
                  <div className={`${styles.pack_info}`}>
                    <div className={`${styles.radio_btn}`}>
                      <div className={`${styles.radio_btn_inner}`}></div>
                    </div>
                  </div>
                </div>
                <div className={`${styles.duration_right}`}>
                  <div className={`${styles.duration_right_inner}`}>
                    <div className={`${styles.pack_meta}`}>
                      <p className={`${styles.pack_type}`}>{pkg.name}</p>
                      <span className={`${styles.terms}`}>
                        <Link
                          href="/support/terms"    
                          prefetch={false}                      
                        >
                          {Durationconstant[localLang].Terms_and_Conditions}
                        </Link>
                        {Durationconstant[localLang].Apply}
                      </span>
                    </div>
                    <div className={`${styles.price_info}`}>
                      {pkg.listPrice != "" &&
                        pkg.listPrice !== pkg.salePrice && (
                          <div className={`${styles.offer}`}>
                            {pkg.currency}
                            {` ${pkg.listPrice}`}
                          </div>
                        )}

                      <div className={`${styles.price}`}>
                        {pkg.currency}
                        {` ${pkg.salePrice}`}
                      </div>

                      <div className={`${styles.tax_info}`}>
                        {Durationconstant[localLang].Inclusive_of_all_Taxes}
                      </div>
                    </div>
                  </div>
                  {pkg?.features && Object.keys(pkg.features).length > 0 && (
                    <div className={`${styles.features}`}>
                      <ul>
                        {Object.keys(pkg.features).map((key, index) => {
                          return (
                            pkg.features[key] && (
                              <li key={index} className={`${styles.feature}`}>
                                {pkg.features[key]}
                              </li>
                            )
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })}
      </div>
      {/* <span className={`${styles.terms}`}>
        <a target="_blank" href="#">
          Terms and Conditions
        </a>
        apply
      </span> */}
      {(appConfig.packageSettings.activePlans !== 'true' || !userDetails) && <button
        className={
          `${styles.mobile_continue} primary` +
          `${activePlanIndex == undefined ? " " + styles.disabled : ""}`
        }
        onClick={() => {
            if(activePlanIndex != undefined){
              window.scrollTo(0,0)
              showmobileSummary();
            }
        }}
      >
        {Durationconstant[localLang].Continue}
      </button>}
    </>
  );
}

export default Durations;
