import React, { useEffect, useState } from "react";
import styles from "./skeleton.module.scss";

const Skeleton = ({ pagePath, custom, type }) => {
  const [checkPageType, setPageType] = useState("content");
  const contentPagePath = ["home", "live-tv"];
  const listPagePath = ["movies", "section"];
  const detailsPagePath = ["movie", "tvshow"];
  const playerPagePath = ["vod/play", "tvshow/play", "play", "movie/play"];
  const tvGuidePagePath = ["tv-guide", "tvguide"];
  const cardS = [0, 1, 2, 3, 4, 5];
  const videoPlayerCards = [0, 1, 2, 3, 4, 5];
  const sectionRows = [1];
  const sectionLis = [0, 1, 2, 3, 4, 5, 6];
  const tvCard = [0, 1, 2, 3, 4];

  useEffect(() => {
    if (pagePath) {
      if (pagePath === "") {
        setPageType("content");
      } else if (contentPagePath.some((path) => pagePath.includes(path))) {
        setPageType("content");
      } else if (listPagePath.some((path) => pagePath.includes(path))) {
        setPageType("list");
      } else if (playerPagePath.some((path) => pagePath.includes(path))) {
        setPageType("player");
      } else if (detailsPagePath.some((path) => pagePath.includes(path))) {
        setPageType("details");
      } else if (tvGuidePagePath.some((path) => pagePath.includes(path))) {
        setPageType("tvguide");
      } else {
        setPageType("content");
      }
    }
  }, [pagePath]);

  const Banners = () => {
    return (
      <div>
        <div className={styles.banners_main}>
          <div className={`${styles.section} ${styles.banners}`}>
            <div className={styles.card}>
              <div className={styles.card_inner}>
                <div className={styles.banner_Details}>
                  <h1></h1>
                  <h6></h6>
                  <p></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Sections = () => {
    return (
      <div>
        <div className={styles.section_main}>
          {sectionRows.map((row, i) => (
            <div className={styles.section} key={i}>
              <h1></h1>
              {cardS.map((card, j) => (
                <div className={styles.card} key={j}>
                  <div className={styles.card_inner}></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Tvshow = () => {
    return (
      <div>
        <div className={styles.tvshow_details}>
          <div className={`${styles.section} ${styles.banners}`}>
            <div className={styles.card}>
              <div className={styles.card_inner}>
                <div className={styles.banner_Details}>
                  <h1></h1>
                  <h6></h6>
                  <p></p>
                  <h1></h1>
                  <div className={styles.buttons}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const List = () => {
    return (
      <div>
        <div className={styles.section_main}>
          {sectionRows.map((row, i) => (
            <div className={styles.section} key={i}>
              {cardS.map((card, j) => (
                <div className={styles.card} key={j}>
                  <div className={styles.card_inner}></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PlayerLeft = () => {
    return (
      <div>
        <div className={styles.player_left}>
          <div className={styles.player}></div>
          <div className={styles.player_info}>
            <div className={styles.player_thumb}></div>
            <div className={styles.player_right_info}>
              <h1></h1>
              <h6></h6>
              <p></p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PlayerRight = () => {
    return (
      <div>
        <div className={styles.player_right}>
          <div className={styles.suggestions}>
            <div className={styles.section}>
              <div className={styles.card_data}>
                <div className={styles.tabs}>
                  <span className={styles.tab}></span>
                  <span className={styles.tab}></span>
                  <span className={styles.tab}></span>
                </div>
                {videoPlayerCards.map((card, index) => (
                  <div className={styles.card} key={index}>
                    <div className={styles.card_inner}></div>
                    <div className={styles.card_info}>
                      <h1></h1>
                      <h6></h6>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TvGuide = () => {
    return (
      <div style={{ width: "100%" }}>
        <div className={styles.skeleton_tvguide}>
          {sectionLis.map((d, i) => (
            <div className={styles.tvguide} key={i}>
              <div className={styles.channel_img}></div>
              <div className={styles.channels}>
                {tvCard.map((data, j) => (
                  <div className={styles.channel_names} key={j}></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

const LanguageSkeleton = () => {
  const totalCards = 16;

  return (
    <div className={styles.language_skeleton}>
      {Array.from({ length: totalCards }).map((_, index) => (
        <div key={index} className={styles.language_item}>
          <div className={styles.language_item_details}>
            <div className={`${styles.language_item_text} ${styles.shimmer}`}></div>
            <div className={`${styles.language_item_subtext} ${styles.shimmer}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};


const GenreSkeleton = () => {
  const totalCards = 8;

  return (
    <div className={styles.genre_skeleton}>
      {Array.from({ length: totalCards }).map((_, index) => (
        <div key={index} className={styles.genre_item}>
          <div className={styles.genre_item_details}>
            <div className={`${styles.genre_item_text} ${styles.shimmer}`}></div>
            <div className={`${styles.genre_item_subtext} ${styles.shimmer}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ContentRatingSkeleton = () => {
  return (
    <div className={styles.rating_skeleton}>
      {[...Array(5)].map((_, index) => (
        <div key={index} className={styles.rating_item}>
          <div className={styles.checkbox_skeleton}></div>
          <div className={styles.text_container}>
            <div className={styles.skeleton_head}></div>
            <div className={styles.skeleton_desc}></div>
          </div>
        </div>
      ))}
    </div>
  );
};


  if (custom === true) {
    return (
      <>
        {type.map((ele, i) => {
          if (ele === "section") {
            return (
              <div key={i} className={styles.list}>
                <Sections />
              </div>
            );
          } else if (ele === "list") {
            return (
              <div key={ele}>
                <List />
              </div>
            );
          } else if (ele === "language") {
            return <LanguageSkeleton key={i} />;
          } else if (ele === "genre") {
            return <GenreSkeleton key={i} />;
          } else if (ele === "contentRating") {
            return <ContentRatingSkeleton key={i} />;
          }
          return null;
        })}
      </>
    );
  }

  return (
    <div>
      {checkPageType === "content" && (
        <>
          <Banners />
          <Sections />
        </>
      )}
      {checkPageType === "list" && (
        <div className={styles.list}>
          <Sections />
          <Sections />
        </div>
      )}
      {checkPageType === "details" && (
        <>
          <Tvshow />
          <Sections />
        </>
      )}
      {checkPageType === "player" && (
        <div className={styles.skeleton_player}>
          <PlayerLeft />
          <PlayerRight />
        </div>
      )}
      {checkPageType === "tvguide" && (
        <div>
          <TvGuide />
        </div>
      )}
    </div>
  );
};

export default Skeleton;