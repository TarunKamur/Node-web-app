import ViewRestrictionComp from "@/components/profiles/view-restrictions/view-restrictions.component"
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";


export default function ViewResctritionsPage({ seodata }) {
  return (
    <>
    {seodata && <MetaTags seodata={seodata} />}
     <ViewRestrictionComp />
    </>
  )
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, "profiles", "no_crawl");
}
