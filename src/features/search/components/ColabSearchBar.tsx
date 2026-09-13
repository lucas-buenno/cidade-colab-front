import { Check } from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import filterListUrl from "@/assets/icons/filter-list.svg";
import searchFieldHandleUrl from "@/assets/icons/search-field-handle.svg";
import searchFieldRingUrl from "@/assets/icons/search-field-ring.svg";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { pickFeaturedCategories } from "@/features/search/featuredCategories";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { Button } from "@/shared/components/Button";
import { messages } from "@/shared/i18n/pt-BR";
import { formatCategoryGroup } from "@/shared/utils/categoryGroup";
import type { CategoryResponse } from "@/shared/types/colab";

const MAX_QUERY_LENGTH = 200;
const MD_MEDIA_QUERY = "(min-width: 768px)";
const CHIP_GAP_PX = 8;
const FILTER_BUTTON_PX = 30;

export type ColabSearchValue = {
  q: string;
  nearMe: boolean;
  lat: number | null;
  lng: number | null;
  categories: string[];
};

type Props = {
  value: ColabSearchValue;
  onChange: (next: ColabSearchValue) => void;
};

function chipClass(selected: boolean) {
  return `inline-flex shrink-0 items-center justify-center rounded-[4px] border border-black px-4 py-2 text-[12px] leading-none font-semibold tracking-[-0.6px] text-black shadow-[2px_2px_0_0_black] ${
    selected ? "bg-feed-yellow" : "bg-white"
  }`;
}

function SearchFieldGlyph() {
  return (
    <span className="relative block size-[13.091px]" aria-hidden="true">
      <img
        src={searchFieldRingUrl}
        alt=""
        width={11.1692}
        height={11.1693}
        className="absolute top-[8.33%] left-[8.33%] block h-[11.1693px] w-[11.1692px] max-w-none"
      />
      <img
        src={searchFieldHandleUrl}
        alt=""
        width={3.28585}
        height={3.28077}
        className="absolute top-[73.78%] left-[71.83%] block h-[3.28077px] w-[3.28585px] max-w-none"
      />
    </span>
  );
}

export function ColabSearchBar({ value, onChange }: Props) {
  const searchId = useId();
  const categoriesQuery = useCategories();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const categories = categoriesQuery.data ?? [];
  const featured = useMemo(
    () => pickFeaturedCategories(categories),
    [categories],
  );
  const featuredSlugs = useMemo(
    () => new Set(featured.map((category) => category.slug)),
    [featured],
  );
  const extraCategories = useMemo(
    () => categories.filter((category) => !featuredSlugs.has(category.slug)),
    [categories, featuredSlugs],
  );
  const orderedExtras = useMemo(() => {
    const selected = extraCategories.filter((category) =>
      value.categories.includes(category.slug),
    );
    const rest = extraCategories.filter(
      (category) => !value.categories.includes(category.slug),
    );
    return [...selected, ...rest];
  }, [extraCategories, value.categories]);

  const extrasRowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MD_MEDIA_QUERY).matches : false,
  );
  const [visibleExtraSlugs, setVisibleExtraSlugs] = useState<string[]>([]);

  useEffect(() => {
    const media = window.matchMedia(MD_MEDIA_QUERY);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    if (!isDesktop) {
      setVisibleExtraSlugs([]);
      return;
    }

    const row = extrasRowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;

    const update = () => {
      const extraNodes = [...measure.children] as HTMLElement[];
      const extraWidths = extraNodes.map((node) => node.offsetWidth);
      const extraSlugs = extraNodes.map((node) => node.dataset.slug ?? "");
      const featuredWidth = [...row.querySelectorAll("[data-featured-chip]")].reduce(
        (sum, node) => sum + (node as HTMLElement).offsetWidth,
        0,
      );

      const fits = (indices: number[], withFilter: boolean) => {
        const itemCount = featured.length + indices.length + (withFilter ? 1 : 0);
        const gaps = Math.max(0, itemCount - 1) * CHIP_GAP_PX;
        const extrasWidth = indices.reduce(
          (sum, index) => sum + extraWidths[index],
          0,
        );
        const filterWidth = withFilter ? FILTER_BUTTON_PX : 0;
        return (
          featuredWidth + extrasWidth + filterWidth + gaps <=
          row.clientWidth + 0.5
        );
      };

      const pack = (withFilter: boolean) => {
        const indices: number[] = [];
        for (let index = 0; index < extraWidths.length; index += 1) {
          if (fits([...indices, index], withFilter)) {
            indices.push(index);
          }
        }
        return indices;
      };

      const allIndices = extraWidths.map((_, index) => index);
      const chosen = fits(allIndices, false) ? allIndices : pack(true);
      const nextSlugs = chosen
        .map((index) => extraSlugs[index])
        .filter(Boolean);
      setVisibleExtraSlugs((current) =>
        current.length === nextSlugs.length &&
        current.every((slug, index) => slug === nextSlugs[index])
          ? current
          : nextSlugs,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [isDesktop, orderedExtras, featured.length]);

  const visibleExtraSlugSet = useMemo(
    () => new Set(visibleExtraSlugs),
    [visibleExtraSlugs],
  );
  const visibleExtras = isDesktop
    ? orderedExtras.filter((category) => visibleExtraSlugSet.has(category.slug))
    : [];
  const overflowCategories = isDesktop
    ? orderedExtras.filter((category) => !visibleExtraSlugSet.has(category.slug))
    : extraCategories;
  const extraSelectedCount = value.categories.filter((slug) =>
    overflowCategories.some((category) => category.slug === slug),
  ).length;
  const filterSelected = extraSelectedCount > 0;
  const showFilterButton = !isDesktop || overflowCategories.length > 0;

  const groupedExtras = useMemo(() => {
    const map = new Map<string, CategoryResponse[]>();
    for (const category of overflowCategories) {
      const list = map.get(category.group) ?? [];
      list.push(category);
      map.set(category.group, list);
    }
    return [...map.entries()].sort(([a], [b]) =>
      formatCategoryGroup(a).localeCompare(formatCategoryGroup(b), "pt-BR"),
    );
  }, [overflowCategories]);

  const overflowSlugs = useMemo(
    () => new Set(overflowCategories.map((category) => category.slug)),
    [overflowCategories],
  );

  const clearSheetFilters = () => {
    onChange({
      ...valueRef.current,
      categories: valueRef.current.categories.filter(
        (slug) => !overflowSlugs.has(slug),
      ),
    });
  };

  const toggleCategory = (slug: string) => {
    if (value.categories.includes(slug)) {
      onChange({
        ...value,
        categories: value.categories.filter((item) => item !== slug),
      });
      return;
    }
    onChange({ ...value, categories: [...value.categories, slug] });
  };

  const toggleNearMe = () => {
    if (valueRef.current.nearMe) {
      setGeoError(null);
      setLocating(false);
      onChange({ ...valueRef.current, nearMe: false, lat: null, lng: null });
      return;
    }

    if (!navigator.geolocation) {
      setGeoError(messages.feed.search.geoDenied);
      return;
    }

    setLocating(true);
    setGeoError(null);
    onChange({ ...valueRef.current, nearMe: true, lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onChange({
          ...valueRef.current,
          nearMe: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        onChange({
          ...valueRef.current,
          nearMe: false,
          lat: null,
          lng: null,
        });
        setGeoError(messages.feed.search.geoDenied);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  useEffect(() => {
    if (!sheetOpen) return;
    const first = document.getElementById(`${searchId}-sheet-option`);
    first?.focus();
  }, [sheetOpen, searchId]);

  return (
    <div className="flex w-full flex-col gap-4">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="relative flex w-full items-center rounded-[4px] border-2 border-field-ink bg-white px-4 py-3 shadow-[2px_2px_0_0_black]"
      >
        <label htmlFor="colab-search" className="sr-only">
          {messages.feed.search.label}
        </label>
        <input
          id="colab-search"
          type="search"
          value={value.q}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(event) =>
            onChange({ ...value, q: event.target.value.slice(0, MAX_QUERY_LENGTH) })
          }
          placeholder={messages.feed.search.placeholder}
          className="min-w-0 flex-1 bg-transparent pr-8 text-[16px] tracking-[-0.8px] text-black outline-none placeholder:text-field-placeholder"
        />
        <span className="pointer-events-none absolute top-[9px] right-3 inline-flex p-[5.455px]">
          <SearchFieldGlyph />
        </span>
      </form>

      <div className="flex w-full items-end gap-2 overflow-x-auto md:overflow-hidden">
        <button
          type="button"
          aria-pressed={value.nearMe}
          aria-busy={locating}
          onClick={toggleNearMe}
          className={chipClass(value.nearMe)}
        >
          {messages.feed.search.nearMe}
        </button>

        <div className="flex h-[30px] shrink-0 items-center px-1">
          <span className="h-[27px] w-px bg-black" aria-hidden="true" />
        </div>

        <div
          ref={extrasRowRef}
          className="relative flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto md:overflow-hidden"
        >
            <div
              ref={measureRef}
              className="pointer-events-none invisible absolute top-0 right-0 flex gap-2"
              aria-hidden="true"
            >
              {orderedExtras.map((category) => (
                <span
                  key={category.slug}
                  data-slug={category.slug}
                  className={chipClass(false)}
                >
                  {category.name}
                </span>
              ))}
            </div>

          {featured.map((category) => {
            const selected = value.categories.includes(category.slug);
            return (
              <button
                key={category.slug}
                type="button"
                data-featured-chip=""
                aria-pressed={selected}
                onClick={() => toggleCategory(category.slug)}
                className={chipClass(selected)}
              >
                {category.name}
              </button>
            );
          })}

            {visibleExtras.map((category) => {
              const selected = value.categories.includes(category.slug);
              return (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category.slug)}
                  className={chipClass(selected)}
                >
                  {category.name}
                </button>
              );
            })}

            {showFilterButton ? (
              <button
                type="button"
                aria-pressed={filterSelected}
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
                aria-label={messages.feed.search.moreFilters}
                onClick={() => setSheetOpen(true)}
                className={`inline-flex size-[30px] shrink-0 items-center justify-center rounded-[4px] border border-feed-ink shadow-[2px_3px_0_0_#0d0d0d] ${
                  filterSelected ? "bg-feed-yellow" : "bg-white"
                }`}
              >
                <img
                  src={filterListUrl}
                  alt=""
                  width={16}
                  height={16}
                  className="block size-4"
                  aria-hidden="true"
                />
              </button>
            ) : null}
        </div>
      </div>

      {geoError ? (
        <p role="alert" className="text-base text-destructive">
          {geoError}
        </p>
      ) : null}

      <BottomSheet
        open={sheetOpen}
        title={messages.feed.search.filtersTitle}
        onClose={closeSheet}
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              disabled={extraSelectedCount === 0}
              onClick={clearSheetFilters}
              className="min-w-0 flex-1 px-2 !text-lg"
            >
              {messages.feed.search.clearFilters}
            </Button>
            <Button
              type="button"
              fullWidth={false}
              onClick={closeSheet}
              className="min-w-0 flex-1 px-2 !text-lg"
            >
              {messages.feed.search.filtersDone}
            </Button>
          </div>
        }
      >
        {categoriesQuery.isLoading ? (
          <p className="px-2 py-3 text-base text-field-ink">
            {messages.create.categoriesLoading}
          </p>
        ) : categoriesQuery.isError ? (
          <p className="px-2 py-3 text-base text-destructive">
            {messages.errors.network}
          </p>
        ) : groupedExtras.length === 0 ? (
          <p className="px-2 py-3 text-base text-field-ink">
            {messages.create.noCategories}
          </p>
        ) : (
          <div
            role="listbox"
            aria-multiselectable="true"
            aria-label={messages.feed.search.filtersTitle}
          >
          {groupedExtras.map(([group, items]) => {
            const groupId = `${searchId}-group-${group}`;
            return (
              <div key={group} role="group" aria-labelledby={groupId} className="py-1">
                <p
                  id={groupId}
                  className="px-2 py-1 text-base font-bold text-field-ink"
                >
                  {formatCategoryGroup(group)}
                </p>
                {items.map((category, index) => {
                  const checked = value.categories.includes(category.slug);
                  return (
                    <button
                      key={category.slug}
                      id={index === 0 ? `${searchId}-sheet-option` : undefined}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      onClick={() => toggleCategory(category.slug)}
                      className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-base text-black hover:bg-feed-tag ${
                        checked ? "bg-feed-yellow" : ""
                      }`}
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
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
