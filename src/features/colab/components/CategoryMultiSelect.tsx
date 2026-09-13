import { Check, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import shoppingmodeUrl from "@/assets/icons/shoppingmode.svg";
import { MAX_CREATE_CATEGORIES } from "@/features/colab/draftStorage";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { Button } from "@/shared/components/Button";
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

function useMdUp() {
  const [mdUp, setMdUp] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const apply = () => setMdUp(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return mdUp;
}

export function CategoryMultiSelect({ id, value, onChange, error }: Props) {
  const listboxId = useId();
  const searchId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const categoriesQuery = useCategories();
  const mdUp = useMdUp();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    if (!mdUp) return;
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
  }, [open, mdUp]);

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
    if (value.length >= MAX_CREATE_CATEGORIES) return;
    onChange([...value, slug]);
  };

  const atLimit = value.length >= MAX_CREATE_CATEGORIES;
  const errorId = error ? `${id}-error` : undefined;

  const picker = (
    <>
      <label htmlFor={searchId} className="sr-only">
        {messages.create.searchCategory}
      </label>
      <div className="relative">
        <MagnifyingGlass
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-field-placeholder"
          aria-hidden="true"
        />
        <input
          id={searchId}
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={messages.create.searchCategory}
          className="h-12 w-full rounded border-2 border-field-ink bg-white py-2 pr-3 pl-9 text-base tracking-[-0.8px] text-black shadow-[2px_2px_0_0_#000] outline-none placeholder:text-field-placeholder"
        />
      </div>
      {atLimit ? (
        <p className="mt-2 text-[12px] tracking-[-0.6px] text-field-ink">
          {messages.create.tagsLimit}
        </p>
      ) : null}

      <div
        id={listboxId}
        role="listbox"
        aria-multiselectable="true"
        aria-label={messages.create.selectCategoryAria}
        className="mt-2 max-h-72 overflow-auto"
      >
        {categoriesQuery.isLoading ? (
          <p className="px-2 py-3 text-base text-field-ink">
            {messages.create.categoriesLoading}
          </p>
        ) : grouped.length === 0 ? (
          <p className="px-2 py-3 text-base text-field-ink">
            {messages.create.noCategories}
          </p>
        ) : (
          grouped.map(([group, items]) => {
            const groupId = `${id}-group-${group}`;
            return (
              <div key={group} role="group" aria-labelledby={groupId} className="py-1">
                <p
                  id={groupId}
                  className="px-2 py-1 text-base font-bold text-field-ink"
                >
                  {formatCategoryGroup(group)}
                </p>
                {items.map((category) => {
                  const checked = value.includes(category.slug);
                  const disabled = atLimit && !checked;
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      aria-disabled={disabled}
                      disabled={disabled}
                      onClick={() => toggle(category.slug)}
                      className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-base text-black hover:bg-feed-tag disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <span
                        className={`inline-flex size-5 shrink-0 items-center justify-center rounded border-2 ${
                          checked
                            ? "border-black bg-feed-yellow text-black"
                            : "border-black bg-white"
                        }`}
                      >
                        {checked ? (
                          <Check className="size-3.5" aria-hidden="true" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">
                          {category.name}
                        </span>
                        {category.description ? (
                          <span className="block truncate text-[12px] text-field-ink">
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
    </>
  );

  return (
    <div ref={rootRef} id={id} className="relative min-w-0">
      <div className="flex flex-wrap gap-2">
        {selected.map((category) => (
          <span
            key={category.slug}
            className="inline-flex max-w-full items-center gap-1 rounded-[12px] border-2 border-black bg-feed-tag px-4 py-2 text-[12px] leading-none font-semibold tracking-[-0.6px] text-black uppercase shadow-[2px_2px_0_0_black]"
          >
            <span className="min-w-0 truncate whitespace-nowrap">
              {category.name}
            </span>
            <button
              type="button"
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-black hover:bg-black hover:text-white"
              aria-label={`${messages.create.removeCategory} ${category.name}`}
              onClick={() =>
                onChange(value.filter((slug) => slug !== category.slug))
              }
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        {atLimit ? null : (
        <button
          type="button"
          aria-haspopup={mdUp ? "listbox" : "dialog"}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          aria-label={messages.create.selectCategoryAria}
          onClick={() => setOpen((current) => !current)}
          className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[12px] border-2 bg-white px-4 py-2 text-[12px] leading-none font-semibold tracking-[-0.6px] text-black shadow-[2px_2px_0_0_black] ${
            error ? "border-destructive" : "border-black"
          }`}
        >
          <img
            src={shoppingmodeUrl}
            alt=""
            width={16}
            height={16}
            className="block size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{messages.create.addTags}</span>
        </button>
        )}
      </div>

      {open && mdUp ? (
        <div
          className="absolute top-full left-0 z-30 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border-2 border-black bg-white p-2 shadow-[2px_2px_0_0_black]"
          role="presentation"
        >
          {picker}
        </div>
      ) : null}

      {!mdUp ? (
        <BottomSheet
          open={open}
          title={messages.create.addTags}
          onClose={close}
          footer={
            <Button type="button" onClick={close}>
              {messages.create.tagsDone}
            </Button>
          }
        >
          {picker}
        </BottomSheet>
      ) : null}

      <p
        id={errorId}
        role={error ? "alert" : undefined}
        aria-live="polite"
        className="min-h-6 text-base text-destructive"
      >
        {error ?? ""}
      </p>
    </div>
  );
}
