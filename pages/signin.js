import DishSignIn from "@/components/dish-signin-in/dish-signin-in.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function SignInPage({ seodata }) {
  return (
    <>
      <MetaTags seodata={seodata} />
      <DishSignIn />
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "signin", "api");
}
