import VoucherActivate from "@/components/activate-voucher/activate-voucher.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function ActivateVoucherPopup({ seodata }) {
  return (
    <>
      {seodata && <MetaTags seodata={seodata} noindex={true} />}
      <VoucherActivate />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "no_crawl");
}


