import { useEffect } from "react";
import { AppRouter } from "./routes/AppRouter";

/** Gọi sớm để Render free tier kịp "thức" trước request chính */
function wakeApiServer() {
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (!base) return;
  fetch(`${base}/health`, { method: "GET" }).catch(() => {});
}

export default function App() {
  useEffect(() => {
    wakeApiServer();
  }, []);

  return <AppRouter />;
}
