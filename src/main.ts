import "module-alias/register";

import dotenv from "dotenv";
import nconf from "nconf";
import path from "path";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();
nconf
  .argv()
  .env()
  .file({ file: path.join(__dirname, "./../config.json") });

import { Update } from "typegram";
import { bot } from "./bot";

const { NODE_ENV, BOT_WEBHOOK, BOT_WEBHOOK_SECRET_PATH } = process.env;
const PORT = +process.env?.PORT;

(async () => {
  try {
    const app = express();

    app.use(bodyParser.json());
    app.use(cors({ origin: "*" }));

    const BOT_MODE = NODE_ENV === "production" ? "webhook" : "pooling";
    const BOT_WEBHOOK_PATH = `${BOT_WEBHOOK}/${BOT_WEBHOOK_SECRET_PATH}`;

    // Checking the bot mode
    switch (BOT_MODE) {
      case "pooling":
        bot
          .launch()
          .then(() => {
            console.log("Bot", { BOT_MODE, BOT_WEBHOOK_PATH });
          })
          .catch();

        break;
      case "webhook":
        bot.telegram.setWebhook(BOT_WEBHOOK_PATH);

        app.post(`/${BOT_WEBHOOK_SECRET_PATH}`, (req, res) => {
          bot.handleUpdate(<Update>req.body, res);
        });
        break;
    }

    // Running the server
    app.get("", (req, res) => {
      res.status(200).send();
    });

    app.listen(PORT, () => {
      console.log("Server", { NODE_ENV, PORT });
    });
  } catch (e) {
    console.log({ e });
  }
})();

process.on("uncaughtException", (e) => {
  console.log("uncaughtException", {
    config: { NODE_ENV, PORT, BOT_WEBHOOK },
    e,
  });

  process.exit(1);
});
