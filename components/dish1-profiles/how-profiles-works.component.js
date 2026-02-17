import styles from "@/components/dish1-profiles/profiles-list.module.scss";
import { actions, useStore } from "@/store/store";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { systemConfigs } from "@/services/user.service";
import { ImageConfig } from "@/config/ImageConfig";

function HowProfileworks() {
  const router = useRouter();
  const {
    state: { userDetails, navigateFrom },
    dispatch,
  } = useStore();

  const naToback = () => {
    if (navigateFrom) {
      router.push(`/${navigateFrom}`);
      dispatch({ type: actions.navigateFrom, payload: null });
    } else {
      router.push("/");
    }
  };

  const howProfileWorks = JSON.parse(
    systemConfigs?.configs?.howProfileWorks || "{}"
  );

  return (
    <>
      {howProfileWorks && (
        <div className={`${styles.Profileworks}`}>
          <div className={`${styles.mobileHeaderback}`}>
            <img
              alt="back"
              src={`${ImageConfig.bookd2h.back}`}
              onClick={naToback}
            />
            <h2>How Profile Works</h2>
          </div>
          <div className={`${styles.Profileworks_inner}`}>
            <div className={`${styles.list}`}>
              <div className={`${styles.left_container}`}>
                <h1>{howProfileWorks?.title}</h1>
                <div className={styles.flow_list}>
                  {howProfileWorks?.steps?.map((step, index) => (
                    <div className={styles.list_item} key={index}>
                      <div className={styles.imgCon}>
                        <img src={step.imageUrl} alt={`Step ${index + 1}`} />
                      </div>
                      <p className={`${styles.listText}`}>{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${styles.right_container}`}>
                <img src={howProfileWorks?.mainImage} />
              </div>
            </div>
            <button onClick={naToback} className={`primary ${styles.btns}`}>
              {howProfileWorks?.buttonText}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default HowProfileworks;
