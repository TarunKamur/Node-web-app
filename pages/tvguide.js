import Tvguide from "@/components/tvguide/tvguide.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";
import { useEffect, useState } from "react";

export default function TvGuidePage({ seodata }) {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setLoad(true);
  }, []);

  return load ? (
    <>
      <MetaTags seodata={seodata} />
      <Tvguide />
    </>
  ) : null;
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "tvguide", "api");
}
