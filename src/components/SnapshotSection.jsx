import styles from "./SnapshotSection.module.css";

const items = [
  { icon: "solar:wallet-money-linear", value: "$18k-$28k", copy: "Average install cost before applied incentives" },
  { icon: "solar:chart-square-linear", value: "30%", copy: "Federal Investment Tax Credit (ITC) savings" },
  { icon: "solar:leaf-linear", value: "$2,500", copy: "Austin Energy local solar education course rebate" },
  { icon: "solar:history-linear", value: "7–9 years", copy: "Typical return-on-investment timeline for Austin homeowners" },
];

export default function SnapshotSection() {
  return (
    <section className={styles.section}>
      <div className={styles.sunWrap}>
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" className={styles.sun}>
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="6"></circle>
            <path strokeLinecap="round" d="M12 2v1m0 18v1m10-10h-1M3 12H2m17.07-7.07l-.392.393M5.322 18.678l-.393.393m14.141-.001l-.392-.393M5.322 5.322l-.393-.393"></path>
          </g>
        </svg>
      </div>

      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Austin Snapshot</p>
          <h2 className={styles.title}>The numbers people usually ask for.</h2>
          <p className={styles.copy}>
            These are directional homeowner benchmarks, not a replacement for a roof-specific production model.
          </p>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.value} className={styles.card}>
                <div className={styles.iconWrap}>
                  <iconify-icon icon={item.icon} className={styles.icon}></iconify-icon>
                </div>
              <div className={styles.value}>{item.value}</div>
              <div className={styles.detail}>{item.copy}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
