import ManageUserProfile from "@/components/profiles/manage-user-profile.component";

import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";


export default function ManageUserProfilePage({seodata}) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <ManageUserProfile></ManageUserProfile>    
    </>
  )
}

export async function getServerSideProps(context) {
  const { req } = context;

  return AddSeoTags(req, "profiles", "no_crawl");
}

