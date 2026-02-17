import Search from "@/components/search/search.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function SearchPage({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <Search> </Search>
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "api");
}
