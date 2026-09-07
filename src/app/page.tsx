"use client";

import Link from "next/link";

import { Navbar } from "~/app/components/navbar";
import styles from "~/styles/index.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.aurora} aria-hidden="true" />
      <Navbar />
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span /> After school / in session
        </div>
        <h1>
          Make Something
          <em>Unexpected.</em>
        </h1>
        <br />
        <p className={styles.intro}>
          Small club, big ideas, and people curious and capable enough to ship
          them.
        </p>
        <div className={styles.orbit} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={styles.panel}>
          <Link className={styles.button} href="/signup">
            Join the club <span>↗</span>
          </Link>
          <Link className={styles.textButton} href="/about">
            Meet the people
          </Link>
        </div>
      </section>
      <footer>
        <span>01 — 04</span>
        <span>
          Build things together <b>✳</b>
        </span>
      </footer>
    </main>
  );
}
