import { describe, expect, it } from "vitest";
import { createGameSchema, updateGameSchema } from "./game.schema";

describe("createGameSchema", () => {
  const validBase = {
    title: "Hollow Knight",
    platformId: 1,
    genreId: 2,
  };

  it("aceita dados mínimos válidos", () => {
    const result = createGameSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejeita título vazio", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita title ausente", () => {
    const result = createGameSchema.safeParse({
      platformId: 1,
      genreId: 2,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita rating acima de 10", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      rating: 11,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita rating negativo", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      rating: -1,
    });
    expect(result.success).toBe(false);
  });

  it("aceita rating decimal", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      rating: 7.4,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(7.4);
    }
  });

  it("aceita hoursPlayed como número", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      hoursPlayed: 42.5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hoursPlayed).toBe(42.5);
    }
  });

  it("aceita hoursPlayed como string numérica", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      hoursPlayed: "42.5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hoursPlayed).toBe(42.5);
    }
  });

  it("converte hoursPlayed vazio em null", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      hoursPlayed: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hoursPlayed).toBeNull();
    }
  });

  it("aceita hoursPlayed null (limpar valor)", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      hoursPlayed: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hoursPlayed).toBeNull();
    }
  });

  it("rejeita hoursPlayed negativo", () => {
    const result = createGameSchema.safeParse({
      ...validBase,
      hoursPlayed: -5,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateGameSchema", () => {
  it("aceita objeto vazio (update parcial)", () => {
    const result = updateGameSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("aceita só title", () => {
    const result = updateGameSchema.safeParse({ title: "Novo título" });
    expect(result.success).toBe(true);
  });

  it("aceita hoursPlayed null para limpar", () => {
    const result = updateGameSchema.safeParse({ hoursPlayed: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hoursPlayed).toBeNull();
    }
  });
});