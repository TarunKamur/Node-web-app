// import UpdateUserProfile from "@/components/profiles/update-user-profile.component";
import UploadProfileimage from "@/components/dish1-profiles/upload-profile-image.component";

import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function UpdateUserProfilePage({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <UploadProfileimage />
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "profiles", "no_crawl");
}
