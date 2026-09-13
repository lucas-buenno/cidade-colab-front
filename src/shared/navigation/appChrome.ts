export const APP_CHROME_HIDDEN_PATHS = [
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/redefinir-senha",
  "/bem-vindo",
] as const;

export function isAppChromeHidden(pathname: string) {
  return (APP_CHROME_HIDDEN_PATHS as readonly string[]).includes(pathname);
}
