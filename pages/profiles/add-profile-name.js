import CreateYourName from "@/components/profiles/create-your-name/create-your-name.component"

import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

export default function CreateProfile ({seodata}){
  return (
    <>
      {seodata && <MetaTags seodata={seodata} />}
      <CreateYourName/>   
    </>
    
  )
}

export async function getServerSideProps(context) {
  const { req } = context;

  return AddSeoTags(req, "profiles", "no_crawl");
}

