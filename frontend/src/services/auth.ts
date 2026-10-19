export type RegisterPayload = {
  nickname: string;
  email: string;
  password: string;
  avatar: File | null;
  banner: File | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const body = new FormData();
  body.append("nickname", payload.nickname);
  body.append("email", payload.email);
  body.append("password", payload.password);
  if (payload.avatar) body.append("avatar", payload.avatar);
  if (payload.banner) body.append("banner", payload.banner);

  // Não defina Content-Type: o navegador cria o boundary do multipart sozinho.
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    body,
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? "Não foi possível criar a conta.", res.status, data.errors ?? {});
  }
}