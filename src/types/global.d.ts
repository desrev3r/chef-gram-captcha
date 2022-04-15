declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;

    NODE_ENV: "development" | "production";
    PORT: number;
    BOT_TOKEN: string;
    BOT_WEBHOOK: string;
  }
}
