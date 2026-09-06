"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

import styles from "~/styles/index.module.css";

export default function Home() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");

  async function enterClub(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (mode === "signup" && name.trim().length < 3) {
      setMessage("Your name needs at least three characters.");
      return;
    }
    const result = await signIn("credentials", {
      action: mode,
      ...(mode === "signup" ? { name } : {}),
      email,
      redirect: false,
    });
    if (result?.error) {
      setMessage(
        mode === "signup"
          ? "That email is already registered, or the details are invalid."
          : "No account found for that email. Sign up first.",
      );
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.aurora} aria-hidden="true" />
      <nav className={styles.nav}>
        <span className={styles.mark}>
          C<span>/</span>C
        </span>
        <span className={styles.navLabel}>Green Level / 2026</span>
      </nav>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <span /> After school / in session
        </div>
        <h1>
          Make Something
          <em>Unexpected.</em>
        </h1>
        <br />
        <p className={styles.intro}>
          Small club, big ideas, and people curious and capable enough to ship
          them.
        </p>
        <div className={styles.orbit} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={styles.panel}>
          {session?.user ? (
            <div className={styles.welcome}>
              <div>
                <span className={styles.statusDot} /> You are on the list
              </div>
              <strong>{session.user.name}</strong>
              <p>Your seat is saved. See you after the bell.</p>
              <div className={styles.actions}>
                <button
                  className={styles.button}
                  onClick={() => void signOut({ callbackUrl: "/" })}
                >
                  Log out
                </button>
                <button
                  className={styles.textButton}
                  onClick={() => void signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={enterClub}>
              <div className={styles.formHeading}>
                <span className={styles.number}>01</span>
                <div>
                  <strong>{mode === "login" ? "Login" : "Sign up"}</strong>
                  <small>
                    {mode === "login"
                      ? "Welcome back."
                      : "No password. Just show up."}
                  </small>
                </div>
              </div>
              {mode === "signup" && (
                <label>
                  Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="John Smith"
                    autoComplete="name"
                    required
                    minLength={3}
                  />
                </label>
              )}
              {mode === "login" && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    setMode("signup");
                    setMessage("");
                  }}
                >
                  New here? Sign up
                </button>
              )}
              <label>
                School email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@students.wcpss.net"
                  autoComplete="email"
                  required
                />
              </label>
              <button className={styles.button} type="submit">
                {mode === "login" ? "Log in" : "Create account"} <span>↗</span>
              </button>
              {message && <p className={styles.message}>{message}</p>}
              {mode === "signup" && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  Already registered? Log in
                </button>
              )}
            </form>
          )}
        </div>
      </section>
      <footer>
        <span>01 — 04</span>
        <span>
          Build things together <b>✳</b>
        </span>
      </footer>
    </main>
  );
}
