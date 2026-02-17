import { setUserDetails } from "@/services/user.service";
import { actions, useStore } from "@/store/store";
import useGetApiMutate from "./useGetApidata";
import { useEffect } from "react";

const useUserDetailsUpdate = () => {
  const { dispatch } = useStore();
  const { mutate: mutateGetUData, data: apiUResponse } = useGetApiMutate();

  useEffect(() => {
    if (apiUResponse) {
      setUserDetails(apiUResponse.data.response);
      dispatch({
        type: actions.userDetails,
        payload: apiUResponse.data.response,
      });
    }
  }, [apiUResponse, dispatch]);

  const updateUser = () => {
    let url = process.env.initJson["api"] + "/service/api/auth/user/info";
    mutateGetUData(url);
  };

  return {
    updateUser,
  };
};

export default useUserDetailsUpdate;
