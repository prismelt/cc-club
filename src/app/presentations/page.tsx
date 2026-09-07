import { Navbar } from "~/app/components/navbar";
import styles from "./presentations.module.css";

const talks = [
  {
    title: "The Internet Is A Place",
    speaker: "Maya Chen",
    date: "October 08, 2026",
    tag: "Talk 01",
  },
  {
    title: "A Tiny Machine With Big Opinions",
    speaker: "Theo Brooks",
    date: "November 12, 2026",
    tag: "Talk 02",
  },
  {
    title: "Designing For The Person Who Is Not In The Room",
    speaker: "Iris Patel",
    date: "December 03, 2026",
    tag: "Talk 03",
  },
];
export default function PresentationsPage() {
  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.content}>
        <p className={styles.kicker}>Show and tell</p>
        <h1>
          Presentations
          <br />
          <em>worth staying late for.</em>
        </h1>
        <div className={styles.list}>
          {talks.map((talk) => (
            <article className={styles.talk} key={talk.title}>
              <span>{talk.tag}</span>
              <div>
                <h2>{talk.title}</h2>
                <p>
                  {talk.speaker} · {talk.date}
                </p>
              </div>
              <b>↗</b>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
