import nodemailer from "nodemailer";
import {
  AlertSeverity,
  NotificationChannel,
  NotificationStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type AlertNotificationTarget = {
  userId: string;
  email: string;
  telegramChatId: string | null;
  telegramEnabled: boolean;
};

type DispatchAlertNotificationsInput = {
  alertId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  targets: AlertNotificationTarget[];
  locationLabel: string;
};

function buildTelegramText(input: DispatchAlertNotificationsInput) {
  return [
    `Caminho Seguro - ${input.title}`,
    input.message,
    `Severidade: ${input.severity}`,
    `Local: ${input.locationLabel}`,
    `Referencia: ${input.alertId}`,
  ].join("\n");
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN nao configurado.");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram retornou HTTP ${response.status}: ${body.slice(0, 180)}`);
  }
}

function createSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;

  if (!host || !from) {
    throw new Error("SMTP_HOST e SMTP_FROM precisam estar configurados.");
  }

  const port = Number(process.env.SMTP_PORT ?? 587);

  return {
    from,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    }),
  };
}

async function sendFormalEmail(to: string, subject: string, text: string) {
  const { from, transporter } = createSmtpTransport();
  await transporter.sendMail({ from, to, subject, text });
}

async function recordNotification(input: {
  userId: string;
  alertId: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  content: string;
  status: NotificationStatus;
  failureReason?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      alertId: input.alertId,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject,
      content: input.content,
      status: input.status,
      sentAt: input.status === "SENT" || input.status === "DELIVERED" ? new Date() : null,
      deliveredAt: input.status === "DELIVERED" ? new Date() : null,
      failureReason: input.failureReason,
    },
  });
}

export async function dispatchAlertNotifications(input: DispatchAlertNotificationsInput) {
  const telegramText = buildTelegramText(input);
  const fallbackChatId = process.env.TELEGRAM_ALERT_CHAT_ID ?? null;

  await Promise.all(
    input.targets.map(async (target) => {
      const chatId = target.telegramChatId ?? fallbackChatId;

      if (!target.telegramEnabled && !fallbackChatId) {
        return;
      }

      if (!chatId) {
        await recordNotification({
          userId: target.userId,
          alertId: input.alertId,
          channel: "TELEGRAM",
          recipient: "telegram-nao-configurado",
          subject: input.title,
          content: telegramText,
          status: "FAILED",
          failureReason: "Chat do Telegram nao configurado.",
        });
        return;
      }

      try {
        await sendTelegramMessage(chatId, telegramText);
        await recordNotification({
          userId: target.userId,
          alertId: input.alertId,
          channel: "TELEGRAM",
          recipient: chatId,
          subject: input.title,
          content: telegramText,
          status: "SENT",
        });
      } catch (error: unknown) {
        await recordNotification({
          userId: target.userId,
          alertId: input.alertId,
          channel: "TELEGRAM",
          recipient: chatId,
          subject: input.title,
          content: telegramText,
          status: "FAILED",
          failureReason:
            error instanceof Error ? error.message : "Falha desconhecida no Telegram.",
        });
      }
    }),
  );

  const governmentRecipients = (process.env.GOVERNMENT_ALERT_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (governmentRecipients.length === 0) {
    return;
  }

  const adminUser = await prisma.user.findFirst({
    where: {
      role: { in: ["ADMIN", "PUBLIC_AGENT", "INSTITUTION_MEMBER"] },
      status: "ACTIVE",
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!adminUser) {
    return;
  }

  const subject = `[Caminho Seguro] ${input.title}`;
  const content = [
    input.message,
    `Severidade: ${input.severity}`,
    `Local: ${input.locationLabel}`,
    `Referencia do alerta: ${input.alertId}`,
    "Dados pessoais da crianca nao foram incluidos neste e-mail formal.",
  ].join("\n");

  await Promise.all(
    governmentRecipients.map(async (recipient) => {
      try {
        await sendFormalEmail(recipient, subject, content);
        await recordNotification({
          userId: adminUser.id,
          alertId: input.alertId,
          channel: "EMAIL",
          recipient,
          subject,
          content,
          status: "SENT",
        });
      } catch (error: unknown) {
        await recordNotification({
          userId: adminUser.id,
          alertId: input.alertId,
          channel: "EMAIL",
          recipient,
          subject,
          content,
          status: "FAILED",
          failureReason:
            error instanceof Error ? error.message : "Falha desconhecida no SMTP.",
        });
      }
    }),
  );
}
