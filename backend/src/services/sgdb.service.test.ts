import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";

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