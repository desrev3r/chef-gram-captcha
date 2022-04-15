import { InlineKeyboardButton } from "typegram";
import { shuffle, randomHex, randomNumber } from "./random";

export interface ICaptcha {
  value: {
    emoji: string;
    data: string;
  };
  attempts: number;
  inline_keyboard: InlineKeyboardButton[][];
}

type CaptchaOptions = {
  variants: number;
  attempts: number;
};

export const generateCaptcha = (options?: CaptchaOptions): ICaptcha => {
  const emojis = "🍇🍉🍊🍓🥝🥑🍏🍒🍆🍅";
  const variants = options?.variants || 3;
  const attempts = options?.attempts || 2;

  const keys = shuffle(Array.from(emojis));
  const values = keys.slice(0, variants).map(() => `captcha:${randomHex()}`);

  const randomVariant = randomNumber(0, variants);

  const value = {
    emoji: keys[randomVariant],
    data: values[randomVariant],
  };

  const inline_keyboard = [
    values.map((v, i) => ({
      text: keys[i],
      callback_data: v,
    })),
  ];

  return { value, attempts, inline_keyboard };
};
