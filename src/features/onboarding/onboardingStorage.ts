const ONBOARDING_KEY = "cidadecolab:onboarding";

export function markOnboardingSeen() {
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
  } catch {
    /* ignore quota */
  }
}

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return true;
  }
}
