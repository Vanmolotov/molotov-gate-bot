import { Telegraf, Markup } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;             // @mltv_brnd
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME; // mltv_brnd
const WEBAPP_URL = process.env.WEBAPP_URL;             // https://.../tg/
const PORT = Number(process.env.PORT || 3000);

if (!BOT_TOKEN || !CHANNEL_ID || !WEBAPP_URL) {
  throw new Error("Set BOT_TOKEN, CHANNEL_ID, WEBAPP_URL");
}

const bot = new Telegraf(BOT_TOKEN);

async function isMember(ctx, userId) {
  const cm = await ctx.telegram.getChatMember(CHANNEL_ID, userId);
  return ["creator", "administrator", "member"].includes(cm.status);
}

const kbGate = () => Markup.inlineKeyboard([
  [Markup.button.url("Подписаться", `https://t.me/${CHANNEL_USERNAME}`)],
  [Markup.button.callback("Проверить доступ", "recheck")]
]);

const kbOk = () => Markup.inlineKeyboard([
  [Markup.button.webApp("Открыть плеер", WEBAPP_URL)]
]);

const gateText =
  "Плеер доступен только подписчикам @mltv_brnd.\n\n" +
  "Подпишись и нажми «Проверить доступ».";

bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  try {
    const ok = await isMember(ctx, userId);
    return ok ? ctx.reply("Доступ открыт 👇", kbOk())
              : ctx.reply(gateText, kbGate());
  } catch {
    return ctx.reply("Не могу проверить подписку. Проверь, что бот — админ канала.");
  }
});

bot.action("recheck", async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.from?.id;
  if (!userId) return;
  try {
    const ok = await isMember(ctx, userId);
    return ok ? ctx.reply("Доступ открыт 👇", kbOk())
              : ctx.reply(gateText, kbGate());
  } catch {
    return ctx.reply("Не могу проверить подписку. Проверь, что бот — админ канала.");
  }
});

bot.launch({
  webhook: process.env.WEBHOOK_URL
    ? { domain: process.env.WEBHOOK_URL, port: PORT }
    : undefined
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
