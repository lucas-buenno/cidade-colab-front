/**
 * Persistência de sessão em localStorage.
 *
 * Risco de XSS: qualquer script injetado na origem pode ler o JWT.
 * Mitigações: nunca renderizar HTML cru de input; escapar via React;
 * não logar token/senha; sanitizar strings exibidas.
 */
const TOKEN_KEY = "cidade-colab.accessToken";

export function readAccessToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeAccessToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}
