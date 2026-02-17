import React, { useState } from "react";
import styles from "@/components/social-login/socialLogin.module.scss";
import { useStore } from "@/store/store";
import Script from "next/script";
import { SocialLoginconstant } from "@/.i18n/locale";
import { ImageConfig } from "@/config/ImageConfig";
const SocialLogin = ({ socialLoginCallBck }) => {
  const {
    state: { SystemFeature, localLang },
  } = useStore();
  const isFacebookEnabled =
    SystemFeature?.sociallogin?.fields?.facebook === "true";
  const isGoogleEnabled = SystemFeature?.sociallogin?.fields?.google === "true";
  const isLinkedinEnabled =
    SystemFeature?.sociallogin?.fields?.linkedin === "true";
  const isAppleEnabled = SystemFeature?.sociallogin?.fields?.apple === "true";

  const googlePlusLogin = async () => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: process.env.GOOGLE_CLIENTID,
      scope:
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      ux_mode: "popup",
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          var xhr = new XMLHttpRequest();
          xhr.open(
            "GET",
            "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" +
              tokenResponse.access_token
          );
          xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
              let profile = JSON.parse(xhr.response);
              let data = {
                login_mode:
                  SystemFeature?.encryptApisList?.fields?.signin == "true"
                    ? "5"
                    : 5,
                login_type: "google",
                login_id: profile.id,
                email: profile.email,
                name: profile.name,
              };
              if (!!data.email) {
                socialLoginCallBck(data);
              } else {
                // _self.socialErrMessage = "social_login_error_msg";
              }
            }
          };
          xhr.send(null);
        }
      },
    });
    client.requestAccessToken();
  };

  const faceBookLogin = () => {
    FB.login(
      function (response) {
        if (response.status === "connected") {
          doFBLogin();
        }
      },
      {
        scope: "public_profile,email",
        return_scopes: true,
        perms: "user_address, user_mobile_phone",
      }
    );
  };

  const doFBLogin = () => {
    FB.api(
      "/me",
      "GET",
      { fields: "email,name,id,first_name,last_name,verified" },
      function (response) {
        if (!response.error) {
          let signinData = {
            login_mode:
              SystemFeature?.encryptApisList?.fields?.signin == "true"
                ? "5"
                : 5,
            login_type: "facebook",
            login_id: response.id,
            email: response.email,
            name: response.name,
            first_name: response.first_name,
            last_name: response.last_name,
          };
          if (!!signinData.email || !!signinData.login_id) {
            socialLoginCallBck(signinData);
          } else {
            socialErrMessage = "social_login_error_msg";
          }
        } else {
          socialErrMessage = response.error.message;
        }
      }
    );
  };

  return (
    <>
      {/* <!-- google share and login library -->     */}
      <Script
        src="https://accounts.google.com/gsi/client"
        onload="console.log('TODO: add onload function')"
      />
      {/* <!-- facebook share and login library Load the JS SDK asynchronously -->     */}
      <Script>
        {`
    window.fbAsyncInit = function() {
      FB.init({
        appId      :  ${process.env.FB_CLIENTID} ,  
        cookie     : true,
        xfbml      : true,
        status     : true,
        version    : 'v8.0'
      });

      FB.AppEvents.logPageView();
    };

    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
        `}
      </Script>
      <div className={` ${styles.social_login} `}>
        <div className={` ${styles.social1} `}>
          {isAppleEnabled && (
            <button type="button" className={`${styles.apple_login}`}>
              <img
                className={`${styles.image_apple}`}
                alt="Apple-icon"
                src={`${ImageConfig?.socialLogins?.apple}`}
              ></img>
              <span className={`${styles.apple_text}`}>
                {SocialLoginconstant[localLang].Login_with_Apple}
              </span>{" "}
            </button>
          )}
          {isFacebookEnabled && (
            <button
              type="button"
              className={`${styles.facebook_login}`}
              onClick={faceBookLogin}
            >
              <img
                className={`${styles.image_fb}`}
                alt="Facebook-icon"
                src={ImageConfig?.socialLogins?.facebook}
              />
              <span className={`${styles.fb_text} ${styles.web}`}>
                {SocialLoginconstant[localLang].Login_with_Facebook}
              </span>
              <span className={`${styles.fb_text} ${styles.mobile}`}>
                {SocialLoginconstant[localLang].Facebook}
              </span>
            </button>
          )}
          {isGoogleEnabled && (
            <button
              type="button"
              className={`${styles.google_login}`}
              onClick={googlePlusLogin}
            >
              <img
                className={`${styles.image_gg}`}
                alt="Google-icon"
                src={ImageConfig?.socialLogins?.google}
              ></img>
              <span className={`${styles.google_text} ${styles.web}`}>
                {SocialLoginconstant[localLang].Login_with_Google}
              </span>
              <span className={`${styles.google_text} ${styles.mobile}`}>
                {SocialLoginconstant[localLang].Google}
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SocialLogin;
