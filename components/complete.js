import { Complete } from "@/components/complete";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";
import { useEffect, useState } from "react";

export default function CompletePage({ seodata }) {
  const [render, setRender] = useState(false);
  useEffect(() => {
    setRender(true);
  }, []);
  return (
    <>
      <MetaTags seodata={seodata} noindex={true} />
      {render && <Complete />}
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "conplete", "no_crawl");
}
