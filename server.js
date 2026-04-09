import express from "express";
import { createApp } from "./server/app.js";

void express;
const app = await createApp({ staticMode: "vercel" });

export default app;
