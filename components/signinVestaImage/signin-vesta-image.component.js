import styles from "./signin-vesta-image.module.scss";

const SignInVestaImage = () => {
  return (
    <>
      <img
        className={`${styles.bg_top_left}`}
        src={
          "https://d2ivesio5kogrp.cloudfront.net/static/vesta/images/Top-left-corner.png"
        }
        alt=""
      ></img>
      <img
        className={`${styles.bg_bottom_right}`}
        src={
          "https://d2ivesio5kogrp.cloudfront.net/static/vesta/images/Bottom-right-Corner.png"
        }
        alt=""
      ></img>
    </>
  );
};

export default SignInVestaImage;
