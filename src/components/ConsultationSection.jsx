import styles from "./ConsultationSection.module.css";

export default function ConsultationSection() {
  return (
    <section className={styles.section} id="estimate">
      <div className={styles.rings}>
        <div className={styles.ringLarge}></div>
        <div className={styles.ringSmall}></div>
      </div>

      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            Talk to a
            <br />
            Austin Solar Pro
          </h2>
          <p className={styles.copy}>
            If you want to talk through your roof, electric usage, or expected savings, request a free, no-pressure
            consultation with a local solar pro.
          </p>
        </div>

        <div className={styles.formCard} id="consultation">
          <form className={styles.form}>
            <div>
              <label className={styles.label}>Full Name</label>
              <input type="text" placeholder="e.g. Jane Doe" className={styles.input} />
            </div>

            <div className={styles.split}>
              <div>
                <label className={styles.label}>Email Address</label>
                <input type="email" placeholder="jane@example.com" className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>Phone Number</label>
                <input type="tel" placeholder="(512) 000-0000" className={styles.input} />
              </div>
            </div>

            <div className={styles.consent}>
              <input type="checkbox" id="privacy" className={styles.checkbox} />
              <label htmlFor="privacy" className={styles.consentText}>
                I agree to be contacted by Austin Solar Pros about my inquiry. We do not sell your information.
              </label>
            </div>

            <button type="button" className={styles.button}>
              Request a Free Consultation
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
