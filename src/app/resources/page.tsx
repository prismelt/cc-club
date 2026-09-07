import { Navbar } from "~/app/components/navbar";
import styles from "./resources.module.css";

const resources = [
  {
    title: "The Missing Semester",
    type: "Course",
    banner: "President Suggested",
    description:
      "The command line, editors, debugging, and the tools behind the tools.",
    href: "https://missing.csail.mit.edu/",
  },
  {
    title: "MDN Web Docs",
    type: "Reference",
    banner: "Exclusive Partnership",
    description: "A sturdy reference for the web platform, from HTML to APIs.",
    href: "https://developer.mozilla.org/",
  },
  {
    title: "Git Book",
    type: "Guide",
    description:
      "Version control explained for people who want to understand it.",
    href: "https://git-scm.com/book/en/v2",
  },
];
export default function ResourcesPage() {
  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.content}>
        <p className={styles.kicker}>A useful shelf</p>
        <h1>
          Resources for
          <br />
          <em>the next attempt.</em>
        </h1>
        <div className={styles.grid}>
          {resources.map((resource) => (
            <a
              className={styles.resource}
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              key={resource.title}
            >
              <span>{resource.type}</span>
              {resource.banner && (
                <>
                  <strong className={styles.banner}>{resource.banner}</strong>
                </>
              )}
              <h2>{resource.title} ↗</h2>
              <p>{resource.description}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
