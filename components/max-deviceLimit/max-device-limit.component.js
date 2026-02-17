import Link from "next/link";
import styles from "@/components/max-deviceLimit/max-device-limit.module.scss";


const MaxDeviceLimit = ({}) => {
const devices = [
  { name: "TV - TCL 203i842", lastActive: "Now" },
  { name: "iPhone", lastActive: "07 Jan 2025" },
  { name: "Samsung Android", lastActive: "07 Jan 2025" },
];

  return (
    <>
    <div className={`${styles.MaxDeviceLimit}`}>
         <div className={`${styles.MaxDeviceLimit_inner}`}>
            <div className={` ${styles.header} `}>
                <Link href="/" aria-label="app logo">
                  <img
                    className={` ${styles.logo_with_tag} `}
                    src="https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg"
                    alt="Watcho"
                  />
                </Link>
            </div>
            <div className={`${styles.MaxDevice_data}`}>
                <div className={`${styles.MaxDevice_Text}`}>
                  <h2 className={`${styles.headerText}`}>Oops! You’ve reached your login limit</h2>
                  <p className={`${styles.subText}`}>Your Current Plan supports 3 devices only </p>
                  <p className={`${styles.subText2}`}>Logout 1 Device to Continue</p>
               </div> 
               <div className={`${styles.deviceLisit}`}>
                     <div className={`${styles.deviceLisit}`}>
                        {devices.map((device, index) => (
                            <div className={styles.list_item} key={index}>
                            <div className={styles.item_left}></div>
                            <div className={styles.item_middle}>
                                <p className={styles.deviceName}>{device.name}</p>
                                <span className={styles.lastActive}>Last Active : {device.lastActive}</span>
                            </div>
                            <div className={styles.item_right}>
                                <button>Logout</button>
                            </div>
                            </div>
                        ))}
                        </div>
               </div>
            </div> 
         </div>
    </div>
    </>
  );
};

export default MaxDeviceLimit;
