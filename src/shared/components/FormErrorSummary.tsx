type Item = { href: string; label: string };

type Props = {
  title: string;
  items: Item[];
};

export function FormErrorSummary({ title, items }: Props) {
  if (items.length === 0) return null;

  return (
    <div
      id="form-error-summary"
      role="alert"
      tabIndex={-1}
      data-testid="form-error-summary"
      className="rounded-lg border border-destructive bg-destructive/5 p-4"
    >
      <h2 id="form-error-summary-title" className="text-sm font-bold text-destructive">
        {title}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="cursor-pointer underline-offset-2 hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
