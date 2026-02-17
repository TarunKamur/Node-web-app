import DeviceActivate from "@/components/device-activate/device-activate.component"
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function DeviceA({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <DeviceActivate />
    </>
  )
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "no_crawl");
}
