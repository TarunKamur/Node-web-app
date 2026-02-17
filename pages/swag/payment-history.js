import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";
import PaymentHistory from "@/components/payment-history/pay-history.component";

export default function Paymenthistory({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} noindex={true} />}
      <PaymentHistory />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "no_crawl");
}
