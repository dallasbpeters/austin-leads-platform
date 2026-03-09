import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.copy}>Copyright © Austin Solar Pros 2026</div>
        <div className={styles.links}>
          <a href="#" className={styles.link}>
            Privacy Policy
          </a>
          <a href="#" className={styles.link}>
            Terms of Service
          </a>
          <a href="#" className={styles.link}>
            Licenses
          </a>
        </div>
      </div>
    </footer>
  );
}
