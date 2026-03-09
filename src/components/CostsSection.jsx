import styles from "./CostsSection.module.css";

export default function CostsSection() {
  return (
    <section className={styles.section} id="costs">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Costs &amp; Incentives</p>
        <h2 className={styles.title}>
          What Does Solar
          <br />
          Actually Cost in Austin?
        </h2>
        <p className={styles.copy}>
          The average residential solar installation in Austin runs between <span>$18,000 and $28,000</span> before
          incentives. That range depends on your roof size, equipment choice, and how much energy your home uses.
        </p>
        <p className={styles.copy}>The good news: incentives bring that number down significantly.</p>

        <div className={styles.grid}>
          <div>
            <p className={styles.value}>30%</p>
            <p className={styles.label}>Federal Tax Credit</p>
            <p className={styles.detail}>
              The federal Investment Tax Credit lets you claim 30% of your total solar cost against your federal taxes.
              On a $22,000 system, that&apos;s <span>$6,600 back</span>.
            </p>
          </div>
          <div>
            <p className={styles.value}>$$$</p>
            <p className={styles.label}>Austin Energy Rebate</p>
            <p className={styles.detail}>
              Austin Energy offers a rebate for residential solar installations. The amount can vary by year and system
              size, so check current incentive amounts on its site.
            </p>
          </div>
          <div>
            <p className={styles.value}>$0</p>
            <p className={styles.label}>Property Tax Increase</p>
            <p className={styles.detail}>
              Solar panels can increase your home&apos;s value, but Texas law exempts that added value from property
              taxes. Your home may be worth more, but your tax bill does not automatically go up with it.
            </p>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.payback}>
          <p className={styles.paybackEyebrow}>Realistic Payback</p>
          <div>
            <p className={styles.paybackTitle}>Most Austin homeowners break even in 7–9 years.</p>
            <p className={styles.paybackCopy}>
              After that, the value shifts to long-term bill reduction for the remaining 15–20 years of a typical panel
              warranty.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
