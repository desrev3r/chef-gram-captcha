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

const { NODE_ENV, BOT_WEBHOOK } = process.env;

const PORT = +process.env?.PORT;
const BOT_MODE = NODE_ENV === "production" ? "webhook" : "pooling";

(async () => {
  const app = fastify();

  const SECRET_PATH = bot.secretPathComponent();
  const BOT_MODE = NODE_ENV === "production" ? "webhook" : "pooling";
  const WEBHOOK = `${BOT_WEBHOOK}/${SECRET_PATH}`;

  // Checking the mode
  switch (BOT_MODE) {
    case "pooling":
      bot.launch().catch();
      break;
    case "webhook":
      bot.telegram.setWebhook(WEBHOOK);

      app.post(`/${SECRET_PATH}`, (req, rep) => {
        bot.handleUpdate(<Update>req.body, rep.raw);
      });
      break;
  }

  // Running the bot
  app.listen(PORT, () => {
    console.log("Bot", { PORT, BOT_MODE, BOT_WEBHOOK });
  });
})();

process.on("uncaughtException", (e) => {
  console.log("uncaughtException", {
    config: { PORT, BOT_MODE, BOT_WEBHOOK },
    e,
  });
});
