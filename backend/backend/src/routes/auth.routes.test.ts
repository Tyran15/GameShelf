import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => {
  const mock = {
    user: { findUnique: vi.fn(), update: vi.fn() },
    passwordResetToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) =>
      typeof arg === "function" ? (arg as (tx: unknown) => unknown)(mock) : Promise.all(arg as []),
    ),
  };
  return { prisma: mock };
});

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
});

const post = (path: string, body: unknown) =>
  fetch(`${baseUrl}/api/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SMTP_HOST", "");
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it("400 para e-mail inválido", async () => {
    const res = await post("/forgot-password", { email: "nao-e-email" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.email).toBeTruthy();
  });

  it("responde 200 com a mesma mensagem quando o e-mail NÃO existe", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const unknown = await post("/forgot-password", { email: "ninguem@example.com" });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      nickname: "tyran",
      email: "tyran@example.com",
    } as never);
    const known = await post("/forgot-password", { email: "tyran@example.com" });

    expect(unknown.status).toBe(200);
    expect(known.status).toBe(200);
    expect(await unknown.json()).toEqual(await known.json());
  });

  it("gera o link no terminal quando o e-mail existe (sem SMTP)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      nickname: "tyran",
      email: "tyran@example.com",
    } as never);

    await post("/forgot-password", { email: "TYRAN@example.com " });

    await vi.waitFor(() =>
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("/reset-password?token=")),
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "tyran@example.com" } }),
    );
  });
});

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 com a regra de senha quando ela é fraca", async () => {
    const res = await post("/reset-password", { token: "abc", password: "curta" });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.password).toBeTruthy();
  });

  it("400 quando o token não existe ou expirou", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);
    const res = await post("/reset-password", { token: "abc", password: "NovaSenha1" });
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/inválido ou expirou/);
  });

  it("200 quando o token é válido", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: 1,
      userId: 1,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    vi.mocked(prisma.passwordResetToken.updateMany).mockResolvedValue({ count: 1 });

    const res = await post("/reset-password", { token: "abc", password: "NovaSenha1" });

    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalled();
  });
});
