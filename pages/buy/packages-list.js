import dynamic from "next/dynamic";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

const Packages = dynamic(
  () => import("@/components/packages/Packages.component"),
  { ssr: false }
);

export default function Payments({ seodata }) {
  return (
    <>
      <MetaTags seodata={seodata} />
      <Packages />
    </>
  );
}

export async function getServerSideProps({ req }) {
  return AddSeoTags(req, "pricing", "api");
}
