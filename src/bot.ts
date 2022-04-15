import { Telegraf, session } from "telegraf";
import nconf from "nconf";

import { TelegramContext } from "@types";
import { generateCaptcha, validator, messages as _messages } from "@utils";

const { BOT_TOKEN } = process.env;

const config = nconf.get("bot");
const messages = { ...config.messages, ..._messages };

export const bot = new Telegraf<TelegramContext>(BOT_TOKEN);

bot.use(session());
bot.catch((e) => console.log({ e }));
bot.use((ctx, next) => {
  if (!ctx.session) {
    ctx.session = {};
  }

  next();
});

bot.on("text", async (ctx) => {
  const { captcha } = ctx.session;
  const message = ctx.message.text;

  // Checking Captcha
  if (!captcha?.isPassed) return ctx.deleteMessage();

  // Checking Message
  const isBannedWord = validator.includesBannedWord(message);
  if (isBannedWord) {
    await ctx.deleteMessage();
    await ctx.reply(messages.bannedWordWarning);
  }
});

bot.on("new_chat_members", (ctx) => {
  const member = ctx.message.from;
  const captcha = generateCaptcha({ variants: 4, attempts: 2 });

  ctx.session.member = member;
  ctx.session.captcha = {
    attempt: 0,
    value: { emoji: captcha.value.emoji, data: captcha.value.data },
  };

  // Captcha
  ctx.reply(
    `Hello, ${member.first_name}!\nPlease confirm that you're not a bot.\nPick ${captcha.value.emoji}!`,
    {
      reply_markup: { inline_keyboard: captcha.inline_keyboard },
    }
  );
});

bot.action(/captcha:.*/, async (ctx) => {
  if (!("data" in ctx.callbackQuery)) return;

  const data = ctx.callbackQuery?.data;
  const { member, captcha } = ctx.session;

  // // @ts-ignore
  // const text = ctx.callbackQuery.message?.text;
  // // @ts-ignore
  // const reply_markup = ctx.callbackQuery.message?.reply_markup;

  const isCaptchaConfirmed = captcha?.value?.data === data;
  if (!isCaptchaConfirmed) {
    ctx.session.captcha = {
      attempt: (ctx.session.captcha?.attempt || 0) + 1,
    };

    const attempt = ctx.session.captcha?.attempt;
    if (attempt >= 2) {
      // Updating Captcha
      const captcha = generateCaptcha({ variants: 4, attempts: 2 });

      ctx.session.captcha = {
        attempt: 0,
        value: { emoji: captcha.value.emoji, data: captcha.value.data },
      };

      await ctx.deleteMessage();
      await ctx.reply(
        `Hello, ${member?.first_name}!\nPlease confirm that you're not a bot.\nPick ${captcha.value.emoji}!`,
        {
          reply_markup: { inline_keyboard: captcha.inline_keyboard },
        }
      );
    }

    return ctx.replyWithChatAction("typing");
  }

  await ctx.deleteMessage();
  await ctx.reply(messages.welcome);

  ctx.session.captcha = {
    attempt: 0,
    isPassed: true,
  };
});
