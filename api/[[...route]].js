import { createApp } from "../server/app.js";

export const config = {
  runtime: "nodejs",
};

const app = await createApp();

export default app;
