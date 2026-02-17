// import PaymentSuccess from "@/components/packages/payment-success/paymentsuccess.component";
import dynamic from "next/dynamic";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

const PaymentSuccess = dynamic(
  () =>
    import("@/components/packages/payment-success/paymentsuccess.component"),
  { ssr: false }
);

export default function Payments({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <PaymentSuccess />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "default");
}
