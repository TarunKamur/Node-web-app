import PreferredGenre from "@/components/lang-and-genre/preferedGenre.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function SignInPage({ seodata }) {
  return (
    <>
      <MetaTags seodata={seodata} />
      <PreferredGenre />
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "genre", "api");
}
