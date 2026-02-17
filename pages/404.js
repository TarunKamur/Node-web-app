import PageNotFound from "@/components/page-not-found/page-not-found.component";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";


export default function Custom404({ seodata }) {
    return (<>
    <MetaTags seodata={seodata} noindex={true}></MetaTags>
      <PageNotFound detailsInfo={{message:'Content you are looking for is not found',code: '5000'}}></PageNotFound>
    </>
    );
  }

  export async function getStaticProps({ req, resolvedUrl }) {
    return AddSeoTags(req, resolvedUrl, "no_crawl");
  }
