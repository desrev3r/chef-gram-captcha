import nconf from "nconf";

const botConfig = nconf.get("bot");

export const includesBannedWord = (message: string) => {
  try {
    const bannedWords: string[] = botConfig.bannedWords;
    const text = message?.toLowerCase();
    const words: string[] = bannedWords?.map((v) => v?.toLowerCase());

    const isBannedWord = words.includes(text);
    if (isBannedWord) return true;

    return false;
  } catch (e) {
    return true;
  }
};
