import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import {
  findFirstCoverByTitle,
  findHeroesByTitle,
} from "./sgdb.service";

const SGDB_API_KEY = "test-api-key";

async function loadService() {
  vi.resetModules();
  return import("./sgdb.service");
}

function mockFetch(response: {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: response.json ?? (async () => ({ success: true, data: [] })),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("searchGames", () => {
  const originalApiKey = process.env.STEAMGRIDDB_API_KEY;

  beforeEach(() => {
    delete process.env.STEAMGRIDDB_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiKey === undefined) {
      delete process.env.STEAMGRIDDB_API_KEY;
    } else {
      process.env.STEAMGRIDDB_API_KEY = originalApiKey;
    }
  });

  it("retorna array vazio para query com menos de 3 caracteres, sem chamar a API", async () => {
    const fetchMock = mockFetch({ ok: true });
    const { searchGames } = await loadService();

    const result = await searchGames("ab");

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lança SGDB_API_KEY_NOT_CONFIGURED quando a chave não está no env", async () => {
    mockFetch({ ok: true });
    const { searchGames } = await loadService();

    await expect(searchGames("hollow knight")).rejects.toThrow(
      "SGDB_API_KEY_NOT_CONFIGURED"
    );
  });

  it("normaliza a busca corretamente, extraindo o ano de um timestamp Unix", async () => {
    process.env.STEAMGRIDDB_API_KEY = SGDB_API_KEY;

    const rawResponse = {
      success: true,
      data: [
        {
          id: 12345,
          name: "Hollow Knight",
          release_date: 1487894400, // 2017-02-24T00:00:00Z
        },
        {
          id: 6789,
          name: "Hollow Knight: Silksong",
          release_date: null,
        },
      ],
    };
    const fetchMock = mockFetch({ ok: true, json: async () => rawResponse });
    const { searchGames } = await loadService();

    const result = await searchGames("hollow knight");

    expect(result).toEqual([
      { id: 12345, name: "Hollow Knight", releaseYear: 2017 },
      { id: 6789, name: "Hollow Knight: Silksong", releaseYear: null },
    ]);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(calledUrl).toContain("/search/autocomplete/hollow%20knight");
    expect(
      (calledInit.headers as Record<string, string>)["Authorization"]
    ).toBe(`Bearer ${SGDB_API_KEY}`);
  });

  it.each([401, 500])(
    "lança SGDB_API_ERROR_%s para resposta HTTP não-OK",
    async (status) => {
      process.env.STEAMGRIDDB_API_KEY = SGDB_API_KEY;
      mockFetch({ ok: false, status });
      const { searchGames } = await loadService();

      await expect(searchGames("hollow knight")).rejects.toThrow(
        `SGDB_API_ERROR_${status}`
      );
    }
  );

  it("usa o cache na segunda chamada com a mesma query (não bate no fetch de novo)", async () => {
    process.env.STEAMGRIDDB_API_KEY = SGDB_API_KEY;
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    const { searchGames } = await loadService();

    await searchGames("hollow knight");
    await searchGames("hollow knight");

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("getCoversByGameId", () => {
  const originalApiKey = process.env.STEAMGRIDDB_API_KEY;

  beforeEach(() => {
    delete process.env.STEAMGRIDDB_API_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiKey === undefined) {
      delete process.env.STEAMGRIDDB_API_KEY;
    } else {
      process.env.STEAMGRIDDB_API_KEY = originalApiKey;
    }
  });

  it("lança SGDB_API_KEY_NOT_CONFIGURED quando a chave não está no env", async () => {
    mockFetch({ ok: true });
    const { getCoversByGameId } = await loadService();

    await expect(getCoversByGameId(12345)).rejects.toThrow(
      "SGDB_API_KEY_NOT_CONFIGURED"
    );
  });

  it("normaliza as capas e ordena por score (desc)", async () => {
    process.env.STEAMGRIDDB_API_KEY = SGDB_API_KEY;

    const rawResponse = {
      success: true,
      data: [
        {
          id: 1,
          url: "https://cdn2.steamgriddb.com/grid/low.png",
          thumb: "https://cdn2.steamgriddb.com/thumb/low.jpg",
          width: 600,
          height: 900,
          mime: "image/png",
          author: { name: "ArtistLow" },
          score: 10,
        },
        {
          id: 2,
          url: "https://cdn2.steamgriddb.com/grid/high.png",
          thumb: "https://cdn2.steamgriddb.com/thumb/high.jpg",
          width: 600,
          height: 900,
          mime: "image/png",
          author: { name: "ArtistHigh" },
          score: 42,
        },
      ],
    };
    const fetchMock = mockFetch({ ok: true, json: async () => rawResponse });
    const { getCoversByGameId } = await loadService();

    const result = await getCoversByGameId(12345);

    expect(result).toEqual([
      {
        id: 2,
        url: "https://cdn2.steamgriddb.com/grid/high.png",
        thumbUrl: "https://cdn2.steamgriddb.com/thumb/high.jpg",
        width: 600,
        height: 900,
        mime: "image/png",
        author: "ArtistHigh",
      },
      {
        id: 1,
        url: "https://cdn2.steamgriddb.com/grid/low.png",
        thumbUrl: "https://cdn2.steamgriddb.com/thumb/low.jpg",
        width: 600,
        height: 900,
        mime: "image/png",
        author: "ArtistLow",
      },
    ]);

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain("dimensions=600x900");
    expect(calledUrl).toContain("types=static");
  });

  it.each([401, 500])(
    "lança SGDB_API_ERROR_%s para resposta HTTP não-OK",
    async (status) => {
      process.env.STEAMGRIDDB_API_KEY = SGDB_API_KEY;
      mockFetch({ ok: false, status });
      const { getCoversByGameId } = await loadService();

      await expect(getCoversByGameId(12345)).rejects.toThrow(
        `SGDB_API_ERROR_${status}`
      );
    }
  );

  it("usa o cache na segunda chamada com o mesmo gameId (não bate no fetch de novo)", async () => {
    process.env.STEAMGRIDDB_API_KEY = SGDB_API_KEY;
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    const { getCoversByGameId } = await loadService();

    await getCoversByGameId(12345);
    await getCoversByGameId(12345);

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

import {
  findFirstCoverByTitle,
  searchGames,
} from "./sgdb.service";

describe("findFirstCoverByTitle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.STEAMGRIDDB_API_KEY = "test-key";
  });

  it("retorna a capa de maior score quando encontra o jogo", async () => {
    const fetchMock = vi
      .fn()
      // Primeira chamada: search
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ id: 123, name: "Hollow Knight" }],
        }),
      })
      // Segunda chamada: covers
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { url: "https://cdn/lower.jpg", score: 10 },
            { url: "https://cdn/higher.jpg", score: 50 },
          ],
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await findFirstCoverByTitle("Hollow Knight");

    expect(result).toBe("https://cdn/higher.jpg");
  });

  it("retorna null quando o título do SGDB não bate", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 999, name: "Jogo Totalmente Diferente" }],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await findFirstCoverByTitle("Hollow Knight");

    expect(result).toBeNull();
  });

  it("retorna null quando o SGDB retorna erro HTTP", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await findFirstCoverByTitle("Hollow Knight");

    expect(result).toBeNull();
  });

  it("retorna null quando não há STEAMGRIDDB_API_KEY", async () => {
    delete process.env.STEAMGRIDDB_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await findFirstCoverByTitle("Hollow Knight");

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retorna null quando o SGDB não acha nenhum jogo", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await findFirstCoverByTitle("JogoQueNaoExiste123");

    expect(result).toBeNull();
  });
});

describe("findHeroesByTitle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.STEAMGRIDDB_API_KEY = "test-key";
  });

  it("retorna heroes ordenados por score", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 123, name: "Hollow Knight" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { url: "https://cdn/h-low.jpg", thumb: "https://cdn/t-low.jpg", score: 5 },
            { url: "https://cdn/h-high.jpg", thumb: "https://cdn/t-high.jpg", score: 90 },
          ],
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await findHeroesByTitle("Hollow Knight");

    expect(result).toHaveLength(2);
    expect(result[0].url).toBe("https://cdn/h-high.jpg");
  });

  it("retorna lista vazia quando título não bate", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: 999, name: "Outro Jogo" }] }),
    });

    vi.stubGlobal("fetch", fetchMock);

    expect(await findHeroesByTitle("Hollow Knight")).toEqual([]);
  });

  it("retorna lista vazia quando SGDB retorna erro HTTP", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 });
    vi.stubGlobal("fetch", fetchMock);

    expect(await findHeroesByTitle("Hollow Knight")).toEqual([]);
  });
});