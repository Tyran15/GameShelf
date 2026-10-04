import { GAME_STATUS_LABELS, type Game } from "@/types/game";

const CSV_HEADERS: string[] = [
  "Título",
  "Plataforma",
  "Gênero",
  "Status",
  "Nota",
  "Horas jogadas",
  "Lançamento",
  "Adicionado em",
];

/** Evita que planilhas executem um título como fórmula (CSV injection). */
function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string): string {
  const safe = neutralizeFormula(value);
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function dateOnly(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function gamesToCsv(games: Game[]): string {
  const rows = games.map((game) => [
    game.title,
    game.platform.name,
    game.genre.name,
    GAME_STATUS_LABELS[game.status],
    game.rating === null ? "" : String(game.rating),
    game.hoursPlayed === null ? "" : String(game.hoursPlayed),
    dateOnly(game.releaseDate),
    dateOnly(game.createdAt),
  ]);
  const lines = [CSV_HEADERS, ...rows].map((row) => row.map(csvCell).join(","));
  // BOM para o Excel reconhecer UTF-8 (acentos).
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export function gamesToJson(games: Game[], exportedAt: Date = new Date()): string {
  return JSON.stringify(
    {
      app: "GameShelf",
      version: 1,
      exportedAt: exportedAt.toISOString(),
      total: games.length,
      games,
    },
    null,
    2,
  );
}

export function exportFilename(extension: "csv" | "json", date: Date = new Date()): string {
  // "sv-SE" formata como AAAA-MM-DD na data local.
  return `gameshelf-biblioteca-${date.toLocaleDateString("sv-SE")}.${extension}`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
