import PaymentFailure from "@/components/payment-failure/paymentfailure.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function Payments( { seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <PaymentFailure />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "default");
}
