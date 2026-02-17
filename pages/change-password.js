import ChangePassword from "@/components/change-password/change-password.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function ChangePasswordMain({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} noindex={true} />}
      <ChangePassword />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "no_crawl");
}

