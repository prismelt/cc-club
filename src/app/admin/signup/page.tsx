"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Navbar } from "~/app/components/navbar";
import styles from "./signup.module.css";

export default function AdminSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", adminCode: "" });
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const result = await signIn("credentials", {
      action: "admin-signup",
      ...form,
      redirect: false,
    });
    if (result?.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setMessage("The details or admin code are invalid.");
    }
  }

  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.panel}>
        <p className={styles.kicker}>Restricted access</p>
        <h1>
          Admin
          <br />
          <em>signup.</em>
        </h1>
        <p className={styles.intro}>
          Create a club administrator account with the private access code.
        </p>
        <form onSubmit={submit}>
          <label>
            Name
            <input
              required
              minLength={3}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </label>
          <label>
            Secret code
            <input
              required
              type="password"
              value={form.adminCode}
              onChange={(event) =>
                setForm({ ...form, adminCode: event.target.value })
              }
            />
          </label>
          <button type="submit">
            Create admin account <span>↗</span>
          </button>
          {message && <p className={styles.message}>{message}</p>}
        </form>
        <Link className={styles.back} href="/login">
          Back to login
        </Link>
      </section>
    </main>
  );
}
