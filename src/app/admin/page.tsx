"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Navbar } from "~/app/components/navbar";
import { api } from "~/trpc/react";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const users = api.user.list.useQuery(undefined, {
    enabled: session?.user.role === "admin",
  });
  const remove = api.user.deleteUser.useMutation({
    onSuccess: () => void users.refetch(),
  });
  if (status === "loading")
    return (
      <main className={styles.page}>
        <Navbar />
        <p>Loading...</p>
      </main>
    );
  if (session?.user.role !== "admin")
    return (
      <main className={styles.page}>
        <Navbar />
        <section className={styles.empty}>
          <h1>Private room.</h1>
          <p>This page is for club admins.</p>
        </section>
      </main>
    );
  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.content}>
        <p className={styles.kicker}>Admin / roster</p>
        <h1>
          Everyone
          <br />
          <em>in the room.</em>
        </h1>
        <div className={styles.roster}>
          {users.data?.map((user) => (
            <article key={user.id}>
              <Image
                src={user.avatar}
                alt=""
                width={44}
                height={44}
                unoptimized={user.avatar !== "/avatar-default.webp"}
              />
              <div>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <small>
                  {user.role} · {user.description || "No description yet"}
                </small>
              </div>
              {user.id !== session.user.id && (
                <button
                  onClick={() => {
                    setPendingDelete({
                      id: user.id,
                      name: user.name ?? "this user",
                    });
                    setConfirmation("");
                  }}
                >
                  Delete
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
      {pendingDelete && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-title"
          >
            <div className={styles.warningIcon}>!</div>
            <p className={styles.modalKicker}>Admin action / permanent</p>
            <h2 id="admin-delete-title">Remove this account?</h2>
            <p className={styles.modalCopy}>
              This permanently deletes the user&apos;s profile, posts, and
              active sessions. This cannot be undone.
            </p>
            <label className={styles.confirmLabel}>
              Type <b>{pendingDelete.name}</b> to confirm
              <input
                autoFocus
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={pendingDelete.name}
              />
            </label>
            <div className={styles.modalActions}>
              <button
                className={styles.cancel}
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDelete}
                disabled={
                  confirmation !== pendingDelete.name || remove.isPending
                }
                onClick={() => {
                  void remove.mutate({ userId: pendingDelete.id });
                  setPendingDelete(null);
                }}
              >
                {remove.isPending ? "Removing..." : "Remove permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
