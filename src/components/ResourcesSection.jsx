import styles from "./ResourcesSection.module.css";

const items = [
  {
    icon: "solar:map-point-linear",
    title: "Austin Energy Solar Rebate Program",
    copy: "Current amounts and eligibility",
    image: "https://images.unsplash.com/photo-1673140511598-2f23d9fec5dd?w=800&q=80",
    alt: "Austin Skyline",
  },
  {
    icon: "solar:home-linear",
    title: "Federal Investment Tax Credit",
    copy: "What it is, who qualifies, how to claim",
    image: "https://images.unsplash.com/photo-1668097613572-40b7c11c8727?w=800&q=80",
    alt: "Solar Panels Close Up",
  },
  {
    icon: "solar:wad-of-money-linear",
    title: "Net Metering in Austin",
    copy: "How credits work on your bill",
    image: "https://images.unsplash.com/photo-1604177420682-0c840feb01de?w=800&q=80",
    alt: "Happy Family",
  },
];

export default function ResourcesSection() {
  return (
    <section className={styles.section} id="resources">
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>Key Austin solar resources</h2>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.title} className={styles.card}>
              <img src={item.image} alt={item.alt} className={styles.image} />
              <div className={styles.overlay}></div>
              <div className={styles.content}>
                <div className={styles.iconWrap}>
                  <iconify-icon icon={item.icon} className={styles.icon}></iconify-icon>
                </div>
                <div className={styles.cardTitle}>{item.title}</div>
                <div className={styles.cardCopy}>{item.copy}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
