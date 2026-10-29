import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../lib/prisma";
import { AuthError, createPasswordReset, resetPasswordWithToken } from "./auth.service";

vi.mock("../lib/prisma", () => {
  const mock = {
    user: { findUnique: vi.fn(), update: vi.fn() },
    passwordResetToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    // Array: executa tudo; função: entrega o próprio mock como "tx".
    $transaction: vi.fn(async (arg: unknown) =>
      typeof arg === "function" ? (arg as (tx: unknown) => unknown)(mock) : Promise.all(arg as []),
    ),
  };
  return { prisma: mock };
});

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const USER = { id: 7, nickname: "tyran", email: "tyran@example.com" };

describe("createPasswordReset", () => {
  beforeEach(() => vi.clearAllMocks());

  it("devolve null e não cria token quando o e-mail não tem conta", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await createPasswordReset("ninguem@example.com");

    expect(result).toBeNull();
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("guarda só o hash do token e devolve o token puro", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(USER as never);

    const result = await createPasswordReset(USER.email);

    expect(result?.token).toMatch(/^[0-9a-f]{64}$/);
    const { data } = vi.mocked(prisma.passwordResetToken.create).mock.calls[0]![0] as {
      data: { tokenHash: string; userId: number; expiresAt: Date };
    };
    expect(data.tokenHash).toBe(sha256(result!.token));
    expect(data.tokenHash).not.toBe(result!.token);
    expect(data.userId).toBe(USER.id);
  });

  it("expira em 1 hora e apaga os links anteriores do usuário", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(USER as never);
    const before = Date.now();

    await createPasswordReset(USER.email);

    const { data } = vi.mocked(prisma.passwordResetToken.create).mock.calls[0]![0] as {
      data: { expiresAt: Date };
    };
    const ttl = data.expiresAt.getTime() - before;
    expect(ttl).toBeGreaterThan(59 * 60 * 1000);
    expect(ttl).toBeLessThanOrEqual(60 * 60 * 1000 + 1000);
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER.id },
    });
  });
});

describe("resetPasswordWithToken", () => {
  const future = () => new Date(Date.now() + 60_000);

  beforeEach(() => vi.clearAllMocks());

  it("rejeita token que não existe", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

    await expect(resetPasswordWithToken("x", "NovaSenha1")).rejects.toMatchObject({
      status: 400,
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("procura pelo hash, nunca pelo token puro", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

    await resetPasswordWithToken("meu-token", "NovaSenha1").catch(() => undefined);

    expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: sha256("meu-token") },
    });
  });

  it("rejeita token expirado", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: 1,
      userId: USER.id,
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    } as never);

    await expect(resetPasswordWithToken("x", "NovaSenha1")).rejects.toBeInstanceOf(AuthError);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejeita token já usado", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: 1,
      userId: USER.id,
      usedAt: new Date(),
      expiresAt: future(),
    } as never);

    await expect(resetPasswordWithToken("x", "NovaSenha1")).rejects.toMatchObject({
      status: 400,
    });
  });

  it("rejeita quando outro pedido já consumiu o link (corrida)", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: 1,
      userId: USER.id,
      usedAt: null,
      expiresAt: future(),
    } as never);
    vi.mocked(prisma.passwordResetToken.updateMany).mockResolvedValue({ count: 0 });

    await expect(resetPasswordWithToken("x", "NovaSenha1")).rejects.toMatchObject({
      status: 400,
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("troca a senha (com hash bcrypt) e apaga os outros links do usuário", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: 1,
      userId: USER.id,
      usedAt: null,
      expiresAt: future(),
    } as never);
    vi.mocked(prisma.passwordResetToken.updateMany).mockResolvedValue({ count: 1 });

    await resetPasswordWithToken("x", "NovaSenha1");

    const { data, where } = vi.mocked(prisma.user.update).mock.calls[0]![0] as {
      where: { id: number };
      data: { passwordHash: string };
    };
    expect(where.id).toBe(USER.id);
    expect(data.passwordHash).not.toBe("NovaSenha1");
    expect(await bcrypt.compare("NovaSenha1", data.passwordHash)).toBe(true);
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER.id, id: { not: 1 } },
    });
  });
});
