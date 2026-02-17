import { actions, useStore } from "@/store/store";
import useGetApiMutate from "./useGetApidata";
import { useEffect } from "react";
import { setItem } from "@/services/local-storage.service";

const useUserPackagesUpdate = () => {
  const { dispatch } = useStore();
  const { mutate: mutateGetUData, data: apiUResponse } = useGetApiMutate();

  useEffect(() => {
    if (apiUResponse) {
      setItem("activePackagesList", {
        expiry: new Date().getTime() + 2 * 60 * 60 * 1000,
        data: apiUResponse?.data?.response,
      });
      dispatch({
        type: actions.ActivePackages,
        payload: apiUResponse.data.response,
      });
    }
  }, [apiUResponse, dispatch]);

  const updateActivePacakges = () => {
    let url =
      process.env.initJson["api"] + "/service/api/auth/user/activepackages";
    mutateGetUData(url);
  };

  return {
    updateActivePacakges,
  };
};

export default useUserPackagesUpdate;
