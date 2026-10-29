import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../app";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/auth";
import { UPLOAD_ROOT, removeUploadedByUrl } from "../middlewares/upload";

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

describe("PUT /api/auth/profile", () => {
  const OLD_URL = "/uploads/avatars/old-route-test.png";
  const oldFile = path.join(UPLOAD_ROOT, "avatars", "old-route-test.png");
  const current = { nickname: "tyran", avatarUrl: OLD_URL, bannerUrl: null };

  const put = (form: FormData, cookie?: string) =>
    fetch(`${baseUrl}/api/auth/profile`, {
      method: "PUT",
      body: form,
      headers: cookie ? { Cookie: `gameshelf_token=${cookie}` } : {},
    });

  const pngFile = () => new File([Buffer.from("89504e470d0a1a0a", "hex")], "foto.png", { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("JWT_SECRET", "segredo-de-teste");
    fs.mkdirSync(path.dirname(oldFile), { recursive: true });
    fs.writeFileSync(oldFile, "antiga");
    vi.mocked(prisma.user.update).mockResolvedValue({ id: 1, nickname: "tyran" } as never);
  });

  afterEach(async () => {
    fs.rmSync(oldFile, { force: true });
    for (const call of vi.mocked(prisma.user.update).mock.calls) {
      const data = (call[0] as { data: { avatarUrl?: string | null } }).data;
      await removeUploadedByUrl(data.avatarUrl);
    }
  });

  it("401 sem login, e nada é gravado no disco", async () => {
    const form = new FormData();
    form.append("nickname", "tyran");
    form.append("avatar", pngFile());

    const res = await put(form);

    expect(res.status).toBe(401);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("400 para nickname inválido", async () => {
    const form = new FormData();
    form.append("nickname", "a");

    const res = await put(form, signToken(1));

    expect(res.status).toBe(400);
    expect((await res.json()).errors.nickname).toBeTruthy();
  });

  it("200: troca a foto e apaga a antiga do disco", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(current as never);
    const form = new FormData();
    form.append("nickname", "tyran");
    form.append("avatar", pngFile());

    const res = await put(form, signToken(1));

    expect(res.status).toBe(200);
    const { data, where } = vi.mocked(prisma.user.update).mock.calls[0]![0] as {
      data: { avatarUrl: string };
      where: { id: number };
    };
    expect(where).toEqual({ id: 1 });
    expect(data.avatarUrl).toMatch(/^\/uploads\/avatars\/[0-9a-f-]+\.png$/);
    expect(fs.existsSync(path.join(UPLOAD_ROOT, data.avatarUrl.replace("/uploads/", "")))).toBe(true);
    expect(fs.existsSync(oldFile)).toBe(false);
  });

  it("200: removeAvatar grava null e apaga o arquivo", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(current as never);
    const form = new FormData();
    form.append("nickname", "tyran");
    form.append("removeAvatar", "true");

    const res = await put(form, signToken(1));

    expect(res.status).toBe(200);
    const { data } = vi.mocked(prisma.user.update).mock.calls[0]![0] as { data: object };
    expect(data).toEqual({ nickname: "tyran", avatarUrl: null });
    expect(fs.existsSync(oldFile)).toBe(false);
  });

  it("409 com nickname repetido: a imagem enviada não fica órfã e a antiga é mantida", async () => {
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(current as never)
      .mockResolvedValueOnce({ id: 2 } as never);
    const before = fs.readdirSync(path.join(UPLOAD_ROOT, "avatars")).length;
    const form = new FormData();
    form.append("nickname", "outra-pessoa");
    form.append("avatar", pngFile());

    const res = await put(form, signToken(1));

    expect(res.status).toBe(409);
    expect((await res.json()).errors.nickname).toBeTruthy();
    expect(fs.readdirSync(path.join(UPLOAD_ROOT, "avatars")).length).toBe(before);
    expect(fs.existsSync(oldFile)).toBe(true);
  });
});
