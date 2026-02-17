import useGetApiMutate from "@/hooks/useGetApidata";
import { jsonToQueryParams } from "@/services/utility.service";
import { useEffect, useReducer, useRef, useState } from "react";
import styles from "./Packages.module.scss";
import Durations from "./Duration/Durations.component";
import Ordersummary from "./OrderSummary/OrderSummary.component";
import { unAuthorisedHandler } from "@/services/data-manager.service";
import { actions, useStore } from "@/store/store";
import usePostApiMutate from "@/hooks/usePostApidata";
import { getItem, getItemSession } from "@/services/local-storage.service";
import { Packagesconstant } from "@/.i18n/locale";
import { appConfig } from "@/config/app.config";
import { useRouter } from "next/router";
import ActivePlans from "./activePlans/active-plans.component";
import { ImageConfig } from "@/config/ImageConfig";
{
  /*\
overlay
tvguide
settings
player
list
shorts
details
content
menus
search
*/
}

let initial_state = {
  apiResponse: {},
  packagesResponse: [],
  durations: [],
  activePackage: [],
  activ_pkg_indx: undefined,
  userActivepackages: [],
  activeOrderSummary: undefined,
  active_plan_index: "",
};
//https://localhost:3000/sso/manage?ut=encodeURI(btoa("bi===61f7a95a-f21c-206a-7d4e-1d7c390dad2a&&&si===d5f74a87-9d07-498f-a864-f338a0c6d468&&&ci===5&&&redirect===bookDTH&&&av===1.2&&&validity===16436562566723"))
function pkgstateReducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case "addPackagesData": {
      let { apiResponse, isloggedin } = payload;
      state.apiResponse = apiResponse;
      if (apiResponse.status === true) {
        state.packagesResponse = apiResponse.response.packageResponse;
        state.durations = apiResponse.response.durations;
        state.activePackage = apiResponse.response.packageResponse[0];
      }
      return { ...state };
    }
    case "activePackage": {
      let { packageResponse, activ_pkg_indx, plan_index } = payload;
      return {
        ...state,
        activePackage: packageResponse,
        activ_pkg_indx,
        active_plan_index: plan_index,
      };
    }
    case "adduserActivepackages": {
      let { packages } = payload;
      return {
        ...state,
        userActivepackages: [...packages],
      };
    }
    case "activeOrderSummary": {
      let { activeOrderSummary } = payload;
      return {
        ...state,
        activeOrderSummary,
      };
    }
    default:
      return state;
  }
}

export default function Packages() {
  const { mutate: mutateGetPackagesData, data: packageapiResponse } =
    useGetApiMutate();
  const { mutate: mutatePostorderSummary, data: orderSummaryResponse } =
    usePostApiMutate();
  const {
    mutate: mutateGetactivePackages,
    data: dataGetactivePackagesListResponse,
  } = useGetApiMutate();
  const { mutate: mutateGetrentPackagesData, data: rentpackageapiResponse } =
    useGetApiMutate();
  const [cstate, cdispatch] = useReducer(pkgstateReducer, initial_state);
  const [isloggedin, setIsLoggedIn] = useState(null);
  const {
    durations,
    packagesResponse,
    activePackage,
    activ_pkg_indx,
    userActivepackages,
    activeOrderSummary,
    active_plan_index,
  } = cstate;

  const {
    state: {
      Session,
      userDetails,
      SystemConfig,
      navigateFrom,
      packageUtil,
      localLang,
    },
    dispatch,
  } = useStore();
  const [isUtuser, setutUser] = useState();
  const [ismobile, setIsmobile] = useState(false);
  // const [clientId,setClientId] = useState()
  const [toggleSummary, setToggleSummary] = useState(false);
  // const [isAndroid,setIsAndroid] = useState(false);
  // const [isIos,setIsIos] = useState(false);
  // let ios_Ids = ['6','7','55',6,7,55]

  const router = useRouter();
  const [isHideBack, hideBack] = useState(false);
  useEffect(() => {
    if (!!Session) {
      getPackages();
      // setIsAndroid(!(['6', '7'].indexOf(getItem("clientId")) > -1))
      // setIsIos((['6', '7'].indexOf(getItem("clientId")) > -1))

      if (getItem("isUtuser")) {
        setutUser(true);
      }
      if (window.innerWidth <= 767) {
        setIsmobile(true);
      }
      // setClientId(getItem("clientId"))
      window.addEventListener("resize", () => {
        if (window.innerWidth <= 767) {
          setIsmobile(true);
        } else {
          setIsmobile(false);
        }
      });
    }
  }, [Session]);

  useEffect(() => {
    const hideBackIOS = getItemSession("hideBackIOS");
    hideBack(hideBackIOS === "true");
  }, []);

  useEffect(() => {
    if (!!userDetails) {
      setIsLoggedIn(true);
      getActivePackages();
    } else {
      setIsLoggedIn(false);
    }
  }, [userDetails]);

  useEffect(() => {
    if (packageapiResponse && packageapiResponse.data) {
      if (packageapiResponse?.data?.status) {
        cdispatch({
          type: "addPackagesData",
          payload: { apiResponse: packageapiResponse.data, isloggedin },
        });
        if (packageUtil) {
          cdispatch({
            type: "activePackage",
            payload: {
              packageResponse: packageUtil.activePackage,
              activ_pkg_indx: packageUtil.activ_pkg_indx,
              plan_index: packageUtil.active_plan_index,
            },
          });
        }
      } else if (
        packageapiResponse?.data?.error &&
        packageapiResponse?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      }
    }
  }, [packageapiResponse]);

  useEffect(() => {
    dispatch({ type: actions.PageData, payload: {} });
  }, []);

  useEffect(() => {
    if (
      dataGetactivePackagesListResponse &&
      dataGetactivePackagesListResponse.data
    ) {
      if (dataGetactivePackagesListResponse?.data?.status) {
        cdispatch({
          type: "adduserActivepackages",
          payload: {
            packages: dataGetactivePackagesListResponse.data.response,
          },
        });
        // let params = {
        //   gateway: packagesResponse[0]?.supportedGateway[0]?.code,
        //   packages: packagesResponse[0]?.packageInfo.packages[0]?.id.toString(),
        // };
        // getOrderSummary(params);
      } else if (
        dataGetactivePackagesListResponse?.data?.error &&
        dataGetactivePackagesListResponse?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      }
    }
  }, [dataGetactivePackagesListResponse]);

  useEffect(() => {
    if (orderSummaryResponse && orderSummaryResponse.data) {
      if (orderSummaryResponse?.data?.status) {
        cdispatch({
          type: "activeOrderSummary",
          payload: { activeOrderSummary: orderSummaryResponse.data.response },
        });
        dispatch({
          type: actions.packageUtil,
          payload: {
            order_summary: orderSummaryResponse.data.response,
          },
        });
      } else if (
        orderSummaryResponse?.data?.error &&
        orderSummaryResponse?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      }
    }
  }, [orderSummaryResponse]);

  useEffect(() => {
    if (rentpackageapiResponse && rentpackageapiResponse.data) {
      if (rentpackageapiResponse?.data?.status) {
        cdispatch({
          type: "addrentPackagesData",
          payload: { apiResponse: rentpackageapiResponse.data, isloggedin },
        });

        cdispatch({
          type: "activePackage",
          payload: {
            packageResponse: rentpackageapiResponse?.data?.response[0],
            activ_pkg_indx: 0,
            plan_index: 0,
          },
        });

        dispatch({
          type: actions.packageUtil,
          payload: {
            activ_pkg_indx: 0,
            active_plan_index: 0,
            activePackage: rentpackageapiResponse?.data?.response[0],
          },
        });
        // TODO need to add  support for mutliple payment gateways until then below is the workaround
        if (
          rentpackageapiResponse?.data?.response?.[0]?.supportedGateway?.[0]
            ?.code !== "razorpay"
        ) {
          router.replace(
            `/buy/order-summary/${rentpackageapiResponse.data.response[0]?.packageInfo?.packages[0]?.id}`
          );
        }
      } else if (
        rentpackageapiResponse?.data?.error &&
        rentpackageapiResponse?.data?.error?.code === 401
      ) {
        unAuthorisedHandler();
      }
    }
  }, [rentpackageapiResponse]);

  const getPackages = () => {
    let params;
    let url;
    if (router.query._rent) {
      params = {
        path: router.query._rent,
        package_type: "2",
        skip_package_content: "true",
      };
      url =
        process.env.initJson.api +
        "/package/api/v1/packages/info/for/content?" +
        jsonToQueryParams(params);
      try {
        mutateGetrentPackagesData(url);
      } catch (e) {}
    } else {
      params = {
        skip_package_content: true,
      };
      url =
        process.env.initJson.api +
        "/package/api/v2/packages/info?" +
        jsonToQueryParams(params);
      try {
        mutateGetPackagesData(url);
      } catch (e) {}
    }
  };

  const getOrderSummary = (params) => {
    let url = process.env.initJson["api"] + "/payment/api/v1/order/summary";
    try {
      mutatePostorderSummary({ url, apiData: params });
    } catch (e) {}
  };

  const getActivePackages = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/user/activepackages";
    try {
      mutateGetactivePackages(url);
    } catch (e) {}
  };

  const handleActivePackage = (packageResponse, activ_pkg_indx, plan_index) => {
    if (!!userDetails && !router.query?._rent) {
      let params = {
        gateway: packageResponse.supportedGateway[0].code,
        packages:
          packageResponse.packageInfo.packages[activ_pkg_indx].id.toString(),
      };
      getOrderSummary(params);
    }
    // else{
    cdispatch({
      type: "activePackage",
      payload: { packageResponse, activ_pkg_indx, plan_index },
    });
    //--------------------------------------
    dispatch({
      type: actions.packageUtil,
      payload: {
        activ_pkg_indx: activ_pkg_indx,
        active_plan_index: plan_index,
        activePackage: packageResponse,
      },
    });
    // }
  };

  const showmobileSummary = () => {
    setToggleSummary(!toggleSummary);
  };

  const onback = () => {
    if (router.query?._nfrom == "settings") {
      router.back();
    } else if (isUtuser) {
      window.location.href = SystemConfig.configs.siteURL;
    } else {
      if (!!navigateFrom) {
        cdispatch({ type: actions.navigateFrom, payload: null });
        router.push(navigateFrom);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div
      className={`${styles.packages_wrapper} ${ismobile ? styles.mobile : ""}`}
    >
      {
        <div className={`${styles.tab_header}`}>
          {!isHideBack && (
            <img
              alt="price"
              src={`${ImageConfig?.packages?.back}`}
              onClick={onback}
            />
          )}
          {Packagesconstant[localLang].Pricing}
        </div>
      }
      {!ismobile ? (
        <div className={`${styles.packages_container}`}>
          <div className={`${styles.active_plans_container}`}>
            {userDetails &&
              appConfig.packageSettings.activePlans !== "false" && (
                <ActivePlans
                  userActivepackages={userActivepackages}
                  ismobile={ismobile}
                />
              )}
          </div>
          {(!userDetails ||
            (userDetails &&
              appConfig.packageSettings.activePlans !== "true")) && (
            <>
              <div className={`${styles.packages_header}`}>
                <h1 className={`${styles.heading}`}>
                  {/* {Packagesconstant[localLang].Choose_the_plan_thats_right_for_you} */}
                  {cstate?.apiResponse?.response?.title}
                </h1>
                {/* <div className={`${styles.sub_headings}`}>
              <p className={`${styles.sub_heading}`}>
              {Packagesconstant[localLang].Try_7_days_FREE_Cancel_anytime}
              </p>
              <p className={`${styles.sub_heading}`}>
              {Packagesconstant[localLang].Selected_package_will_be_activated_after_the_free_trial_period_ends}
              </p>
            </div> */}
              </div>

              <div className={`${styles.packages_body}`}>
                <div className={`${styles.packages_left_container}`}>
                  {durations.length > 0 && (
                    <Durations
                      durations={durations}
                      packagesResponse={packagesResponse}
                      handleActivePackage={handleActivePackage}
                      userActivepackages={userActivepackages}
                      active_plan_index={active_plan_index}
                      title={cstate?.apiResponse?.response?.title}
                    />
                  )}
                </div>
                <div className={`${styles.packages_right_container}`}>
                  {activePackage && (
                    <Ordersummary
                      activePackage={activePackage}
                      activ_pkg_indx={activ_pkg_indx}
                      active_OrderSummary={activeOrderSummary}
                      userActivepackages={userActivepackages}
                      isloggedin={isloggedin}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={`${styles.packages_container}`}>
          {!toggleSummary && (
            <div className={`${styles.packages_header}`}>
              {/* <div className={`${styles.sub_headings}`}>
                  <p className={`${styles.sub_heading}`}>
                  {Packagesconstant[localLang].Try_7_days_FREE_Cancel_anytime}
                  </p>
                  <p className={`${styles.sub_heading}`}>
                  {Packagesconstant[localLang].Selected_package_will_be_activated_after_the_free_trial_period_ends}
                  </p>
                </div> */}
            </div>
          )}
          <div className={`${styles.packages_body}`}>
            {!(toggleSummary || router?.query?._rent) ? (
              <>
                {
                  <div className={`${styles.mobile_header}`}>
                    {!isHideBack && (
                      <img
                        alt="price"
                        src={`${ImageConfig?.packages?.back}`}
                        onClick={onback}
                      />
                    )}
                    {Packagesconstant[localLang].Pricing}
                  </div>
                }
                <div className={`${styles.packages_left_container}`}>
                  {durations.length > 0 && (
                    <Durations
                      durations={durations}
                      packagesResponse={packagesResponse}
                      handleActivePackage={handleActivePackage}
                      userActivepackages={userActivepackages}
                      ismobile={ismobile}
                      showmobileSummary={showmobileSummary}
                      activ_pkg_indx={activ_pkg_indx}
                      active_plan_index={active_plan_index}
                      title={cstate?.apiResponse?.response?.title}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={`${styles.mobile_summary_header}`}>
                  {Packagesconstant[localLang].Confirm_Order}
                  <span
                    className={`${styles.close}`}
                    onClick={() => {
                      showmobileSummary();
                    }}
                  >
                    X
                  </span>
                </div>
                <div className={`${styles.packages_right_container}`}>
                  {activePackage && (
                    <Ordersummary
                      activePackage={activePackage}
                      activ_pkg_indx={activ_pkg_indx}
                      active_OrderSummary={activeOrderSummary}
                      userActivepackages={userActivepackages}
                      isloggedin={isloggedin}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
