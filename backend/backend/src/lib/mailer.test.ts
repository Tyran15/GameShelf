import { afterEach, describe, expect, it, vi } from "vitest";
import { buildResetLink, sendPasswordResetEmail } from "./mailer";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("buildResetLink", () => {
  it("usa FRONTEND_URL e remove a barra final", () => {
    vi.stubEnv("FRONTEND_URL", "https://gameshelf.app/");
    expect(buildResetLink("abc123")).toBe("https://gameshelf.app/reset-password?token=abc123");
  });

  it("escapa caracteres especiais do token", () => {
    vi.stubEnv("FRONTEND_URL", "http://localhost:5173");
    expect(buildResetLink("a b&c")).toBe("http://localhost:5173/reset-password?token=a%20b%26c");
  });
});

describe("sendPasswordResetEmail sem SMTP", () => {
  it("em desenvolvimento imprime o link no terminal", async () => {
    vi.stubEnv("SMTP_HOST", "");
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await sendPasswordResetEmail("a@b.com", "tyran", "tok");

    expect(log).toHaveBeenCalledWith(expect.stringContaining("/reset-password?token=tok"));
  });
});
