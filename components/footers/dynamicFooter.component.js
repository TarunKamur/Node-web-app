import { appConfig } from "@/config/app.config";
import dynamic from "next/dynamic";

const ReeldramaFooter = dynamic(
  () =>
    import("@/components/footers/reeldrama-footer/reeldrama-footer.component")
);
const VestaFooter = dynamic(
  () => import("@/components/footers/vesta-footer/vesta-footer.component")
);
const FooterDefault = dynamic(
  () => import("@/components/footers/footer-default/footer-default.component")
);
const WatchoFooter = dynamic(
  () => import("@/components/footers/watcho-footer/watcho-footer.component")
);

export default function DynamicFooter({ props }) {
  const components = {
    reeldramaFooter: ReeldramaFooter,
    vestaFooter: VestaFooter,
    watchoFooter: WatchoFooter,
    footer: FooterDefault,
    default: FooterDefault, // Default footer component
  };
  const ResolvedComponent =
    components?.[appConfig?.footer?.type] || components?.default; // Fallback for footer
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <ResolvedComponent {...props} />;
}
