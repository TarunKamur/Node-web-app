import CreatePassword from "@/components/create-password/create-password.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function ChangePasswordMain({ seodata }) {
  return (
    <>
     {seodata && <MetaTags seodata={seodata} noindex={true} />}
      <CreatePassword />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "no_crawl");
}