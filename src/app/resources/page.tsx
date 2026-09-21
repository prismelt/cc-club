"use client";

import { useSession } from "next-auth/react";
import { type FormEvent, useState } from "react";

import { Navbar } from "~/app/components/navbar";
import { api } from "~/trpc/react";
import styles from "./resources.module.css";

const RESOURCE_TYPES = [
  "guide",
  "resource",
  "reference",
  "demo",
  "opportunity",
] as const;

const BRAND_OPTIONS = [
  "none",
  "president suggested",
  "exclusive partnership",
] as const;

const defaultForm = {
  type: "guide" as (typeof RESOURCE_TYPES)[number],
  brand: "none" as (typeof BRAND_OPTIONS)[number],
  name: "",
  link: "",
  description: "",
};

const normalizeLabel = (value: string) =>
  value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const isExternalLink = (value: string) =>
  /^https?:\/\//i.test(value) ||
  /^mailto:/i.test(value) ||
  /^www\./i.test(value);

export default function ResourcesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";
  const utils = api.useUtils();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [form, setForm] = useState(defaultForm);

  const resources = api.resource.list.useQuery();

  const createResource = api.resource.create.useMutation({
    onSuccess: async () => {
      setIsFormOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      await utils.resource.list.invalidate();
    },
  });

  const updateResource = api.resource.update.useMutation({
    onSuccess: async () => {
      setIsFormOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      await utils.resource.list.invalidate();
    },
  });

  const deleteResource = api.resource.delete.useMutation({
    onSuccess: async () => {
      setPendingDelete(null);
      setDeleteConfirmation("");
      await utils.resource.list.invalidate();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = form.name.trim();
    const nextLink = form.link.trim();
    const nextDescription = form.description.trim();

    if (!nextName || !nextLink || !nextDescription) {
      return;
    }

    if (editingId !== null) {
      updateResource.mutate({
        id: editingId,
        type: form.type,
        brand: form.brand,
        name: nextName,
        link: nextLink,
        description: nextDescription,
      });
      return;
    }

    createResource.mutate({
      type: form.type,
      brand: form.brand,
      name: nextName,
      link: nextLink,
      description: nextDescription,
    });
  };

  const openEditForm = (resource: {
    id: number;
    type: string;
    brand: string;
    name: string;
    link: string;
    description: string;
  }) => {
    setEditingId(resource.id);
    setForm({
      type: RESOURCE_TYPES.includes(
        resource.type as (typeof RESOURCE_TYPES)[number],
      )
        ? (resource.type as (typeof RESOURCE_TYPES)[number])
        : "guide",
      brand: BRAND_OPTIONS.includes(
        resource.brand as (typeof BRAND_OPTIONS)[number],
      )
        ? (resource.brand as (typeof BRAND_OPTIONS)[number])
        : "none",
      name: resource.name,
      link: resource.link,
      description: resource.description,
    });
    setIsFormOpen(true);
  };

  return (
    <main className={styles.page}>
      <Navbar />
      <section className={styles.content}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.kicker}>A useful shelf</p>
            <h1>
              Resources for
              <br />
              <em>the next attempt.</em>
            </h1>
          </div>
          {isAdmin && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                setForm(defaultForm);
                setEditingId(null);
                setIsFormOpen(true);
              }}
            >
              Add a resource
            </button>
          )}
        </div>

        <div className={styles.grid}>
          {resources.data?.map((resource) => (
            <article className={styles.resourceCard} key={resource.id}>
              {isAdmin && (
                <div className={styles.adminActions}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => openEditForm(resource)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => {
                      setPendingDelete({
                        id: resource.id,
                        name: resource.name,
                      });
                      setDeleteConfirmation("");
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
              <a
                className={styles.resource}
                href={resource.link}
                target={isExternalLink(resource.link) ? "_blank" : undefined}
                rel={isExternalLink(resource.link) ? "noreferrer" : undefined}
              >
                <span>{normalizeLabel(resource.type)}</span>
                {resource.brand !== "none" && (
                  <strong className={styles.banner}>
                    {normalizeLabel(resource.brand)}
                  </strong>
                )}
                <h2>{resource.name} ↗</h2>
                <p>{resource.description}</p>
              </a>
            </article>
          ))}
          {!resources.data?.length && !resources.isLoading && (
            <p className={styles.emptyState}>No resources yet.</p>
          )}
        </div>
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
            aria-labelledby="resource-delete-title"
          >
            <div className={styles.warningBadge}>!</div>
            <p className={styles.modalKicker}>Admin action / permanent</p>
            <h2 id="resource-delete-title">Delete this resource?</h2>
            <p className={styles.modalCopy}>
              This permanently removes <b>{pendingDelete.name}</b> from the
              resources shelf.
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
                  deleteResource.isPending
                }
                onClick={() => deleteResource.mutate({ id: pendingDelete.id })}
              >
                {deleteResource.isPending ? "Deleting..." : "Delete resource"}
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
            if (event.target === event.currentTarget) {
              setIsFormOpen(false);
              setEditingId(null);
              setForm(defaultForm);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-form-title"
          >
            <p className={styles.modalKicker}>Admin / resource</p>
            <h2 id="resource-form-title">
              {editingId !== null ? "Edit resource" : "Add a resource"}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.field}>
                Type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target
                        .value as (typeof RESOURCE_TYPES)[number],
                    }))
                  }
                >
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {normalizeLabel(type)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                Brand
                <select
                  value={form.brand}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brand: event.target
                        .value as (typeof BRAND_OPTIONS)[number],
                    }))
                  }
                >
                  {BRAND_OPTIONS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand === "none" ? "None" : normalizeLabel(brand)}
                    </option>
                  ))}
                </select>
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
                  placeholder="Git Book"
                />
              </label>

              <label className={styles.field}>
                Link
                <input
                  type="text"
                  required
                  value={form.link}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      link: event.target.value,
                    }))
                  }
                  placeholder="https://example.com or /about"
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
                  placeholder="Short practical overview of why this is useful."
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                    setForm(defaultForm);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={
                    createResource.isPending || updateResource.isPending
                  }
                >
                  {createResource.isPending || updateResource.isPending
                    ? "Saving..."
                    : editingId !== null
                      ? "Save changes"
                      : "Save resource"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
