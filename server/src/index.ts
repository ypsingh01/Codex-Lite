import http from "http";
import dotenv from "dotenv";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { initSockets } from "./sockets";

dotenv.config();

async function bootstrap() {
  const port = Number(process.env.PORT || 5000);

  await connectDB(process.env.MONGODB_URI || "");

  const app = createApp();
  const server = http.createServer(app);

  initSockets(server);

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`CODEX server listening on :${port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

