export type RegisterPayload = {
  nickname: string;
  email: string;
  password: string;
  avatar: File | null;
  banner: File | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  nickname: string;
  email: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
};

/**
 * Erro das rotas /api/auth. Diferente do ApiError de services/api.ts:
 * aqui os erros de campo vêm como { campo: "mensagem" } (um texto por campo).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

export const API_URL: string = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

/** A API devolve caminhos relativos (/uploads/...). Aqui viram URLs completas. */
export function assetUrl(path: string | null | undefined): string | null {
  return path ? `${API_URL}${path}` : null;
}

type ErrorBody = { message?: string; errors?: Record<string, string> };

/** fetch com cookie de sessão. Falha de rede vira ApiError (status 0) com mensagem amigável. */
async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, { ...init, credentials: "include" });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Tente novamente.", 0);
  }
}

async function toApiError(res: Response, fallback: string): Promise<ApiError> {
  const data = (await res.json().catch(() => ({}))) as ErrorBody;
  return new ApiError(data.message ?? fallback, res.status, data.errors ?? {});
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const body = new FormData();
  body.append("nickname", payload.nickname);
  body.append("email", payload.email);
  body.append("password", payload.password);
  if (payload.avatar) body.append("avatar", payload.avatar);
  if (payload.banner) body.append("banner", payload.banner);

  // Não defina Content-Type: o navegador cria o boundary do multipart sozinho.
  const res = await apiFetch("/api/auth/register", { method: "POST", body });
  if (!res.ok) throw await toApiError(res, "Não foi possível criar a conta.");
}

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toApiError(res, "Não foi possível entrar.");
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

/** Retorna o usuário logado, ou null se não houver sessão (401 não é erro, é um estado). */
export async function fetchMe(): Promise<AuthUser | null> {
  const res = await apiFetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw await toApiError(res, "Não foi possível verificar sua sessão.");
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function logoutUser(): Promise<void> {
  const res = await apiFetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw await toApiError(res, "Não foi possível sair.");
}
