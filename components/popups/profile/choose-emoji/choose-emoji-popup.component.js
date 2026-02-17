import { useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "../choose-emoji/choose-emoji-popup.module.scss";
import { getAbsolutePath } from "@/services/user.service";
import { ChooseEmojiconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
import { useStore } from "@/store/store";

export default function ChooseProfile({ popupData, userProfileInfo }) {
  const [profileList, setProfileList] = useState([]);
  const [currentEmoji, setCurrentEmoji] = useState("");
  const {
    state: { localLang },
  } = useStore();
  useEffect(() => {
    setProfileList(popupData.emojiList);
    let item = popupData?.emojiList?.filter(
      (ele) =>
        ele.imageUrl === popupData.currentSelected.image ||
        ele.imageUrl === popupData.currentSelected.imageUrl
    );
    if (item?.length > 0) setCurrentEmoji(item[0].imageUrl);
  }, [popupData]);

  const handleClose = (e) => {
    e.preventDefault();
    popupData.closeTarget();
  };

  const selected = (item) => {
    setCurrentEmoji(item.imageUrl);
  };

  const handleSelected = (e) => {
    e.preventDefault();
    popupData.emojiSelected(currentEmoji);
  };

  return (
    <Dialog
      open={popupData.isActive ? popupData.isActive : false}
      onClose={(e) => handleClose(e)}
    >
      <div className={styles.sharecontent_modal}>
        <div className={styles.main_modal}>
          <div className={styles.modal_wrapper}>
            <div className={styles.modal_content}>
              <CloseIcon
                className={`${styles.cross_icon}`}
                onClick={handleClose}
              ></CloseIcon>
              <div className={styles.modal_header}>
                <h2 className={styles.modal_title}>
                  {!!userProfileInfo?.name ? userProfileInfo?.name : "New User"}
                </h2>
                <span className={styles.modal_subtitle}>
                  {ChooseEmojiconstant[localLang].Choose_Your_Profile_Picture}
                </span>
              </div>

              <div className={styles.profileIcon_block}>
                <div className={styles.profileIcon_list}>
                  {profileList?.map((emoji, i) => (
                    <div
                      key={i}
                      className={styles.profileIcon}
                      onClick={() => selected(emoji)}
                    >
                      <img
                        className={styles.profileImg}
                        src={getAbsolutePath(emoji.imageUrl)}
                        alt=""
                      ></img>
                      {emoji.imageUrl === currentEmoji && (
                        <img
                          className={styles.profileselect_Img}
                          src={`${ImageConfig?.popup?.selectedEmoji}`}
                          alt="selected"
                        ></img>
                      )}
                      <span className={styles.profileSelected_box}>
                        {emoji.imageUrl === currentEmoji && (
                          <span className={styles.profileSelected}>
                            {" "}
                            {ChooseEmojiconstant[localLang].Selected}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.footer_actions}>
                  <button
                    type="button"
                    className={`grey ${styles.btns}`}
                    onClick={handleClose}
                  >
                    {ChooseEmojiconstant[localLang].Cancel}
                  </button>
                  <button
                    type="button"
                    className={`primary ${styles.btns}`}
                    onClick={handleSelected}
                  >
                    {ChooseEmojiconstant[localLang].Change}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
