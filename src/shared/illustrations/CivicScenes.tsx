type SceneProps = {
  className?: string;
  title?: string;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IllustrationNeighbors({ className, title }: SceneProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <rect x="20" y="204" width="320" height="16" fill="#1b190d" />
      <rect x="36" y="86" width="92" height="118" fill="#fcff05" stroke="#1b190d" strokeWidth="3" />
      <rect x="228" y="58" width="96" height="146" fill="#ffffff" stroke="#1b190d" strokeWidth="3" />
      <rect x="52" y="108" width="28" height="28" fill="#1b190d" />
      <rect x="84" y="108" width="28" height="28" fill="#1b190d" />
      <rect x="248" y="82" width="24" height="24" fill="#1b190d" />
      <rect x="284" y="82" width="24" height="24" fill="#1b190d" />
      <rect x="248" y="118" width="24" height="24" fill="#1b190d" />
      <rect x="108" y="132" width="44" height="44" fill="#fedbff" stroke="#1b190d" strokeWidth="3" />
      <rect x="196" y="124" width="44" height="44" fill="#f634f9" stroke="#1b190d" strokeWidth="3" />
      <rect x="116" y="176" width="28" height="28" fill="#1b190d" />
      <rect x="204" y="168" width="28" height="36" fill="#1b190d" />
    </svg>
  );
}

export function IllustrationStreetlight({ className, title }: SceneProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <rect x="24" y="208" width="312" height="16" fill="#1b190d" />
      <rect x="64" y="56" width="16" height="152" fill="#1b190d" />
      <rect x="64" y="56" width="88" height="16" fill="#1b190d" />
      <rect x="136" y="48" width="40" height="32" fill="#fcff05" stroke="#1b190d" strokeWidth="3" />
      <rect x="176" y="112" width="48" height="48" fill="#ffffff" stroke="#1b190d" strokeWidth="3" />
      <rect x="188" y="124" width="8" height="8" fill="#1b190d" />
      <rect x="204" y="124" width="8" height="8" fill="#1b190d" />
      <rect x="168" y="160" width="64" height="48" fill="#f634f9" stroke="#1b190d" strokeWidth="3" />
      <rect x="232" y="148" width="48" height="32" fill="#fcff05" stroke="#1b190d" strokeWidth="3" />
    </svg>
  );
}

export function IllustrationPothole({ className, title }: SceneProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <ellipse cx="210" cy="198" rx="78" ry="22" fill="var(--muted)" />
      <ellipse cx="210" cy="198" rx="42" ry="14" fill="#3d3a36" />
      <circle cx="118" cy="118" r="26" fill="#8d5524" />
      <path d="M100 108c12-20 40-16 44 6" fill="#6b3a2a" />
      <circle cx="110" cy="114" r="2.2" fill="currentColor" />
      <circle cx="126" cy="114" r="2.2" fill="currentColor" />
      <path d="M110 128c8 6 18 6 24 0" {...stroke} />
      <path d="M98 150c-4 32 16 56 28 56h30s10-24 6-46z" fill="var(--color-secondary)" />
      <path d="M148 168c28 8 48 22 62 30" {...stroke} />
      <circle cx="214" cy="198" r="7" fill="var(--color-accent)" />
    </svg>
  );
}

export function IllustrationGarden({ className, title }: SceneProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <rect x="36" y="196" width="288" height="18" rx="8" fill="var(--color-primary)" />
      <path d="M86 196c0-40 18-70 18-70s18 30 18 70" fill="var(--color-secondary)" />
      <path d="M250 196c0-48 22-84 22-84s22 36 22 84" fill="var(--color-accent)" />
      <circle cx="104" cy="118" r="10" fill="var(--color-mustard)" />
      <circle cx="272" cy="104" r="10" fill="var(--color-mustard)" />
      <circle cx="176" cy="116" r="24" fill="#f5d0c5" />
      <path d="M160 108c10-18 36-14 38 6" fill="#d4a017" />
      <circle cx="168" cy="114" r="2.2" fill="currentColor" />
      <circle cx="184" cy="114" r="2.2" fill="currentColor" />
      <path d="M168 126c6 6 16 6 22 0" {...stroke} />
      <path d="M156 146c-2 30 14 50 22 50h24s8-18 6-40z" fill="var(--color-mustard)" />
      <path d="M200 158c18-4 32 8 40 22" {...stroke} />
      <path d="M240 176c8 6 4 18-6 16" fill="var(--color-secondary)" />
    </svg>
  );
}

export function IllustrationWelcome({ className, title }: SceneProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <rect x="40" y="40" width="280" height="180" fill="#ffffff" stroke="#1b190d" strokeWidth="3" />
      <rect x="64" y="64" width="72" height="72" fill="#f634f9" stroke="#1b190d" strokeWidth="3" />
      <rect x="144" y="56" width="80" height="80" fill="#fcff05" stroke="#1b190d" strokeWidth="3" />
      <rect x="232" y="72" width="64" height="64" fill="#fedbff" stroke="#1b190d" strokeWidth="3" />
      <rect x="80" y="152" width="40" height="48" fill="#1b190d" />
      <rect x="164" y="144" width="40" height="56" fill="#1b190d" />
      <rect x="244" y="152" width="40" height="48" fill="#1b190d" />
    </svg>
  );
}

export function IllustrationEmptyFeed({ className, title }: SceneProps) {
  return (
    <svg
      viewBox="0 0 360 220"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <rect x="28" y="176" width="304" height="16" fill="#1b190d" />
      <rect x="48" y="36" width="168" height="128" fill="#ffffff" stroke="#1b190d" strokeWidth="3" />
      <rect x="68" y="56" width="80" height="12" fill="#1b190d" />
      <rect x="68" y="80" width="128" height="8" fill="#fedbff" stroke="#1b190d" strokeWidth="2" />
      <rect x="68" y="100" width="104" height="8" fill="#fedbff" stroke="#1b190d" strokeWidth="2" />
      <rect x="68" y="120" width="72" height="8" fill="#fcff05" stroke="#1b190d" strokeWidth="2" />
      <rect x="236" y="72" width="76" height="76" fill="#f634f9" stroke="#1b190d" strokeWidth="3" />
      <rect x="256" y="92" width="36" height="36" fill="#fcff05" stroke="#1b190d" strokeWidth="3" />
      <rect x="88" y="148" width="28" height="28" fill="#1b190d" />
      <rect x="252" y="148" width="28" height="28" fill="#1b190d" />
    </svg>
  );
}

export function IllustrationSuccess({ className, title }: SceneProps) {
  return (
    <svg
      viewBox="0 0 360 260"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="180" cy="128" r="86" fill="var(--color-primary)" />
      <circle cx="148" cy="120" r="24" fill="#e8b896" />
      <circle cx="212" cy="120" r="24" fill="#8d5524" />
      <path d="M132 112c8-16 28-12 32 4" fill="#2c1b18" />
      <path d="M196 110c10-16 30-10 32 6" fill="#121212" />
      <path d="M140 132c6 8 16 8 22 0" {...stroke} />
      <path d="M204 132c6 8 16 8 22 0" {...stroke} />
      <path d="M168 148c8 10 16 10 24 0" {...stroke} />
      <path d="M126 168c10 10 28 18 54 18s44-8 54-18" {...stroke} />
    </svg>
  );
}

export function IllustrationAuth({ className, title }: SceneProps) {
  return (
    <svg
      viewBox="0 0 360 200"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <rect x="20" y="28" width="320" height="148" rx="16" fill="var(--color-primary)" />
      <circle cx="120" cy="108" r="28" fill="#c68642" />
      <path d="M98 98c12-22 44-18 48 6" fill="#2c1b18" />
      <circle cx="112" cy="104" r="2.4" fill="currentColor" />
      <circle cx="128" cy="104" r="2.4" fill="currentColor" />
      <path d="M112 118c8 7 18 6 24-1" {...stroke} />
      <path d="M96 142c-2 22 14 36 26 36h28s8-14 6-28z" fill="var(--color-accent)" />
      <rect x="176" y="72" width="128" height="16" rx="8" fill="var(--surface)" />
      <rect x="176" y="100" width="96" height="16" rx="8" fill="var(--surface)" />
      <rect x="176" y="128" width="72" height="22" rx="8" fill="var(--color-mustard)" />
    </svg>
  );
}
