import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { router } from "./routes.js";

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT ?? "5001", 10);
const isDev = process.env.NODE_ENV !== "production";

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: isDev ? true : process.env.APP_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

async function bootstrap() {
  if (isDev) {
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  } else {
    const { serveStatic } = await import("./static.js");
    serveStatic(app);
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Accor Mailer running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
