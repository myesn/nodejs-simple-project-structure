// https://stackoverflow.com/a/53981706
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT: number;
      MONGODB_URL: string;
    }
  }
}
export {};
