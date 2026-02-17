import ActivityList from "@/components/activity-list/activityList.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function SignInPage({ seodata }) {
  return (
    <>
      <MetaTags seodata={seodata} />
      <ActivityList />
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "signin", "api");
}
