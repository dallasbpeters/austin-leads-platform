import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.content}>
            <div className={styles.eyebrow}>
              <div className={styles.dotWrap}>
                <span className={styles.dotPulse}></span>
                <span className={styles.dot}></span>
              </div>
              <span className={styles.eyebrowText}>Austin averages 228 sunny days a year</span>
            </div>

            <h1 className={styles.title}>
              Solar,
              <br />
              <span className={styles.titleOutline}>simplified.</span>
            </h1>

            <div className={styles.actions}>
              <a href="#consultation" className={styles.primaryButton}>
                Talk to a Solar Pro
              </a>

              <div className={styles.credit}>
                <div className={styles.creditDivider}></div>
                <div>
                  <span className={styles.creditLabel}>Typical Austin Payback</span>
                  <span className={styles.creditValue}>7–9 years</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.panelWrap}>
            <div className={styles.panel}>
              <p className={styles.panelCopy}>
                Straight answers on Austin solar costs, incentives, and whether the math works for your home.
              </p>
              <div className={styles.panelDots}>
                <div className={styles.panelDotsLong}></div>
                <div className={styles.panelDotsShort}></div>
                <div className={styles.panelDotsFaint}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
