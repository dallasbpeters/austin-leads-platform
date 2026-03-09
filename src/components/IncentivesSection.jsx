import styles from "./IncentivesSection.module.css";

export default function IncentivesSection() {
  return (
    <section className={styles.section} id="incentives">
      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 className={styles.title}>Understanding Solar Incentives in Texas</h2>
          <div className={styles.text}>
            <p>
              Beyond the federal tax credit, Texas offers one meaningful long-term perk for solar homeowners: a
              property tax exemption on the added home value. Solar can increase what your home is worth without
              automatically increasing your property tax bill.
            </p>
            <p>
              Local rebates, interconnection requirements, and net metering rules can still be confusing. The details
              change over time, so it is worth confirming the current Austin Energy requirements and incentive amounts
              before you make a decision.
            </p>
          </div>
          <button className={styles.button} type="button">
            Review incentive basics
          </button>
        </div>

        <div className={styles.imageWrap}>
          <img
            src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop"
            alt="Austin Neighborhood"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
