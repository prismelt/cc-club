"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import styles from "./navbar.module.css";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <Link className={styles.logo} href="/">
        C<span>/</span>C
      </Link>
      <nav className={styles.links}>
        <Link href="/about">About</Link>
        <Link href="/vision">Vision</Link>
        <Link href="/presentations">Presentations</Link>
        <Link href="/resources">Resources</Link>
      </nav>
      <div className={styles.account}>
        {session?.user ? (
          <>
            {session.user.role === "admin" && <Link href="/admin">Admin</Link>}
            <Link href="/home">{session.user.name ?? "Profile"}</Link>
            <button onClick={() => void signOut({ callbackUrl: "/" })}>
              Log out
            </button>
          </>
        ) : (
          <Link className={styles.login} href="/login">
            Log in <span>↗</span>
          </Link>
        )}
      </div>
    </header>
  );
}
