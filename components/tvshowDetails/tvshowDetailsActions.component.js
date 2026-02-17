import React, { Fragment } from "react";
import { ImageConfig } from "@/config/ImageConfig";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { TvshowDetailsconstant } from "@/.i18n/locale";
import { useStore } from "@/store/store";
import styles from "./tvshowDetails.module.scss";

function TvShowDetailsPageActions({
  detailsObj,
  addToFavourite,
  navigateTo,
  navigateToSignIn,
  shareDataSet,
}) {
  const {
    state: { PageData, localLang },
  } = useStore();

  const buttons =
    detailsObj?.buttons?.elements?.length > 0
      ? detailsObj?.buttons?.elements
      : [];

  return (
    <>
      <Fragment key="mobileActions">
        <div className={`${styles.resume_now_mobile}`}>
          {buttons?.elements?.map(
            (button) =>
              button.elementSubtype == "resume" && (
                <button
                  type="button"
                  className={`btn ${styles.buttons} ${styles.resume_now}  ${styles.seekBarResume} primary br2`}
                  onClick={(e) => navigateTo(button, e)}
                >
                  <img
                    src={`${ImageConfig?.tvShowDetails?.playCirclebtn}`}
                    alt="resume"
                  />
                  {button.data}
                  <span className={`${styles.seek_bar} `}>
                    <span
                      className={`${styles.seek_position} `}
                      style={{ width: `${button.seekedValue}%` }}
                    />
                  </span>
                </button>
              )
          )}
        </div>
        <div className={`${styles.actions} ${styles.mobile} `}>
          {/* Buttons start */}
          {buttons?.map((button) => (
            <React.Fragment key={button?.id}>
              {(button.elementSubtype == "trailer" ||
                (button.elementSubtype == "signin" &&
                  button.data.toLowerCase() == "trailer")) && (
                <button
                  type="button"
                  className={` ${styles.buttons} ${styles.trailer}  br2`}
                  onClick={(e) => navigateTo(button, e)}
                >
                  <img
                    className={`${styles.trailer_image}`}
                    src={`${ImageConfig?.tvShowDetails?.trailerIcon}`}
                    alt="trailer"
                  />
                  {button.data}
                </button>
              )}
              {button.elementSubtype == "signin" &&
                button.data.toLowerCase() != "trailer" && (
                  <button
                    type="button"
                    onClick={navigateToSignIn}
                    className={` ${styles.buttons} ${styles.signin} primary br2`}
                  >
                    {button.data}
                  </button>
                )}
              {button.elementSubtype == "signup" && (
                <Link href="/signup">
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.signup} primary br2`}
                  >
                    {button.data}
                  </button>
                </Link>
              )}
              {button.elementSubtype == "watchnow" && (
                <div className={styles.RentalDiv}>
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.watchnow} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data}
                  </button>
                  {/* {button.expiryInfoData && (
                    <p className={`${styles.rent_info}`}>
                      <img
                        src={`${appConfig.staticImagesPath}pack-info-icon.svg`}
                        alt="Rentel Info"
                      />
                      {button.expiryInfoData?.data}
                    </p>
                  )} */}
                </div>
              )}
              {button.elementSubtype == "startover" && (
                <button
                  type="button"
                  className={`${styles.buttons} ${styles.startover} primary br2`}
                  onClick={(e) => navigateTo(button, e)}
                >
                  {button.data}
                </button>
              )}
              {button.elementSubtype == "resume" && (
                <button
                  type="button"
                  className={`btn ${styles.buttons} ${styles.resume} ${styles.seekBarResume} primary br2`}
                  onClick={(e) => navigateTo(button, e)}
                >
                  <img
                    src={`${ImageConfig?.tvShowDetails?.playCirclebtn}`}
                    alt="resume"
                  />
                  {button.data}
                  <span className={`${styles.seek_bar} `}>
                    <span
                      className={`${styles.seek_position} `}
                      style={{ width: `${button.seekedValue}%` }}
                    />
                  </span>
                </button>
              )}
              {button.elementSubtype == "watch_latest_episode" && (
                <Link href="/">
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.watch_latest_episode} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data}
                  </button>
                </Link>
              )}
              {button.elementSubtype == "rent" && (
                // <Link   href='/'>
                <button
                  type="button"
                  className={`btn ${styles.buttons} ${styles.rent} primary br2`}
                  onClick={(e) => navigateTo(button, e)}
                >
                  {button.data}
                  {button.rentalInfoData && (
                    <p className={`${styles.rent_info}`}>
                      <img
                        src={`${appConfig.staticImagesPath}pack-info-icon.svg`}
                        alt="Rentel Info"
                      />
                      {button.rentalInfoData?.data}
                    </p>
                  )}
                </button>
                // </Link>
              )}
              {button.elementSubtype == "subscribe" && (
                <Link href="/">
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.subscribe} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data}
                  </button>
                </Link>
              )}
            </React.Fragment>
          ))}
          {/* Buttons end */}
        </div>

        <div className={`${styles.mobile_share_controls}`}>
          {detailsObj?.showFavouriteButton && (
            <button
              key="fav-button"
              type="button"
              className={`mobile_button ${styles.buttons} ${styles.fav} br2`}
              onClick={addToFavourite}
            >
              {detailsObj?.isFavourite ? (
                <>
                  <img
                    alt="fav"
                    className={styles.active_fav_icon}
                    src={ImageConfig?.tvShowDetails?.favoriteActive}
                  />
                  <span className={`btn_text ${styles.fav_text}`}>
                    {/* {TvshowDetailsconstant?.[localLang]?.Mobile.Favourited} */}
                    {TvshowDetailsconstant[localLang]?.Remove_Watch_List}
                  </span>
                </>
              ) : (
                <>
                  <img
                    alt="fav"
                    className={styles.fav_icon}
                    src={ImageConfig?.tvShowDetails?.favorite}
                  />
                  <span className={`btn_text ${styles.fav_text}`}>
                    {/* {TvshowDetailsconstant?.[localLang]?.Mobile?.Favourite} */}
                    {TvshowDetailsconstant[localLang]?.Watch_List}
                  </span>
                </>
              )}
            </button>
          )}
          {PageData.shareInfo.isSharingAllowed && (
            <>
              <span className={styles.line} />
              <button
                type="button"
                className={`mobile_button ${styles.buttons} ${styles.share} br2`}
                onClick={shareDataSet}
              >
                <img src={`${ImageConfig?.tvShowDetails?.share}`} alt="share" />
                <span
                  className={`btn_text ${styles.fav_text} ${styles.fancy_tool_tip}`}
                >
                  {TvshowDetailsconstant?.[localLang]?.Share}
                </span>
              </button>
            </>
          )}
        </div>
      </Fragment>

      <Fragment key="desktopActions">
        <div
          className={`${styles.actions} 
          ${PageData?.info?.attributes?.networkCode == "freedomtv" && styles.freedommobile}
           ${buttons.length == 1 && styles.btnLenEq1} 
          `}
        >
          {/* Buttons start */}
          {buttons?.map((button) => (
            <React.Fragment key={button?.id}>
              {(button.elementSubtype == "trailer" ||
                (button.elementSubtype == "signin" &&
                  button.data.toLowerCase() == "trailer")) && (
                <button
                  type="button"
                  className={` ${styles.buttons} ${styles.trailer} ${button.elementSubtype}  br2`}
                  onClick={(e) => navigateTo(button, e)}
                >
                  {/* <img
                    className={`${styles.trailer_image}`}
                    src={`${ImageConfig?.tvShowDetails?.trailerIcon}`}
                    alt="trailer"
                  /> */}
                  {button.data}
                </button>
              )}
              {button.elementSubtype == "signin" &&
                button.data.toLowerCase() != "trailer" && (
                  <button
                    type="button"
                    onClick={navigateToSignIn}
                    className={` ${styles.buttons} ${styles.signin} primary br2`}
                  >
                    {button.data}
                  </button>
                )}
              {button.elementSubtype == "signup" && (
                <Link href="/signup">
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.signup} primary br2`}
                  >
                    {button.data}
                  </button>
                </Link>
              )}
              {button.elementSubtype == "watchnow" && (
                <div className={styles.RentalDiv}>
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.watchnow} ${button.elementSubtype} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data}
                  </button>
                  {button.expiryInfoData && (
                    <p
                      className={`${styles.rent_info} ${styles.expiryInfoData}`}
                    >
                      <img
                        src={`${appConfig.staticImagesPath}pack-info-icon.svg`}
                        alt="Rentel Info"
                      />
                      {button.expiryInfoData?.data}
                    </p>
                  )}
                </div>
              )}
              {button.elementSubtype == "startover" && (
                <button
                  type="button"
                  className={`${styles.buttons} ${styles.startover} br2`}
                  onClick={(e) => navigateTo(button, e)}
                >
                  {button.data}
                </button>
              )}
              {button.elementSubtype == "resume" && (
                <div>
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.resume} ${styles.seekBarResume} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    <img
                      src={`${ImageConfig?.tvShowDetails?.playCirclebtn}`}
                      alt="resume"
                    />
                    {button.data}
                    <span className={`${styles.seek_bar} `}>
                      <span
                        className={`${styles.seek_position} `}
                        style={{ width: `${button.seekedValue}%` }}
                      />
                    </span>
                  </button>
                  {detailsObj?.expiryInfo &&
                    detailsObj?.expiryInfo?.length > 0 && (
                      <span
                        style={{ color: "#adadad" }}
                        className={styles.expiryInfodesktop}
                      >
                        {detailsObj?.expiryInfo[0]}
                      </span>
                    )}
                </div>
              )}
              {button.elementSubtype == "watch_latest_episode" && (
                <div>
                  <Link href="/">
                    <button
                      type="button"
                      className={`btn ${styles.buttons} ${styles.watch_latest_episode} primary br2`}
                      onClick={(e) => navigateTo(button, e)}
                    >
                      {button.data}
                    </button>
                  </Link>
                  {detailsObj?.expiryInfo &&
                    detailsObj?.expiryInfo?.length > 0 && (
                      <span
                        style={{ color: "#adadad" }}
                        className={styles.expiryInfodesktop}
                      >
                        {detailsObj?.expiryInfo[0]}
                      </span>
                    )}
                </div>
              )}
              {button.elementSubtype == "rent" && (
                // <Link   href='/'>
                <div className={styles.RentalDiv}>
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.rent} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data}
                  </button>
                  {button.rentalInfoData && (
                    <p className={`${styles.rent_info}`}>
                      <img
                        src={`${appConfig.staticImagesPath}pack-info-icon.svg`}
                        alt="Rentel Info"
                      />
                      {button.rentalInfoData?.data}
                    </p>
                  )}
                  {/* // </Link> */}
                </div>
              )}
             {button.elementSubtype === "subscribe" && (
                <Link href="/">
                  <button
                    type="button"
                    className={`btn ${styles.buttons} ${styles.subscribe} primary br2`}
                    onClick={(e) => navigateTo(button, e)}
                  >
                    {button.data.includes("₹") ? (
                      <>
                        {button.data.split("₹")[0]}
                        <span>{`₹${button.data.split("₹")[1]}`}</span>
                      </>
                    ) : button.data.includes("$") ? (
                      <>
                        {button.data.split("$")[0]}
                        <span>{`$${button.data.split("$")[1]}`}</span>
                      </>
                    ) : (
                      (() => {
                        const parts = button.data.split(/[^a-zA-Z0-9 ]+/);
                        const symbolMatch = button.data.match(/[^a-zA-Z0-9 ]+/);
                        return (
                          <>
                            {parts[0]}
                            {parts[1] && (<span>{`${symbolMatch ? symbolMatch[0] : ""}${parts[1] || ""}`}</span>)}
                          </>
                        );
                      })()
                    )}
                  </button>
                </Link>
              )}
            </React.Fragment>
          ))}
          {/* Buttons end */}

          {/* Fav button start */}
          {detailsObj?.showFavouriteButton &&
            appConfig?.detailsPage?.favType == 1 && (
              <button
                type="button"
                key="fav-button"
                className={` ${styles.buttons} ${styles.fav1} br2`}
                onClick={addToFavourite}
              >
                {detailsObj.isFavourite ? (
                  <>
                    <img
                      className={styles.active_fav_icon}
                      src={ImageConfig?.tvShowDetails?.favoriteActive}
                      alt="favourite"
                    />
                    {/* <span className={`${styles.fav_text}`}>
                  {TvshowDetailsconstant[localLang].Favourited}
                </span> */}
                    <span className={`${styles.fancy_tool_tip}`}>
                      Remove from watchlist
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      className={`${styles.fav_icon}`}
                      src={`${ImageConfig?.tvShowDetails?.favorite}`}
                      alt="favourite"
                    />
                    {/* <span className={`${styles.fav_text}`}>
                  {TvshowDetailsconstant[localLang].Favourite}
                </span> */}
                    <span className={`${styles.fancy_tool_tip}`}>
                      Add to watchlist
                    </span>{" "}
                  </>
                )}
              </button>
            )}

          {detailsObj.showFavouriteButton &&
            appConfig?.detailsPage?.favType == 2 && (
              <button
                type="button"
                key="fav-button"
                className={` ${styles.buttons} ${styles.fav2} br2`}
                onClick={addToFavourite}
              >
                {detailsObj.isFavourite ? (
                  <>
                    <img
                      className={styles.active_fav_icon}
                      src={ImageConfig?.playerDescription?.watchedTick}
                      alt="favourite"
                    />
                    <span className={styles.fav_text}>
                      {TvshowDetailsconstant?.[localLang].Favourited}
                      {/* {TvshowDetailsconstant?.[localLang].Remove_Watch_List } */}
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      className={styles.fav_icon}
                      src={ImageConfig?.playerDescription?.plusGray}
                      alt="watchlist"
                    />
                    <span className={styles.fav_text}>
                      {TvshowDetailsconstant?.[localLang]?.Favourite}
                      {/* {TvshowDetailsconstant?.[localLang].Watch_List} */}
                    </span>
                  </>
                )}
              </button>
            )}
          {/* Fav button end */}

          {PageData.shareInfo.isSharingAllowed && (
            <button
              type="button"
              className={`${styles.buttons} ${styles.share} br2`}
              onClick={(e) => navigateTo({ elementSubtype: "Share" }, e)}
            >
              <img src={`${ImageConfig?.tvShowDetails?.share}`} alt="share" />
              <span className={styles.fancy_tool_tip}>
                {TvshowDetailsconstant?.[localLang]?.Share}
              </span>
            </button>
          )}

          {detailsObj?.expiryInfo && (
            <p className={styles.expiry_info}>
              {detailsObj.expiryInfo[0]}
              <span className={`${styles.time_stamp}`}>
                {detailsObj.expiryInfo[1]}
              </span>
            </p>
          )}
        </div>
        {detailsObj?.expiryInfo && detailsObj?.expiryInfo?.length > 0 && (
          <span
            style={{ color: "#adadad" }}
            className={styles.expiryInfomobile}
          >
            {detailsObj?.expiryInfo[0]}
          </span>
        )}
      </Fragment>
    </>
  );
}

export default TvShowDetailsPageActions;
