import Shorts from "@/components/shorts/shorts.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function ShortsVideos({ seodata }) {
  return (
    <>
      <MetaTags seodata={seodata} />
      <Shorts />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "api");
}
