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
