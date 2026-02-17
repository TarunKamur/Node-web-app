import React, { useEffect, useState } from "react";
import styles from "./tvguidefilter.module.scss";
import Filter from "./filter/filter.component";
import { useRouter } from "next/router";
import { Tvguideconstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";

const Tvguidefilter = ({ guidefilter, handleselectedFiltersData }) => {
  const { title, items } = guidefilter;
  const router = useRouter();
  const {
    state: { localLang },
    dispatch,
  } = useStore();
  const getInitialFilters = () => {
    let queryfilter = router.query.filter;
    let filters = [];
    let queryfiltercodes = [];

    if (queryfilter) {
      let queryfilters = queryfilter.split(";");
      let filterCode = guidefilter.code;
      queryfilters.map((filter) => {
        let filterSplit = filter.split(":");
        if (filterSplit[0] === filterCode) {
          queryfiltercodes = filterSplit[1].split(",");
        }
      });
    }

    if (queryfiltercodes.length > 0) {
      items?.map((item) => {
        if (queryfiltercodes.indexOf(item.code) > -1) {
          filters.push({ ...item, isSelected: true });
        } else {
          filters.push({ ...item, isSelected: false });
        }
      });
    } else if (queryfilter) {
      items?.map((item) => {
        filters.push({ ...item, isSelected: false });
      });
    } else {
      items?.map((item) => {
        filters.push({ ...item, isSelected: true });
      });
    }
    return filters;
  };

  const [filters, setFilters] = useState(getInitialFilters());

  const handleClearAll = () => {
    let newfilters = filters.map((filter) => ({
      ...filter,
      isSelected: false,
    }));
    handleselectedFiltersData(newfilters, guidefilter.code);
    setFilters(newfilters);
  };

  const handleFilterSelect = (selectedfilter) => {
    let newfilters = filters.map((filter) => {
      if (selectedfilter.code === filter.code) {
        return { ...filter, isSelected: !filter.isSelected };
      }
      return filter;
    });
    setFilters(newfilters);
    handleselectedFiltersData(newfilters, guidefilter.code);
  };

  useEffect(() => {
    handleselectedFiltersData(filters, guidefilter.code);
  }, []);

  return (
    <div className={`${styles.filters}`}>
      <div className={`${styles.filters_header}`}>
        <p>
          {Tvguideconstant[localLang].select} {title}
        </p>
        <p onClick={handleClearAll} style={{ cursor: "pointer" }}>
          {Tvguideconstant[localLang].clear_all}
        </p>
      </div>
      <div className={`${styles.filters_inner}`}>
        {filters?.map((filter, index) => {
          return (
            <Filter
              filter={filter}
              key={index}
              handleFilterSelect={handleFilterSelect}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Tvguidefilter;
