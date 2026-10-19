export type RegisterPayload = {
  nickname: string;
  email: string;
  password: string;
  avatar: File | null;
  banner: File | null;
};

/**
 * Cadastro de usuário.
 *
 * SIMULADO: o backend ainda não tem autenticação nem upload (escopo da V2).
 * Quando existir, envie como multipart (arquivos não vão em JSON):
 *
 *   const body = new FormData();
 *   body.append("nickname", payload.nickname);
 *   body.append("email", payload.email);
 *   body.append("password", payload.password);
 *   if (payload.avatar) body.append("avatar", payload.avatar);
 *   if (payload.banner) body.append("banner", payload.banner);
 *   const res = await fetch(`${API_URL}/api/auth/register`, { method: "POST", body });
 *   if (!res.ok) throw new Error((await res.json()).message ?? "Falha no cadastro");
 *
 * Não defina Content-Type manualmente: o navegador cria o boundary sozinho.
 */
export async function registerUser(payload: RegisterPayload): Promise<void> {
  void payload; // não registre a senha em logs
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
