import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { clearAuthCookie, setAuthCookie, signToken } from "../lib/auth";
import type { AuthedRequest } from "../middlewares/auth";
import { MAX_AVATAR_BYTES, removeUploadedFiles } from "../middlewares/upload";
import { AuthError, getUserById, loginUser, registerUser } from "../services/auth.service";

const registerSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, "O nickname deve ter ao menos 3 caracteres.")
    .max(20, "O nickname deve ter no máximo 20 caracteres.")
    .regex(/^[A-Za-z0-9_.-]+$/, "Use apenas letras, números, ponto, hífen e underline."),
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres.")
    .regex(/[A-Za-z]/, "Inclua ao menos uma letra.")
    .regex(/\d/, "Inclua ao menos um número."),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  password: z.string().min(1, "Informe sua senha.").max(72),
});

/** Primeira mensagem de erro de cada campo: { nickname: "...", email: "..." } */
function firstErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function sendAuthError(res: Response, error: AuthError) {
  return res.status(error.status).json({
    message: error.message,
    errors: error.field ? { [error.field]: error.message } : undefined,
  });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  const files = (req.files ?? {}) as Record<string, Express.Multer.File[] | undefined>;
  const avatar = files.avatar?.[0];
  const banner = files.banner?.[0];
  let created = false;

  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Dados inválidos.", errors: firstErrors(parsed.error) });
    }
    if (avatar && avatar.size > MAX_AVATAR_BYTES) {
      const message = "A foto deve ter no máximo 2 MB.";
      return res.status(413).json({ message, errors: { avatar: message } });
    }

    const user = await registerUser({
      ...parsed.data,
      avatarUrl: avatar ? `/uploads/avatars/${avatar.filename}` : null,
      bannerUrl: banner ? `/uploads/banners/${banner.filename}` : null,
    });

    created = true;
    return res.status(201).json({ user });
  } catch (error) {
    if (error instanceof AuthError) return sendAuthError(res, error);
    return next(error);
  } finally {
    // Se o cadastro falhou, não deixa as imagens órfãs no disco.
    if (!created) await removeUploadedFiles([avatar, banner]);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Dados inválidos.", errors: firstErrors(parsed.error) });
    }

    const user = await loginUser(parsed.data.email, parsed.data.password);
    setAuthCookie(res, signToken(user.id));
    return res.json({ user });
  } catch (error) {
    if (error instanceof AuthError) return sendAuthError(res, error);
    return next(error);
  }
}

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.status(204).send();
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserById((req as AuthedRequest).userId);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ message: "Não autenticado." });
    }
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}
