import { Navbar } from "~/app/components/navbar";
import styles from "./vision.module.css";

export default function VisionPage() {
  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.content}>
        <p className={styles.kicker}>Our vision</p>
        <h1>
          Make room
          <br />
          <em>for better questions.</em>
        </h1>
        <div className={styles.copy}>
          <p>
            We believe the future belongs to people who are willing to be
            beginners, collaborators, and slightly unreasonable about what could
            be possible.
          </p>
          <p>
            So we make things. Sometimes they work. Sometimes they teach us what
            to try next. Either way, the room gets more interesting.
          </p>
        </div>
        <div className={styles.statement}>
          No grand plan.
          <br />
          <span>Just momentum.</span>
        </div>
      </section>
    </main>
  );
}
