// import UpdateUserProfile from "@/components/profiles/update-user-profile.component";
import Dish1userupdateProfile from "@/components/dish1-profiles/dish1-manage-profile.component";

import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function UpdateUserProfilePage({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <Dish1userupdateProfile />
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "profiles", "no_crawl");
}
