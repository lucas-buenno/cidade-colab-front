const PALETTE = ["#D6FF3E", "#B8A8FF", "#FF6B5B", "#F5C542"] as const;

export function authorColor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
