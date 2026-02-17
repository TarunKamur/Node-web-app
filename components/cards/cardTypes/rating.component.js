import styles from "@/components/cards/card.module.scss";

export default function Rating({ eleIndex, topValue }) {
  return (
    <div
      className={`${styles.rating_badge} ${eleIndex[1] + 1 > 9 ? `${styles.dg}` : ``}`}
      style={{ height: `${topValue}px` }}
    >
      <p>{eleIndex[1] + 1}</p>
    </div>
  );
}
