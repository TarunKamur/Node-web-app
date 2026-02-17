import Forgot from "@/components/forgot/forgot.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function ForgetPasswordPage({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <Forgot />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "no_crawl");
}
