import styles from "@/components/loader/loader.module.scss";

const Loader = ({ type }) => {
  if (type == "button") {
    return (
      <div className={`${styles.btn_loader}`}>
        <div className={`${styles.icon}`}></div>
      </div>
    );
  }
};

export default Loader;
