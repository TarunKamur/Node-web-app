import AddNewProfile from "@/components/dish1-profiles/upload-profile-image.component";

import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function CreateUserProfilePage({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <AddNewProfile></AddNewProfile>
    </>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;

  return AddSeoTags(req, "profiles", "no_crawl");
}
