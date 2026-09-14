/**
 * Cliente HTTP base. A URL da API vem sempre de variável de ambiente
 * (VITE_API_URL), com fallback para o backend local em desenvolvimento.
 */
export const API_BASE_URL = (
  import.meta.env["VITE_API_URL"] ?? "http://localhost:3000"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined | null | "">;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_BASE_URL}/api${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function request<T>(
  path: string,
  { method = "GET", body, query }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar à API. Verifique se o servidor está rodando.",
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const payload = (data ?? {}) as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    throw new ApiError(
      payload.message ?? defaultMessage(response.status),
      response.status,
      payload.errors,
    );
  }

  return data as T;
}

function defaultMessage(status: number) {
  if (status === 400) return "Dados inválidos. Revise os campos do formulário.";
  if (status === 404) return "Registro não encontrado.";
  if (status >= 500) return "Erro interno no servidor. Tente novamente.";
  return "Ocorreu um erro inesperado.";
}
