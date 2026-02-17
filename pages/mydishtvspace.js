import Mydishtvspace from "@/components/myDishtv/myDishtv.component";
import { useEffect, useState } from "react";
import { getItem } from "@/services/local-storage.service";
import { useRouter } from "next/router";

export default function mydishtvspace() {
  const [render, setRender] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let isLogginIn = getItem("isloggedin");
    if (!isLogginIn) {
      router.push("/signin");
    } else {
      setRender(true);
    }
  }, []);
  return <>{render && <Mydishtvspace />}</>;
}
