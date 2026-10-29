import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma"; // ajuste se o seu client estiver em outro lugar/export

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

const publicUser = {
  id: true,
  nickname: true,
  email: true,
  avatarUrl: true,
  bannerUrl: true,
  createdAt: true,
} as const;

// Hash falso para comparar mesmo quando o e-mail não existe (tempo de resposta parecido).
const DUMMY_HASH = bcrypt.hashSync("senha-inexistente", 12);

type RegisterInput = {
  nickname: string;
  email: string;
  password: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

export async function registerUser(input: RegisterInput) {
  const [emailTaken, nicknameTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email: input.email }, select: { id: true } }),
    prisma.user.findUnique({ where: { nickname: input.nickname }, select: { id: true } }),
  ]);
  if (emailTaken) throw new AuthError(409, "Este e-mail já está cadastrado.", "email");
  if (nicknameTaken) throw new AuthError(409, "Este nickname já está em uso.", "nickname");

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    return await prisma.user.create({
      data: {
        nickname: input.nickname,
        email: input.email,
        passwordHash,
        avatarUrl: input.avatarUrl,
        bannerUrl: input.bannerUrl,
      },
      select: publicUser,
    });
  } catch (error) {
    // Cadastros simultâneos com o mesmo e-mail/nickname escapam da checagem acima.
    if ((error as { code?: string }).code === "P2002") {
      throw new AuthError(409, "E-mail ou nickname já em uso.");
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    throw new AuthError(401, "E-mail ou senha incorretos.");
  }

  const { passwordHash: _omit, ...safeUser } = user;
  return {
    id: safeUser.id,
    nickname: safeUser.nickname,
    email: safeUser.email,
    avatarUrl: safeUser.avatarUrl,
    bannerUrl: safeUser.bannerUrl,
    createdAt: safeUser.createdAt,
  };
}

export function getUserById(id: number) {
  return prisma.user.findUnique({ where: { id }, select: publicUser });
}

type UpdateProfileInput = {
  nickname: string;
  /** undefined = manter a atual · null = remover · string = nova imagem */
  avatarUrl?: string | null;
  bannerUrl?: string | null;
};

/**
 * Atualiza apelido, foto e banner. Devolve também as URLs das imagens que deixaram de ser
 * usadas, para quem chama apagá-las do disco depois que o banco foi atualizado.
 */
export async function updateUserProfile(userId: number, input: UpdateProfileInput) {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { nickname: true, avatarUrl: true, bannerUrl: true },
  });
  if (!current) throw new AuthError(401, "Não autenticado.");

  if (input.nickname !== current.nickname) {
    const taken = await prisma.user.findUnique({
      where: { nickname: input.nickname },
      select: { id: true },
    });
    if (taken) throw new AuthError(409, "Este nickname já está em uso.", "nickname");
  }

  let user;
  try {
    user = await prisma.user.update({
      where: { id: userId },
      data: {
        nickname: input.nickname,
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
        ...(input.bannerUrl !== undefined && { bannerUrl: input.bannerUrl }),
      },
      select: publicUser,
    });
  } catch (error) {
    // Duas edições simultâneas com o mesmo nickname escapam da checagem acima.
    if ((error as { code?: string }).code === "P2002") {
      throw new AuthError(409, "Este nickname já está em uso.", "nickname");
    }
    throw error;
  }

  const replacedUrls: string[] = [];
  if (input.avatarUrl !== undefined && current.avatarUrl && current.avatarUrl !== input.avatarUrl) {
    replacedUrls.push(current.avatarUrl);
  }
  if (input.bannerUrl !== undefined && current.bannerUrl && current.bannerUrl !== input.bannerUrl) {
    replacedUrls.push(current.bannerUrl);
  }

  return { user, replacedUrls };
}

/* -------------------------------------------------------------------------- */
/*  Recuperação de senha                                                      */
/* -------------------------------------------------------------------------- */

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

/** O banco guarda só o hash: se o banco vazar, os links não podem ser usados. */
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Gera um link de recuperação para o e-mail. Devolve `null` se não existir conta:
 * quem chama responde igual nos dois casos, para não revelar quais e-mails têm cadastro.
 */
export async function createPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, nickname: true, email: true },
  });
  if (!user) return null;

  const token = randomBytes(32).toString("hex");

  // Só o último link vale: pedidos antigos deixam de funcionar.
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    }),
  ]);

  return { user, token };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    throw new AuthError(400, "Este link é inválido ou expirou. Peça um novo.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    // O updateMany condicional garante que dois cliques simultâneos não usem o link duas vezes.
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count !== 1) {
      throw new AuthError(400, "Este link é inválido ou expirou. Peça um novo.");
    }

    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.passwordResetToken.deleteMany({
      where: { userId: record.userId, id: { not: record.id } },
    });
  });
}
