"use client";

const TOKEN_KEY = "caminho_seguro_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Tenta ler do Cookie primeiro (prioridade para bater com o servidor)
  const match = document.cookie.match(new RegExp("(^| )" + TOKEN_KEY + "=([^;]+)"));
  if (match) {
    return match[2];
  }

  // 2. Fallback para o localStorage
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  // Salva no localStorage para manter a compatibilidade com o client-side
  localStorage.setItem(TOKEN_KEY, token);

  // O SEGREDO: Salva também como Cookie para o Next.js conseguir ler na proteção de rota
  // path=/ garante que todas as telas da aplicação consigam ler a sessão
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);

  // Remove o cookie definindo uma data de validade no passado
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options?.headers);

  if (!headers.has("content-type") && !(options?.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
}
