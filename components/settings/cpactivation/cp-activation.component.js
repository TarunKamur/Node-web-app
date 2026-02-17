import styles from "./cp-activation.module.scss";
import { actions, useStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { sendEvent } from "@/services/analytics.service";
import { getPlansDetails } from "@/services/utility.service";
import Contentpartner from "./contentpartner/contentpartner.component";
import useGetApiMutate from "@/hooks/useGetApidata";
import usePostApiMutate from "@/hooks/usePostApidata";
import { Activatecp } from "@/.i18n/locale";

export default function CPActivationList() {
  const {
    state: { userDetails, localLang },
    dispatch,
  } = useStore();

  const { mutate: mutateGetPartnersList, data: partnersListResponse } =
    useGetApiMutate();

  const { mutate: mutateActivatePartnersList, data: ActivatePartnerResponse } =
    usePostApiMutate();

  const [partnersList, setPartnersList] = useState([]);
  const [actvateCPindex, SetactvateCPindex] = useState("");
  const GetPartnersList = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/list/user/network";
    mutateGetPartnersList(url);
  };

  const ActivePartner = (apiData) => {
    let url =
      process.env.initJson["api"] +
      "/service/api/auth/external/process/network";
    mutateActivatePartnersList({ url, apiData });
  };

  useEffect(() => {
    if (!!userDetails) {
      GetPartnersList();
    }
  }, [localLang]);

  useEffect(() => {
    if (partnersListResponse?.data?.status === true) {
      setPartnersList(partnersListResponse?.data?.response);
    }
  }, [partnersListResponse]);

  useEffect(() => {
    if (ActivatePartnerResponse?.data?.status === true) {
      setPartnersList((partnersList) =>
        partnersList.map((item, index) =>
          index === actvateCPindex
            ? {
                ...item,
                hasNetworkSubscription: true,
                buttonText: Activatecp[localLang].Activated,
              }
            : item
        )
      );
      dispatch({
        type: actions.NotificationBar,
        payload: { message: ActivatePartnerResponse?.data?.response?.message },
      });
    } else if (ActivatePartnerResponse?.data?.status === false) {
      dispatch({
        type: actions.NotificationBar,
        payload: { message: ActivatePartnerResponse?.data?.error?.message },
      });
    }
  }, [ActivatePartnerResponse]);

  const closePopup = () => {
    getUserSubscriptions();
    setPopUpData({});
  };

  const handleClose = () => {
    setPopUpData({});
    sendEvent("unsubscribe_no", getPlansDetails(true));
  };

  const handleActivatePartner = (partnerInfo, ind) => {
    SetactvateCPindex(ind);
    const { networkId } = partnerInfo;
    let payload = {
      userId: userDetails.userId,
      networkId,
      operation: "activate",
    };
    ActivePartner(payload);
  };

  return (
    <div className={`${styles.wrapperdiv}`}>
      <div className={`${styles.container}`}>
        <p className={`${styles.info_text}`}>
          {Activatecp[localLang]?.Below_is_a_list_of_content_partners}
        </p>
        <div className={`${styles.partners_container}`}>
          <div className={`${styles.partners_header}`}>
            <span className={`${styles.text} ${styles.name_text}`}>
              {Activatecp[localLang]?.Partner_Name}
            </span>
            <span className={`${styles.text} ${styles.action_text}`}>
              {Activatecp[localLang]?.Status_Action}
            </span>
          </div>
          <div className={`${styles.partners_body}`}>
            {partnersList.map((partner, _index) => (
              <Contentpartner
                partnerdata={{ ...partner, _index }}
                key={_index}
                handleActivatePartner={handleActivatePartner}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
