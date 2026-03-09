import styles from "./GuidesSection.module.css";

const guides = [
  {
    number: "01",
    title: "How Solar Works in Austin",
    copy:
      "Panels, inverters, grid connection — explained in plain English. Plus Austin-specific details like buyback rates and system sizing.",
    image:
      "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7c81dc6c-677b-458c-9c27-a3d6ff08395d_1600w.png",
    cardClass: styles.cardPrimary,
  },
  {
    number: "02",
    title: "Costs & Savings",
    copy: "Real numbers behind solar costs in Austin, how financing works, and when you're likely to break even.",
    image:
      "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1619b254-4925-4861-ae23-ae515f16291f_1600w.png",
    cardClass: styles.cardGold,
  },
  {
    number: "03",
    title: "Austin Solar Incentives",
    copy: "Federal tax credit, Austin Energy rebates, property tax exemptions — and how to stack them all.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
    cardClass: styles.cardSky,
  },
];

export default function GuidesSection() {
  return (
    <section className={styles.section} id="go-deeper">
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>Go Deeper</h2>
        </div>
        <div className={styles.grid}>
          {guides.map((guide) => (
            <article key={guide.title} className={`${styles.card} ${guide.cardClass}`}>
              <div className={styles.cardTop}>
                <ArrowIcon />
                <span className={styles.number}>{guide.number}</span>
              </div>
              <h3 className={styles.cardTitle}>{guide.title}</h3>
              <p className={styles.cardCopy}>{guide.copy}</p>
              <div className={styles.imageFrame}>
                <img src={guide.image} alt={guide.title} className={styles.image} />
              </div>
              <div className={styles.cardFooter}>
                <SunIcon />
                <span>Read the Guide</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h10v10"></path>
      <path d="M7 17 17 7"></path>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  );
}
