import nodemailer, { type Transporter } from "nodemailer";

/**
 * Envio de e-mail (SMTP via nodemailer).
 *
 * - Com SMTP_HOST definido: envia de verdade (Ethereal, Mailtrap, Gmail, Resend...).
 * - Sem SMTP_HOST em desenvolvimento: só imprime o link no terminal, para testar sem conta de e-mail.
 * - Sem SMTP_HOST em produção: não envia e NÃO imprime o link (ele dá acesso à conta).
 */

const isProduction = process.env.NODE_ENV === "production";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }
  return transporter;
}

export function getFrontendUrl(): string {
  return (process.env.FRONTEND_URL ?? "http://localhost:5173").replace(/\/$/, "");
}

export function buildResetLink(token: string): string {
  return `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export async function sendPasswordResetEmail(to: string, nickname: string, token: string) {
  const link = buildResetLink(token);
  const transport = getTransporter();

  if (!transport) {
    if (isProduction) {
      throw new Error("SMTP_HOST não configurado: e-mail de recuperação não enviado.");
    }
    console.log(`\n[mailer] SMTP não configurado. Link de recuperação para ${to}:\n${link}\n`);
    return;
  }

  const safeName = escapeHtml(nickname);

  await transport.sendMail({
    from: process.env.MAIL_FROM ?? "GameShelf <no-reply@gameshelf.local>",
    to,
    subject: "Recuperação de senha — GameShelf",
    text: [
      `Olá, ${nickname}!`,
      "",
      "Recebemos um pedido para criar uma nova senha na sua conta do GameShelf.",
      "Use o link abaixo (vale por 1 hora):",
      "",
      link,
      "",
      "Se não foi você, ignore este e-mail: sua senha continua a mesma.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2a37">
        <h2 style="margin:0 0 16px">Recuperação de senha</h2>
        <p>Olá, <strong>${safeName}</strong>!</p>
        <p>Recebemos um pedido para criar uma nova senha na sua conta do GameShelf.
           O link vale por <strong>1 hora</strong>.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#06b6d4;color:#00424f;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
            Criar nova senha
          </a>
        </p>
        <p style="font-size:13px;color:#566074">Se o botão não funcionar, copie este endereço no navegador:<br>${link}</p>
        <p style="font-size:13px;color:#566074">Se não foi você, ignore este e-mail: sua senha continua a mesma.</p>
      </div>`,
  });
}
