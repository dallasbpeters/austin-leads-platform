import { useEffect, useRef } from "react";
import styles from "./StorySection.module.css";

export default function StorySection() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return undefined;
    }

    const wrapWords = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent?.match(/\S+|\s+/g) || [];
        const fragment = document.createDocumentFragment();

        words.forEach((word) => {
          if (word.trim().length > 0) {
            const span = document.createElement("span");
            span.textContent = word;
            span.className = styles.word;
            span.dataset.kWord = "true";
            fragment.appendChild(span);
          } else {
            fragment.appendChild(document.createTextNode(word));
          }
        });

        node.replaceWith(fragment);
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapWords);
      }
    };

    if (!container.querySelector("[data-k-word]")) {
      Array.from(container.childNodes).forEach(wrapWords);
      container.dataset.processed = "true";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const words = container.querySelectorAll("[data-k-word]");

            words.forEach((word, index) => {
              window.setTimeout(() => {
                word.classList.add(styles.wordActive);
              }, index * 40);
            });

            observer.unobserve(container);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.inner}>
        <h2 ref={ref} className={styles.text}>
          We&apos;re an independent solar resource for Austin homeowners. No sales pitch. No pressure. Just clear
          information about how solar works here, what it costs, and whether it makes sense for your home. If you
          decide to keep going, you&apos;ll do it with better questions and clearer expectations.{" "}
          <span className={styles.ending}>Start with the numbers first.</span>
        </h2>
      </div>
    </section>
  );
}
