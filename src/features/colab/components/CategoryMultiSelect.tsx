import { Check, MagnifyingGlass, Tag, X } from "@phosphor-icons/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { messages } from "@/shared/i18n/pt-BR";
import { formatCategoryGroup } from "@/shared/utils/categoryGroup";
import type { CategoryResponse } from "@/shared/types/colab";

type Props = {
  id: string;
  value: string[];
  onChange: (slugs: string[]) => void;
  error?: string;
};

function matchesQuery(category: CategoryResponse, query: string): boolean {
  if (!query) return true;
  const haystack = [
    category.name,
    category.slug,
    category.description,
    ...category.keywords,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function CategoryMultiSelect({ id, value, onChange, error }: Props) {
  const listboxId = useId();
  const searchId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const categoriesQuery = useCategories();

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const categories = categoriesQuery.data ?? [];
  const selected = useMemo(
    () => categories.filter((category) => value.includes(category.slug)),
    [categories, value],
  );

  const grouped = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const map = new Map<string, CategoryResponse[]>();
    for (const category of categories) {
      if (!matchesQuery(category, normalized)) continue;
      const list = map.get(category.group) ?? [];
      list.push(category);
      map.set(category.group, list);
    }
    return [...map.entries()].sort(([a], [b]) =>
      formatCategoryGroup(a).localeCompare(formatCategoryGroup(b), "pt-BR"),
    );
  }, [categories, query]);

  const toggle = (slug: string) => {
    if (value.includes(slug)) {
      onChange(value.filter((item) => item !== slug));
      return;
    }
    onChange([...value, slug]);
  };

  const errorId = error ? `${id}-error` : undefined;

  return (
    <div ref={rootRef} className="relative min-w-0">
      <div className="flex flex-wrap gap-2">
        {selected.map((category) => (
          <span
            key={category.slug}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-sm text-foreground"
          >
            <span className="min-w-0 truncate whitespace-nowrap">
              {category.name}
            </span>
            <button
              type="button"
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-card hover:text-foreground"
              aria-label={`${messages.create.removeCategory} ${category.name}`}
              onClick={() =>
                onChange(value.filter((slug) => slug !== category.slug))
              }
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          aria-label={messages.create.selectCategoryAria}
          onClick={() => setOpen((current) => !current)}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm font-bold text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground ${
            error ? "border-destructive" : "border-border"
          }`}
        >
          <Tag className="size-4 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">{messages.create.addTags}</span>
        </button>
      </div>

      {open ? (
        <div
          className="absolute left-0 z-30 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-border bg-card p-2 shadow-lg"
          role="presentation"
        >
          <label htmlFor={searchId} className="sr-only">
            {messages.create.searchCategory}
          </label>
          <div className="relative">
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id={searchId}
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={messages.create.searchCategory}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={messages.create.selectCategoryAria}
            className="mt-2 max-h-72 overflow-auto"
          >
            {categoriesQuery.isLoading ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                {messages.create.categoriesLoading}
              </p>
            ) : grouped.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                {messages.create.noCategories}
              </p>
            ) : (
              grouped.map(([group, items]) => {
                const groupId = `${id}-group-${group}`;
                return (
                  <div
                    key={group}
                    role="group"
                    aria-labelledby={groupId}
                    className="py-1"
                  >
                    <p
                      id={groupId}
                      className="px-2 py-1 text-xs font-bold tracking-wide text-muted-foreground uppercase"
                    >
                      {formatCategoryGroup(group)}
                    </p>
                    {items.map((category) => {
                      const checked = value.includes(category.slug);
                      return (
                        <button
                          key={category.slug}
                          type="button"
                          role="option"
                          aria-selected={checked}
                          onClick={() => toggle(category.slug)}
                          className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-sm text-foreground transition-colors duration-200 hover:bg-muted"
                        >
                          <span
                            className={`inline-flex size-5 shrink-0 items-center justify-center rounded border ${
                              checked
                                ? "border-accent bg-accent text-on-accent"
                                : "border-border bg-card"
                            }`}
                          >
                            {checked ? (
                              <Check className="size-3.5" aria-hidden="true" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold">
                              {category.name}
                            </span>
                            {category.description ? (
                              <span className="block truncate text-xs text-muted-foreground">
                                {category.description}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      <p
        id={errorId}
        role={error ? "alert" : undefined}
        aria-live="polite"
        className="min-h-5 text-sm text-destructive"
      >
        {error ?? ""}
      </p>
    </div>
  );
}
