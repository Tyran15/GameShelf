import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { clearAuthCookie, setAuthCookie, signToken } from "../lib/auth";
import type { AuthedRequest } from "../middlewares/auth";
import { MAX_AVATAR_BYTES, removeUploadedByUrl, removeUploadedFiles } from "../middlewares/upload";
import { sendPasswordResetEmail } from "../lib/mailer";
import {
  AuthError,
  createPasswordReset,
  getUserById,
  loginUser,
  registerUser,
  resetPasswordWithToken,
  updateUserProfile,
} from "../services/auth.service";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.")
  .regex(/[A-Za-z]/, "Inclua ao menos uma letra.")
  .regex(/\d/, "Inclua ao menos um número.");

const nicknameSchema = z
  .string()
  .trim()
  .min(3, "O nickname deve ter ao menos 3 caracteres.")
  .max(20, "O nickname deve ter no máximo 20 caracteres.")
  .regex(/^[A-Za-z0-9_.-]+$/, "Use apenas letras, números, ponto, hífen e underline.");

const registerSchema = z.object({
  nickname: nicknameSchema,
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
  password: passwordSchema,
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Digite um e-mail válido."),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Link inválido.").max(200, "Link inválido."),
  password: passwordSchema,
});

// Campos de texto do multipart chegam como string ("true"/"false").
const flagSchema = z.preprocess((value) => value === "true", z.boolean());

const profileSchema = z.object({
  nickname: nicknameSchema,
  removeAvatar: flagSchema,
  removeBanner: flagSchema,
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

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  const files = (req.files ?? {}) as Record<string, Express.Multer.File[] | undefined>;
  const avatar = files.avatar?.[0];
  const banner = files.banner?.[0];
  let saved = false;

  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Dados inválidos.", errors: firstErrors(parsed.error) });
    }
    if (avatar && avatar.size > MAX_AVATAR_BYTES) {
      const message = "A foto deve ter no máximo 2 MB.";
      return res.status(413).json({ message, errors: { avatar: message } });
    }

    const { nickname, removeAvatar, removeBanner } = parsed.data;

    // Arquivo novo > "remover" > manter (undefined não altera a coluna).
    const avatarUrl = avatar ? `/uploads/avatars/${avatar.filename}` : removeAvatar ? null : undefined;
    const bannerUrl = banner ? `/uploads/banners/${banner.filename}` : removeBanner ? null : undefined;

    const { user, replacedUrls } = await updateUserProfile((req as AuthedRequest).userId, {
      nickname,
      avatarUrl,
      bannerUrl,
    });

    saved = true;
    // Só depois de salvar no banco: as imagens antigas deixam de ocupar disco.
    await Promise.all(replacedUrls.map(removeUploadedByUrl));
    return res.json({ user });
  } catch (error) {
    if (error instanceof AuthError) return sendAuthError(res, error);
    return next(error);
  } finally {
    // Se a atualização falhou, não deixa as imagens novas órfãs no disco.
    if (!saved) await removeUploadedFiles([avatar, banner]);
  }
}

const FORGOT_PASSWORD_MESSAGE =
  "Se existir uma conta com este e-mail, enviamos um link para criar uma nova senha.";

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Dados inválidos.", errors: firstErrors(parsed.error) });
    }

    const reset = await createPasswordReset(parsed.data.email);

    // Não espera o envio: assim a resposta (e o tempo) é igual com ou sem conta, e uma
    // falha no SMTP não vira um erro que revelaria que o e-mail existe.
    if (reset) {
      sendPasswordResetEmail(reset.user.email, reset.user.nickname, reset.token).catch((error) =>
        console.error("[auth] Falha ao enviar e-mail de recuperação:", error),
      );
    }

    return res.json({ message: FORGOT_PASSWORD_MESSAGE });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Dados inválidos.", errors: firstErrors(parsed.error) });
    }

    await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    return res.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    if (error instanceof AuthError) return sendAuthError(res, error);
    return next(error);
  }
}
