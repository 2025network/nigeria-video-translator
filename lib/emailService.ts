import nodemailer, { type Transporter } from "nodemailer";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type EmailDeliveryResult =
  | { ok: true; messageId: string }
  | { ok: false; code: string; message: string };

type SmtpConfiguration = {
  configured: boolean;
  host: string;
  port: number | null;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  missing: string[];
};

let cachedTransporter: Transporter | null = null;
let cachedTransportKey = "";

export function getEmailDiagnostics() {
  const config = readSmtpConfiguration();

  return {
    configured: config.configured,
    fromEmail: config.fromEmail || "Not configured",
    fromName: config.fromName,
    missing: config.missing,
  };
}

export function isSmtpConfigured() {
  return readSmtpConfiguration().configured;
}

export async function sendEmail(
  message: EmailMessage,
  context = "general",
): Promise<EmailDeliveryResult> {
  const config = readSmtpConfiguration();

  if (!config.configured || !config.port) {
    return {
      ok: false,
      code: "SMTP_NOT_CONFIGURED",
      message: "SMTP is not fully configured.",
    };
  }

  try {
    const transporter = getTransporter(config);
    const result = await transporter.sendMail({
      from: {
        name: config.fromName,
        address: config.fromEmail,
      },
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    return {
      ok: true,
      messageId: result.messageId,
    };
  } catch (error) {
    const safeError = toSafeEmailError(error);

    console.error("[email] delivery failed", {
      context,
      code: safeError.code,
      responseCode: safeError.responseCode,
    });

    return {
      ok: false,
      code: safeError.code,
      message: safeError.message,
    };
  }
}

function getTransporter(config: SmtpConfiguration) {
  const key = [config.host, config.port, config.user, config.fromEmail].join("|");

  if (cachedTransporter && cachedTransportKey === key) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port!,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
  cachedTransportKey = key;

  return cachedTransporter;
}

function readSmtpConfiguration(): SmtpConfiguration {
  const host = process.env.SMTP_HOST?.trim() ?? "";
  const portValue = process.env.SMTP_PORT?.trim() ?? "";
  const port = Number.parseInt(portValue, 10);
  const user = process.env.SMTP_USER?.trim() ?? "";
  const password = process.env.SMTP_PASSWORD ?? "";
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "SermonBridge";
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() ?? "";
  const missing = [
    !host ? "SMTP_HOST" : "",
    !portValue || !Number.isInteger(port) || port < 1 || port > 65535
      ? "SMTP_PORT"
      : "",
    !user ? "SMTP_USER" : "",
    !password ? "SMTP_PASSWORD" : "",
    !fromEmail ? "SMTP_FROM_EMAIL" : "",
  ].filter(Boolean);

  return {
    configured: missing.length === 0,
    host,
    port: missing.includes("SMTP_PORT") ? null : port,
    user,
    password,
    fromName,
    fromEmail,
    missing,
  };
}

function toSafeEmailError(error: unknown) {
  const details =
    error && typeof error === "object"
      ? (error as { code?: unknown; responseCode?: unknown })
      : {};
  const code = typeof details.code === "string" ? details.code : "EMAIL_DELIVERY_FAILED";
  const responseCode =
    typeof details.responseCode === "number" ? details.responseCode : undefined;
  const message =
    code === "EAUTH"
      ? "SMTP authentication failed."
      : code === "ETIMEDOUT"
        ? "The SMTP server timed out."
        : code === "ECONNECTION" || code === "ECONNREFUSED"
          ? "The SMTP server could not be reached."
          : "Email could not be delivered.";

  return { code, responseCode, message };
}
