import PreferredLanguage from "@/components/lang-and-genre/preferedLang.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function SignInPage({ seodata }) {
  return (
    <>
      <MetaTags seodata={seodata} />
      <PreferredLanguage />
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "languages", "api");
}
