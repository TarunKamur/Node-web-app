import Dynamic from "@/components/dynamic/dynamic.component";
import DynamicSeoComponent from "@/components/footers/dynamicSeoFooter/dynamicSeoFooter.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function DynamicPage({ seodata , dynamicSeo  }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <Dynamic />
      {dynamicSeo &&  <DynamicSeoComponent dynamicSeo={dynamicSeo} />}
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "api");
}
