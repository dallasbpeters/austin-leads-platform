import { useMemo, useState } from "react";
import styles from "./CalculatorSection.module.css";

const DEFAULT_BILL = 200;
const MIN_BILL = 50;
const MAX_BILL = 800;

function clampBill(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_BILL;
  }

  return Math.min(MAX_BILL, Math.max(MIN_BILL, parsed));
}

function calculate(rawBill) {
  const bill = clampBill(rawBill);
  const rate = 0.11;
  const offset = 0.85;
  const sunHours = 5.5;
  const performanceRatio = 0.8;
  const monthlyKwh = bill / rate;
  const annualKwh = monthlyKwh * 12 * offset;
  const systemKw = annualKwh / (sunHours * 365 * performanceRatio);
  const panels = Math.ceil(systemKw / 0.4);
  const costPerWatt = systemKw >= 10 ? 2.45 : systemKw >= 7 ? 2.6 : systemKw >= 5 ? 2.75 : 2.95;
  const fixedCosts = 1800;
  const grossCost = systemKw * 1000 * costPerWatt + fixedCosts;
  const localRebate = systemKw >= 8 ? 2500 : systemKw >= 6 ? 1800 : 1200;
  const federalCredit = grossCost * 0.3;
  const netCost = Math.max(grossCost - federalCredit - localRebate, 0);
  const year1Savings = annualKwh * rate;
  const monthlySavings = year1Savings / 12;
  const payback = year1Savings > 0 ? netCost / year1Savings : 0;

  let lifetime = 0;
  for (let year = 0; year < 25; year += 1) {
    lifetime += year1Savings * Math.pow(1.025, year) * Math.pow(0.995, year);
  }

  return {
    systemKw: systemKw.toFixed(1),
    panels,
    year1: Math.round(year1Savings).toLocaleString(),
    monthly: `$${Math.round(monthlySavings)}`,
    lifetime: Math.round(lifetime).toLocaleString(),
    payback: payback.toFixed(1),
  };
}

export default function CalculatorSection() {
  const [bill, setBill] = useState(DEFAULT_BILL);
  const results = useMemo(() => calculate(bill), [bill]);

  return (
    <section className={styles.section}>
      <div className={styles.accentTop}></div>
      <div className={styles.accentBottom}></div>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>See what solar could save&nbsp;you</h2>
          <p className={styles.copy}>
            Enter your average monthly electric bill and we&apos;ll estimate your system size, potential savings, and
            likely payback period.
          </p>
        </div>

        <div className={styles.shell}>
          <div className={styles.controls}>
            <label htmlFor="calc-bill" className={styles.label}>
              Your Monthly Electric Bill
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.currency}>$</span>
              <input
                id="calc-bill"
                type="number"
                min={MIN_BILL}
                max={MAX_BILL}
                value={bill}
                onChange={(event) => setBill(clampBill(event.target.value))}
                className={styles.input}
              />
            </div>
            <input
              type="range"
              min={MIN_BILL}
              max={MAX_BILL}
              step="10"
              value={bill}
              onChange={(event) => setBill(clampBill(event.target.value))}
              className={styles.range}
            />
            <div className={styles.rangeLabels}>
              <span>$50</span>
              <span>$800</span>
            </div>

            <div className={styles.note}>
              <svg className={styles.noteIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
              </svg>
              Based on average Austin Energy rates and 5.5 peak sun hours per day
            </div>
          </div>

          <div className={styles.results}>
            <ResultCard title="System Size" value={results.systemKw} suffix="kW" detail={`~${results.panels} panels on your roof`} />
            <ResultCard title="Year 1 Savings" value={results.year1} prefix="$" detail={`Avg ${results.monthly}/mo back in your pocket`} />
            <ResultCard title="25-Year Savings" value={results.lifetime} prefix="$" detail="With 2.5% annual rate increase" accent />
            <ResultCard
              title="Payback Period"
              value={results.payback}
              suffix="years"
              detail="After federal credit and a typical local rebate"
              accent
            />

            <div className={styles.cta}>
              <a href="#estimate" className={styles.ctaButton}>
                Talk to a solar pro →
              </a>
              <span className={styles.ctaMeta}>Free estimate · No commitment · Takes 2 minutes</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.gridPattern}></div>
    </section>
  );
}

function ResultCard({ title, value, prefix = "", suffix = "", detail, accent = false }) {
  return (
    <div className={`${styles.card} ${accent ? styles.card : ""}`}>
      <span className={styles.cardTitle}>{title}</span>
      <div className={styles.cardValue}>
        {prefix ? <span className={styles.cardSmall}>{prefix}</span> : null}
        <span>{value}</span>
        {suffix ? <span className={styles.cardSmall}>{suffix}</span> : null}
      </div>
      <p className={styles.cardDetail}>{detail}</p>
    </div>
  );
}
