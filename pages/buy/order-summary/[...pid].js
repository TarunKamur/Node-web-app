import CheckOut from "@/components/packages/checkout/checkout.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function OrderSummary({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <CheckOut />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "default");
}
