import PageLoader from "@/components/loader/page-loder.component";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function OpenLink() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.back();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  return <PageLoader />;
}
