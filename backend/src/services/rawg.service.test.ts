import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

const RAWG_API_KEY = "test-api-key";

async function loadService() {
  vi.resetModules();
  return import("./rawg.service");
}

function mockFetch(response: {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: response.json ?? (async () => ({ results: [] })),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("searchGames", () => {
  const originalApiKey = process.env.RAWG_API_KEY;

  beforeEach(() => {
    delete process.env.RAWG_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiKey === undefined) {
      delete process.env.RAWG_API_KEY;
    } else {
      process.env.RAWG_API_KEY = originalApiKey;
    }
  });

  it("retorna array vazio para query com menos de 3 caracteres, sem chamar a API", async () => {
    const fetchMock = mockFetch({ ok: true });
    const { searchGames } = await loadService();

    const result = await searchGames("ab");

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lança RAWG_API_KEY_NOT_CONFIGURED quando a chave não está no env", async () => {
    mockFetch({ ok: true });
    const { searchGames } = await loadService();

    await expect(searchGames("zelda")).rejects.toThrow(
      "RAWG_API_KEY_NOT_CONFIGURED"
    );
  });

  it("retorna array normalizado corretamente para resposta HTTP OK", async () => {
    process.env.RAWG_API_KEY = RAWG_API_KEY;

    const rawResponse = {
      results: [
        {
          id: 123,
          name: "Hollow Knight",
          released: "2017-02-24",
          background_image: "https://example.com/cover.jpg",
          rating: 4.5,
          metacritic: 90,
          playtime: 27,
          genres: [{ id: 1, name: "Metroidvania" }],
          platforms: [{ platform: { id: 1, name: "PC" } }],
        },
      ],
    };
    const fetchMock = mockFetch({ ok: true, json: async () => rawResponse });
    const { searchGames } = await loadService();

    const result = await searchGames("hollow knight");

    expect(result).toEqual([
      {
        rawgId: 123,
        title: "Hollow Knight",
        releaseDate: "2017-02-24",
        coverUrl: "https://example.com/cover.jpg",
        rating: 4.5,
        metacritic: 90,
        averagePlaytime: 27,
        genres: ["Metroidvania"],
        platforms: ["PC"],
      },
    ]);

    expect(fetchMock).toHaveBeenCalledOnce();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain(`key=${RAWG_API_KEY}`);
    expect(calledUrl).toContain("search=hollow");
  });

  it.each([401, 500])(
    "lança RAWG_API_ERROR_%s para resposta HTTP não-OK",
    async (status) => {
      process.env.RAWG_API_KEY = RAWG_API_KEY;
      mockFetch({ ok: false, status });
      const { searchGames } = await loadService();

      await expect(searchGames("zelda")).rejects.toThrow(
        `RAWG_API_ERROR_${status}`
      );
    }
  );

  it("usa o cache na segunda chamada com a mesma query (não bate no fetch de novo)", async () => {
    process.env.RAWG_API_KEY = RAWG_API_KEY;
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ results: [] }),
    });
    const { searchGames } = await loadService();

    await searchGames("zelda");
    await searchGames("zelda");

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});