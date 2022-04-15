import { ICaptcha } from "@utils";
import { Context, Scenes } from "telegraf";
import { User } from "typegram";

export interface TelegramContext extends Context {
  session: TelegramSession;
}

export interface TelegramSession {
  member?: Member;
  captcha?: {
    value?: { emoji: string; data: string };
    attempt: number;
    isPassed?: boolean;
  };
}

interface Member extends User {
  verified?: boolean;
}
