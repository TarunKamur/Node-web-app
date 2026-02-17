import styles from "@/components/loader/loader.module.scss";
import { ImageConfig } from "@/config/ImageConfig";

const PageLoader = ({ isBackgroundBlur }) => {
  return (
    <div
      className={styles.page_loader}
      style={{
        backgroundColor: isBackgroundBlur && "rgba(0, 0, 0, 0.5)",
      }}
    >
      <img
        className={`${styles.icon} rotate`}
        src={`${ImageConfig?.PageLoader?.loader}`}
        alt="rotate"
      />
    </div>
  );
};

export default PageLoader;
