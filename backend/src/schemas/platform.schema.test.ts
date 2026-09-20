import { describe, expect, it } from "vitest";
import {
  createPlatformSchema,
  updatePlatformSchema,
} from "./platform.schema";

describe("createPlatformSchema", () => {
  it("aceita nome válido", () => {
    const result = createPlatformSchema.safeParse({ name: "PC" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("PC");
    }
  });

  it("aceita nome com espaços internos", () => {
    const result = createPlatformSchema.safeParse({ name: "Nintendo Switch" });
    expect(result.success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const result = createPlatformSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita quando name está ausente", () => {
    const result = createPlatformSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejeita quando name não é string", () => {
    const result = createPlatformSchema.safeParse({ name: 123 });
    expect(result.success).toBe(false);
  });

  it("rejeita quando name é null", () => {
    const result = createPlatformSchema.safeParse({ name: null });
    expect(result.success).toBe(false);
  });

  it("ignora campos extras", () => {
    const result = createPlatformSchema.safeParse({
      name: "PC",
      hack: "valor malicioso",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("hack");
    }
  });
});

describe("updatePlatformSchema", () => {
  it("aceita objeto vazio (update parcial)", () => {
    const result = updatePlatformSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("aceita apenas name", () => {
    const result = updatePlatformSchema.safeParse({ name: "PlayStation 5" });
    expect(result.success).toBe(true);
  });

  it("rejeita name vazio no update", () => {
    const result = updatePlatformSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita name não-string no update", () => {
    const result = updatePlatformSchema.safeParse({ name: 42 });
    expect(result.success).toBe(false);
  });
});