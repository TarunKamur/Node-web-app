import PageLoader from "@/components/loader/page-loder.component";
import {
  getBoxId,
  getDeviceId,
  getSessionId,
} from "@/services/data-manager.service";
import { getCookie, getItemEnc } from "@/services/local-storage.service";
import { useRouter } from "next/router";
import { useEffect } from "react";
import OrderSummary from "@/components/packages/OrderSummary/OrderSummary.component";

export default function Plans() {
  const router = useRouter();

  return (
    <>
      {/* <PageLoader />; */}
      <OrderSummary />
    </>
  );
}
