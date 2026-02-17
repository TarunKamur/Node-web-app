import Search from "@/components/search/search.component";
import Search1 from "@/components/searchv1/searchv1.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";
import SearchV3 from "@/components/searchV3/searchv3.component";
import { appConfig } from "@/config/app.config";

export default function SearchP({ seodata }) {
  const searchVersionComponent = {
    v1: Search1,
    v3: SearchV3,
    default: Search,
  };
  const SearchComponent =
    searchVersionComponent[appConfig?.header?.searchVersion] ||
    searchVersionComponent.default;

  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <SearchComponent />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "api");
}
