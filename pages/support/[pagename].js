import SupportPages from "@/components/support/support.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function SupportPage({ seodata }) {
  return (
    <>
      <MetaTags seodata={seodata} noindex={true} />
      <SupportPages />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "default");
}
