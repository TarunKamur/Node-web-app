import dynamic from "next/dynamic";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

const EditProfile = dynamic(
  () => import("@/components/settings/edit-profile.component"),
  { ssr: false }
);

const EditProfiles = ({ seodata }) => {
  return (
    <div>
      {seodata && <MetaTags seodata={seodata} />}
      <EditProfile />
    </div>
  );
};

export default EditProfiles;

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "no_crawl");
}
