import { describe, expect, it } from "vitest";
import { createGenreSchema, updateGenreSchema } from "./genre.schema";

describe("createGenreSchema", () => {
  it("aceita nome válido", () => {
    const result = createGenreSchema.safeParse({ name: "Action" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Action");
    }
  });

  it("aceita nome com espaços internos", () => {
    const result = createGenreSchema.safeParse({ name: "RPG" });
    expect(result.success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const result = createGenreSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita quando name está ausente", () => {
    const result = createGenreSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejeita quando name não é string", () => {
    const result = createGenreSchema.safeParse({ name: 123 });
    expect(result.success).toBe(false);
  });

  it("rejeita quando name é null", () => {
    const result = createGenreSchema.safeParse({ name: null });
    expect(result.success).toBe(false);
  });

  it("ignora campos extras", () => {
    const result = createGenreSchema.safeParse({
      name: "Action",
      hack: "valor malicioso",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("hack");
    }
  });
});

describe("updateGenreSchema", () => {
  it("aceita objeto vazio (update parcial)", () => {
    const result = updateGenreSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("aceita apenas name", () => {
    const result = updateGenreSchema.safeParse({ name: "Adventure" });
    expect(result.success).toBe(true);
  });

  it("rejeita name vazio no update", () => {
    const result = updateGenreSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejeita name não-string no update", () => {
    const result = updateGenreSchema.safeParse({ name: 42 });
    expect(result.success).toBe(false);
  });
});