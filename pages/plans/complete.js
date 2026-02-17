import PageLoader from "@/components/loader/page-loder.component";
import useUserDetailsUpdate from "@/hooks/useUserDetailsUpdate";
import useUserPackagesUpdate from "@/hooks/useUserPackagesUpdate";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";

export default function Complete() {
  const router = useRouter();
  const { query } = router;
  const { updateUser } = useUserDetailsUpdate();
  const { updateActivePacakges } = useUserPackagesUpdate();
  const [isCalled, setIscalled] = useState(false);
  const {
    state: { userDetails },
  } = useStore();

  useEffect(() => {
    console.log(userDetails);
    if (query.st != undefined) {
      if (isCalled == false) {
        setIscalled(true);
      } else {
        return;
      }

      if (
        !!userDetails &&
        (!!!userDetails.gender || !!!userDetails.name || !!!userDetails.age)
      ) {
        setTimeout(() => {
          window.location.href =
            window.location.origin + "/settings/edit-profile";
        }, 1000);
      } else {
        if (query.st == "1") {
          updateUser();
          updateActivePacakges();
          setTimeout(() => {
            if (
              query.redirectlink == "home" ||
              query.redirectlink == undefined ||
              query.redirectlink == ""
            ) {
              window.location.href = window.location.origin + "/home";
            } else {
              window.location.href =
                window.location.origin + "/" + query.redirectlink;
            }
          }, 1000);
        } else {
          setTimeout(() => {
            if (
              query.redirectlink == "home" ||
              query.redirectlink == undefined ||
              query.redirectlink == ""
            ) {
              window.location.href = window.location.origin + "/home";
            } else {
              window.location.href =
                window.location.origin + "/" + query.redirectlink;
            }
          }, 1000);
        }
      }
    }
  }, [userDetails, query.st]);

  return <PageLoader />;
}
