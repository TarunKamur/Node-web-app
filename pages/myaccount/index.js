import MyAccount from "@/components/MyAccount/myaccount.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";
import { useEffect, useState } from "react";

export default function MobileAccountPage({ seodata }) {
  const [render, setRender] = useState(false);
  useEffect(() => {
    setRender(true);
  }, []);
  return (
    <>
      <MetaTags seodata={seodata} noindex={true} />
      {render && <MyAccount />}
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "myaccount", "no_crawl");
}
