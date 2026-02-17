import HowProfileworks from "@/components/dish1-profiles/how-profiles-works.component";

import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function ManageUserProfilePage({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <HowProfileworks></HowProfileworks>
    </>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;

  return AddSeoTags(req, "profiles", "no_crawl");
}
