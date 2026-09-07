"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Navbar } from "~/app/components/navbar";
import styles from "./signup.module.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await signIn("credentials", {
      action: "signup",
      name,
      email,
      callbackUrl: "/home",
    });
    if (result?.error)
      setMessage(
        "That email is already registered, or the details are invalid.",
      );
  }
  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.panel}>
        <p className={styles.kicker}>First time here?</p>
        <h1>Sign up.</h1>
        <form onSubmit={submit}>
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={3}
              placeholder="Your name"
            />
          </label>
          <label>
            School email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@students.wcpss.net"
            />
          </label>
          <button type="submit">
            Create account <span>↗</span>
          </button>
          {message && <p className={styles.message}>{message}</p>}
        </form>
        <p className={styles.switch}>
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
