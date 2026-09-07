"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Navbar } from "~/app/components/navbar";
import { api } from "~/trpc/react";
import styles from "./home.module.css";

export default function HomePage() {
  const { data: session, status } = useSession();
  const profile = api.user.me.useQuery(undefined, {
    enabled: Boolean(session?.user),
  });
  const update = api.user.updateProfile.useMutation({
    onSuccess: () => void profile.refetch(),
  });
  const remove = api.user.deleteAccount.useMutation({
    onSuccess: () => void signOut({ callbackUrl: "/" }),
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
    avatar: "/avatar-default.webp",
  });
  const [confirmation, setConfirmation] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  useEffect(() => {
    if (profile.data)
      setForm({
        name: profile.data.name ?? "",
        email: profile.data.email,
        description: profile.data.description,
        avatar: profile.data.avatar,
      });
  }, [profile.data]);
  if (status === "loading" || profile.isLoading)
    return (
      <main className={styles.page}>
        <Navbar />
        <p className={styles.loading}>Loading profile...</p>
      </main>
    );
  if (!session?.user || !profile.data)
    return (
      <main className={styles.page}>
        <Navbar />
        <p className={styles.loading}>Log in to see your profile.</p>
      </main>
    );
  const name = profile.data.name ?? "your name";
  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.content}>
        <div className={styles.heading}>
          <p className={styles.kicker}>Your club home</p>
          <h1>
            Make your
            <br />
            <em>mark.</em>
          </h1>
        </div>
        <div className={styles.layout}>
          <aside>
            <img src={form.avatar || "/avatar-default.webp"} alt="" />
            <strong>{name}</strong>
            <span>{form.email}</span>
            <p>
              {form.description ||
                "Add a little context about what you like to make."}
            </p>
          </aside>
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              update.mutate(form);
            }}
          >
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              Avatar URL
              <input
                value={form.avatar}
                onChange={(event) =>
                  setForm({ ...form, avatar: event.target.value })
                }
              />
            </label>
            <label>
              Description
              <textarea
                maxLength={500}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <button disabled={update.isPending}>
              {update.isPending ? "Saving..." : "Save changes"}
            </button>
            {update.error && (
              <p className={styles.error}>{update.error.message}</p>
            )}
          </form>
        </div>
        <section className={styles.danger}>
          <h2>Delete your account</h2>
          <p>This permanently removes your profile, posts, and sessions.</p>
          <button className={styles.delete} onClick={() => setShowDelete(true)}>
            Delete account
          </button>
        </section>
      </section>
      {showDelete && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowDelete(false);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div className={styles.warningIcon}>!</div>
            <p className={styles.modalKicker}>Warning / final step</p>
            <h2 id="delete-title">Delete your account?</h2>
            <p className={styles.modalCopy}>
              This action is irreversible. Your profile, posts, and active
              sessions will be permanently removed.
            </p>
            <label className={styles.modalLabel}>
              Type <b>{name}</b> to confirm
              <input
                autoFocus
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={name}
              />
            </label>
            <div className={styles.modalActions}>
              <button
                className={styles.cancel}
                onClick={() => {
                  setShowDelete(false);
                  setConfirmation("");
                }}
              >
                Keep my account
              </button>
              <button
                className={styles.delete}
                disabled={confirmation !== name || remove.isPending}
                onClick={() => remove.mutate()}
              >
                {remove.isPending ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
