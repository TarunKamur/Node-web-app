// import SignUp from "@/components/signup/signup.component"
import dynamic from "next/dynamic";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

const SignUp = dynamic(() => import("@/components/signup/signup.component"), {
  ssr: false,
});

export default function SignUpPage({ seodata }) {
  return (
    <>
      <MetaTags seodata={seodata} />
      <SignUp />
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "signup", "api");
}
