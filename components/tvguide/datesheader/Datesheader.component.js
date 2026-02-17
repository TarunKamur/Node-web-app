import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import styles from "./Datesheader.module.scss";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { getTimeMenuList } from "@/services/utility.service";

const DateTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    backgroundColor: "#c30",
  },
});

const DateTab = styled(Tab)({
  color: "hsla(0,0%,100%,.8)",
  "&:hover": {
    backgroundColor: "#363636",
    color: "hsla(0,0%,100%,1)",
  },
  "&.Mui-selected": {
    color: "#c30",
    backgroundColor: "#141414",
  },
});

function TvGuideDatesHeader(props) {
  const { tabs, handleSlectedTab } = props;
  const [activeTab, setActiveTab] = useState(getActiveTab());
  // let time_List =['1:00pm','2:00pm' ,'3:00pm', '3:00pm', '3:00pm', '3:00pm', '3:00pm', '3:00pm', '3:00pm', '3:00pm', '3:00pm', ];
  let time_List = getTimeMenuList();
  function getActiveTab() {
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].title === "Today") {
        return i;
      }
    }
    return 0;
  }

  return (
    <div className={`${styles.tabs_container}`}>
      {tabs.length > 0 && (
        <>
        <DateTabs
          value={activeTab}
          onChange={(eve, value) => {
            setActiveTab(value);
          }}
          variant="scrollable"
          scrollButtons="auto"
          // aria-label="scrollable auto tabs example"
        >
          {tabs.map((tab, index) => {
            return (
              <DateTab
                label={
                  tab.title === "Today"
                    ? tab.title
                    : `${tab.title},${tab.subtitle}`
                }
                key={index}
                onClick={() => {
                  handleSlectedTab(tab);
                }}
              />
            );
          })}
        </DateTabs>
          <div className={`${styles.times_bar}`}>
            <div className={`${styles.live_tag}`}>
              <span>Live</span>
            </div>
              {/* TV Guide time bar starts here */}
              <div className={`${styles.times_container}`}>
                <div className={`${styles.times}`}>
                  <div className={`${styles.times_inner}`}>
                    {time_List.map((time, index) => (
                      <div key={index} className={`${styles.time}`}>
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`${styles.time_controls}`}>
                  <span className={`${styles.prev}`}> 
                  </span>
                  <span className={`${styles.next}`}>
                  </span>
                </div>
              </div>
              {/* TV Guide time bar ends here */}
          </div>
        </>
      )}
    </div>
  );
}

export default TvGuideDatesHeader;
