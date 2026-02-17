import DevicesList from "@/components/settings/device-list.component";
import React, { useEffect, useState } from "react";
import styles from "@/components/settings/settings.module.scss";
import { useRouter } from "next/router";
import { AddSeoTags } from "@/services/seo.service";
import MetaTags from "@/components/meta-tags/meta-data";

const ActiveDevice = ({ seodata }) => {
  const router = useRouter();
  const [defaultTab, setDefaultTab] = useState(null);
  useEffect(() => {
    if (router?.query?.id) {
      const queryPath = router.query.id;
      if (queryPath === "devices") {
        setDefaultTab(1);
      } else if (queryPath === "screens") {
        setDefaultTab(2);
      } else {
        router.push("/404");
      }
    }
  }, [router.query.id, router]);

  if (defaultTab === null) {
    return null;
  }

  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <div className={`${styles.settings}`}>
        <div className={`${styles.container}`}>
          <div className={`settings_inner ${styles.settings_inner}`}>
            <div className={`${styles.user_details}`}>
              <DevicesList isPage defaultTab={defaultTab} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActiveDevice;

export async function getServerSideProps({ req }) {
  return AddSeoTags(req,  "Devices", "no_crawl");
}
