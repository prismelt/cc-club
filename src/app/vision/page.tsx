import { Navbar } from "~/app/components/navbar";
import styles from "./vision.module.css";

export default function VisionPage() {
  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.content}>
        <p className={styles.kicker}>Our vision</p>
        <h1>
          Coding Club
          <br />
          <em>learn, build, and belong.</em>
        </h1>

        <div className={styles.grid}>
          <article className={styles.section}>
            <h2>Purpose</h2>
            <p>
              The Coding Club is an informal club open to any student who is
              interested in solving problems, collaborating, and programming.
              Our mission is to provide opportunities to learn coding skills and
              build confidence. We welcome students with different perspectives
              and backgrounds.
            </p>
          </article>

          <article className={styles.section}>
            <h2>Meeting Time</h2>
            <p>We meet every Thursday during Connectivity.</p>
            <p>
              Sign up in AllTimely, Room 0125, to reserve your spot
              <span className={styles.note}>
                (Spots fill up fast. Be mindful and sign up early).
              </span>
            </p>
          </article>

          <article className={styles.section}>
            <h2>What we&apos;ve done</h2>
            <ul className={styles.list}>
              <li>UCLA Codesprint</li>
              <li>Portfolio Project</li>
              <li>UC Berkeley Calico</li>
              <li>And Much More</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
