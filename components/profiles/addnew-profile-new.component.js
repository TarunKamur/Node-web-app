import styles from "@/components/profiles/profiles-list.module.scss";
import { ImageConfig } from "@/config/ImageConfig";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

function AddNewProfile() {
  const [profileName, setProfileName] = useState("Neha");
 const [selected, setSelected] = useState("Just Me");
  const avatars = [
  "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg", 
  "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg",
  "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg",
  "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg",
  "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg",
  "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg",
  "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/profile-pic1.svg"
];

const audienceOptions = [
  { label: "Just Me", icon: "👤" },
  { label: "A Kid", icon: "🧒" },
  { label: "Couple", icon: "👫" },
  { label: "Senior", icon: "👵" },
];

 const centerIndex = Math.floor(avatars.length / 2);

 

  return (
    <>
     
      <div className={`${styles.addNew_profile}`}>
         <div className={`${styles.header}`}>
            <img
            alt="back"
            className={` ${styles.back}`}
            src={`${ImageConfig.changePassword.arrowBack}`}
          />
           <h2>Add new profile</h2>
         </div>
        <div className={`${styles.add_profiles}`}>
          <div className={`${styles.add_profiles_inner}`}>
             <div className={`${styles.profile_img_container}`}>
               <p>Choose a Profile Image</p>
                <div className={`${styles.AvatarRow}`}>
                     {avatars.map((url, index) => (
                      <div
                        key={index}
                        className={`${styles.avatar} ${index === centerIndex ? `${styles.center_avatar}` : ""}`}
                      >
                        <img src={url} alt={`avatar-${index}`} />
                      </div>
                    ))}
                </div>
                <div className={`${styles.input_box}`}>
                    <label  class={`${styles.profileName}`}>Give this profile a name</label>
                    <input type="text" id="profileName"
                    placeholder="profile Name"
                     value={profileName}
                     onChange={(e) => setProfileName(e.target.value)}
                      
                    />
                </div>
             </div>
              <div className={`${styles.addNew_profile_bottom}`}>
                 <p> Who will be watching on this profile</p>
                 <div className={`${styles.audience_options}`}>
                    {audienceOptions.map((option) => (
                      <label
                        key={option.label}
                        className={`${styles.audience_card} ${
                          selected === option.label ?  `${styles.active}`: ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="audience"
                          value={option.label}
                          checked={selected === option.label}
                          onChange={() => setSelected(option.label)}
                        />
                        <div className={`${styles.indicator}`}></div>
                        <span className={`${styles.icon}`}>{option.icon}</span>
                        <span className={`${styles.text}`}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                   <div className={`${styles.actions}`}>
                     <button className={`${styles.btn} primary`} type="text">Create  profile</button>
                     <p>How profile works ?</p>
                   </div>
                </div>

          </div>
          
        </div>


      </div>
     
    </>
  );
}

export default AddNewProfile;
