import SelectUserProfile from "@/components/profiles/select-user-profile.component";

import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function SelectUserProfilePage({ redirectionPath,seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <SelectUserProfile redirectionPath={redirectionPath} />
    </>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;

  return AddSeoTags(req, "profiles", "no_crawl");
}
