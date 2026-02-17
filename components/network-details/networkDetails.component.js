import { getAbsolutePath } from "@/services/user.service";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";

import styles from "@/components/network-details/networkDetails.module.scss";
import { ImageConfig } from "@/config/ImageConfig";

const NetworkDetails = () => {
  const {
    state: { PageData, userDetails },
  } = useStore();
  const [detailsObj, setDetailsobj] = useState({});

  useEffect(() => {
    getBackgroundImage();
  }, [PageData]);

  const getBackgroundImage = () => {
    let obj = {};
    PageData?.data?.map((data) => {
      if (data?.paneType === "content") {
        data?.content?.dataRows[0]?.elements?.map((element) => {
          if (element?.elementSubtype === "bgImage") {
            obj.bgImage = getAbsolutePath(element.data);
          }
          if (element?.elementSubtype === "title") {
            obj.title = element.data;
          }
        });
      }
    });
    setDetailsobj(obj);
  };

  return (
    <div className={`${styles.network_details}`}>
      <img
        className={` ${styles.image}`}
        src={detailsObj.bgImage}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.src = `${ImageConfig?.defaultdetails}`;
        }}
        alt=""
      />
    </div>
  );
};

export default NetworkDetails;
