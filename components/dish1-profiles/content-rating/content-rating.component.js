import React, { use, useEffect, useState } from "react";
import styles from "./content-rating.module.scss";
import useGetApiMutate from "@/hooks/useGetApidata";
import { actions, useStore } from "@/store/store";
import usePostApiMutate from "@/hooks/usePostApidata";
import { Co2Sharp } from "@mui/icons-material";
import Loader from "@/components/loader/loader.component";
import Skeleton from "@/components/skeleton/skeleton.component";
import { useRouter } from "next/router";
import { setUserDetails } from "@/services/user.service";

const ContentRating = (props) => {
  const [selectProfile, setSelectedProfile] = useState();
  const [pRatings, setPRatings] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();
  const [fetchPgratings, setfetchPgratings] = useState(true);
  const { mutate: mutateSavePg, data: apiPostresponse } = usePostApiMutate();
  const [isbtnLoading, setIsbtnLoading] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  const router = useRouter();

  const {
    mutate: mutateGetData,
    data: apiGetResponse,

    isError,
    error,
    refetch,
  } = useGetApiMutate();
  const {
    state: { userDetails, profileUtil, localLang },
    dispatch,
  } = useStore();
  useEffect(() => {
    if (
      !!apiGetResponse?.data?.status &&
      selectProfile?.profileRatingId &&
      !props?.userinfo
    ) {
      setisLoading(false);
      let data = apiGetResponse.data.response.parentalRatings.sort(
        (a, b) => a.priority - b.priority
      );
      setPRatings(data.reverse());
      let ind;
      ind = !!selectProfile?.profileRatingId
        ? data.findIndex((ele) => ele.id === selectProfile.profileRatingId)
        : data?.length - 1;
      setSelectedIndex(ind);
    }
  }, [apiGetResponse, props?.userinfo]);
  useEffect(() => {
    if (userDetails) {
      setSelectedProfile(
        userDetails.profileParentalDetails.find(
          (ele) => ele.profileId == props?.userID
        )
      );
    }
  }, [userDetails]);
  useEffect(() => {
    if (selectProfile && fetchPgratings) {
      setfetchPgratings(false);
      let url =
        process.env.initJson["api"] + "/service/api/v1/get/parental/ratings";
      mutateGetData(url);
    }
  }, [selectProfile]);
  useEffect(() => {
    if (props?.isMobile) {
      props?.setSelectedRating(pRatings[selectedIndex]?.id);
      // console.log(props)
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (!!apiPostresponse) {
      setIsbtnLoading(false);
      if (!!apiPostresponse.data.status) {
        let index = userDetails.profileParentalDetails.findIndex(
          (ele) => ele.profileId == router?.query?.slug
        );
        userDetails.profileParentalDetails[index].profileRating =
          pRatings[selectedIndex].name;
        userDetails.profileParentalDetails[index].profileRatingDesc =
          pRatings[selectedIndex].description;
        userDetails.profileParentalDetails[index].profileRatingId =
          pRatings[selectedIndex].id;
        dispatch({ type: actions.userDetails, payload: { ...userDetails } });
        setUserDetails(userDetails);
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message:
              apiPostresponse?.data?.response?.message || "Changes Saved",
            icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/login_success_icon.svg",
          },
        });
      } else {
        dispatch({
          type: actions.NotificationBar,
          payload: {
            message: "Something went wrong",
          },
        });
      }
    }
  }, [apiPostresponse]);

  const saveDetails = () => {
    setIsbtnLoading(true);
    let postData = {
      ratingsId: pRatings[selectedIndex]?.id,
      profileId: selectProfile?.profileId,
      blockedItems: [], //formatBlockedItems(),
    };
    // console.log(pRatings[selectedIndex])
    // setIsbtnLoading(false);

    let url =
      process.env.initJson["api"] +
      "/service/api/auth/update/view/restrictions";
    mutateSavePg({ url, apiData: postData });
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton custom={true} type={["contentRating"]} />
      </div>
    );
  }

  const clickHandler = (valu, i) => {
    if (!selectProfile?.isChildren || valu.id == 1 || valu.id == 5) {
      setSelectedIndex(i);
    }
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.SelectContent}>Select Content Rating</h4>
      <form className={`${styles.dotted_line}`}>
        <svg
          height="104%"
          width="2"
          style={{
            display: "block",
            margin: "0 auto",
            position: "absolute",
            left: "13px",
            top: "-11.5px",
            profileUtil,
          }}
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="#FFFFFF66"
            strokeWidth="0.8"
            strokeDasharray="8, 8"
          />
        </svg>
        {/* {console.log(pRatings)} */}
        {pRatings.map((valu, i) => (
          <div key={i} className={styles.arrContainer}>
            <div
              className={`${styles.customCheckbox} ${i >= selectedIndex ? styles.checked : ""} ${!(!selectProfile?.isChildren || valu.id == 1 || valu.id == 5) && styles.cursorNone}`}
              onClick={() => clickHandler(valu, i)}
            ></div>

            <div
              className={`${styles.description} ${i >= selectedIndex ? styles.active : ""} ${!(!selectProfile?.isChildren || valu.id == 1 || valu.id == 5) ? styles.cursorNone : styles.cursorPointer}`}
              onClick={() => clickHandler(valu, i)}
            >
              <h4 className={styles.head}>
                {valu?.displayCode == "A" ? "A (Adult)" : valu?.displayCode}
              </h4>
              <p className={styles.desc}>{valu?.description}</p>
            </div>
          </div>
        ))}
      </form>

      <button
        onClick={() => saveDetails()}
        className={styles.saveBtn}
        disabled={isbtnLoading}
      >
        {isbtnLoading ? <Loader type="button" /> : "Save"}
      </button>
    </div>
  );
};

export default ContentRating;
