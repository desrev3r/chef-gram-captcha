import "module-alias/register";

import dotenv from "dotenv";
import fastify from "fastify";
import nconf from "nconf";
import path from "path";

dotenv.config();
nconf
  .argv()
  .env()
  .file({ file: path.join(__dirname, "./../config.json") });

import { Update } from "typegram";
import { bot } from "./bot";

(async () => {
  const { PORT, BOT_WEBHOOK } = process.env;

  const app = fastify();

  const SECRET_PATH = bot.secretPathComponent();
  const WEBHOOK = `${BOT_WEBHOOK}/${SECRET_PATH}`;

  // Bot
  bot.telegram.setWebhook(WEBHOOK);

  // Webhook
  app.post(`/${SECRET_PATH}`, (req, rep) => {
    bot.handleUpdate(<Update>req.body, rep.raw);
  });

  app.listen(PORT, () => {
    console.log(`TelegramBot: Running [${PORT}]`);
  });
})();
