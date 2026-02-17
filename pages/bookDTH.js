import BookD2h from "@/components/Bookd2h/bookd2h.component";
import { useEffect, useState } from "react";

export default function BookDTH() {
  const [render, setRender] = useState(false);
  useEffect(() => {
    setRender(true);
  }, []);
  return <>{render && <BookD2h />}</>;
}
