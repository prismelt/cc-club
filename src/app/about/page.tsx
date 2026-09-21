"use client";

import { useSession } from "next-auth/react";
import { type FormEvent, useEffect, useState } from "react";

import { Navbar } from "~/app/components/navbar";
import { api } from "~/trpc/react";
import styles from "./about.module.css";

export default function AboutPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";
  const utils = api.useUtils();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [form, setForm] = useState({
    position: "",
    name: "",
    description: "",
    email: "",
    quote: "",
  });

  const aboutMembers = api.about.list.useQuery();
  const createMember = api.about.create.useMutation({
    onSuccess: async () => {
      setIsFormOpen(false);
      setForm({
        position: "",
        name: "",
        description: "",
        email: "",
        quote: "",
      });
      await utils.about.list.invalidate();
    },
  });
  const deleteMember = api.about.delete.useMutation({
    onSuccess: async () => {
      setPendingDelete(null);
      setDeleteConfirmation("");
      await utils.about.list.invalidate();
    },
  });

  useEffect(() => {
    const leaderNodes = document.querySelectorAll<HTMLElement>("[data-leader]");
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

    leaderNodes.forEach((leader) => observer.observe(leader));
    return () => observer.disconnect();
  }, [aboutMembers.data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const position = form.position.trim();
    const name = form.name.trim();
    const description = form.description.trim();
    const email = form.email.trim();
    const quote = form.quote.trim();

    if (!position || !name || !description) {
      return;
    }

    createMember.mutate({
      position,
      name,
      description,
      email,
      quote,
    });
  };

  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.intro}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.kicker}>The people behind the projects</p>
            <h1>
              Small club.
              <br />
              <em>Serious curiosity.</em>
            </h1>
          </div>
          {isAdmin && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setIsFormOpen(true)}
            >
              Add a person
            </button>
          )}
        </div>
        <p className={styles.lede}>
          Green Level Coding Club is a place to learn in public, make useful
          mistakes, and leave with something real.
        </p>
      </section>
      <section className={styles.grid}>
        {aboutMembers.data?.map((leader, index) => (
          <article
            className={styles.leader}
            data-leader
            data-direction={index % 2 === 0 ? "left" : "right"}
            key={leader.id}
          >
            <div className={styles.number}>0{index + 1}</div>
            <div>
              <p className={styles.role}>{leader.position}</p>
              <h2>{leader.name}</h2>
              <p className={styles.description}>{leader.description}</p>
              {leader.email && (
                <a href={`mailto:${leader.email}`}>{leader.email}</a>
              )}
              {leader.quote && <blockquote>“{leader.quote}”</blockquote>}
            </div>
            {isAdmin && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => {
                  setPendingDelete({ id: leader.id, name: leader.name });
                  setDeleteConfirmation("");
                }}
              >
                Delete
              </button>
            )}
          </article>
        ))}
        {!aboutMembers.data?.length && !aboutMembers.isLoading && (
          <p className={styles.emptyState}>No club members yet.</p>
        )}
      </section>
      {pendingDelete && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPendingDelete(null);
              setDeleteConfirmation("");
            }
          }}
        >
          <section
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-delete-title"
          >
            <div className={styles.warningBadge}>!</div>
            <p className={styles.modalKicker}>Admin action / permanent</p>
            <h2 id="about-delete-title">Delete this profile?</h2>
            <p className={styles.modalCopy}>
              This permanently removes <b>{pendingDelete.name}</b> from the
              about page.
            </p>
            <label className={styles.field}>
              Type <b>{pendingDelete.name}</b> to confirm
              <input
                autoFocus
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder={pendingDelete.name}
              />
            </label>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setPendingDelete(null);
                  setDeleteConfirmation("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmButton}
                disabled={
                  deleteConfirmation !== pendingDelete.name ||
                  deleteMember.isPending
                }
                onClick={() => {
                  deleteMember.mutate({ id: pendingDelete.id });
                }}
              >
                {deleteMember.isPending ? "Deleting..." : "Delete person"}
              </button>
            </div>
          </section>
        </div>
      )}
      {isFormOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsFormOpen(false);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-member-title"
          >
            <p className={styles.modalKicker}>Admin / profile</p>
            <h2 id="about-member-title">Add a person</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.field}>
                Position
                <input
                  type="text"
                  required
                  value={form.position}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      position: event.target.value,
                    }))
                  }
                  placeholder="Enter the position"
                />
              </label>
              <label className={styles.field}>
                Name
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter the name"
                />
              </label>
              <label className={styles.field}>
                Description
                <textarea
                  required
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Enter the role"
                />
              </label>
              <label className={styles.field}>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                />
              </label>
              <label className={styles.field}>
                Quote
                <input
                  type="text"
                  value={form.quote}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      quote: event.target.value,
                    }))
                  }
                  placeholder="Enter the quote"
                />
              </label>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={createMember.isPending}
                >
                  {createMember.isPending ? "Saving..." : "Save person"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
