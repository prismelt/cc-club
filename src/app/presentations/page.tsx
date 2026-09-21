"use client";

import { useSession } from "next-auth/react";
import { type FormEvent, useEffect, useState } from "react";

import { Navbar } from "~/app/components/navbar";
import { api } from "~/trpc/react";
import styles from "./presentations.module.css";

const defaultPresentationTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localTime = new Date(now.getTime() - offset * 60 * 1000);
  return localTime.toISOString().slice(0, 16);
};

export default function PresentationsPage() {
  const { data: session } = useSession();
  const [visibleCount, setVisibleCount] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [form, setForm] = useState({
    name: "",
    presenterName: session?.user?.name ?? "",
    link: "",
    publishedAt: defaultPresentationTime(),
  });

  const utils = api.useUtils();
  const isAdmin = session?.user.role === "admin";
  const totalTalks = api.presentation.count.useQuery();
  const presentations = api.presentation.list.useQuery({
    limit: visibleCount,
  });
  const createPresentation = api.presentation.create.useMutation({
    onSuccess: async () => {
      setIsFormOpen(false);
      setForm({
        name: "",
        presenterName: session?.user?.name ?? "",
        link: "",
        publishedAt: defaultPresentationTime(),
      });
      setVisibleCount(10);
      await utils.presentation.list.invalidate();
    },
  });
  const deletePresentation = api.presentation.delete.useMutation({
    onSuccess: async () => {
      setPendingDelete(null);
      setDeleteConfirmation("");
      await Promise.all([
        utils.presentation.list.invalidate(),
        utils.presentation.count.invalidate(),
      ]);
    },
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      presenterName:
        current.presenterName === ""
          ? (session?.user?.name ?? "")
          : current.presenterName,
    }));
  }, [session?.user?.name]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const presenterName = form.presenterName.trim();
    const link = form.link.trim();

    if (!name || !link) {
      return;
    }

    createPresentation.mutate({
      name,
      presenterName,
      link,
      publishedAt: form.publishedAt,
    });
  };

  const openPresentation = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const talkCount = presentations.data?.length ?? 0;
  const totalTalkCount = totalTalks.data ?? 0;

  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.content}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.kicker}>Show and tell</p>
            <h1>
              Presentations
              <br />
              <em>worth staying late for.</em>
            </h1>
          </div>
          {isAdmin && (
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => {
                setForm({
                  name: "",
                  presenterName: session?.user?.name ?? "",
                  link: "",
                  publishedAt: defaultPresentationTime(),
                });
                setIsFormOpen(true);
              }}
            >
              Add a presentation
            </button>
          )}
        </div>
        <div className={styles.list}>
          {presentations.data?.map((presentation, index) => {
            const talkNumber = Math.max(totalTalkCount - index, 1);
            return (
              <article
                className={styles.talk}
                key={presentation.id}
                role="link"
                tabIndex={0}
                onClick={() => openPresentation(presentation.link)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPresentation(presentation.link);
                  }
                }}
              >
                <span>{`Talk ${String(talkNumber).padStart(2, "0")}`}</span>
                <div>
                  <h2>{presentation.name}</h2>
                  <p>
                    {presentation.presenterName} ·{" "}
                    {new Date(presentation.publishedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div className={styles.actions}>
                  {isAdmin && (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      aria-label={`Delete ${presentation.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingDelete({
                          id: presentation.id,
                          name: presentation.name,
                        });
                        setDeleteConfirmation("");
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.linkButton}
                    aria-label={`Open ${presentation.name} slides`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openPresentation(presentation.link);
                    }}
                  >
                    ↗
                  </button>
                </div>
              </article>
            );
          })}
          {!presentations.data?.length && !presentations.isLoading && (
            <p className={styles.emptyState}>No presentations yet.</p>
          )}
        </div>
        {talkCount >= visibleCount && (
          <button
            className={styles.showMore}
            type="button"
            onClick={() => setVisibleCount((count) => count + 10)}
          >
            Show more
          </button>
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
            aria-labelledby="delete-presentation-title"
          >
            <div className={styles.warningBadge}>!</div>
            <p className={styles.modalKicker}>Admin action / permanent</p>
            <h2 id="delete-presentation-title">Delete this talk?</h2>
            <p className={styles.modalCopy}>
              This permanently removes <b>{pendingDelete.name}</b> from the
              presentation list.
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
                  deletePresentation.isPending
                }
                onClick={() => {
                  deletePresentation.mutate({ id: pendingDelete.id });
                }}
              >
                {deletePresentation.isPending ? "Deleting..." : "Delete talk"}
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
            aria-labelledby="presentation-form-title"
          >
            <p className={styles.modalKicker}>Admin / upload</p>
            <h2 id="presentation-form-title">Add a presentation</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.field}>
                Presenter
                <input
                  type="text"
                  value={form.presenterName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      presenterName: event.target.value,
                    }))
                  }
                  placeholder={session?.user?.name ?? "Your name"}
                />
              </label>
              <label className={styles.field}>
                Presentation name
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
                  placeholder="Talk title or event name"
                />
              </label>
              <label className={styles.field}>
                Slide link
                <input
                  type="url"
                  required
                  value={form.link}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      link: event.target.value,
                    }))
                  }
                  placeholder="https://docs.google.com/presentation/..."
                />
              </label>
              <label className={styles.field}>
                Publish time
                <input
                  type="datetime-local"
                  required
                  value={form.publishedAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      publishedAt: event.target.value,
                    }))
                  }
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
                  disabled={createPresentation.isPending}
                >
                  {createPresentation.isPending
                    ? "Saving..."
                    : "Save presentation"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
