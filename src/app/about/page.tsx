"use client";

import { useEffect } from "react";

import { Navbar } from "~/app/components/navbar";
import styles from "./about.module.css";

const leaders = [
  {
    name: "Dummy Dummy 1",
    role: "Faculty advisor",
    description:
      "Keeps the room curious, generous, and pointed at real problems.",
    contact: "Dummy.Dummy@wcpss.net",
    quote: "The best project is the one that changes the question.",
  },
  {
    name: "Dummy Dummy 2",
    role: "Club president",
    description:
      "Builds the prototypes that turn a loose idea into something you can touch.",
    contact: "Dummy.Dummy@students.wcpss.net",
    quote: "-----------------------------------------",
  },
  {
    name: "Dummy Dummy 3",
    role: "Community lead",
    description:
      "Makes sure every new voice has a place at the table and a way into the work.",
    contact: "Dummy.Dummy@students.wcpss.net",
  },
];

export default function AboutPage() {
  useEffect(() => {
    const leaders = document.querySelectorAll<HTMLElement>("[data-leader]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    leaders.forEach((leader) => observer.observe(leader));
    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.intro}>
        <p className={styles.kicker}>The people behind the projects</p>
        <h1>
          Small club.
          <br />
          <em>Serious curiosity.</em>
        </h1>
        <p className={styles.lede}>
          Green Level Coding Club is a place to learn in public, make useful
          mistakes, and leave with something real.
        </p>
      </section>
      <section className={styles.grid}>
        {leaders.map((leader, index) => (
          <article
            className={styles.leader}
            data-leader
            data-direction={index % 2 === 0 ? "left" : "right"}
            key={leader.name}
          >
            <div className={styles.number}>0{index + 1}</div>
            <div>
              <p className={styles.role}>{leader.role}</p>
              <h2>{leader.name}</h2>
              <p className={styles.description}>{leader.description}</p>
              <a href={`mailto:${leader.contact}`}>{leader.contact}</a>
              {leader.quote && <blockquote>“{leader.quote}”</blockquote>}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
