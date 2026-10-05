import { GAME_STATUSES, GAME_STATUS_LABELS, type Game, type GameStatus } from "@/types/game";
import type { Genre } from "@/types/genre";
import type { Platform } from "@/types/platform";

export const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 1000;

const MAX_TITLE_LENGTH = 300;
const MAX_NAME_LENGTH = 100;

export interface ImportedGame {
  title: string;
  platformName: string;
  genreName: string;
  status?: GameStatus | undefined;
  rating?: number | undefined;
  hoursPlayed?: number | undefined;
  /** AAAA-MM-DD */
  releaseDate?: string | undefined;
  description?: string | undefined;
  coverUrl?: string | undefined;
  backgroundUrl?: string | undefined;
}

export interface ImportRowError {
  /** Linha do arquivo (CSV) ou posição do item (JSON), começando em 1. */
  line: number;
  message: string;
}

export interface ParsedImportFile {
  format: "csv" | "json";
  games: ImportedGame[];
  errors: ImportRowError[];
}

/** Arquivo que não pode ser lido de jeito nenhum (formato, estrutura ou tamanho). */
export class ImportFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportFileError";
  }
}

// ---------------------------------------------------------------------------
// Normalização de texto
// ---------------------------------------------------------------------------

/** Minúsculas, sem acentos e com espaços colapsados: base de toda comparação. */
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tidyName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Desfaz o apóstrofo que a exportação CSV coloca antes de `=`, `+`, `-` e `@`. */
function cleanText(value: string): string {
  return value.replace(/^'(?=[=+\-@\t\r])/, "").trim();
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

interface CsvRecord {
  cells: string[];
  line: number;
}

function detectDelimiter(text: string): string {
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
  let inQuotes = false;
  for (const char of text) {
    if (char === '"') inQuotes = !inQuotes;
    else if (!inQuotes && (char === "\n" || char === "\r")) break;
    else if (!inQuotes && char in counts) counts[char] = (counts[char] ?? 0) + 1;
  }
  // Excel em português costuma salvar com ";".
  return (["\t", ";", ","] as const).reduce(
    (best, candidate) => ((counts[candidate] ?? 0) > (counts[best] ?? 0) ? candidate : best),
    ",",
  );
}

/** Parser CSV (RFC 4180): aspas, aspas duplas escapadas, quebras de linha dentro de campos. */
export function parseCsv(text: string): CsvRecord[] {
  const input = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(input);
  const records: CsvRecord[] = [];

  let cells: string[] = [];
  let field = "";
  let inQuotes = false;
  let line = 1;
  let recordLine = 1;

  const endRecord = () => {
    cells.push(field);
    if (cells.some((cell) => cell.trim() !== "")) records.push({ cells, line: recordLine });
    cells = [];
    field = "";
  };

  for (let index = 0; index < input.length; index++) {
    const char = input.charAt(index);

    if (inQuotes) {
      if (char === '"') {
        if (input.charAt(index + 1) === '"') {
          field += '"';
          index++;
        } else {
          inQuotes = false;
        }
      } else {
        if (char === "\n") line++;
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      cells.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input.charAt(index + 1) === "\n") index++;
      endRecord();
      line++;
      recordLine = line;
    } else {
      field += char;
    }
  }
  if (field !== "" || cells.length > 0) endRecord();

  return records;
}

// ---------------------------------------------------------------------------
// Campos e valores
// ---------------------------------------------------------------------------

type Field =
  | "title"
  | "platform"
  | "genre"
  | "status"
  | "rating"
  | "hours"
  | "release"
  | "description"
  | "cover"
  | "background";

const FIELD_ALIASES: Record<Field, string[]> = {
  title: ["titulo", "title", "nome", "name", "jogo", "game"],
  platform: ["plataforma", "platform"],
  genre: ["genero", "genre"],
  status: ["status", "situacao"],
  rating: ["nota", "rating", "avaliacao", "score"],
  hours: ["horasjogadas", "horas", "hoursplayed", "hours", "playtime"],
  release: ["lancamento", "datadelancamento", "datalancamento", "releasedate", "released"],
  description: ["descricao", "description", "sinopse"],
  cover: ["capa", "coverurl", "cover", "urldacapa"],
  background: ["fundo", "backgroundurl", "background", "urldofundo"],
};

const FIELD_LABELS: Record<"title" | "platform" | "genre", string> = {
  title: "Título",
  platform: "Plataforma",
  genre: "Gênero",
};

const ALIAS_TO_FIELD = new Map<string, Field>(
  (Object.entries(FIELD_ALIASES) as [Field, string[]][]).flatMap(([field, aliases]) =>
    aliases.map((alias): [string, Field] => [alias, field]),
  ),
);

function canonicalField(header: string): Field | null {
  const key = foldText(header).replace(/[^a-z0-9]/g, "");
  return ALIAS_TO_FIELD.get(key) ?? null;
}

type RawRecord = Partial<Record<Field, string>>;

const STATUS_ALIASES: Record<string, GameStatus> = {
  desejo: "WISHLIST",
  desejos: "WISHLIST",
  concluido: "COMPLETED",
  finalizado: "COMPLETED",
  jogado: "COMPLETED",
};

const STATUS_LOOKUP = new Map<string, GameStatus>([
  ...GAME_STATUSES.map((status): [string, GameStatus] => [foldText(status), status]),
  ...GAME_STATUSES.map((status): [string, GameStatus] => [
    foldText(GAME_STATUS_LABELS[status]),
    status,
  ]),
  ...Object.entries(STATUS_ALIASES),
]);

function parseNumber(raw: string): number | null {
  const text = raw.replace(/\s/g, "");
  // "1.234,5" (milhar com ponto, decimal com vírgula) -> "1234.5"
  const normalized = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)
    ? text.replace(/\./g, "").replace(",", ".")
    : text.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Aceita AAAA-MM-DD (com ou sem hora) e DD/MM/AAAA. Retorna AAAA-MM-DD. */
function parseDate(raw: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/.exec(raw);
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  const [year, month, day] = iso
    ? [iso[1], iso[2], iso[3]]
    : br
      ? [br[3], br[2], br[1]]
      : [undefined, undefined, undefined];
  if (year === undefined || month === undefined || day === undefined) return null;
  if (!isRealDate(Number(year), Number(month), Number(day))) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseHttpUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

type RowResult = { ok: true; game: ImportedGame } | { ok: false; message: string };

function fail(message: string): RowResult {
  return { ok: false, message };
}

function normalizeRecord(record: RawRecord): RowResult {
  const title = cleanText(record.title ?? "");
  if (title === "") return fail("Título em branco.");
  if (title.length > MAX_TITLE_LENGTH) return fail("Título muito longo.");

  const platformName = tidyName(record.platform ?? "");
  if (platformName === "") return fail(`"${title}": plataforma em branco.`);
  const genreName = tidyName(record.genre ?? "");
  if (genreName === "") return fail(`"${title}": gênero em branco.`);
  if (platformName.length > MAX_NAME_LENGTH || genreName.length > MAX_NAME_LENGTH) {
    return fail(`"${title}": nome de plataforma ou gênero muito longo.`);
  }

  const game: ImportedGame = { title, platformName, genreName };

  const statusText = (record.status ?? "").trim();
  if (statusText !== "") {
    const status = STATUS_LOOKUP.get(foldText(statusText));
    if (!status) return fail(`"${title}": status "${statusText}" não reconhecido.`);
    game.status = status;
  }

  const ratingText = (record.rating ?? "").trim();
  if (ratingText !== "") {
    const rating = parseNumber(ratingText);
    if (rating === null || rating > 10) {
      return fail(`"${title}": nota "${ratingText}" inválida (use de 0 a 10).`);
    }
    game.rating = rating;
  }

  const hoursText = (record.hours ?? "").trim();
  if (hoursText !== "") {
    const hours = parseNumber(hoursText);
    if (hours === null) return fail(`"${title}": horas "${hoursText}" inválidas.`);
    game.hoursPlayed = hours;
  }

  const releaseText = (record.release ?? "").trim();
  if (releaseText !== "") {
    const release = parseDate(releaseText);
    if (release === null) {
      return fail(`"${title}": data "${releaseText}" inválida (use AAAA-MM-DD ou DD/MM/AAAA).`);
    }
    game.releaseDate = release;
  }

  const description = cleanText(record.description ?? "");
  if (description !== "") game.description = description;

  for (const [field, key, label] of [
    ["cover", "coverUrl", "capa"],
    ["background", "backgroundUrl", "fundo"],
  ] as const) {
    const urlText = (record[field] ?? "").trim();
    if (urlText === "") continue;
    const url = parseHttpUrl(urlText);
    if (url === null) return fail(`"${title}": link de ${label} inválido.`);
    game[key] = url;
  }

  return { ok: true, game };
}

// ---------------------------------------------------------------------------
// Leitura dos arquivos
// ---------------------------------------------------------------------------

function collect(
  records: { raw: RawRecord; line: number }[],
  format: ParsedImportFile["format"],
): ParsedImportFile {
  if (records.length === 0) throw new ImportFileError("O arquivo não tem nenhum jogo.");
  if (records.length > MAX_IMPORT_ROWS) {
    throw new ImportFileError(
      `O arquivo tem ${records.length} jogos; o limite é ${MAX_IMPORT_ROWS} por importação. Divida em partes.`,
    );
  }

  const games: ImportedGame[] = [];
  const errors: ImportRowError[] = [];
  for (const { raw, line } of records) {
    const result = normalizeRecord(raw);
    if (result.ok) games.push(result.game);
    else errors.push({ line, message: result.message });
  }
  return { format, games, errors };
}

function parseCsvFile(text: string): ParsedImportFile {
  const [header, ...rows] = parseCsv(text);
  if (!header) throw new ImportFileError("O arquivo CSV está vazio.");

  const columns = header.cells.map(canonicalField);
  const present = new Set(columns);
  const missing = (["title", "platform", "genre"] as const).filter((f) => !present.has(f));
  if (missing.length > 0) {
    throw new ImportFileError(
      `Colunas obrigatórias ausentes: ${missing.map((f) => FIELD_LABELS[f]).join(", ")}.`,
    );
  }

  const records = rows.map(({ cells, line }) => {
    const raw: RawRecord = {};
    columns.forEach((field, index) => {
      const value = cells[index];
      // Se duas colunas apontarem para o mesmo campo, vale a primeira preenchida.
      if (field && value !== undefined && value.trim() !== "" && !raw[field]) raw[field] = value;
    });
    return { raw, line };
  });
  return collect(records, "csv");
}

function jsonValueToText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "object" && value !== null && "name" in value) {
    const name = (value as { name: unknown }).name;
    return typeof name === "string" ? name : "";
  }
  return "";
}

function parseJsonFile(text: string): ParsedImportFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ImportFileError("O arquivo JSON é inválido.");
  }

  const items = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null && "games" in data
      ? (data as { games: unknown }).games
      : null;
  if (!Array.isArray(items)) {
    throw new ImportFileError('O JSON precisa ser uma lista de jogos ou um objeto com "games".');
  }

  const records = items.map((item: unknown, index) => {
    const raw: RawRecord = {};
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      for (const [key, value] of Object.entries(item)) {
        const field = canonicalField(key);
        const text = jsonValueToText(value);
        if (field && text.trim() !== "" && !raw[field]) raw[field] = text;
      }
    }
    return { raw, line: index + 1 };
  });
  return collect(records, "json");
}

/** Lê o conteúdo de um .csv ou .json (decidido pela extensão do nome do arquivo). */
export function parseImportFile(filename: string, text: string): ParsedImportFile {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".json")) return parseJsonFile(text);
  if (lower.endsWith(".csv")) return parseCsvFile(text);
  throw new ImportFileError("Formato não suportado. Use um arquivo .csv ou .json.");
}

// ---------------------------------------------------------------------------
// Plano de importação
// ---------------------------------------------------------------------------

export interface ImportPlan {
  /** Jogos que serão criados. */
  toImport: ImportedGame[];
  /** Jogos ignorados por já existirem (ou por repetirem outro do próprio arquivo). */
  duplicates: ImportedGame[];
  /** Nomes (já arrumados) de plataformas/gêneros que ainda não existem e serão criados. */
  newPlatforms: string[];
  newGenres: string[];
}

function duplicateKey(title: string, platformName: string): string {
  return `${foldText(title)}|${foldText(platformName)}`;
}

function missingNames(names: string[], existing: { name: string }[]): string[] {
  const known = new Set(existing.map((item) => foldText(item.name)));
  const missing: string[] = [];
  for (const name of names) {
    const key = foldText(name);
    if (!known.has(key)) {
      known.add(key);
      missing.push(name);
    }
  }
  return missing;
}

/** Um jogo é duplicado quando já existe outro com o mesmo título na mesma plataforma. */
export function buildImportPlan(
  games: ImportedGame[],
  existing: { games: Game[]; platforms: Platform[]; genres: Genre[] },
  options: { skipDuplicates: boolean },
): ImportPlan {
  const seen = new Set(existing.games.map((g) => duplicateKey(g.title, g.platform.name)));
  const toImport: ImportedGame[] = [];
  const duplicates: ImportedGame[] = [];

  for (const game of games) {
    const key = duplicateKey(game.title, game.platformName);
    if (options.skipDuplicates && seen.has(key)) duplicates.push(game);
    else toImport.push(game);
    seen.add(key);
  }

  return {
    toImport,
    duplicates,
    newPlatforms: missingNames(
      toImport.map((g) => g.platformName),
      existing.platforms,
    ),
    newGenres: missingNames(
      toImport.map((g) => g.genreName),
      existing.genres,
    ),
  };
}
