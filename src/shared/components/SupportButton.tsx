import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useSessionStore } from "@/features/auth/sessionStore";
import type { SessionUser } from "@/shared/types/auth";
import { useSupportColab } from "@/features/feed/hooks/useSupportColab";
import { useSupportStore } from "@/features/feed/supportStore";
import { messages } from "@/shared/i18n/pt-BR";

const SUPPORT_PERMISSIONS = ["PERM_colabs:support", "colabs:support"];

function hasSupportPermission(user: SessionUser | null): boolean {
  if (!user) return false;
  return (
    user.authorities.some((authority) =>
      SUPPORT_PERMISSIONS.includes(authority),
    ) ||
    user.roles.some((role) => SUPPORT_PERMISSIONS.includes(role))
  );
}

type Props = {
  colabId: string;
  supportCount: number;
};

export function SupportButton({ colabId, supportCount }: Props) {
  const user = useSessionStore((state) => state.user);
  const isAuthenticated = Boolean(user);
  const canSupport = hasSupportPermission(user);
  const isSupported = useSupportStore((state) => state.isSupported(colabId));
  const mutation = useSupportColab();

  const tooltip = !isAuthenticated
    ? messages.feed.support.loginTooltip
    : !canSupport
      ? messages.feed.support.noPermissionTooltip
      : undefined;

  const arrowBtn =
    "inline-flex items-center justify-center rounded-full p-1 transition-colors duration-200 min-h-8 min-w-8";

  const isPending = mutation.isPending;
  const canVote = isAuthenticated && canSupport && !isPending;

  const handleToggle = () => {
    if (!canVote) return;
    mutation.mutate(colabId);
  };

  const handleUnvote = () => {
    if (!canVote || !isSupported) return;
    mutation.mutate(colabId);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5"
        aria-label={`${supportCount} apoios`}
      >
        <button
          type="button"
          aria-pressed={isSupported}
          aria-label={
            isSupported
              ? messages.feed.support.unsupportLabel
              : messages.feed.support.supportLabel
          }
          title={tooltip}
          disabled={!canVote}
          onClick={handleToggle}
          className={
            canVote
              ? isSupported
                ? `${arrowBtn} text-accent hover:bg-accent/10`
                : `${arrowBtn} text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground`
              : `${arrowBtn} cursor-not-allowed text-muted-foreground`
          }
        >
          <CaretUp
            className="size-5"
            weight={isSupported ? "fill" : "regular"}
            aria-hidden="true"
          />
        </button>

        <span
          className={`min-w-[1.5rem] select-none text-center text-sm font-bold ${
            canVote ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {supportCount}
        </span>

        <button
          type="button"
          aria-pressed={false}
          aria-label={messages.feed.support.unsupportLabel}
          title={tooltip}
          disabled={!canVote || !isSupported}
          onClick={handleUnvote}
          className={
            canVote && isSupported
              ? `${arrowBtn} text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground`
              : `${arrowBtn} cursor-not-allowed text-muted-foreground`
          }
        >
          <CaretDown
            className="size-5"
            weight="regular"
            aria-hidden="true"
          />
        </button>
      </div>

      {mutation.isError ? (
        <span className="max-w-[10rem] text-center text-xs text-destructive">
          {mutation.error.message}
        </span>
      ) : null}
    </div>
  );
}
