import TransactionsList from "@/components/transactions-list/transactions-list.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function Transaction({ seodata }) {
 
  return (
    <>
      {seodata && <MetaTags seodata={seodata} noindex={true} />}
      <TransactionsList />
    </>
  );
}

export async function getServerSideProps({ req, resolvedUrl }) {
  return AddSeoTags(req, resolvedUrl, "no_crawl");
}
