import dynamic from "next/dynamic";
import MetaTags from "@/components/meta-tags/meta-data";
import { AddSeoTags } from "@/services/seo.service";

const SettingsPage = dynamic(
  () => import("@/components/settings/settings.component"),
  { ssr: false }
);

const Home = ({ seodata }) => {
  return (
    <div>
      <MetaTags seodata={seodata} noindex={true} />
      <SettingsPage />
    </div>
  );
};

export default Home;

export async function getServerSideProps({ req }) {  
  return AddSeoTags(req, "settings", "no_crawl");
}
