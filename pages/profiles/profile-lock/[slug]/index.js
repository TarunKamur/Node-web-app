import ProfileLockComp from "@/components/profiles/profile-lock/profile-lock.component"
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";



export default function ProfileLockPage( { seodata }) {
  return (
    <>
    {seodata && <MetaTags seodata={seodata} />}
     <ProfileLockComp />
    </>
  )
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, "profiles", "no_crawl");
}
