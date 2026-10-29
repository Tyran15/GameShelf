import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../lib/prisma";
import {
  createGame,
  deleteGame,
  getAllGames,
  getGameById,
  updateGame,
} from "./game.service";

// Mock completo do Prisma Client
vi.mock("../lib/prisma", () => ({
  prisma: {
    game: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    platform: {
      findUnique: vi.fn(),
    },
    genre: {
      findUnique: vi.fn(),
    },
  },
}));

// Helper: retorna um jogo fake com relacionamentos
function makeGame(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    title: "Hollow Knight",
    description: null,
    coverUrl: null,
    releaseDate: null,
    status: "WISHLIST",
    rating: null,
    hoursPlayed: null,
    platformId: 1,
    genreId: 1,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    platform: { id: 1, name: "PC" },
    genre: { id: 1, name: "Action" },
    ...overrides,
  };
}

describe("getAllGames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("busca todos os jogos sem filtros", async () => {
    vi.mocked(prisma.game.findMany).mockResolvedValue([]);

    await getAllGames(1);

    expect(prisma.game.findMany).toHaveBeenCalledOnce();
    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 1 }),
        include: { platform: true, genre: true },
        orderBy: { updatedAt: "desc" },
      })
    );
  });

  it("só busca os jogos do usuário informado", async () => {
    vi.mocked(prisma.game.findMany).mockResolvedValue([]);

    await getAllGames(42, { status: "PLAYING" });

    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 42, status: "PLAYING" }),
      })
    );
  });

  it("aplica filtro de status", async () => {
    vi.mocked(prisma.game.findMany).mockResolvedValue([]);

    await getAllGames(1, { status: "PLAYING" });

    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "PLAYING" }),
      })
    );
  });

  it("aplica filtro de busca por título (case insensitive)", async () => {
    vi.mocked(prisma.game.findMany).mockResolvedValue([]);

    await getAllGames(1, { search: "hollow" });

    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: { contains: "hollow", mode: "insensitive" },
        }),
      })
    );
  });

  it("combina múltiplos filtros", async () => {
    vi.mocked(prisma.game.findMany).mockResolvedValue([]);

    await getAllGames(1, { status: "PLAYING", platformId: 1, genreId: 2 });

    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PLAYING",
          platformId: 1,
          genreId: 2,
        }),
      })
    );
  });
});

describe("createGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lança PLATFORM_NOT_FOUND quando plataforma não existe", async () => {
    vi.mocked(prisma.platform.findUnique).mockResolvedValue(null);

    await expect(
      createGame(1, { title: "Hollow Knight", platformId: 999, genreId: 1 })
    ).rejects.toThrow("PLATFORM_NOT_FOUND");

    expect(prisma.genre.findUnique).not.toHaveBeenCalled();
    expect(prisma.game.create).not.toHaveBeenCalled();
  });

  it("lança GENRE_NOT_FOUND quando gênero não existe", async () => {
    vi.mocked(prisma.platform.findUnique).mockResolvedValue({
      id: 1,
      name: "PC",
    });
    vi.mocked(prisma.genre.findUnique).mockResolvedValue(null);

    await expect(
      createGame(1, { title: "Hollow Knight", platformId: 1, genreId: 999 })
    ).rejects.toThrow("GENRE_NOT_FOUND");

    expect(prisma.game.create).not.toHaveBeenCalled();
  });

  it("cria o jogo quando plataforma e gênero existem", async () => {
    vi.mocked(prisma.platform.findUnique).mockResolvedValue({
      id: 1,
      name: "PC",
    });
    vi.mocked(prisma.genre.findUnique).mockResolvedValue({
      id: 1,
      name: "Action",
    });
    vi.mocked(prisma.game.create).mockResolvedValue(makeGame() as never);

    const result = await createGame(1, {
      title: "Hollow Knight",
      platformId: 1,
      genreId: 1,
    });

    expect(result.title).toBe("Hollow Knight");
    expect(prisma.game.create).toHaveBeenCalledOnce();
    expect(prisma.game.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Hollow Knight",
          platformId: 1,
          genreId: 1,
          userId: 1,
        }),
        include: { platform: true, genre: true },
      })
    );
  });
});

describe("getGameById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna o jogo quando existe", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue(makeGame() as never);

    const result = await getGameById(1, 1);

    expect(result?.id).toBe(1);
    expect(prisma.game.findFirst).toHaveBeenCalledWith({
      where: { id: 1, userId: 1 },
      include: { platform: true, genre: true },
    });
  });

  it("retorna null quando não existe (ou é de outro usuário)", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue(null);

    const result = await getGameById(1, 999);

    expect(result).toBeNull();
  });
});

describe("updateGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por padrão o jogo pertence ao usuário que está editando.
    vi.mocked(prisma.game.findFirst).mockResolvedValue({ id: 1 } as never);
  });

  it("lança GAME_NOT_FOUND quando o jogo é de outro usuário", async () => {
    vi.mocked(prisma.game.findFirst).mockResolvedValue(null);

    await expect(updateGame(2, 1, { title: "Hack" })).rejects.toThrow("GAME_NOT_FOUND");

    expect(prisma.game.findFirst).toHaveBeenCalledWith({
      where: { id: 1, userId: 2 },
      select: { id: true },
    });
    expect(prisma.game.update).not.toHaveBeenCalled();
  });

  it("não valida plataforma quando não foi enviada", async () => {
    vi.mocked(prisma.game.update).mockResolvedValue(makeGame() as never);

    await updateGame(1, 1, { title: "Novo título" });

    expect(prisma.platform.findUnique).not.toHaveBeenCalled();
    expect(prisma.genre.findUnique).not.toHaveBeenCalled();
    expect(prisma.game.update).toHaveBeenCalledOnce();
  });

  it("valida plataforma quando enviada", async () => {
    vi.mocked(prisma.platform.findUnique).mockResolvedValue({
      id: 2,
      name: "Switch",
    });
    vi.mocked(prisma.game.update).mockResolvedValue(makeGame() as never);

    await updateGame(1, 1, { platformId: 2 });

    expect(prisma.platform.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
    });
  });

  it("lança PLATFORM_NOT_FOUND quando plataforma enviada não existe", async () => {
    vi.mocked(prisma.platform.findUnique).mockResolvedValue(null);

    await expect(
      updateGame(1, 1, { platformId: 999 })
    ).rejects.toThrow("PLATFORM_NOT_FOUND");

    expect(prisma.game.update).not.toHaveBeenCalled();
  });

  it("lança GENRE_NOT_FOUND quando gênero enviado não existe", async () => {
    vi.mocked(prisma.platform.findUnique).mockResolvedValue({
      id: 1,
      name: "PC",
    });
    vi.mocked(prisma.genre.findUnique).mockResolvedValue(null);

    await expect(
      updateGame(1, 1, { platformId: 1, genreId: 999 })
    ).rejects.toThrow("GENRE_NOT_FOUND");

    expect(prisma.game.update).not.toHaveBeenCalled();
  });
});

describe("deleteGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("apaga apenas o jogo do usuário informado", async () => {
    vi.mocked(prisma.game.deleteMany).mockResolvedValue({ count: 1 });

    await deleteGame(1, 5);

    expect(prisma.game.deleteMany).toHaveBeenCalledOnce();
    expect(prisma.game.deleteMany).toHaveBeenCalledWith({ where: { id: 5, userId: 1 } });
  });

  it("lança GAME_NOT_FOUND quando o jogo não existe ou é de outro usuário", async () => {
    vi.mocked(prisma.game.deleteMany).mockResolvedValue({ count: 0 });

    await expect(deleteGame(2, 5)).rejects.toThrow("GAME_NOT_FOUND");
  });
});
