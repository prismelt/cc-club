"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Navbar } from "~/app/components/navbar";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await signIn("credentials", {
      action: "login",
      email,
      redirect: false,
    });
    if (result?.ok === true) {
      router.push("/home");
      router.refresh();
    } else {
      setMessage("No account found for that email. Sign up first.");
    }
  }
  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.panel}>
        <p className={styles.kicker}>Welcome back</p>
        <h1>Log in.</h1>
        <form onSubmit={submit}>
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
            Enter the club <span>↗</span>
          </button>
          {message && <p className={styles.message}>{message}</p>}
        </form>
        <p className={styles.switch}>
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
