import { useIsMutating } from "@tanstack/react-query";
import { useSessionStore } from "@/features/auth/sessionStore";
import type { SessionUser } from "@/shared/types/auth";
import { HandshakeIcon } from "@/shared/components/HandshakeIcon";
import {
  COLAB_SUPPORT_MUTATION_KEY,
  useSupportColab,
} from "@/features/feed/hooks/useSupportColab";
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

function supportCountLabel(count: number): string {
  if (count === 1) return messages.feed.support.countOne;
  return messages.feed.support.countMany.replace("{count}", String(count));
}

type Props = {
  colabId: string;
  supportCount: number;
  supportedByMe: boolean;
  prominent?: boolean;
};

export function SupportButton({
  colabId,
  supportCount,
  supportedByMe,
  prominent = false,
}: Props) {
  const user = useSessionStore((state) => state.user);
  const isAuthenticated = Boolean(user);
  const canSupport = hasSupportPermission(user);
  const isSupported = isAuthenticated && supportedByMe === true;
  const mutation = useSupportColab();
  const pendingForThisColab = useIsMutating({
    mutationKey: COLAB_SUPPORT_MUTATION_KEY,
    predicate: (pending) => pending.state.variables === colabId,
  });

  const tooltip = !isAuthenticated
    ? messages.feed.support.loginTooltip
    : !canSupport
      ? messages.feed.support.noPermissionTooltip
      : undefined;

  const isPending = pendingForThisColab > 0;
  const canVote = isAuthenticated && canSupport && !isPending;
  const countText = supportCountLabel(supportCount);

  const handleToggle = () => {
    if (!canVote) return;
    mutation.mutate(colabId);
  };

  return (
    <div className={`flex flex-col ${prominent ? "w-full" : "items-start"}`}>
      <button
        type="button"
        aria-pressed={isSupported}
        aria-busy={isPending}
        aria-label={
          isSupported
            ? `${messages.feed.support.unsupportLabel}, ${supportCount}`
            : `${messages.feed.support.supportLabel}, ${supportCount}`
        }
        title={tooltip}
        disabled={!canVote}
        onClick={handleToggle}
        className={`motion-press inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-black px-2 py-1 text-[16px] leading-none font-semibold tracking-[-0.8px] text-black shadow-[0px_1px_0px_0px_black] hover:translate-y-px hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 ${
          prominent ? "w-full" : ""
        } ${isSupported ? "bg-feed-yellow" : "bg-white"}`}
      >
        <HandshakeIcon active={isSupported} />
        <span>{countText}</span>
      </button>

      {mutation.isError && mutation.variables === colabId ? (
        <span className="mt-1 max-w-[16rem] text-xs text-destructive">
          {mutation.error.message}
        </span>
      ) : null}
    </div>
  );
}
