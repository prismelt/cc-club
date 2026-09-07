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
      </section>
      <section className={styles.explore}>
        <div className={styles.exploreGrid}>
          <Link className={styles.exploreCard} href="/about">
            <span>01 / People</span>
            <strong>
              Meet the People <b>↗</b>
            </strong>
            <p>Find the people making the room more interesting.</p>
          </Link>
          <Link className={styles.exploreCard} href="/vision">
            <span>02 / Direction</span>
            <strong>
              Share Our Goals <b>↗</b>
            </strong>
            <p>A little something about where curiosity can take us.</p>
          </Link>
          <Link className={styles.exploreCard} href="/presentations">
            <span>03 / Gatherings</span>
            <strong>
              See Our Meetings <b>↗</b>
            </strong>
            <p>Talks, show-and-tells, and ideas worth staying late for.</p>
          </Link>
          <Link className={styles.exploreCard} href="/resources">
            <span>04 / Toolkit</span>
            <strong>
              Find More Resources <b>↗</b>
            </strong>
            <p>A useful shelf for your next attempt.</p>
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
