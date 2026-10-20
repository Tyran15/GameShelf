/** Rotas que não exigem login (e que escondem o SiteHeader). */
const PUBLIC_PATHS = ["/login", "/cadastro"];

export function isPublicPath(pathname: string): boolean {
  // Remove a barra final para "/cadastro/" também ser reconhecido.
  return PUBLIC_PATHS.includes(pathname.replace(/\/$/, ""));
}
