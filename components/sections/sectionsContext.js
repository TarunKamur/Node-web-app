import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const initialValues = {
  favInfo: {
    added: {}, // using objects for easier delete and insert
    removed: {},
  },
  onFavStatusChange: () => {},
};
export const SectionsContext = createContext(initialValues);

export default function SectionsContextProvider({ children }) {
  const [favInfo, setFavInfo] = useState(initialValues.favInfo);
  const router = useRouter();

  const onFavStatusChange = useCallback(
    (targetPath, action) => {
      if (action === "add") {
        const favInfoCopy = JSON.parse(JSON.stringify(favInfo));
        if (!favInfoCopy.added.hasOwnProperty(targetPath)) {
          // Adding only if path doesn't exist in object already
          favInfoCopy.added[targetPath] = true;
        }

        // Also delete if key is present in removed objects.
        if (favInfoCopy.removed.hasOwnProperty(targetPath)) {
          delete favInfoCopy.removed[targetPath];
        }
        setFavInfo(favInfoCopy);
      } else {
        const favInfoCopy = JSON.parse(JSON.stringify(favInfo));
        if (!favInfoCopy.removed.hasOwnProperty(targetPath)) {
          // Adding only if path doesn't exist in object already
          favInfoCopy.removed[targetPath] = true;
        }

        // Also delete if key is present in added objects.
        if (favInfoCopy.added.hasOwnProperty(targetPath)) {
          delete favInfoCopy.added[targetPath];
        }
        setFavInfo(favInfoCopy);
      }
    },
    [favInfo]
  );

  const resetState = () => {
    if (
      Object.keys(favInfo.added)?.length ||
      Object.keys(favInfo.removed)?.length
    ) {
      setFavInfo({ added: {}, removed: {} });
    }
  };

  useEffect(() => {
    // Reset context on page change and has data in state
    resetState();
  }, [router.asPath]);

  const values = useMemo(
    () => ({ favInfo, onFavStatusChange }),
    [favInfo, onFavStatusChange]
  );
  return (
    <SectionsContext.Provider value={values}>
      {children}
    </SectionsContext.Provider>
  );
}
