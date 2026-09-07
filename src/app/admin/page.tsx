"use client";

import { useSession } from "next-auth/react";

import { Navbar } from "~/app/components/navbar";
import { api } from "~/trpc/react";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { data: session, status } = useSession();
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
              <img src={user.avatar} alt="" />
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
                    if (window.confirm(`Delete ${user.name ?? "this user"}?`))
                      remove.mutate({ userId: user.id });
                  }}
                >
                  Delete
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
